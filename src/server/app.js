'use strict'
const {Wit, log} = require('node-wit');
const Config = require('../../config.json')
const SmashLeagueInteractions = require('../smash-league-interactions')
const Slack = require('../slack-api')
const Utils = require('../utils')

const WitClient = new Wit({
    accessToken: process.env.WIT_TOKEN,
    logger: new log.Logger(log.DEBUG) // optional
})

const getSlackMessagesObjFromInteractions = (interactions, validInteractionFn) => {
    const result = []
    result.push( ...interactions.map(
        interaction => {
            if (!interaction.ok) {
                return { title: interaction.error }
            }

            return validInteractionFn(interaction)
        }
    ) )
    return result
}

const digetsWitReponseFromSlackEvent = async (slackEvent = {}) => {
    const msg = Utils.removesBotTagFromString(slackEvent.text || "")

    if (msg.length === 0) {// Nothing here
        return
    }

    const thread_ts = slackEvent.thread_ts || slackEvent.ts
    const { entities } = await WitClient.message(msg, {})
    const messagesToPost = []
    let validIntentDetected = false

    if (entities.reported_result) {
        validIntentDetected = true
        const reportedResults = SmashLeagueInteractions.getReportedResultFromWitEntities(slackEvent.user, entities)
        messagesToPost.push(
            ...getSlackMessagesObjFromInteractions(
                reportedResults, 
                repResult => ({
                    title: 'Confirmación de resultado reportado',
                    blocks: getBlocksForReportedResult(repResult)
                })
            )
        )
    }

    if (entities.lookup_challengers) {
        validIntentDetected = true
        const res = SmashLeagueInteractions.getLookupChallengersResponseFromWitEntities(slackEvent.user, entities)
        messagesToPost.push(
            ...getSlackMessagesObjFromInteractions(
                res,
                ({ value }) => ({
                    title: value
                })
            )
        )
    }

    if (!validIntentDetected) {
        // TODO: Add custom Regexp messages
        messagesToPost.push({
            title: Utils.getRandomMessageById('no_interpretation', {
                user, msgUrl: SmashLeagueInteractions.getSlackUrlForMessage(slackEvent.ts, slackEvent.thread_ts)
            })
        })
    }

    // Post all messages into Slack
    messagesToPost.forEach(
        ({ title, blocks }) => {
            if (typeof blocks === 'object') {
                blocks = JSON.stringify(blocks)
            }
            Slack.postMessageInChannel(title, Config.slack_channel_id, { thread_ts, blocks })
        }
    )
}

const getBlocksForReportedResult = (reportedResult) => {
    const { winner, player1, player2, player1Result, player2Result} = reportedResult.value
    const highScore = player1Result > player2Result ? player1Result : player2Result
    const lowScore = player1Result > player2Result ? player2Result : player1Result

    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": Utils.getRandomMessageById('reported_result valid', {
                    winner, loser: winner === player1 ? player2 : player1,
                    highScore, lowScore
                })

            }
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Durante la noche es cuando los cambios se aplican, puede que aún estés a tiempo de hacer alguna corrección."
                }
            ]
        }
    ]
}

module.exports = {
    digetsWitReponseFromSlackEvent
}