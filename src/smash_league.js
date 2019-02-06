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

            const messageWithoutBotTag = message.replace(new RegExp(BOT_SLACK_TAG), '')
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

const getRankingPlaceByUserId = (userId, ranking) => {
    for (let idx = 0; idx < ranking.length; idx++) {
        const people = ranking[0]
        if (people.includes(userId)) {
            return idx + 1
        }
    }

    return undefined// Means unranked
}

const getNumberOfChallengesAllowed = place => {
    let tmp = place - 11
    if (tmp < 0) {
        tmp = 0
    }

    let total = 2 + tmp
    if (total > 5) {
        total = 5
    }
    
    return total
}

const getTotalOfChallengesDoneByPlayer = (activeChallenges = [], completedChallenges = []) => activeChallenges.length + completedChallenges.length

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
            const playerPlace = getRankingPlaceByUserId(challengerId, ranking)
            const numberOfChallengesAllowed = getNumberOfChallengesAllowed(playerPlace)
            const currentNumOfChallengesFromPlayer = getTotalOfChallengesDoneByPlayer(challengerActiveChallenges, challengerCompletedChallenges)

            if (numberOfChallengesAllowed >= currentNumOfChallengesFromPlayer) {
                // Player can no longer challenge people, maximum challenges reached
                return validChallenges
            }

            let challengesLeft = numberOfChallengesAllowed - currentNumOfChallengesFromPlayer

            for (let idx = 0; challengesLeft > 0 || idx > challenge.peopleChallenged.length; idx++) {
                if (isValidChallenge(challengerId, playerId, challengerActiveChallenges, challengerCompletedChallenges)) {
                    challengesLeft--
                    validChallenges[]
                }
            }

            challenge.peopleChallenged.forEach(
                playerId => {
                    if (isValidChallenge(challengerId, playerId, challengerActiveChallenges, challengerCompletedChallenges)) {
                        if (!validChallenges[challengerId]) {
                            validChallenges[challengerId] = {}
                        }
                        validChallenges[challengerId][playerId] = true
                        challengesLeft--
                    }
                }
            )
            
        },
        {}
    )
}

const digestActivitiesAndGetUpdatedRankingObj = (activities, rankingObj) => {
    if (typeof activities === 'object') {
        throw new Error(`The "activities" argument must be an object but received "${typeof activities}" instead.`)
    }

    if (typeof rankingObj === 'object') {
        throw new Error(`The "rankingObj" argument must be an object but received "${typeof rankingObj}" instead.`)
    }

    const { reportedResults = [], challenges = [] } = activities



    const newScoreboard = { ...inProgressRankingObj.scoreboard }
    const newActiveChallenges = calculateNewChallenges()
    const newCompletedChallenges = []

    activities.reportedResults.forEach(
        ({ winner }) => {
            newScoreboard[winner] += 3
        }
    )
}


module.exports = {
    categorizeSlackMessages,
    digestActivitiesAndGetUpdatedRankingObj
}