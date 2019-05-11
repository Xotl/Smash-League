'use strict'
const Config = require('../config.json')
const {Wit, log} = require('node-wit');

const WIT_TOKEN =  process.env.WIT_TOKEN
const BOT_SLACK_TAG = `<@${Config.bot_id}>`

const GetUserIDFromUserTag = userTag => userTag.slice(2, -1)

const sortWitEntityArrayByConfidence = entityArray => entityArray && entityArray.sort( entity => entity.confidence)

const getReportedResultObjFromWitEntities = (user, player1Entity, player1ScoreEntity, player2Entity, player2ScoreEntity, match_result) => {
    if (!player1ScoreEntity || !player2ScoreEntity) {// Missing score
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: `Falta el puntaje de ${!player1ScoreEntity && !player2ScoreEntity ? 'ambos jugadores' : 'uno de los jugadores'}`
        }
    }
    
    if (match_result && !player1Entity && !player2Entity) {// Match result with both players missing
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: `Indicaste que ${match_result === 'win' ? 'ganaste': 'perdiste'} aunque no dijiste contra quién`
        }
    }

    if ( !match_result && (!player1Entity || !player2Entity) ) {// One player missing with no match result
        return {// Not enough data to generate result object, so ignoring it
            ok: false, error: `Te faltó indicar ${!player1Entity && !player2Entity ? 'los jugadores involucrados' : 'quién es el otro jugador'}`
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
        player1 = user
        player2 = player1Entity ? GetUserIDFromUserTag(player1Entity[0].value) : GetUserIDFromUserTag(player2Entity[0].value)
        if (match_result[0].value === 'win') {
            player1Result = player1ResultAbs > player2ResultAbs ? player1ResultAbs : player2ResultAbs
            player2Result = player1ResultAbs < player2ResultAbs ? player1ResultAbs : player2ResultAbs
        }
        else {// lose
            player2Result = player1ResultAbs > player2ResultAbs ? player1ResultAbs : player2ResultAbs
            player1Result = player1ResultAbs < player2ResultAbs ? player1ResultAbs : player2ResultAbs
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

const categorizeSlackMessages = async (messagesArray) => {
    if (!Array.isArray(messagesArray)) {
        throw new Error('The argument messagesArray must be an Array.')
    }

    const WitClient = new Wit({
        accessToken: WIT_TOKEN,
        logger: new log.Logger(log.DEBUG) // optional
    })

    const promiseArray = messagesArray.filter(
        // Slack bot is not tagged in this message or a bot message, just ignore it
        ({ text, subtype }) => !(subtype === 'bot_message' || -1 === text.indexOf(BOT_SLACK_TAG))
    ).map(
        async ({ text:message, user, ts, thread_ts }) => {
            const messageWithoutBotTag = message.replace(new RegExp(BOT_SLACK_TAG, 'gm'), '')
            const { entities } = await WitClient.message(messageWithoutBotTag, {})

            if (!entities.intent) {
                return// Ignore all messages that doesn't have an intent
            }

            return entities.intent.reduce(
                (result, { value, confidence }) => {
                    if (confidence < 0.8) {
                        // not enough confidence, no sure what the user wants
                        // resultCategorized.ignoredMessages.push({text: message, user, ts, thread_ts})
                        return
                    }

                    switch(value) {
                        case 'reported_result':
                            const reportedResult = getReportedResultObjFromWitEntities(
                                user, entities.player1, entities.player1_score,
                                entities.player2, entities.player2_score, entities.match_result
                            )

                            if (reportedResult.ok) {
                                if ( !Array.isArray(result.reportedResults) ) {
                                    result.reportedResults = []
                                }
                                result.reportedResults.push(reportedResult.value)
                                return result
                            }
                        default:
                    }
                },
                { ts }
            )
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
                "text": `¡He sido actualizado a la versiòn *v${newVersion}*!... espero que sean nuevos features y no sólo bugs. :unamused:`
            }
        })
        
        if (totalValidActivities === 0) {
            newVersionStuff.push({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Aprovechando el update revisé y no encontré actividad nueva. :disappointed:"
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
                        "text": "Aprovechando el update actualicé " + 
                                "<https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>."
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
                    "text": "Parece que no hubo actividad desde la ùltima vez que revisé, " + 
                            "¿será que son vacaciones o fin de semana?. :thinking_face:"
                }
            }])
        }
        else {
            slackBlocks.push([{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Aquí reportando que ya actualicé " + 
                            "<https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>."
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
                    "text": "¡Ha iniciando un nuevo ranking esta semana!, ya " +
                            "<https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|pueden revisar>" + 
                            " en qué lugar quedaron."
                }
            }
        ])
    }

    if (ignoredMessagesCount > 0) {
        slackBlocks.push([
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Por cierto, les recuerdo que sólo soy una máquina y hubo " + ignoredMessagesCount +
                            (ignoredMessagesCount > 1 ? " mensajes" : " mensaje")  + 
                            " donde me taggearon pero no entedí qué querían. :sweat_smile:"
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Recuerden seguir " + 
                                "<https://github.com/Xotl/Smash-League#How-do-i-report-a-result|el formato>" +
                                " para poder entenderles. También les avisé en el thread de los mensajes para " +
                                "que vean a cualés mensajes me refiero."
                    }
                ]
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
                    "text": "Además, parece que aún hay gente que no conoce las reglas, ya que tuve que ignorar " + 
                            ignoredActivities.length + (ignoredActivities.length > 1 ? " mensajes" : " mensaje")  + 
                            " en donde me taggearon. :unamused:" + 
                            "\nEstos fueron los motivos:" + 
                            "\n```\n" + ignoredMessages + "\n```" + 
                            "\nLéanse <https://github.com/Xotl/Smash-League#ranking-rules|las reglas> por favor."
                }
            }
        ])
    }


    return slackBlocks.flatMap(
        block => {
            block.push({
                "type": "divider"
            })
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
    notifyInThreadThatMeesagesGotIgnored,
    getReportedResultObjFromWitEntities
}
