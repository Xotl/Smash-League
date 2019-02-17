'use strict'
const Config = require('../config.json')

const MILISECONDS_24HOURS = 86400000// 24 hours in miliseconds
const CHALLENGE_REGEX = `^.*?reto.*?<@.*?>`
const REPORTED_RESULT_REGEX = `(<@.*?>).*?([0-9].*)-.*([0-9)]).*(<@.*?>)`
const USERS_TAGGED_REGEX = `<@.*?>`
const BOT_SLACK_TAG = `<@${Config.bot_id}>`
const POINTS_IF_CHALLENGER_WINS = 3
const POINTS_IF_PLAYER_CHALLENGED_WINS = 1
const POINTS_IF_PLAYER_CHALLENGED_LOSES = 1
const GetUserIDFromUserTag = userTag => userTag.slice(2, -1)

const categorizeSlackMessages = (messagesArray) => {
    if (!Array.isArray(messagesArray)) {
        throw new Error('The argument messagesArray must be an Array.')
    }

    const resultCategorized = messagesArray.reduce(
        (result, { text:message, user }) => {
            if (-1 === message.indexOf(BOT_SLACK_TAG)) {
                return result// Slack bot is not tagged in this message, just ignore it
            }

            const messageWithoutBotTag = message.replace(new RegExp(BOT_SLACK_TAG, 'gm'), '')
            const isChallengeMessage = (new RegExp(CHALLENGE_REGEX, 'gm')).test(messageWithoutBotTag)

            if (isChallengeMessage) {
                const taggedUsersMatch = messageWithoutBotTag.match(new RegExp(USERS_TAGGED_REGEX, 'gm'))
                result.challenges.push({
                    challenger: user,
                    peopleChallenged: taggedUsersMatch.map( GetUserIDFromUserTag )
                })
                return result
            }
            else {
                const reportedResultMatch = (new RegExp(REPORTED_RESULT_REGEX, 'gm')).exec(messageWithoutBotTag)
                if (reportedResultMatch) {
                    let player1Result, player2Result

                    try {
                        player1Result = Number(reportedResultMatch[2])
                        player2Result = Number(reportedResultMatch[3])
                    }
                    catch (err) {
                        console.error(new Error(`Bad reported result format for message "${message}". Ignoring this message.`))
                        return result
                    }
                    
                    const player1 = GetUserIDFromUserTag(reportedResultMatch[1])
                    const player2 = GetUserIDFromUserTag(reportedResultMatch[4])
                    
                    result.reportedResults.push({
                        winner: player1Result > player2Result ? player1 : player2,
                        player1, player2, player1Result, player2Result,
                        players: [player1, player2]
                    })

                    return result
                }

                // if it comes here, is just a random message where the bot got tagged
                return result
            }
        }, 
        {
            challenges: [],
            reportedResults: []
        }
    )

    return resultCategorized
}

const getRankingPlaceByPlayerId = (userId, ranking) => {
    for (let idx = 0; idx < ranking.length; idx++) {
        const people = ranking[idx]
        if (people.includes(userId)) {
            return idx + 1
        }
    }

    return ranking.length + 1// Means unranked
}

const getNumberOfChallengesAllowed = place => {
    let tmp = place - 9
    if (tmp < 0) {
        tmp = 0
    }

    let total = (place > 2) ?  2 + tmp : place - 1
    if (total > 5) {
        total = 5
    }
    
    return total
}

const getTotalOfChallengesDoneByPlayer = (activePlayerChallenges = [], completedPlayerChallenges = []) => activePlayerChallenges.length + completedPlayerChallenges.length

const doesPlayerAlreadyFoughtOrChallengedThatPlace = (playerId, playerActiveChallenges = [], playerCompletedChallenges = [], ranking) => {
    const place = typeof playerId === 'string' ? getRankingPlaceByPlayerId(playerId, ranking) : playerId

    for (let idx = 0; idx < playerActiveChallenges.length; idx++) {
        if ( getRankingPlaceByPlayerId(playerActiveChallenges[idx], ranking) === place) {
            return true
        }
    }
    
    for (let idx = 0; idx < playerCompletedChallenges.length; idx++) {
        if ( getRankingPlaceByPlayerId(playerCompletedChallenges[idx].playerChallenged, ranking) === place) {
            return true
        }
    }

    return false
}

