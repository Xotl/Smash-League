'use strict'
const Config = require('../config.json')
const Messages = require('./messages')

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

const logIgnoredMatch = (reason, activity) => {
    logIgnoredActivity(reason, activity, 'match')
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

const getRandomIndex = max => {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max + 1)); //The maximum is inclusive
}

const getRandomItemFromArray = array => array[ getRandomIndex(array.length - 1) ]

const templateString = (strings, ...keys) =>  (
    (dict = {}) => {
        var result = [strings[0]]
        keys.forEach(
            (key, i) => {
                result.push(dict[key], strings[i + 1])
            }
        )
        return result.join('')
    }
)

const MESSAGES_LIST = Messages(templateString)// Used in getRandomMessageById function
const getRandomMessageById = (msgId, values = {}) => {
    if (!MESSAGES_LIST[msgId] || MESSAGES_LIST[msgId].length === 0) {
        return `Missing messages in "${msgId}" list`
    }
    const template = getRandomItemFromArray( MESSAGES_LIST[msgId] )

    if (typeof template === 'string') {
        return template
    }

    return template( values )
}

const removesBotTagFromString = msg => {
    return msg.replace(new RegExp(`<@${Config.bot_id}>`, 'gm'), '').trim()
}

const removeAlreadyChallengedPlayers = (players, playerId, in_progress) => {
    const { scoreboard } = in_progress
    const { completed_challenges = [] } = scoreboard[playerId] || {}

    return players.map(
        rankPlayers => rankPlayers.filter(
            id => {
                for (const challenge of completed_challenges) {
                    if ( challenge.players.includes(id) && challenge.winner === playerId ) {
                        return false
                    }
                }
                return true
            }
        )
    )
}

const removeEmptyArray = array => array.filter(i => (i.length === 0) ? false : true)

const factorKCaculator = elo => {
    if (elo < 2100)
        return 32

    if (elo >= 2100 && elo <= 2400)
        return 24

    return 16
}

const eloCalculation = (playerAElo, playerBElo, playerAScore) => {
    const probabilityOfWinPlayerA = 1 / (1 + Math.pow(10, (playerAElo - playerBElo) / 400))
    return playerAElo + factorKCaculator(playerAElo) * (playerAScore - probabilityOfWinPlayerA)
}

module.exports = {
    GetDateObjFromEpochTS,
    GetEpochUnixFromDate,
    logIgnoredMatch,
    logIgnoredActivity,
    setIgnoredActivityLogObject,
    showInConsoleIgnoredActivities,
    getPlayerAlias,
    templateString,
    getRandomMessageById,
    removesBotTagFromString,
    removeAlreadyChallengedPlayers,
    removeEmptyArray,
    eloCalculation,
}
