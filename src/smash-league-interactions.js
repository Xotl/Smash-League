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

const getReportedResultObjFromWitEntities = (user, player1Entity, player1ScoreEntity, player2Entity, player2ScoreEntity, match_result) => {
    if (!player1ScoreEntity || !player2ScoreEntity) {// Missing score
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: Utils.getRandomMessageById('reported_result missing_score', {bothScoresMissing: !player1ScoreEntity && !player2ScoreEntity})
        }
    }
    
    if (match_result && !player1Entity && !player2Entity) {// Match result with both players missing
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: Utils.getRandomMessageById('reported_result myself_missing_player', { match_result })
        }
    }

    if ( !match_result && (!player1Entity || !player2Entity) ) {// One player missing with no match result
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: Utils.getRandomMessageById('reported_result normal_missing_player', {bothPlayersMissing: !player1Entity && !player2Entity})
        }
    }

    player1Entity = sortWitEntityArrayByConfidence(player1Entity)
    player2Entity = sortWitEntityArrayByConfidence(player2Entity)
    player1ScoreEntity = sortWitEntityArrayByConfidence(player1ScoreEntity)
    player2ScoreEntity = sortWitEntityArrayByConfidence(player2ScoreEntity)
    match_result = sortWitEntityArrayByConfidence(match_result)

    const player1ResultAbs = Math.abs( player1ScoreEntity[0].value ), player2ResultAbs = Math.abs( player2ScoreEntity[0].value )
    
    let player1, player2, player1Result, player2Result
    if (match_result) {
        player1 = player1Entity ? GetUserIDFromUserTag(player1Entity[0].value) : GetUserIDFromUserTag(player2Entity[0].value)
        player2 = user
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
        player1 = GetUserIDFromUserTag(player1Entity[0].value)
        player2 = GetUserIDFromUserTag(player2Entity[0].value)
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

            let whoWantsToKnow = user
            if (value.includes('onbehalf')) {
                if (!witEntities.onbehalf) {
                    return results.push({
                        ok: false,
                        error: Utils.getRandomMessageById('lookup_challengers onbehalf_missing')
                    })
                }

                whoWantsToKnow = GetUserIDFromUserTag(witEntities.onbehalf[0].value)
            }


            const playerPlace = SmashLeague.getRankingPlaceByPlayerId(whoWantsToKnow, Ranking.ranking)
            let playerScore = Ranking.in_progress.scoreboard[whoWantsToKnow]
            const isUnrankedPlayer = !playerScore

            if (isUnrankedPlayer) {// Unranked Player
                playerScore = SmashLeague.getUnrankedPlayerScore(playerPlace)
            }

            if (playerScore.coins <= 0) {
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById('lookup_challengers no_coins')
                })
            }

            const playersArray = SmashLeague.getPlayersThatCanBeChallenged(playerPlace, playerScore.range, Ranking.ranking)
            if (value.includes('_all')) {
                return results.push({
                    ok: true,
                    value: Utils.getRandomMessageById(
                        'lookup_challengers all',
                        { 
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
                if (!witEntities.slack_user_id) {
                    return results.push({
                        ok: false,
                        error: Utils.getRandomMessageById('lookup_challengers specific_missing_players')
                    })
                }

                const playersArrayFlat = playersArray.flat()
                const mentionedPlayers = witEntities.slack_user_id.map( e => GetUserIDFromUserTag(e.value) )
                const mentionedAndValidPlayers = mentionedPlayers.filter(
                    mentionedPlayer => playersArrayFlat.includes( mentionedPlayer )
                )

                if (mentionedAndValidPlayers.length === 0) {
                    return results.push({
                        ok: false,
                        error: Utils.getRandomMessageById(
                            'lookup_challengers specific_cannot_challenge',
                            {
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
                            'lookup_challengers specific_all_players_found',
                            {
                                mentionedPlayersQty: mentionedPlayers.length,
                                mentionedPlayers: mentionedPlayers.map(p => `<@${p}>`)

                            }
                        )
                    })
                }

                return results.push({
                    ok: true,
                    value: Utils.getRandomMessageById(
                        'lookup_challengers specific_some_players_found',
                        { 
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

            if ( !['normal', 'myself'].includes(value) ) {// Wit is trained but there's no implemententation yet
                return results.push({
                    ok: false,
                    error: Utils.getRandomMessageById('reported_result not_implemented', {type: value})
                })
            }

            results.push( getReportedResultObjFromWitEntities(
                user, witEntities.player1, witEntities.player1_score,
                witEntities.player2, witEntities.player2_score, witEntities.match_result
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

            return result
        }
    )

    const allResults = await Promise.all(promiseArray)
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
    }

    if (ignoredActivities.length > 0) {
        const ignoredMessages = Object.keys(ignoredActivities).map(
            type => {
                ignoredActivities[type].map(
                    ({ reason }) => `* ${reason}`
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
