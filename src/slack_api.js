'use strict'
const
    Request = require('request'),
    Utils = require('./utils')


const
    SLACK_API_TOKEN = process.env.SLACK_API_TOKEN,
    SLACK_API = 'https://slack.com/api',
    SLACK_GROUPS_HISTORY_METHOD = `${SLACK_API}/groups.history`// private channels


if (!SLACK_API_TOKEN) {
    throw new Error('The environment variable "SLACK_API_TOKEN" is not set.')
}


// https://tacosespaciales.slack.com/messages/GFY345QV8



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
    
    return new Promise((resolve, reject) => {
        Request(SLACK_GROUPS_HISTORY_METHOD, {
            qs: {
                token: SLACK_API_TOKEN,
                count: 1000, 
                channel, inclusive, latest, oldest
            }
        }, (err, response, body) => {
            if (err) {
                return reject(err)
            }

            if (response && response.statusCode === 200) {
                if (typeof body === 'string') {
                    try {
                        return resolve(JSON.parse(body))
                    }
                    catch(err) {
                        return reject(err)
                    }
                }

                return resolve(body)
            }

            reject(new Error(`Server responded with ${response.statusCode}: ${body}`))
        })
    })
}


module.exports = {
    getMessagesFromPrivateChannel
}