'use strict'
const Config = require('../config.json')
const { logIgnoredChallenge } = require('./utils')

const MILISECONDS_24HOURS = 86400000// 24 hours in miliseconds
const CHALLENGE_REGEX = `^.*?reto.*?<@.*?>`
const REPORTED_RESULT_REGEX = String.raw`(<@\w+?>)\s*?(\d)\s*?\-\s*?(\d)\s*?(<@\w+?>)`
const USERS_TAGGED_REGEX = `<@.*?>`
const BOT_SLACK_TAG = `<@${Config.bot_id}>`


const GetUserIDFromUserTag = userTag => userTag.slice(2, -1)

const categorizeSlackMessages = (messagesArray) => {
    if (!Array.isArray(messagesArray)) {
        throw new Error('The argument messagesArray must be an Array.')
    }

    messagesArray = messagesArray.sort(// Sorts from oldest to latest
        (a, b) => Number(a.ts) - Number(b.ts)
    )

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

const getPlayerAlias = playerId => Config.users_dict[playerId] || playerId

const getRankingPlaceByPlayerId = (userId, ranking) => {
    for (let idx = 0; idx < ranking.length; idx++) {
        const people = ranking[idx]
        if (people.includes(userId)) {
            return idx + 1
        }
    }

    return ranking.length + 1// Means unranked
}

const doesPlayerAAlreadyWonAgainstThatPlace = (playerAId, completedChallenges, place, ranking) => completedChallenges.find(
    match => 
        match.winner === playerAId && 
        place === getRankingPlaceByPlayerId(match.player1 === playerAId ? match.player2 : match.player1, ranking)
)

const identifyPlayers = (playerAId, playerBId, rankingTable) => {
    const playerAPlace = getRankingPlaceByPlayerId(playerAId, rankingTable)
    const playerBPlace = getRankingPlaceByPlayerId(playerBId, rankingTable)

    if (playerAPlace > playerBPlace) {// playerA is below playerB in ranking
        return {
            challengerId: playerAId,
            challengerPlace: playerAPlace,
            playerChallengedId: playerBId,
            playerChallengedPlace: playerBPlace
        }
    }

    return {
        challengerId: playerBId,
        challengerPlace: playerBPlace,
        playerChallengedId: playerAId,
        playerChallengedPlace: playerAPlace
    }
}

const isReportedResultValid = (reportedResult, rankingTable, scoreboard) => {
    // {
    //     winner: player1Result > player2Result ? player1 : player2,
    //     player1, player2, player1Result, player2Result,
    //     players: [player1, player2]
    // }

    const { player1, player2 } = reportedResult
    const {
        challengerId, challengerPlace,
        playerChallengedId, playerChallengedPlace
    } = identifyPlayers(player1, player2, rankingTable)

    if (challengerPlace === playerChallengedPlace) {// They cannot challenge people in the same place
        logIgnoredChallenge(`Ignored result between players "${getPlayerAlias(challengerId)}" & "${getPlayerAlias(playerChallengedId)}" because they are in the same place.`, reportedResult)
        return false
    }

    const challenger = scoreboard[challengerId]

    if (challenger.coins < 1) {// No remaining coins, so no more challenges
        logIgnoredChallenge(`Ignored result because "${getPlayerAlias(challengerId)}" has 0 coins, so he cannot challenge "${getPlayerAlias(playerChallengedId)}"`, reportedResult)
        return false
    }

    if ( (challengerPlace - playerChallengedPlace) > challenger.range ) {// Challenger out of range
        logIgnoredChallenge(`Ignored result because "${getPlayerAlias(challengerId)}" (place ${challengerPlace}) cannot reach "${getPlayerAlias(playerChallengedId)}" (place ${playerChallengedPlace}) with only ${challenger.range} of range`, reportedResult)
        return false
    }

    if ( doesPlayerAAlreadyWonAgainstThatPlace(challengerId, challenger.completed_challenges, playerChallengedPlace, rankingTable) ) {
        logIgnoredChallenge(`Ignored result because "${getPlayerAlias(challengerId)}" already won against a player in the same place as "${getPlayerAlias(playerChallengedId)}" (place ${playerChallengedPlace})`, reportedResult)
        return false
    }

    return true;
}

const applyChallengerWinsScoringRules = challengerScore => ({
    ...challengerScore,
    range: challengerScore.range + 1,
})

const applyChallengerLosesScoringRules = challengerScore => ({
    ...challengerScore,
    coins: challengerScore.coins - 1
})

const applyPlayerChallengedWinsScoringRules = playerChallengedScore => ({
    ...playerChallengedScore,
    stand_points: playerChallengedScore.stand_points + 1
})

const applyActivitiesToRanking = (activities, rankingObj) => {

    if (typeof activities !== 'object') {
        throw new Error(`The "activities" argument must be an object but received "${typeof activities}" instead.`)
    }

    if (typeof rankingObj !== 'object') {
        throw new Error(`The "rankingObj" argument must be an object but received "${typeof rankingObj}" instead.`)
    }

    const { challenges } = activities, {ranking: rankingTable,  in_progress: { scoreboard } } = rankingObj
    const newScoreboard = challenges.reduce(
        (currentScoreboard, match) => {
            // {
            //     winner: player1Result > player2Result ? player1 : player2,
            //     player1, player2, player1Result, player2Result,
            //     players: [player1, player2]
            // }

            if ( !isReportedResultValid(match, rankingTable, currentScoreboard) ) {
                return currentScoreboard // if not valid we simply ignore this match
            }
            
            const { player1, player2, player1Result, player2Result, winner } = match
            const {
                challengerId, challengerPlace,
                playerChallengedId, playerChallengedPlace
            } = identifyPlayers(player1, player2, rankingTable)
            const challengerScore = currentScoreboard[challengerId]


            if (challengerScore.completed_challenges === scoreboard[challengerId].completed_challenges) {
                challengerScore.completed_challenges = [...scoreboard[challengerId].completed_challenges]
            }
            challengerScore.completed_challenges.push(match)

            
            if (winner === challengerId) {
                currentScoreboard[challengerId] = applyChallengerWinsScoringRules(challengerScore)
            }
            else {// Winner is player challenged
                currentScoreboard[challengerId] = applyChallengerLosesScoringRules(challengerScore)
                currentScoreboard[playerChallengedId] = applyPlayerChallengedWinsScoringRules(currentScoreboard[playerChallengedId])
            }

            return currentScoreboard
        },
        { ...scoreboard }
    )

    return {
        ...rankingObj,
        in_progress: {
            scoreboard: newScoreboard
        }
    }
}

const getNextWeekObject = lastEndOfWeek => {
    const endDate = new Date(lastEndOfWeek)
    endDate.setDate(endDate.getDate() + 7);
    return {
        start: lastEndOfWeek + 1,
        end: endDate.getTime()
    }
}

const isItTimeToCommitInProgress = (nowDate, currentWeek) => {
    return currentWeek.end <= nowDate.getTime()
}

const getInitialCoinsForPlayer = playerPlace => {

    if (playerPlace === 1) {
        return 0
    }

    const result = Math.ceil(playerPlace / 5)
    return result > 5 ? 5 : result
}

const calculatePointsFromPlayerScore = (playerScore, playerPlace) => {
    const { stand_points, points, coins, range} = playerScore
    const initialCoins = getInitialCoinsForPlayer(playerPlace)
    return points + stand_points + range - initialCoins
}

const getRankingFromScoreboard = (scoreboard, rankingTable) => {
    const scoreDict = Object.keys(scoreboard).reduce(
        (resultObj, playerId) => {
            const playerPlace = getRankingPlaceByPlayerId(playerId, rankingTable)
            const initialCoins = getInitialCoinsForPlayer(playerPlace)
            const score = scoreboard[playerId].points + ( (scoreboard[playerId].range - initialCoins) / 1000 )

            if (score < 1) {// Ignoring the people with 0 points from the ranking
                return resultObj
            }

            if (!resultObj[score]) {
                resultObj[score] = []
            }

            resultObj[score].push(playerId)
            return resultObj
        },
        {}
    )

    return Object.keys(scoreDict).sort( (a, b) => b - a ).map(score => scoreDict[score])
}

const commitInProgress = rankingObj => {
    const result = { ...rankingObj }
    const inProgress = { ...result.in_progress }

    // Creates a clone of all player's score with updated points
    const newScoreboard = Object.keys(inProgress.scoreboard).reduce(
        (tmpScoreboard, playerId) => {
            const playerPlace = getRankingPlaceByPlayerId(playerId, rankingObj.ranking)
            tmpScoreboard[playerId] = {
                ...inProgress.scoreboard[playerId],
                points: calculatePointsFromPlayerScore(inProgress.scoreboard[playerId], playerPlace)
            }
            // tmpScoreboard[playerId] = applyEndOfWeekRulesToPlayerScore(inProgress.scoreboard[playerId], playerPlace)
            return tmpScoreboard
        },
        {}
    )

    // We need to generate the new ranking table in order to know how many coins tha players should get
    result.ranking = getRankingFromScoreboard(newScoreboard, rankingObj.ranking)
    
    // Applies inital completed_challenges, stand_points, coins and range
    Object.keys(newScoreboard).forEach(
        playerId => {
            const playerPlace = getRankingPlaceByPlayerId(playerId, result.ranking)
            const initialCoins = getInitialCoinsForPlayer(playerPlace)
            newScoreboard[playerId].coins = initialCoins
            newScoreboard[playerId].range = initialCoins
            newScoreboard[playerId].stand_points = 0
            newScoreboard[playerId].completed_challenges = []
        }
    )

    
    inProgress.scoreboard = newScoreboard
    result.current_week = getNextWeekObject(rankingObj.current_week.end)
    result.last_update_ts = inProgress.last_update_ts
    result.scoreboard = inProgress.scoreboard
    result.in_progress = inProgress
    return result
}

/* istanbul ignore next */
const getMessageToNotifyUsers = (weekCommited, totalValidActivities, totalIgnoredActivities, endOfSeason) => {
    if (weekCommited) {
        return '¡Ha iniciando un nuevo ranking esta semana!, ya pueden revisar en qué lugar quedaron.\n' +
                'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
    }

    return 'Aquí reportando que ya actualicé el scoreboard.' +
            'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
}


module.exports = {
    categorizeSlackMessages,
    getRankingFromScoreboard,
    isItTimeToCommitInProgress,
    getRankingPlaceByPlayerId,
    commitInProgress,
    applyActivitiesToRanking,
    getMessageToNotifyUsers,
    calculatePointsFromPlayerScore,
    getNextWeekObject
}
