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
                // Slack bot is not tagged in this message, just ignore it
                result.ignoredMessagesCount++
                return result
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
            reportedResults: [],
            ignoredMessagesCount: 0
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

const doesPlayerChallengedAlreadyWonAgainstThatChallenger = (playerChallengedId, challengersCompletedChallenges) => challengersCompletedChallenges.find(
    match => match.winner === playerChallengedId
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

const getUnrankedPlayerScore = playerPlace => {
    const initialCoins = getInitialCoinsForPlayer(playerPlace)
    return {
        stand_points: 0, points: 0,
        initial_coins: initialCoins, coins: initialCoins, range: initialCoins,
        completed_challenges: []
    }
}

const isReportedResultValid = (identifiedPlayersObj, rankingTable, playerScoreboard, reportedResult) => {

    const {
        challengerId, challengerPlace,
        playerChallengedId, playerChallengedPlace
    } = identifiedPlayersObj

    if (challengerPlace === playerChallengedPlace) {// They cannot challenge people in the same place
        logIgnoredChallenge(`Ignored result between players "${getPlayerAlias(challengerId)}" & "${getPlayerAlias(playerChallengedId)}" because they are in the same place.`, reportedResult)
        return false
    }

    const challenger = playerScoreboard

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

const updateInProgressScoreboard = (activities, rankingObj) => {

    if (typeof activities !== 'object') {
        throw new Error(`The "activities" argument must be an object but received "${typeof activities}" instead.`)
    }

    if (typeof rankingObj !== 'object') {
        throw new Error(`The "rankingObj" argument must be an object but received "${typeof rankingObj}" instead.`)
    }

    const { reportedResults } = activities, {ranking: rankingTable,  in_progress: { scoreboard } } = rankingObj
    const newScoreboard = reportedResults.reduce(
        (currentScoreboard, match) => {
            // {
            //     winner: player1Result > player2Result ? player1 : player2,
            //     player1, player2, player1Result, player2Result,
            //     players: [player1, player2]
            // }

            const { player1, player2, player1Result, player2Result, winner } = match
            const identifiedPlayersObj = identifyPlayers(player1, player2, rankingTable)
            const {
                challengerId, challengerPlace,
                playerChallengedId, playerChallengedPlace
            } = identifiedPlayersObj
            const challengerScore = currentScoreboard[challengerId] || getUnrankedPlayerScore(challengerPlace)


            if ( !isReportedResultValid(identifiedPlayersObj, rankingTable, challengerScore, match) ) {
                return currentScoreboard // if not valid we simply ignore this match
            }

            if (scoreboard[challengerId] && challengerScore.completed_challenges === scoreboard[challengerId].completed_challenges) {
                challengerScore.completed_challenges = [...scoreboard[challengerId].completed_challenges]
            }
            
            if (winner === challengerId) {
                currentScoreboard[challengerId] = applyChallengerWinsScoringRules(challengerScore)
            }
            else {// Winner is player challenged
                currentScoreboard[challengerId] = applyChallengerLosesScoringRules(challengerScore)
                if ( !doesPlayerChallengedAlreadyWonAgainstThatChallenger(playerChallengedId, challengerScore.completed_challenges) ) {
                    currentScoreboard[playerChallengedId] = applyPlayerChallengedWinsScoringRules(currentScoreboard[playerChallengedId])
                }
            }

            challengerScore.completed_challenges.push(match)

            return currentScoreboard
        },
        { ...scoreboard }
    )

    return {
        ...rankingObj.in_progress,
        scoreboard: newScoreboard
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

const calculatePointsFromPlayerScore = playerScore => {
    const { stand_points, points, coins, range, initial_coins} = playerScore
    return points + stand_points + range - initial_coins - coins
}

const getRankingFromScoreboard = scoreboard => {
    const scoreDict = Object.keys(scoreboard).reduce(
        (resultObj, playerId) => {
            const { points, initial_coins, range} = scoreboard[playerId]
            const score = points + ( (range - initial_coins) / 1000 )

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

    // We need to generate the new ranking table in order to know how many coins 
    // the players should get at the end of week. Also we use the old ranking to 
    // calculatethe initial coins they have for the Tie-breaker.
    result.ranking = getRankingFromScoreboard(newScoreboard)
    
    // Now that the new score has been calculated that's how the week ended
    result.scoreboard = newScoreboard

    // Applies inital completed_challenges, initial_coins, stand_points, coins and range
    Object.keys(newScoreboard).forEach(
        playerId => {
            const playerPlace = getRankingPlaceByPlayerId(playerId, result.ranking)
            const initialCoins = getInitialCoinsForPlayer(playerPlace)
            newScoreboard[playerId].initial_coins = initialCoins
            newScoreboard[playerId].coins = initialCoins
            newScoreboard[playerId].range = initialCoins
            newScoreboard[playerId].stand_points = 0
            newScoreboard[playerId].completed_challenges = []
        }
    )

    
    inProgress.scoreboard = newScoreboard
    result.last_update_ts = inProgress.last_update_ts
    result.in_progress = inProgress
    result.current_week = getNextWeekObject(result.last_update_ts)
    return result
}

/* istanbul ignore next */
const getMessageToNotifyUsers = (weekCommited, totalValidActivities, ignoredActivities, 
            ignoredMessagesCount, season, isNewVersion) => {
    if (weekCommited) {
        return '¡Ha iniciando un nuevo ranking esta semana!, ya pueden revisar en qué lugar quedaron.\n' +
                'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
    }

    if (totalValidActivities === 0 && !isNewVersion) {
        return 'Parece que no hubo actividad desde la ùltima vez que revisé, ¿será que son vacaciones? :thinking_face:'
    }

    let ignoredMessagesTxt = ''
    if (ignoredMessagesCount > 0) {
        ignoredMessagesTxt = '\n\nPor cierto, les recuerdo que sólo soy una máquina y hubo ' + ignoredMessagesCount +
            ' mensajes donde me taggearon pero no entedí qué querían. :sweat_smile:' + 
            '\nRecuerden seguir el formato para poder entenderles'
    }

    let ignoredActivities = ''
    if (ignoredActivities.length > 0) {
        const ignoredMessages = Object.keys(ignoredActivities).map(
            type => {
                ignoredActivities[type].map(
                    ({ reason }) => `* ${reason}`
                ).join('\n')
            }
        ).join('\n')

        ignoredActivities = '\n\nAdemás, parece que aún hay gente que no conoce las reglas, ya que tuve que ignorar ' + 
                            ignoredActivities.length + ' mensajes en donde me taggearon. :unamused:' +
                            '\nEstos fueron los motivos' + '```' + ignoredMessages  + '```' +
                            'Léanse las reglas por favor -> https://github.com/Xotl/Smash-League#ranking-rules'

    }

    return 'Aquí reportando que ya actualicé el scoreboard.\n' +
           'https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md' +
           + ignoredMessagesTxt + ignoredActivities
}


module.exports = {
    categorizeSlackMessages,
    getRankingFromScoreboard,
    isItTimeToCommitInProgress,
    getRankingPlaceByPlayerId,
    commitInProgress,
    updateInProgressScoreboard,
    getMessageToNotifyUsers,
    calculatePointsFromPlayerScore,
    getNextWeekObject
}
