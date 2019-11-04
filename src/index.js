'use strict'
const Slack = require('./slack-api')
const SmashLeague = require('./smash-league')
const SmashLeagueInteractions = require('./smash-league-interactions')
const Ranking = require('../ranking-info/ranking.json')
const Config = require('../config.json')
const { version } = require('../package.json')
const Utils = require('./utils')
const OutputGenerator = require('./output-generator')


const SMASH_SLACK_CHANNEL_ID = Config.slack_channel_id
const IS_UPDATE = process.env.TRAVIS_EVENT_TYPE === 'push'
const IS_MASTER_BRANCH = process.env.TRAVIS_BRANCH === 'master'
const IS_CI = process.env.CI


async function Main() {
    const now = new Date()
    
    // Next milisecond after last update because it's inclusive search
    const lastInProgressUpdated = new Date(Ranking.in_progress.last_update_ts + 1)
    const opts = { latest: now, oldest: lastInProgressUpdated }
    const slackResponse = await Slack.getMessagesFromPrivateChannel(SMASH_SLACK_CHANNEL_ID, opts)
    const activities = await SmashLeagueInteractions.categorizeSlackMessages(slackResponse.messages)
    
    // We create & set the Object that will have all the data of the 
    // ignored activites logged by "logIgnoredActivity" function
    const ignoredActivities = {}
    Utils.setIgnoredActivityLogObject(ignoredActivities)

    // Updates ranking table in case there's a manual change in current scoreboard
    Ranking.ranking = SmashLeague.getRankingFromScoreboard(Ranking.scoreboard)

    // Now using the activities let's do the calculations to get the new in_progress object
    const newInProgressObj = SmashLeague.updateInProgressScoreboard(activities, Ranking)
    newInProgressObj.last_update_ts = now.getTime()

    // Log the ignored activities so we can debug Production in the Travis log
    Utils.showInConsoleIgnoredActivities(ignoredActivities)


    let newRankingObj = { ...Ranking, in_progress: newInProgressObj }
    let isItTimeToCommit = SmashLeague.isItTimeToCommitInProgress(now, newRankingObj.current_week)

    if (isItTimeToCommit) {
        newRankingObj = SmashLeague.commitInProgress(newRankingObj)
        OutputGenerator.updateHistoryLog(
            newInProgressObj, newRankingObj.current_week, newRankingObj.inactive_players
        )
    }

    await OutputGenerator.updateRankingJsonFile(newRankingObj)
    await OutputGenerator.updateRankingMarkdownFile(
        newRankingObj,
        SmashLeague.getUnrankedPlayerScore(newRankingObj.ranking.length)
    )

    const newChampion = Utils.aNewChampion(Ranking.ranking, newRankingObj.ranking)

    const blocksToPost = SmashLeagueInteractions.getUpdatesToNotifyUsers(
        isItTimeToCommit ? {/* TODO: send weeks times */} : null,
        activities.reportedResults.length,
        ignoredActivities, 
        activities.ignoredMessages.length,
        newRankingObj.season,
        IS_UPDATE ? version : null,
        newChampion
    )
        
    // Only post in slack if it's a master Job
    if (IS_CI && IS_MASTER_BRANCH) {
        await Slack.postMessageInChannel('Smash League Update!', SMASH_SLACK_CHANNEL_ID, { blocks: JSON.stringify(blocksToPost) })
        await SmashLeagueInteractions.notifyInThreadThatMeesagesGotIgnored(activities.ignoredMessages, Slack.postMessageInChannel)
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
