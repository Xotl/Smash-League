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
    const lastInProgressUpdated = Utils.GetDateObjFromEpochTS(Ranking.in_progress.last_update_ts)
    const opts = { latest: now, oldest: lastInProgressUpdated }

    const slackResponse = await Slack.getMessagesFromPrivateChannel(SMASH_SLACK_CHANNEL_ID, opts)
    const activities = SmashLeague.categorizeSlackMessages(slackResponse.messages)
    const newInProgressObj = SmashLeague.digestActivitiesAndGetUpdatedRankingObj(activities, Ranking)

    newInProgressObj.last_update_ts = Utils.GetEpochUnixFromDate(now)
    let newRankingObj = { ...Ranking, in_progress: newInProgressObj }

    let isItTimeToCommit = SmashLeague.isItTimeToCommitInProgress(now, lastInProgressUpdated)
    if (isItTimeToCommit) {
        newRankingObj = SmashLeague.commitInProgress(newRankingObj)
        OutputGenerator.updateHistoryLog(newInProgressObj)
    }
    else {
        // Updates ranking table in case there's a manual change in current scoreboard
        newRankingObj.ranking = SmashLeague.getRankingFromScoreboard(newRankingObj.scoreboard)
    }

    await OutputGenerator.updateRankingJsonFile(newRankingObj)
    await OutputGenerator.updateRankingMarkdownFile(newRankingObj)

    if (process.env.CI && process.env.TRAVIS_BRANCH === 'master') {
        if (isItTimeToCommit) {
            Slack.postMessageInChannel(
                '¡Ha iniciando un nuevo ranking esta semana!, ya pueden revisar en qué lugar quedaron.\n' +
                'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
                , SMASH_SLACK_CHANNEL_ID
            )
        }
        else {
            console.log('The Travis event type is:', process.env.TRAVIS_EVENT_TYPE)
            switch(process.env.TRAVIS_EVENT_TYPE) {
                case 'push':
                    Slack.postMessageInChannel(
                        `¡He sido actualizado a la version v${version}!... espero que sean nuevos features y no sólo bugs. :unamused:\n\n` +
                        'Y también aproveché a buscar mensajes nuevos para actualizar el ranking (si es que hubo actividad).\n' +
                        'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
                        , SMASH_SLACK_CHANNEL_ID
                    )                    
                    break;

                case 'cron':
                default:
                    Slack.postMessageInChannel(
                        'Aquí reportando que ya actualicé el scoreboard.' +
                        'https://github.com/Xotl/Smash-League/tree/master/ranking-info'
                        , SMASH_SLACK_CHANNEL_ID
                    )                    
                    break;
            }
        }
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
