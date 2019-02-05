'use strict'
const
    Request = require('request')


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

    const { latest, oldest, inclusive } = opts;
    
    return new Promise((resolve, reject) => {
        Request(SLACK_GROUPS_HISTORY_METHOD, {
            qs: {
                token: SLACK_API_TOKEN,
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