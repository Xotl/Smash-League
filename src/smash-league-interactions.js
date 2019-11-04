'use strict'
const {Wit, log} = require('node-wit')
const Utils = require('./utils')
const SmashLeague = require('./smash-league')

const Config = require('../config.json')
const Ranking = require('../ranking-info/ranking.json')

const WIT_TOKEN =  process.env.WIT_TOKEN
const BOT_SLACK_TAG = `<@${Config.bot_id}>`

const GetUserIDFromUserTag = userTag => userTag.slice(2, -1)

const sortWitEntityArrayByConfidence = entityArray => entityArray && entityArray.sort( entity => entity.confidence)

const getReportedResultObjFromWitEntities = (user, players = [], score = [], match_result, onbehalf) => {
    if (score.length < 2) {// Missing score
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: Utils.getRandomMessageById('reported_result missing_score', {bothScoresMissing: score.length === 0})
        }
    }
    
    if (match_result && players.length === 0) {// Match result with players missing
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: Utils.getRandomMessageById('reported_result myself_missing_player', { match_result })
        }
    }

    if (!match_result && players.length < 2) {// One player missing with no match result
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: Utils.getRandomMessageById('reported_result normal_missing_player', {bothPlayersMissing: players.length === 0})
        }
    }

    const player1Entity = players[0]
    const player2Entity = onbehalf ? onbehalf[0] : players[1]
    const player1ScoreEntity = score[0]
    const player2ScoreEntity = score[1]

    const player1ResultAbs = Math.abs( player1ScoreEntity.value ), player2ResultAbs = Math.abs( player2ScoreEntity.value )
    
    let player1, player2, player1Result, player2Result
    if (match_result) {
        player1 = GetUserIDFromUserTag(player1Entity.value)
        player2 = player2Entity ? GetUserIDFromUserTag(player2Entity.value) : user
        if (match_result[0].value === 'win') {
            player1Result = player1ResultAbs < player2ResultAbs ? player1ResultAbs : player2ResultAbs
            player2Result = player1ResultAbs > player2ResultAbs ? player1ResultAbs : player2ResultAbs
        }
        else {// lose
            player1Result = player1ResultAbs > player2ResultAbs ? player1ResultAbs : player2ResultAbs
            player2Result = player1ResultAbs < player2ResultAbs ? player1ResultAbs : player2ResultAbs
        }
    }
    else {
        player1 = GetUserIDFromUserTag(player1Entity.value)
        player2 = GetUserIDFromUserTag(player2Entity.value)
        player1Result = player1ResultAbs
        player2Result = player2ResultAbs
    }

    return {
        ok: true,
        value: {
            winner: player1Result > player2Result ? player1 : player2,
            player1, player2, player1Result, player2Result,
            players: [player1, player2]
        }
    }
}

