'use strict'
const Config = require('../config.json')

const GetDateObjFromEpochTS = (epoch) => (new Date( Number(epoch) * 1000 ))
const GetEpochUnixFromDate = (dateObj) => {
    if ( !(dateObj instanceof Date) ) {
        throw new Error('Argument received is not a Date object.')
    }

    return dateObj.getTime() / 1000
}

let ignoredActivityObject
const setIgnoredActivityLogObject = obj => ignoredActivityObject = obj
const logIgnoredActivity = (reason, activity, type) => {
    if (typeof ignoredActivityObject !== 'object') {
        return
    }

    if (!Array.isArray(ignoredActivityObject[type])) {
        ignoredActivityObject[type] = []
    }

    ignoredActivityObject[type].push({ reason, activity })
}

const logIgnoredChallenge = (reason, activity) => {
    logIgnoredActivity(reason, activity, 'challenge')
}

const showInConsoleIgnoredActivities = ignoredActivities => {
    console.log('############## Ignored activities ##############')
    Object.keys(ignoredActivities).forEach(
        type => {
            ignoredActivities[type].forEach(
                ignoredActivity => console.log(
                    `---- ${ignoredActivity.reason}: ${JSON.stringify(ignoredActivity.activity)}` 
                )
            )
            console.log(`A total of ${ignoredActivities[type].length} ${type} activities ignored.`)
        }
    )
}

const getPlayerAlias = playerId => Config.users_dict[playerId] || playerId

module.exports = {
    GetDateObjFromEpochTS,
    GetEpochUnixFromDate,
    logIgnoredChallenge,
    logIgnoredActivity,
    setIgnoredActivityLogObject,
    showInConsoleIgnoredActivities,
    getPlayerAlias
}