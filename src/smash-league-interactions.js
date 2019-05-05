'use strict'
const Config = require('../config.json')

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
        (result, { text:message, user, ts, thread_ts }) => {
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


                    if (player1 === BOT_SLACK_TAG || player2 === BOT_SLACK_TAG) {
                        // Someone wants the bot to be in the League ¬¬'
                        return result
                    }
                    
                    result.reportedResults.push({
                        winner: player1Result > player2Result ? player1 : player2,
                        player1, player2, player1Result, player2Result,
                        players: [player1, player2]
                    })

                    return result
                }

                // if it comes here, is just a random message where the bot got tagged
                result.ignoredMessages.push({text: message, user, ts, thread_ts})
                return result
            }
        }, 
        {
            challenges: [],
            reportedResults: [],
            ignoredMessages: []
        }
    )

    return resultCategorized
}

const getMessageToNotifyUsers = (weekCommited, totalValidActivities, ignoredActivities, 
    ignoredMessagesCount, season, isNewVersion) => {
    if (weekCommited) {
    return '¡Ha iniciando un nuevo ranking esta semana!, ya pueden revisar en qué lugar quedaron.\n' +
            'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
    }

    let totalValidActivitiesTxt = ''
    if (totalValidActivities === 0) {
    if (isNewVersion) {
        totalValidActivitiesTxt = 'Aprovechando el update revisé y no encontré actividad nueva. :disappointed:'
    }
    else {
        totalValidActivitiesTxt = 'Parece que no hubo actividad desde la ùltima vez que revisé, ' + 
            '¿será que son vacaciones o fin de semana?. :thinking_face:'
    }
    }
    else {
    if (isNewVersion) {
        totalValidActivitiesTxt = 'Aprovechando el update actualicé el scoreboard.\n' + 
            'https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md'
    }
    else {
        totalValidActivitiesTxt = 'Aquí reportando que ya actualicé el scoreboard.\n' +
        'https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md'
    }
    }

    let ignoredMessagesTxt = ''
    if (ignoredMessagesCount > 0) {
    ignoredMessagesTxt = '\n\nPor cierto, les recuerdo que sólo soy una máquina y hubo ' + ignoredMessagesCount +
        (ignoredMessagesCount > 1 ? ' mensajes' : ' mensaje')  + 
        ' donde me taggearon pero no entedí qué querían. :sweat_smile:' + 
        '\nRecuerden seguir el formato para poder entenderles.'
    }

    let ignoredActivitiesTxt = ''
    if (ignoredActivities.length > 0) {
    const ignoredMessages = Object.keys(ignoredActivities).map(
        type => {
            ignoredActivities[type].map(
                ({ reason }) => `* ${reason}`
            ).join('\n')
        }
    ).join('\n')

    ignoredActivitiesTxt = '\n\nAdemás, parece que aún hay gente que no conoce las reglas, ya que tuve que ignorar ' + 
                        ignoredActivities.length + (ignoredActivities.length > 1 ? ' mensajes' : ' mensaje')  + 
                        ' en donde me taggearon. :unamused:' +
                        '\nEstos fueron los motivos:\n' + '```\n' + ignoredMessages  + '\n```' +
                        '\nLéanse las reglas por favor -> https://github.com/Xotl/Smash-League#ranking-rules'

    }

    return totalValidActivitiesTxt + ignoredMessagesTxt + ignoredActivitiesTxt
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
        await postMessageFn(msg, 'D61Q9K50D', { thread_ts: '1557086377.000200' })
    }
}

module.exports = {
    categorizeSlackMessages,
    getMessageToNotifyUsers,
    notifyInThreadThatMeesagesGotIgnored
}