const getLookupChallengersResponseFromWitEntities = (user, witEntities) => {
    const results = []
    witEntities.lookup_challengers.forEach(
        entity => {
            const { confidence, value } = entity
            
            if (confidence < 0.8) {// Not enough confidence, no sure what the user wants
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById('lookup_challengers confidence_low', {type: value})
                })
            }

            if (!['onbehalf_specific', 'onbehalf_all', 'myself_all', 'myself_specific'].includes(value)) {
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById('lookup_challengers not_implemented', {type: value})
                })
            }

            let userWhoWantstoKnow = user, whoWantsToKnow = 'myself'
            if (value.includes('onbehalf')) {
                whoWantsToKnow = 'onbehalf'
                if (!witEntities.onbehalf) {
                    return results.push({
                        ok: false,
                        error: Utils.getRandomMessageById(`lookup_challengers ${whoWantsToKnow}_missing`)
                    })
                }

                userWhoWantstoKnow = GetUserIDFromUserTag(witEntities.onbehalf[0].value)
            }


            const playerPlace = SmashLeague.getRankingPlaceByPlayerId(userWhoWantstoKnow, Ranking.ranking)
            let playerScore = Ranking.in_progress.scoreboard[userWhoWantstoKnow]
            const isUnrankedPlayer = !playerScore

            if (isUnrankedPlayer) {// Unranked Player
                playerScore = SmashLeague.getUnrankedPlayerScore(playerPlace)
            }

            if (playerScore.coins <= 0) {
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById(`lookup_challengers ${whoWantsToKnow} no_coins`, {user: `<@${userWhoWantstoKnow}>`})
                })
            }

            const playersArray = SmashLeague.getPlayersThatCanBeChallenged(playerPlace, playerScore.range, Ranking, userWhoWantstoKnow)
            if (value.includes('_all')) {
                return results.push({
                    ok: true,
                    value: Utils.getRandomMessageById(
                        `lookup_challengers ${whoWantsToKnow}_all`,
                        { 
                            user: `<@${userWhoWantstoKnow}>`,
                            listOfValidPlayers: playersArray.map(
                                placeArray => {
                                    const playersString = placeArray.map(
                                        playerId => '`<@' + playerId + '>`'
                                    ).join(', ')
                
                                    return `- ${playersString} ${
                                        placeArray.length > 1 ? 
                                            '_(' + Utils.getRandomMessageById(
                                                'lookup_challengers select_one', { num: placeArray.length}
                                            ) + ')_'
                                            : ''
                                    }`
                                }
                            ).join('\n') 
                        }
                    )
                })
            }

            if (value.includes('_specific')) {
                if (!witEntities.player) {
                    return results.push({
                        ok: false,
                        error: Utils.getRandomMessageById(
                            `lookup_challengers ${whoWantsToKnow}_specific missing_players`,
                            {user: `<@${userWhoWantstoKnow}>`}
                        )
                    })
                }

                const playersArrayFlat = playersArray.flat()
                const mentionedPlayers = witEntities.player.map( e => GetUserIDFromUserTag(e.value) )
                const mentionedAndValidPlayers = mentionedPlayers.filter(
                    mentionedPlayer => playersArrayFlat.includes( mentionedPlayer )
                )

                if (mentionedAndValidPlayers.length === 0) {
                    return results.push({
                        ok: false,
                        error: Utils.getRandomMessageById(
                            `lookup_challengers ${whoWantsToKnow}_specific cannot_challenge`,
                            {
                                user: `<@${userWhoWantstoKnow}>`,
                                mentionedPlayersQty: mentionedPlayers.length,
                                mentionedPlayers: mentionedPlayers.map(p => `<@${p}>`)
                            }
                        )
                    })
                }

                if (mentionedAndValidPlayers.length === mentionedPlayers.length) {
                    return results.push({
                        ok: true,
                        value: Utils.getRandomMessageById(
                            `lookup_challengers ${whoWantsToKnow}_specific all_players_found`,
                            {
                                user: `<@${userWhoWantstoKnow}>`,
                                mentionedPlayersQty: mentionedPlayers.length,
                                mentionedPlayers: mentionedPlayers.map(p => `<@${p}>`)

                            }
                        )
                    })
                }

                return results.push({
                    ok: true,
                    value: Utils.getRandomMessageById(
                        `lookup_challengers ${whoWantsToKnow}_specific some_players_found`,
                        { 
                            user: `<@${userWhoWantstoKnow}>`,
                            listOfValidPlayers: mentionedAndValidPlayers.map(p => `<@${p}>`).join(', ')
                        }
                    )
                })
            }

            return results.push({
                ok: false,
                error: Utils.getRandomMessageById('lookup_challengers not_implemented', {type: value})
            })
        }
    )

    return results
}

const getReportedResultFromWitEntities = (user, witEntities) => {
    const results = []
    witEntities.reported_result.forEach(
        entity => {
            const { confidence, value } = entity
            
            if (confidence < 0.8) { // Not enough confidence, no sure what the user wants
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById('reported_result confidence_low', {type: value})
                })
            }

            if ( !['normal', 'myself', 'onbehalf'].includes(value) ) {// Wit is trained but there's no implemententation yet
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById('reported_result not_implemented', {type: value})
                })
            }

            results.push( getReportedResultObjFromWitEntities(
                user, witEntities.player, witEntities.score,
                witEntities.match_result, witEntities.onbehalf
            ) )
        }
    )

    return results
}

const categorizeSlackMessages = async (messagesArray) => {
    if (!Array.isArray(messagesArray)) {
        throw new Error('The argument messagesArray must be an Array.')
    }

    const WitClient = new Wit({
        accessToken: WIT_TOKEN,
        logger: new log.Logger(log.DEBUG) // optional
    })

    const ignoredMessages = []
    const promiseArray = messagesArray.filter(
        // Ignore it if Slack bot is not tagged in this message or is bot message
        ({ text, subtype }) => !(subtype === 'bot_message' || -1 === text.indexOf(BOT_SLACK_TAG))
    ).map(
        async ({ text:message, user, ts, thread_ts }) => {
            const messageWithoutBotTag = Utils.removesBotTagFromString(message)
            const { entities } = await WitClient.message(messageWithoutBotTag, {})
            let result

            if (entities.reported_result) {
                const reportedResults = getReportedResultFromWitEntities(user, entities)
                                            .filter(i => i.ok).map(i => i.value)

                if ( reportedResults.length > 0 ) {
                    result = { reportedResults }
                }
            }

            if (result) {
                result.ts = ts
            }
            else {// Ignored message
                ignoredMessages.push(`[${Utils.getPlayerAlias(user)}] - ${message}`)
            }

            return result
        }
    )

    const allResults = await Promise.all(promiseArray)

    if (ignoredMessages.length > 0) {
        console.log('########## Ignored Messages ########')
        console.log(ignoredMessages.join('\n'))
    }

    return allResults.filter(// Filters the undefined values
        value => value
    ).sort(// Sorts from oldest to latest
        (a, b) => Number(a.ts) - Number(b.ts)
    ).reduce(
        (result, activityObj) => {
            if (activityObj.challenges) {
                result.challenges = [...result.challenges, ...activityObj.challenges]
            }

            if (activityObj.reportedResults) {
                result.reportedResults = [...result.reportedResults, ...activityObj.reportedResults]
            }

            if (activityObj.ignoredMessages) {
                result.ignoredMessages = [...result.ignoredMessages, ...activityObj.ignoredMessages]
            }
            
            return result
        },
        {
            challenges: [],
            reportedResults: [],
            ignoredMessages: []
        }
    )
}