const isPlayerUnranked = (playerId, ranking) => {
    const place = typeof playerId === 'string' ? getRankingPlaceByPlayerId(playerId, ranking) : playerId
    return place > ranking.length
}

const isValidChallenge = (challengerId, playerChallengedId, challengerActiveChallenges = [], challengerCompletedChallenges = [], ranking = [], scoreboard = {}) => {

    if (challengerId === playerChallengedId) {
        return false// He tried to fool the bot by challenging himself ¬¬'
    }

    if (challengerActiveChallenges.includes(playerChallengedId)) {
        return false// Duplicated challenge
    }

    const challengerPlace = getRankingPlaceByPlayerId(challengerId, ranking)

    if (isPlayerUnranked(challengerPlace, ranking) && scoreboard[ playerChallengedId ] === 0) {
        // Unranked player challenged a player with 0 points
        return false
    }
    
    if ( doesMatchBetweenPlayersAlreadyHappened(challengerId, playerChallengedId, challengerCompletedChallenges) ) {
        return false// Match already happened, challenge can't happen now
    }

    if ( doesPlayerAlreadyFoughtOrChallengedThatPlace(playerChallengedId, challengerActiveChallenges, challengerCompletedChallenges, ranking) ) {
        return false// Player can't challenge or fight multiple players in the same place
    }
    return canPlayerAChallengePlayerB(challengerId, playerChallengedId, ranking)
}

const calculateNewChallenges = (newChallenges = [], ranking, activeChallenges, completedChallenges, scoreboard) => {
    return newChallenges.reduce(
        (validChallenges, challenge) => {
            const challengerId = challenge.challenger
            const challengerActiveChallenges = validChallenges[challengerId]
            const challengerCompletedChallenges = completedChallenges[challengerId]
            const playerPlace = getRankingPlaceByPlayerId(challengerId, ranking)
            const numberOfChallengesAllowed = getNumberOfChallengesAllowed(playerPlace)
            const currentNumOfChallengesFromPlayer = getTotalOfChallengesDoneByPlayer(challengerActiveChallenges, challengerCompletedChallenges)

            if (currentNumOfChallengesFromPlayer >= numberOfChallengesAllowed) {
                console.log(`Ignored challenge because player "${challengerId}" reached limit of challenges allowed: ${JSON.stringify(challenge)}`)
                // Player can no longer challenge people, maximum challenges reached
                return validChallenges
            }

            
            let challengesLeft = numberOfChallengesAllowed - currentNumOfChallengesFromPlayer
            
            for (let idx = 0; challengesLeft > 0 && idx < challenge.peopleChallenged.length; idx++) {
                const playerChallenged = challenge.peopleChallenged[idx]
                if (isValidChallenge(challengerId, playerChallenged, challengerActiveChallenges, challengerCompletedChallenges, ranking, scoreboard)) {
                    
                    if (!validChallenges[challengerId]) {// No previous active challenges 
                        validChallenges[challengerId] = []
                    }
                    else if (validChallenges[challengerId] === activeChallenges[challengerId]) {
                        // Cloning the array to safely modify it
                        validChallenges[challengerId] = [ ...activeChallenges[challengerId] ]
                    }

                    validChallenges[challengerId].push(playerChallenged)
                    challengesLeft--
                }
                else {
                    console.log(`Ignored challenge from "${challengerId}" to "${playerChallenged}" because is not a valid.`)
                }
            }

            return validChallenges
        },
        { ...activeChallenges }
    )
}

const doesMatchBetweenPlayersAlreadyHappened = (challenger, playerChallenged, completedPlayerChallenges) => {
    return completedPlayerChallenges.find(
        ({players}) =>  players.includes(challenger) && players.includes(playerChallenged)
    ) !== undefined
}

