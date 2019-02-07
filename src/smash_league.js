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
        const people = ranking[0]
        if (people.includes(userId)) {
            return idx + 1
        }
    }

    return undefined// Means unranked
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

            if (numberOfChallengesAllowed >= currentNumOfChallengesFromPlayer) {
                // Player can no longer challenge people, maximum challenges reached
                return validChallenges
            }

            let challengesLeft = numberOfChallengesAllowed - currentNumOfChallengesFromPlayer

            for (let idx = 0; challengesLeft > 0 && idx < challenge.peopleChallenged.length; idx++) {
                if (isValidChallenge(challengerId, playerId, challengerActiveChallenges, challengerCompletedChallenges)) {
                    validChallenges[challengerId][playerId] = true
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

const playerACanChallengePlayerB = (playerA, playerB, ranking) => {
    const playerAPlace = getRankingPlaceByPlayerId(playerA, ranking)
    const playerBPlace = getRankingPlaceByPlayerId(playerB, ranking)

    const diff = playerAPlace - playerBPlace

    if (playerBPlace <= 8) {// Top 8 player
        return diff > 0 && diff <= 2
    }

    // Non Top 8 player
    return diff > 0 && diff <= 5
}

const validateReportedResultsAndDetermineChallenger = (reportedResults, ranking, activeChallenges, completedChallenges) => {
    const validatedResults = reportedResults.reduce(
        (resultsArray, reportedResult) => {
            const { player1, player2, player1Result, player2Result, winner } = reportedResult
            
            let validChallenger = null// Null means non of the two players can challenge the other
            let playerChallenged = null
            if (playerACanChallengePlayerB(player1, player2, ranking)) {
                validChallenger = player1
                playerChallenged = player2
            }
            else if (playerACanChallengePlayerB(player2, player1, ranking)) {
                validChallenger = player2
                playerChallenged = player1
            }

            if (!validChallenger || completedChallenges[validChallenger].includes(playerChallenged)) {
                // Non of the players could challenge the other one or match between these players already registered
                return resultsArray
            }

            resultsArray.push({ challenger: validChallenger, playerChallenged, ...reportedResult })
            return resultsArray
        }, []
    )
}

const getUpdatedChallengesAndScoreboard = (reportedResults, scoreboard, completedChallenges, activeChallenges) => {

    const resultObj = { scoreboard: { ...scoreboard }, active_challenges: { ...activeChallenges }, completed_challenges: { ...completedChallenges } }
    // reportedResults.forEach(
    //     (matchResult) => {

    //     }
    // )
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

    const {
        active_challenges:updatedActiveChallenges,
        completed_challenges:newCompletedChallenges,
        scoreboard:newScoreboard
    } = getUpdatedChallengesAndScoreboard(reportedResults, scoreboard, completed_challenges, active_challenges)

    // activities.reportedResults.forEach(
    //     ({ winner }) => {
    //         newScoreboard[winner] += 3
    //     }
    // )
}


module.exports = {
    categorizeSlackMessages,
    digestActivitiesAndGetUpdatedRankingObj,
    getNumberOfChallengesAllowed
}
