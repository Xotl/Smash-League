'use strict'
const Config = require('../config.json')

// const BOT_TAG_REGEX = `\<\@${Config.bot_id}\>`
const CHALLENGE_REGEX = `^.*?reto.*?<@.*?>`
const REPORTED_RESULT_REGEX = `(<@.*?>).*?([0-9].*)-.*([0-9)]).*(<@.*?>)`
const USERS_TAGGED_REGEX = `<@.*?>`
const BOT_SLACK_TAG = `<@${Config.bot_id}>`
const GetUserIDFromUserTag = userTag => userTag.slice(2, -1)

const categorizeSlackMessages = (messagesArray) => {
    if (!Array.isArray(messagesArray)) {
        throw new Error('The argument messagesArray must be an Array')
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

const isValidChallenge = (challengerId, playerChallengedId, activeChallenges = [], completedChallenges = []) => {
    const isAlreadyChallenged = activeChallenges.includes(playerChallengedId) || completedChallenges.includes(playerChallengedId)
    return !isAlreadyChallenged && challengerId !== playerChallengedId
}

const calculateNewChallenges = (newChallenges = [], ranking, activeChallenges, completedChallenges) => {
    const newValidChallenges = newChallenges.reduce(
        (validChallenges, challenge) => {
            const challengerId = challenge.challenger
            const challengerActiveChallenges = activeChallenges[challengerId]
            const challengerCompletedChallenges = completedChallenges[challengerId]
            const playerPlace = getRankingPlaceByPlayerId(challengerId, ranking)
            const numberOfChallengesAllowed = getNumberOfChallengesAllowed(playerPlace)
            const currentNumOfChallengesFromPlayer = getTotalOfChallengesDoneByPlayer(challengerActiveChallenges, challengerCompletedChallenges)

            if (currentNumOfChallengesFromPlayer >= numberOfChallengesAllowed) {
                // Player can no longer challenge people, maximum challenges reached
                return validChallenges
            }

            
            let challengesLeft = numberOfChallengesAllowed - currentNumOfChallengesFromPlayer
            
            for (let idx = 0; challengesLeft > 0 && idx < challenge.peopleChallenged.length; idx++) {
                const playerChallenged = challenge.peopleChallenged[idx]
                if (isValidChallenge(challengerId, playerChallenged, challengerActiveChallenges, challengerCompletedChallenges)) {
                    
                    if (!validChallenges[challengerId]) {
                        validChallenges[challengerId] = {}
                    }

                    validChallenges[challengerId][playerChallenged] = true
                    challengesLeft--
                }
            }

            return validChallenges
        },
        {}
    )

    

    const newActiveChallenges = { ...activeChallenges }

    Object.keys(newValidChallenges).forEach(
        playerId => {
            if (!newActiveChallenges[playerId]) {// First challenges
                newActiveChallenges[playerId] = Object.keys(newValidChallenges[playerId])
            }
            else {// Adds Challenges
                newActiveChallenges[playerId] = [ ...activeChallenges[playerId], ...Object.keys( newValidChallenges[playerId] ) ]
            }
        }
    )

    return newActiveChallenges
}

const canPlayerAChallengePlayerB = (playerA, playerB, ranking) => {
    const playerAPlace = getRankingPlaceByPlayerId(playerA, ranking)
    const playerBPlace = getRankingPlaceByPlayerId(playerB, ranking)
    const diff = playerAPlace - playerBPlace

    if (diff < 1 && diff > 5) {
        return false// There's no way playerA can challenge playerB
    }

    const numAllowedChallengesForPlayerA = getNumberOfChallengesAllowed(playerA)
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
                return// Non of the players could challenge the other one, ignoring result
            }

            if (Array.isArray( updatedCompletedChallenges[validChallenger] )) {// Checks if player already have completed challenges
                const matchBetweenPlayersExists = updatedCompletedChallenges[validChallenger].find(
                    ({players}) =>  players.includes(validChallenger) && players.includes(playerChallenged)
                )
                if (matchBetweenPlayersExists) {
                    return// Match between these players already registered, ignoring result
                }

                // Valid match result, let's clone the array if not yet cloned to safely modify it
                if (updatedCompletedChallenges[validChallenger] === completedChallenges[validChallenger]) {
                    updatedCompletedChallenges[validChallenger] = [ ...completedChallenges[validChallenger] ]
                }
            }
            else {// First challenge completed by this player
                updatedCompletedChallenges[validChallenger] = []
            }

            // Adds the result to completed challenges
            updatedCompletedChallenges[validChallenger].push({ challenger: validChallenger, playerChallenged, ...reportedResult })
            


            // Removes the active challenge because now is completed, if challenge got reported previously
            let indexOfPlayerChallenged = -1

            if (Array.isArray(updatedActiveChallenges[validChallenger])) {// Looks if challenge was reported 
                indexOfPlayerChallenged = updatedActiveChallenges[validChallenger].indexOf(playerChallenged)
            }

            if (indexOfPlayerChallenged >= 0) {
                // Let's clone the array if not yet cloned to safely modify it
                if (updatedActiveChallenges[validChallenger] === activeChallenges[validChallenger]) {
                    updatedActiveChallenges[validChallenger] = [ ...activeChallenges[validChallenger] ]
                }

                updatedActiveChallenges[validChallenger].splice(indexOfPlayerChallenged, 1)
            }
            
            // Apply points to winner score
            updatedScoreboard[winner] += winner === validChallenger ? 3 : 1
        }
    )

    return resultObj
}

const digestActivitiesAndGetUpdatedRankingObj = (activities, rankingObj) => {
    if (typeof activities !== 'object') {
        throw new Error(`The "activities" argument must be an object but received "${typeof activities}" instead.`)
    }

    if (typeof rankingObj !== 'object') {
        throw new Error(`The "rankingObj" argument must be an object but received "${typeof rankingObj}" instead.`)
    }

    const { reportedResults = [], challenges = [] } = activities
    const { ranking, in_progress: { active_challenges, completed_challenges, scoreboard } } = rankingObj


    // const newScoreboard = { ...scoreboard }
    const newActiveChallenges = calculateNewChallenges(challenges, ranking, active_challenges, completed_challenges)
    // const validatedReportedResults = validateReportedResultsAndDetermineChallenger(reportedResults, ranking, newActiveChallenges, )

    return getUpdatedChallengesAndScoreboard(reportedResults, ranking, scoreboard, completed_challenges, newActiveChallenges)
}


module.exports = {
    categorizeSlackMessages,
    digestActivitiesAndGetUpdatedRankingObj
}
