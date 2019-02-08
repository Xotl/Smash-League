'use strict'
const Slack = require('./slack_api')
const SmashLeague = require('./smash_league')
const Ranking = require('../ranking.json')
const Config = require('../config.json')
const Utils = require('./utils')

const SMASH_SLACK_CHANNEL_ID = Config.slack_channel_id


async function Main() {
    const now = new Date()
    const lastInProgressUpdated = Utils.GetDateObjFromEpochTS(Ranking.in_progress.last_update_ts)
    const opts = { latest: now, oldest: lastInProgressUpdated }

    let slackResponse
    try {
        slackResponse = await Slack.getMessagesFromPrivateChannel(SMASH_SLACK_CHANNEL_ID, opts)
    }
    catch (err) { return console.error(err) }

    const activities = SmashLeague.categorizeSlackMessages(slackResponse.messages)
    const newInProgressObj = SmashLeague.digestActivitiesAndGetUpdatedRankingObj(activities, Ranking)

    console.log('Wow, such newInProgressObj', newInProgressObj)
    console.log('Wow, such ranking', SmashLeague.getRankingFromScoreboard(newInProgressObj.scoreboard))
}

Main().catch(console.error)
