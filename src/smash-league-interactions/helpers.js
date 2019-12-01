'use strict'
const Utils = require('../utils')

const addIgnoredActivitiesToBlocks = (slackBlocksArray, ignoredActivitiesObj) => {
    const ignoredTypes = Object.keys(ignoredActivitiesObj)

    if (ignoredTypes.length === 0) {
        return// Nothing to add here
    }

    let ignoredActivitiesCount = 0
    const ignoredMessages = ignoredTypes.map(
        type => ignoredActivitiesObj[type].map(
            ({ reason, activity: {ts, thread_ts} }) => {
                ignoredActivitiesCount++
                return `> • ${reason} _<${Utils.getSeeMessageUrl(ts, thread_ts)}|(See message)>_.`
            }
        ).join('\n')
    ).join('\n')

    slackBlocksArray.push([
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": Utils.getRandomMessageById('daily_update ignored_activities', {
                    numIgnoredActivities: ignoredActivitiesCount, ignoredMessages
                })
            }
        }
    ])

}

module.exports = {
    addIgnoredActivitiesToBlocks
}