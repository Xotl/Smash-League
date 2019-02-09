'use strict'
const Slack = require('./slack_api')
const SmashLeague = require('./smash_league')
const Ranking = require('../release/ranking.json')
const Config = require('../config.json')
const Utils = require('./utils')
const OutputGenerator = require('./output_generator')


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

    newInProgressObj.last_update_ts = Utils.GetEpochUnixFromDate(now)
    const newRankingObj = { ...Ranking, ...{ in_progress: newInProgressObj} }

    if (OutputGenerator.isItTimeToCommitInProgress(now, lastInProgressUpdated)) {
        newRankingObj.last_update_ts = newInProgressObj.last_update_ts
        newRankingObj.ranking = SmashLeague.getRankingFromScoreboard(newInProgressObj.scoreboard)
        newRankingObj.scoreboard = newInProgressObj.scoreboard
        newInProgressObj.active_challenges = {}
        newInProgressObj.completed_challenges = {}
        newInProgressObj.reported_results = []
    }
    
    
    console.log('Wow, such newRankingObj', newRankingObj)
    console.log('Wow, such in_progress', newRankingObj.in_progress)
    console.log('Wow, such ranking', SmashLeague.getRankingFromScoreboard(newInProgressObj.scoreboard))

    await OutputGenerator.updateRankingJsonFile(newRankingObj)
    await OutputGenerator.updateRankingMarkdownFile(newRankingObj)
}

Main().catch(console.error)
