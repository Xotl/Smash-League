'use strict'
const Slack = require('./slack_api')
const SmashLeague = require('./smash_league')


async function Main() {
    try {
        const response = await Slack.getMessagesFromPrivateChannel('GFY345QV8')
        const messages = SmashLeague.categorizeSlackMessages(response.messages)
        console.log('Wow, such debugging', messages)
    }
    catch (err) { console.error(err) }
}

Main()
