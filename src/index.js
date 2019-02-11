'use strict'
const Slack = require('./slack-api')
const SmashLeague = require('./smash-league')
const Ranking = require('../ranking-info/ranking.json')
const Config = require('../config.json')
const Utils = require('./utils')
const OutputGenerator = require('./output-generator')


const SMASH_SLACK_CHANNEL_ID = Config.slack_channel_id


async function Main() {
    const now = new Date()
    const lastInProgressUpdated = Utils.GetDateObjFromEpochTS(Ranking.in_progress.last_update_ts)
    const opts = { latest: now, oldest: lastInProgressUpdated }

    const slackResponse = await Slack.getMessagesFromPrivateChannel(SMASH_SLACK_CHANNEL_ID, opts)
    const activities = SmashLeague.categorizeSlackMessages(slackResponse.messages)
    const newInProgressObj = SmashLeague.digestActivitiesAndGetUpdatedRankingObj(activities, Ranking)

    newInProgressObj.last_update_ts = Utils.GetEpochUnixFromDate(now)
    let newRankingObj = {
        ...Ranking, 
        ...{ 
            in_progress: newInProgressObj, 
            ranking: SmashLeague.getRankingFromScoreboard(newInProgressObj.scoreboard)
        } 
    }

    // console.log('Wow, such in_progress', newRankingObj.in_progress.completed_challenges)

    if (SmashLeague.isItTimeToCommitInProgress(now, lastInProgressUpdated)) {
        newRankingObj = SmashLeague.commitInProgress(newRankingObj)
    }
    
    
    // console.log('Wow, such newRankingObj', newRankingObj)
    // console.log('Wow, such ranking', SmashLeague.getRankingFromScoreboard(newInProgressObj.scoreboard))

    await OutputGenerator.updateRankingJsonFile(newRankingObj)
    await OutputGenerator.updateRankingMarkdownFile(newRankingObj)
    console.log('Finished Successfully.')
}

Main().catch(
    err => {
        console.error(err)
        console.log('Finished with errors.')
        process.exit(1);
    }
)
