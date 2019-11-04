'use strict'
const {
    getPlayerAlias,
    logIgnoredMatch,
    removeAlreadyChallengedPlayers,
    removeEmptyArray,
    eloCalculation
} = require('./utils')

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
        points: 1000,
        initial_coins: initialCoins, coins: initialCoins, range: initialCoins,
        completed_challenges: []
    }
}

const isReportedResultValid = (identifiedPlayersObj, rankingTable, challenger, playerChallenged, reportedResult) => {

    const {
        challengerId, challengerPlace,
        playerChallengedId, playerChallengedPlace
    } = identifiedPlayersObj



    if (challengerPlace === playerChallengedPlace) {
        if (challengerPlace <= 5) {
            // They cannot challenge each other in the same place above place 5
            logIgnoredMatch(`Ignored result between players "${getPlayerAlias(challengerId)}" & "${getPlayerAlias(playerChallengedId)}" because they are in the same place but are in the top 5.`, reportedResult)
            return false
        }

        if (challenger.coins < 1 || playerChallenged.coins < 1) {
            // They cannot challenge each other unless both has at least 1 coin
            logIgnoredMatch(`Ignored result between players "${getPlayerAlias(challengerId)}" & "${getPlayerAlias(playerChallengedId)}" because they are in the same place but at least one of them has 0 coins.`, reportedResult)
            return false
        }

        if (
            doesPlayerChallengedAlreadyWonAgainstThatChallenger(challengerId, playerChallenged.completed_challenges) ||
            doesPlayerChallengedAlreadyWonAgainstThatChallenger(playerChallengedId, challenger.completed_challenges)
        ) {
            // They cannot challenge each each other more than once if both are in same place
            logIgnoredMatch(`Ignored result between players "${getPlayerAlias(challengerId)}" & "${getPlayerAlias(playerChallengedId)}" because they already reported the untie match before.`, reportedResult)
            return false
        }
    }
    

    if (challenger.coins < 1) {// No remaining coins, so no more challenges
        logIgnoredMatch(`Ignored result because "${getPlayerAlias(challengerId)}" has 0 coins, so he cannot challenge "${getPlayerAlias(playerChallengedId)}"`, reportedResult)
        return false
    }

    if ( (challengerPlace - playerChallengedPlace) > challenger.range ) {// Challenger out of range
        logIgnoredMatch(`Ignored result because "${getPlayerAlias(challengerId)}" (place ${challengerPlace}) cannot reach "${getPlayerAlias(playerChallengedId)}" (place ${playerChallengedPlace}) with only ${challenger.range} of range`, reportedResult)
        return false
    }

    if ( doesPlayerAAlreadyWonAgainstThatPlace(challengerId, challenger.completed_challenges, playerChallengedPlace, rankingTable) ) {
        logIgnoredMatch(`Ignored result because "${getPlayerAlias(challengerId)}" already won against a player in the same place as "${getPlayerAlias(playerChallengedId)}" (place ${playerChallengedPlace})`, reportedResult)
        return false
    }

    return true;
}

const applyChallengerWinsScoringRules = (challengerScore, playerChallengedScore, winnerMatchScoreDiff) => ({
    ...challengerScore,
    range: challengerScore.range + 1,
    points: eloCalculation(challengerScore.points, playerChallengedScore.points, winnerMatchScoreDiff)
})

const applyChallengerLosesScoringRules = (challengerScore, playerChallengedScore) => ({
    ...challengerScore,
    coins: challengerScore.coins - 1,
    points: eloCalculation(challengerScore.points, playerChallengedScore.points, 0)
})

const applyPlayerChallengedWinsScoringRules = (playerChallengedScore, challengerScore, winnerMatchScoreDiff) => ({
    ...playerChallengedScore,
    points: eloCalculation(playerChallengedScore.points, challengerScore.points, winnerMatchScoreDiff)
})

const applyPlayersUntieScoringRules = (winnerInSamePlaceScore, loserScore, winnerMatchScoreDiff) => ({
    ...winnerInSamePlaceScore,
    points: eloCalculation(winnerInSamePlaceScore.points, loserScore.points, winnerMatchScoreDiff)
})