const canPlayerAChallengePlayerB = (playerA, playerB, ranking) => {
    const playerAPlace = getRankingPlaceByPlayerId(playerA, ranking)
    const playerBPlace = getRankingPlaceByPlayerId(playerB, ranking)
    const diff = playerAPlace - playerBPlace
    
    if (diff < 1 || diff > 5) {
        return false// There's no way playerA can challenge playerB
    }
    
    const numAllowedChallengesForPlayerA = getNumberOfChallengesAllowed(playerAPlace)
    return diff <= numAllowedChallengesForPlayerA
}

const getUpdatedChallengesAndScoreboard = (reportedResults, ranking, scoreboard, completedChallenges, activeChallenges) => {
    const updatedCompletedChallenges = { ...completedChallenges }
    const updatedActiveChallenges = { ...activeChallenges }
    const updatedScoreboard = { ...scoreboard }
    const resultObj = { scoreboard: updatedScoreboard, active_challenges: updatedActiveChallenges, completed_challenges: updatedCompletedChallenges }

    reportedResults.forEach(
        reportedResult => {
            const { player1, player2, winner } = reportedResult
            
            let validChallenger = null// Null means non of the two players can challenge the other
            let playerChallenged = null
            if (canPlayerAChallengePlayerB(player1, player2, ranking)) {
                validChallenger = player1
                playerChallenged = player2
            }
            else if (canPlayerAChallengePlayerB(player2, player1, ranking)) {
                validChallenger = player2
                playerChallenged = player1
            }

            if (!validChallenger) {
                console.log(`Ignored result because is not a valid challenge: ${JSON.stringify(reportedResult)}`)
                return// Non of the players could challenge the other one, ignoring result
            }

            
            if (// Checks if challenge already got validated before otherwise does a full check
                updatedActiveChallenges[validChallenger].includes(playerChallenged) || 
                isValidChallenge(
                    validChallenger, playerChallenged,
                    updatedActiveChallenges[validChallenger],
                    updatedCompletedChallenges[validChallenger],
                    ranking,
                    scoreboard
                )
            )
            {
                console.log(`Ignored result because match between players is not valid: ${JSON.stringify(reportedResult)}`)
            }

            if ( !Array.isArray( updatedCompletedChallenges[validChallenger] ) ) {
                // Player does not have any completed matches yet
                updatedCompletedChallenges[validChallenger] = []
            }
            else if (updatedCompletedChallenges[validChallenger] === completedChallenges[validChallenger]) {
                // Let's clone the array if not yet cloned to safely modify it
                updatedCompletedChallenges[validChallenger] = [ ...completedChallenges[validChallenger] ]
            }


            // Adds the result to completed challenges
            updatedCompletedChallenges[validChallenger].push({ challenger: validChallenger, playerChallenged, ...reportedResult })
            

            // Removes the active challenge because now is completed, only if challenge got reported previously
            let indexOfPlayerChallenged = -1
            if (Array.isArray(updatedActiveChallenges[validChallenger])) {// Looks if challenge was reported 
                indexOfPlayerChallenged = updatedActiveChallenges[validChallenger].indexOf(playerChallenged)
            }

            if (indexOfPlayerChallenged >= 0) {

                if (updatedActiveChallenges[validChallenger].length === 1) {
                    // Last one in the list, let's clean the list of active challenges
                    delete updatedActiveChallenges[validChallenger]
                }
                else {
                    // Let's clone the array if not yet cloned to safely modify it
                    if (updatedActiveChallenges[validChallenger] === activeChallenges[validChallenger]) {
                        updatedActiveChallenges[validChallenger] = [ ...activeChallenges[validChallenger] ]
                    }
    
                    updatedActiveChallenges[validChallenger].splice(indexOfPlayerChallenged, 1)
                }
            }

            // Apply points to winner score
            updatedScoreboard[winner] = (updatedScoreboard[winner] || 0) + (winner === validChallenger ? POINTS_IF_CHALLENGER_WINS : POINTS_IF_PLAYER_CHALLENGED_WINS)
        }
    )

    return resultObj
}

