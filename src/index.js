'use strict'
const Slack = require('./slack_api')
const SmashLeague = require('./smash_league')
const Ranking = require('../ranking.json')

const SMASH_SLACK_CHANNEL_ID = 'GFY345QV8'

async function Main() {
    let slackResponse

    try {
        slackResponse = await Slack.getMessagesFromPrivateChannel(SMASH_SLACK_CHANNEL_ID)
    }
    catch (err) { return console.error(err) }

    const activities = SmashLeague.categorizeSlackMessages(slackResponse.messages)
    const newRankingObj = SmashLeague.digestActivitiesAndGetUpdatedRankingObj(activities, Ranking)
    
    console.log('Wow, such debugging', newRankingObj, activities.challenges, activities.reportedResults)
}

Main().catch(console.error)