const getUpdatesToNotifyUsers = (weekCommited, totalValidActivities, ignoredActivities, 
    ignoredMessagesCount, season, newVersion) => {

    const slackBlocks = []
    if (newVersion) {
        const newVersionStuff = []
        newVersionStuff.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": Utils.getRandomMessageById('new_version', {newVersion})
            }
        })
        
        if (totalValidActivities === 0) {
            newVersionStuff.push({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": Utils.getRandomMessageById('new_version no_activity')
                    }
                ]
            })
        }
        else {
            newVersionStuff.push({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": Utils.getRandomMessageById('new_version with_activity')
                    }
                ]
            })
        }

        slackBlocks.push(newVersionStuff)
    }
    else if (!weekCommited) {// If week commited then there's no need to show this
        if (totalValidActivities === 0) {
            slackBlocks.push([{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": Utils.getRandomMessageById('daily_update no_activity')
                }
            }])
        }
        else {
            slackBlocks.push([{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": Utils.getRandomMessageById('daily_update with_activity')
                }
            }])
        }
    }


    if (weekCommited) {
        slackBlocks.push([
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": Utils.getRandomMessageById('daily_update week_commited')
                }
            }
        ])

        if (weekCommited.newChampionName) {
            slackBlocks.push([
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": Utils.getRandomMessageById('daily_update week_commited_new_champion', { newChampionName })
                    }
                }
            ])
        }
    }

    if (weekCommited && weekCommited.newChampionName) {
        slackBlocks.push([
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": Utils.getRandomMessageById('daily_update week_commited_new_champion', { newChampionName })
                }
            }
        ])
    }

    if (Array.isArray(ignoredActivities) && ignoredActivities.length > 0) {
        const ignoredMessages = Object.keys(ignoredActivities).map(
            type => {
                ignoredActivities[type].map(
                    ({ reason }) => `* [${type}]: ${reason}`
                ).join('\n')
            }
        ).join('\n')

        slackBlocks.push([
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": Utils.getRandomMessageById('daily_update ignored_activities', {
                        numIgnoredActivities: ignoredActivities.length, ignoredMessages
                    })
                }
            }
        ])
    }


    return slackBlocks.flatMap(
        (block, idx, arr) => {
            if (idx < arr.length - 1) {// Avoid adding a divider on last item
                block.push({
                    "type": "divider"
                })
            }
            return block
        }
    )
}

const getSlackUrlForMessage = (msgtTs, thread_ts) => {
    const tsId = msgtTs.toString().replace('.', '')
    const baseUrl = `https://${Config.slack_workspace}.slack.com/archives/${Config.slack_channel_id}/p${tsId}`

    let threadQueryParams = ''
    if (thread_ts) {
        threadQueryParams = `?thread_ts=${thread_ts}&cid=${Config.slack_channel_id}`
    }

    return baseUrl + threadQueryParams
}

const notifyInThreadThatMeesagesGotIgnored = async (ignoredMessagesArray, postMessageFn = async () => {}) => {
    for (let index = 0; index < ignoredMessagesArray.length; index++) {
        const { user, ts, thread_ts } = ignoredMessagesArray[index] 
        const msg = `¿Qué onda con <${getSlackUrlForMessage(ts, thread_ts)}|tu mensaje> <@${user}>?. No entendí qué querías, sólo soy una máquina. :robot_face:`
        await postMessageFn(msg, Config.slack_channel_id, { thread_ts: thread_ts || ts })
    }
}

module.exports = {
    categorizeSlackMessages,
    getUpdatesToNotifyUsers,
    getReportedResultObjFromWitEntities,
    getReportedResultFromWitEntities,
    getLookupChallengersResponseFromWitEntities,
    getSlackUrlForMessage,
    notifyInThreadThatMeesagesGotIgnored,
}