const applyPlayerChallengedLosesScoringRules = (playerChallengedScore, challengerScore) => ({
    ...playerChallengedScore,
    points: eloCalculation(challengerScore.points, playerChallengedScore.points, 0)
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
            const loserId = winner === challengerId ? playerChallengedId : challengerId
            const winnerMatchDiffResult = winner === player1 ? player1Result - player2Result : player2Result - player1Result
            const challengerScore = currentScoreboard[challengerId] || getUnrankedPlayerScore(challengerPlace)
            const playerChallengedScore = currentScoreboard[playerChallengedId] || getUnrankedPlayerScore(playerChallengedPlace)


            if ( !isReportedResultValid(identifiedPlayersObj, rankingTable, challengerScore, playerChallengedScore, match) ) {
                return currentScoreboard // if not valid we simply ignore this match
            }

            if (scoreboard[challengerId] && challengerScore.completed_challenges === scoreboard[challengerId].completed_challenges) {
                // Clones completed challenges to avoid manipulating the old state. 
                challengerScore.completed_challenges = [...scoreboard[challengerId].completed_challenges]
            }
            
            if (challengerPlace === playerChallengedPlace) {// Challenge between players in same place
                let winnerScore = playerChallengedScore
                let loserScore = challengerScore
                
                if (winner === challengerId) {
                    winnerScore = challengerScore
                    loserScore = playerChallengedScore
                }

                // Apply scoring adjustment
                currentScoreboard[winner] = applyPlayersUntieScoringRules(winnerScore, loserScore, winnerMatchDiffResult)
                currentScoreboard[loserId] = applyChallengerLosesScoringRules(loserScore, winnerScore)

                // Add a record of the match
                currentScoreboard[winner].completed_challenges.push(match)
                currentScoreboard[loserId].completed_challenges.push(match)
            }
            else {// Normal challenge
                if (winner === challengerId) {
                    currentScoreboard[challengerId] = applyChallengerWinsScoringRules(challengerScore, playerChallengedScore, winnerMatchDiffResult)
                    currentScoreboard[playerChallengedId] = applyPlayerChallengedLosesScoringRules(playerChallengedScore, challengerScore)
                }
                else {// Winner is player challenged
                    currentScoreboard[challengerId] = applyChallengerLosesScoringRules(challengerScore, playerChallengedScore)
                    currentScoreboard[playerChallengedId] = applyPlayerChallengedWinsScoringRules(playerChallengedScore, challengerScore, winnerMatchDiffResult)
                }

                // Add a record of the match
                challengerScore.completed_challenges.push(match)
            }

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
    const newInactivePlayers = { ...rankingObj.inactive_players }

    // Update inactive players list
    Object.keys(inProgress.scoreboard).forEach(
        (playerId) => {
            const isPlayerInactiveThisWeek = !Object.keys(inProgress.scoreboard).find(
                (anotherPlayerId) => {
                    const anotherPlayerScoreboard = inProgress.scoreboard[anotherPlayerId]
                    const anotherPlayerChallenges = anotherPlayerScoreboard.completed_challenges
                    return anotherPlayerChallenges.find(
                        (challenge) => {
                            return playerId === challenge.player1 || playerId === challenge.player2
                        }
                    )
                }
            )

            if ( !isPlayerInactiveThisWeek || (
                newInactivePlayers[playerId] && newInactivePlayers[playerId].deleted_by_inactivity
            ) ) {
                // Player was active this week or was previuosly marked as deleted, so we 
                // remove the player from the list.
                delete newInactivePlayers[playerId]
                return
            }

            if (!newInactivePlayers[playerId]) {// New inactive player, let's create the profile 
                newInactivePlayers[playerId] = {
                    weeks_count: 0,
                    inactive_since: inProgress.last_update_ts
                }
            }
            newInactivePlayers[playerId].weeks_count++
        }
    )

    // Creates a clone of all player's score with updated points
    const newScoreboard = Object.keys(inProgress.scoreboard).reduce(
        (tmpScoreboard, playerId) => {
            tmpScoreboard[playerId] = {
                ...inProgress.scoreboard[playerId]
            }

            if (newInactivePlayers[playerId]) {
                const unrankedPlayerScore = getUnrankedPlayerScore(0)
                if (newInactivePlayers[playerId].weeks_count > 1) {
                    // Punish inactive player by losing against an unranked player
                    tmpScoreboard[playerId] = applyPlayerChallengedLosesScoringRules(
                        tmpScoreboard[playerId],
                        unrankedPlayerScore
                    )
                }
    
                if (tmpScoreboard[playerId].points <= unrankedPlayerScore.points) {
                    // Remove player for it's inactivity, but we want to keep 
                    // track of what happened, so we just mark the player
                    newInactivePlayers[playerId].deleted_by_inactivity = true
                    delete tmpScoreboard[playerId]
                }
            }
            return tmpScoreboard
        },
        {}
    )

    // We need to generate the new ranking table in order to know how many coins 
    // the players should get at the end of week.
    result.ranking = getRankingFromScoreboard(newScoreboard)


    // Applies inital completed_challenges, initial_coins, coins and range
    const newInProgressScoreboard = Object.keys(newScoreboard).reduce(
        (tmpScoreboard, playerId) => {
            const playerPlace = getRankingPlaceByPlayerId(playerId, result.ranking)
            const initialCoins = getInitialCoinsForPlayer(playerPlace)
            tmpScoreboard[playerId] = {
                initial_coins: initialCoins, coins: initialCoins, range: initialCoins,
                points: newScoreboard[playerId].points, 
                completed_challenges: [],
            }
            return tmpScoreboard
        },
        {}
    )

    
    result.inactive_players = newInactivePlayers
    result.scoreboard = newScoreboard
    inProgress.scoreboard = newInProgressScoreboard
    result.last_update_ts = inProgress.last_update_ts
    result.in_progress = inProgress
    result.current_week = getNextWeekObject(result.current_week.end)
    return result
}

const getPlayersThatCanBeChallenged = (playerPlace, playerRange, completeRanking, playerId) => {
    const { in_progress, ranking } = completeRanking
    let index = playerPlace - playerRange - 1

    if (index < 0) {
        index = 0
    }

    return removeEmptyArray(removeAlreadyChallengedPlayers(ranking.slice(index, index + playerRange), playerId, in_progress))
}


module.exports = {
    getRankingFromScoreboard,
    isItTimeToCommitInProgress,
    getRankingPlaceByPlayerId,
    commitInProgress,
    updateInProgressScoreboard,
    getNextWeekObject,
    getUnrankedPlayerScore,
    getPlayersThatCanBeChallenged,
    isReportedResultValid
}
