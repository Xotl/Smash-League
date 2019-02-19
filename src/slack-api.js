'use strict'
const
    Request = require('request'),
    Utils = require('./utils')


const
    SLACK_API_TOKEN = process.env.SLACK_API_TOKEN,
    SLACK_API = 'https://slack.com/api',
    SLACK_GROUPS_HISTORY_METHOD = `${SLACK_API}/groups.history`,// private channels
    SLACK_CHAT_MESSAGE_METHOD =`${SLACK_API}/chat.postMessage`


if (!SLACK_API_TOKEN) {
    throw new Error('The environment variable "SLACK_API_TOKEN" is not set.')
}

const slackHttpRequest = (url, opts, method = 'get') => {
    return new Promise((resolve, reject) => {
        Request[method](url, opts, (err, response, body) => {
            if (err) {
                return reject(err)
            }

            if (response && response.statusCode === 200) {
                if (typeof body === 'string') {
                    let jsonParsedBody
                    try {
                        jsonParsedBody = JSON.parse(body)
                    }
                    catch(err) {
                        return reject(err)
                    }

                    if (jsonParsedBody.ok) {
                        return resolve(jsonParsedBody)
                    }

                    return reject(new Error('Slack response not OK: ' + jsonParsedBody.error))
                }

                return resolve(body)
            }

            reject(new Error(`Server responded with ${response.statusCode}: ${body}`))
        })
    })
}


const getMessagesFromPrivateChannel = async (channel, opts = {}) => {
    if (channel === undefined) {
        throw new Error('Slack channel ID is required.')
    }

    let { latest, oldest, inclusive } = opts;

    if (latest instanceof Date) {
        latest = Utils.GetEpochUnixFromDate(latest)
    }

    if (oldest instanceof Date) {
        oldest = Utils.GetEpochUnixFromDate(oldest)
    }

    return slackHttpRequest(
        SLACK_GROUPS_HISTORY_METHOD,
        {
            qs: {
                token: SLACK_API_TOKEN,
                count: 1000, 
                channel, inclusive, latest, oldest
            }
        }
    )
}

const postMessageInChannel = (text, channel) => {
    if (channel === undefined) {
        throw new Error('Slack channel ID is required.')
    }

    if (typeof text !== 'string') {
        throw new Error('Text is required to post in Slack.')
    }

    text = text.trim()
    if (text === '') {
        throw new Error('Text cannot be an empty string to post in Slack.')
    }

    return slackHttpRequest(
        SLACK_CHAT_MESSAGE_METHOD,
        {
            qs: {
                token: SLACK_API_TOKEN,
                text, channel
            }
        },
        'post'
    )
}

module.exports = {
    getMessagesFromPrivateChannel,
    postMessageInChannel
}