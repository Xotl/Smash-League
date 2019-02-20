'use strict'
const fs = require('fs')
const path = require('path')
const Utils = require('./utils')
const Config = require('../config.json')


const getPlayerNameById = playerId => Config.users_dict[playerId] || playerId

const getRankingTemplate = () => new Promise(
    (resolve, reject) => {
        fs.readFile(
            path.join(__dirname, '../RANKING-template.md'),
            { encoding: 'utf8'},
            (err, data) => {
                if (err) {
                    reject(err)
                }
                resolve(data)
            }
        )
    }
)

const updateRankingJsonFile = rankingObj => new Promise(
    (resolve, reject) => {
        fs.writeFile(
            './ranking-info/ranking.json',
            JSON.stringify(rankingObj, null, 4),
            (err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            }
        )
    }
)

const getRankingBulletsMarkdown = (rankingArray, scoreboardObj) => {
    return '|#|Player|Points|\n|---|---|---|\n' + rankingArray.map(
        (players, idx) => {
            const points = scoreboardObj[ players[0] ]
            const playersNames = players.map( playerId => `\`${getPlayerNameById(playerId)}\`` ).join(', ')
            return `|${1 + idx}|${playersNames}|${points}|`
        }
    ).join('\n')
}

const getScoreboardMarkdown = scoreboardObj => {
    return '|Player|Points|\n|---|---|\n' + Object.keys(scoreboardObj).sort(
        (a, b) => scoreboardObj[b] - scoreboardObj[a]
    )
    .map(
        playerId => `|${getPlayerNameById(playerId)}|${scoreboardObj[playerId]}|`
    )
    .join('\n')
} 

const getActiveChallengesMarkdown = activeChallengesArray => {
    return Object.keys(activeChallengesArray).map(
        challengerId => {
            const challengerName = getPlayerNameById(challengerId)
            const playersChallenged = activeChallengesArray[challengerId].map(
                playerId => '`' + getPlayerNameById(playerId) + '`'
            ).join(', ')
            return `* Player \`${challengerName}\` challenged ${playersChallenged}.`
        }
    ).join('\n')
}

const getCompletedChallengesMarkdown = completedChallengesObj => {
    return Object.keys(completedChallengesObj).map(
        challengerId => {
            return completedChallengesObj[challengerId].map(
                challenge => {
                    const challengerName = getPlayerNameById(challengerId)
                    const challengedPlayerName = getPlayerNameById(challenge.playerChallenged)
                    const winnerPlayer = challenge.winner === challenge.player1 ? 'player1' : 'player2'
                    const loserPlayer = challenge.winner !== challenge.player1 ? 'player1' : 'player2'
                    const nonNumericResult = challengerId === challenge.winner ? 'won' : 'lost'
                    return `* \`${challengerName}\` challenged \`${challengedPlayerName}\` and **${nonNumericResult}** *${challenge[winnerPlayer + 'Result']}-${challenge[loserPlayer + 'Result']}*.`
                }
            ).join('\n')
        }
    ).join('\n')
}

const updateRankingMarkdownFile = async rankingObj => {

    const template = await getRankingTemplate()
    const output = template
        .replace(/\{\{last_updated\}\}/gm, Utils.GetDateObjFromEpochTS(rankingObj.last_update_ts).toUTCString())
        .replace(/\{\{ranking_bullets\}\}/gm, getRankingBulletsMarkdown(rankingObj.ranking, rankingObj.scoreboard))
        // .replace(/\{\{scoreboard\}\}/gm, getScoreboardMarkdown(rankingObj.scoreboard))
        .replace(/\{\{inprogress_last_updated\}\}/gm, Utils.GetDateObjFromEpochTS(rankingObj.in_progress.last_update_ts).toUTCString())
        .replace(/\{\{active_challenges\}\}/gm, getActiveChallengesMarkdown(rankingObj.in_progress.active_challenges))
        .replace(/\{\{completed_challenges\}\}/gm, getCompletedChallengesMarkdown(rankingObj.in_progress.completed_challenges))
        .replace(/\{\{inprogress_scoreboard\}\}/gm, getScoreboardMarkdown(rankingObj.in_progress.scoreboard))

    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '../', 'ranking-info', 'README.md'),
                output,
                { encoding: 'utf8'},
                (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve()
                }
            )
        }
    )
}


const updateHistoryLog = async inProgressObj => {
    const filePath = path.join(__dirname, '..', 'ranking-info', 'history-log.md')
    const newStringToAppend = `## Commit from ${Utils.GetDateObjFromEpochTS(inProgressObj.last_update_ts).toUTCString()}
### Completed challenges
${getCompletedChallengesMarkdown(inProgressObj.completed_challenges)}
### Incompleted challenges
${getActiveChallengesMarkdown(inProgressObj.active_challenges)}


`

    const newDataBuffer = Buffer.from(newStringToAppend)
    return new Promise(
        (resolve, reject) => {
            fs.readFile(filePath, (err, data) => {// Reads current file data
                if (err) return reject({err})
                fs.open(filePath, 'w', (err, fd) => {// Opens file to write on it
                    if (err) return reject({err, fd})
                    fs.writeSync(fd, newDataBuffer, 0, newDataBuffer.length, 0)
                    fs.writeSync(fd, data, 0, data.length, newDataBuffer.length)
                    fs.closeSync(fd)
                    resolve()
                })
            })
        }
    ).catch(obj => {
        if(typeof obj.fd === 'number') {
            fs.closeSync(obj.fd)
        }
        throw obj.err
    })
}

    


module.exports = {
    updateRankingJsonFile,
    updateRankingMarkdownFile,
    updateHistoryLog
}