const getRankingFromScoreboard = scoreboard => {
    const scoreDict = Object.keys(scoreboard).reduce(
        (resultObj, playerId) => {
            const score = scoreboard[playerId]

            if (!resultObj[score]) {
                resultObj[score] = []
            }

            resultObj[score].push(playerId)
            return resultObj
        },
        {}
    )

    delete scoreDict[0]// Removing the people with 0 points from the ranking
    return Object.keys(scoreDict).sort( (a,b) => b - a ).map(score => scoreDict[score])
}

const digestActivitiesAndGetUpdatedRankingObj = (activities, rankingObj) => {
    if (typeof activities !== 'object') {
        throw new Error(`The "activities" argument must be an object but received "${typeof activities}" instead.`)
    }

    if (typeof rankingObj !== 'object') {
        throw new Error(`The "rankingObj" argument must be an object but received "${typeof rankingObj}" instead.`)
    }

    console.log(`--- Activities to digets:\n${JSON.stringify(activities)}\n---\n`)
    console.log(`--- Current ranking object:\n${JSON.stringify(rankingObj)}\n---\n`)

    const { reportedResults = [], challenges = [] } = activities
    const { ranking, in_progress: { active_challenges, completed_challenges, scoreboard } } = rankingObj
    const newActiveChallenges = calculateNewChallenges(challenges, ranking, active_challenges, completed_challenges, scoreboard)

    return getUpdatedChallengesAndScoreboard(reportedResults, ranking, scoreboard, completed_challenges, newActiveChallenges)
}

const applyScoreForChallengesNotCompleted = (scoreboard, activeChallenges) => {
    return Object.keys(activeChallenges).reduce(
        (newScoreboard, challengerId) => {

            if (typeof newScoreboard[challengerId] !== 'number') {
                // We add a initial value in case this is their first points
                newScoreboard[challengerId] = 0
            }

            activeChallenges[challengerId].forEach(
                playerChallengedId => {
                    newScoreboard[challengerId] += POINTS_IF_CHALLENGER_WINS

                    if (newScoreboard[playerChallengedId]) {
                        newScoreboard[playerChallengedId] -= POINTS_IF_PLAYER_CHALLENGED_LOSES
                    }

                    if (newScoreboard[playerChallengedId] < 0) {
                        newScoreboard[playerChallengedId] = 0
                    }
                }
            )

            return newScoreboard
        },
        { ...scoreboard }
    )
}

const isItTimeToCommitInProgress = (current, last) => {

    const diff = current.getTime() - last.getTime()
    if (diff < 0) {
        return false
    }

    if ( current.getDay() === 0 && (last.getDay() !== 0 || diff >= MILISECONDS_24HOURS) ) {
        // if current is sunday and last is not, or there's at least 24 hours of difference
        return true
    }

    return false
}

const commitInProgress = rankingObj => {
    const result = { ...rankingObj }
    const inProgress = { ...result.in_progress }

    inProgress.scoreboard = applyScoreForChallengesNotCompleted(inProgress.scoreboard, inProgress.active_challenges)

    result.last_update_ts = inProgress.last_update_ts
    result.scoreboard = inProgress.scoreboard
    result.ranking = getRankingFromScoreboard(result.scoreboard)
    inProgress.active_challenges = {}
    inProgress.completed_challenges = {}
    inProgress.reported_results = []
    result.in_progress = inProgress
    return result
}


module.exports = {
    categorizeSlackMessages,
    digestActivitiesAndGetUpdatedRankingObj,
    getRankingFromScoreboard,
    isItTimeToCommitInProgress,
    getRankingPlaceByPlayerId,
    getNumberOfChallengesAllowed,
    canPlayerAChallengePlayerB,
    getUpdatedChallengesAndScoreboard,
    commitInProgress,
    applyScoreForChallengesNotCompleted,
    isValidChallenge
}
