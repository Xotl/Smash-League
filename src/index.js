'use strict'
const Slack = require('./slack-api')
const SmashLeague = require('./smash-league')
const Ranking = require('../ranking-info/ranking.json')
const Config = require('../config.json')
const { version } = require('../package.json')
const Utils = require('./utils')
const OutputGenerator = require('./output-generator')


const SMASH_SLACK_CHANNEL_ID = Config.slack_channel_id


async function Main() {
    const now = new Date()
    const lastInProgressUpdated = new Date(Ranking.in_progress.last_update_ts)
    const opts = { latest: now, oldest: lastInProgressUpdated }
    const slackResponse = await Slack.getMessagesFromPrivateChannel(SMASH_SLACK_CHANNEL_ID, opts)

    const activities = SmashLeague.categorizeSlackMessages(slackResponse.messages)
    

    const ignoredActivities = Utils.setIgnoredActivityLogObject({})
    const newInProgressObj = SmashLeague.applyActivitiesToRanking(activities, Ranking)
    Utils.showInConsoleIgnoredActivities(ignoredActivities)


    newInProgressObj.last_update_ts = now.getTime()
    let newRankingObj = { ...Ranking, in_progress: newInProgressObj }

    let isItTimeToCommit = SmashLeague.isItTimeToCommitInProgress(now, Ranking.current_week)
    if (isItTimeToCommit) {
        newRankingObj = SmashLeague.commitInProgress(newRankingObj)
        OutputGenerator.updateHistoryLog(newInProgressObj)
    }
    else {
        // Updates ranking table in case there's a manual change in current scoreboard
        newRankingObj.ranking = SmashLeague.getRankingFromScoreboard(Ranking.scoreboard)
    }

    await OutputGenerator.updateRankingJsonFile(newRankingObj)
    await OutputGenerator.updateRankingMarkdownFile(newRankingObj)

    if (process.env.CI && process.env.TRAVIS_BRANCH === 'master') {
        let messageToPost;
        if (process.env.TRAVIS_EVENT_TYPE === 'push') {
            messageToPost = `¡He sido actualizado a la version v${version}!... espero que sean nuevos features y no sólo bugs. :unamused:\n\n`
        }

        messageToPost += SmashLeague.getMessageToNotifyUsers(isItTimeToCommit, )
        Slack.postMessageInChannel(messageToPost, SMASH_SLACK_CHANNEL_ID)
    }
    console.log('Finished Successfully.')
}

Main().catch(
    err => {
        console.error(err)
        console.log('Finished with errors.')
        process.exit(1);
    }
)
