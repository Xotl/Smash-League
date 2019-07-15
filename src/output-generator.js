'use strict'
const fs = require('fs')
const path = require('path')
const Utils = require('./utils')
const SmashLeague = require('./smash-league')

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
    return '|#|Player|Score|\n|-|------|-----|\n' + rankingArray.map(
        (players, idx) => {
            const { points, range } = scoreboardObj[ players[0] ]
            let rangeSup = ''
            if (// Checks if current place is contigous to another place with same points
                (idx !== 0 && scoreboardObj[ rankingArray[idx - 1][0] ].points === points) // Checks previous place
                || (idx !== rankingArray.length - 1 && scoreboardObj[ rankingArray[idx + 1][0] ].points === points)// Checks next place
            ) {
                rangeSup = `<sub>${range}</sub>`
            }
            const playersNames = players.map( playerId => `\`${Utils.getPlayerAlias(playerId)}\`` ).join(', ')
            return `|${1 + idx}|${playersNames}|${points}${rangeSup}|`
        }
    ).join('\n')
}

const getScoreboardMarkdown = scoreboardObj => {
    return '|Player|Coins|Range|Stand points|Score|' +
         '\n|------|-----|-----|------------|-----|\n' +
        Object.keys(scoreboardObj).sort(
            (a, b) => scoreboardObj[b].points - scoreboardObj[a].points
        )
        .map(
            playerId => {
                const { stand_points, points, coins, range} = scoreboardObj[playerId]
                return `|${Utils.getPlayerAlias(playerId)}|${coins}|${range}|${stand_points}|${points}|`
            }
        )
        .join('\n')
} 

const getEndOfWeekSummaryMarkdown = scoreboardObj => {
    return '|Player|Coins|Range|Stand points|' +
         '\n|------|-----|-----|------------|\n' +
        Object.keys(scoreboardObj).sort(
            (a, b) => scoreboardObj[b].points - scoreboardObj[a].points
        )
        .map(
            playerId => {
                const { stand_points, points, coins, range} = scoreboardObj[playerId]
                return `|${Utils.getPlayerAlias(playerId)} - ${points}pts|${coins}|${range}|${stand_points}|`
            }
        )
        .join('\n')
} 

const getCompletedChallengesMarkdown = scoreboard => {
    return Object.keys(scoreboard).reduce(
        (resultArray, challengerId) => {
            const str = scoreboard[challengerId].completed_challenges.map(
                challenge => {
                    const challengerName = Utils.getPlayerAlias(challengerId)
                    const challengedPlayerName = Utils.getPlayerAlias(challenge.player1 !== challengerId ? challenge.player1 : challenge.player2)
                    const winnerPlayer = challenge.winner === challenge.player1 ? 'player1' : 'player2'
                    const loserPlayer = challenge.winner !== challenge.player1 ? 'player1' : 'player2'
                    const nonNumericResult = challengerId === challenge.winner ? 'won' : 'lost'
                    return `* \`${challengerName}\` challenged \`${challengedPlayerName}\` and **${nonNumericResult}** *${challenge[winnerPlayer + 'Result']}-${challenge[loserPlayer + 'Result']}*.`
                }
            ).join('\n')

            if (str.length > 0) {
                resultArray.push(str)
            }

            return resultArray
        },
        []
    ).join('\n')
}

const getUnrankedScore = ({ coins, range, stand_points, points}) => 
      '|Coins|Range|Stand points|Points|' +
    '\n|-----|-----|------------|------|\n' +
    `|${coins}|${range}|${stand_points}|${points}|`


const updateRankingMarkdownFile = async (rankingObj, unrankedScore) => {

    const template = await getRankingTemplate()
    const output = template
        .replace(/\{\{last_updated\}\}/gm, (new Date(rankingObj.last_update_ts)).toUTCString())
        .replace(/\{\{ranking_bullets\}\}/gm, getRankingBulletsMarkdown(rankingObj.ranking, rankingObj.scoreboard))
        .replace(/\{\{unranked_score\}\}/gm, getUnrankedScore(unrankedScore))
        .replace(/\{\{inprogress_last_updated\}\}/gm, (new Date(rankingObj.in_progress.last_update_ts)).toUTCString())
        .replace(/\{\{inprogress_scoreboard\}\}/gm, getScoreboardMarkdown(rankingObj.in_progress.scoreboard))
        .replace(/\{\{completed_challenges\}\}/gm, getCompletedChallengesMarkdown(rankingObj.in_progress.scoreboard))
        
        

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


const updateHistoryLog = async (inProgressObj, weekObj) => {
    const filePath = path.join(__dirname, '..', 'ranking-info', 'history-log.md')
    const newStringToAppend = 
// Start of srting
`## Commit from ${(new Date(inProgressObj.last_update_ts)).toUTCString()}
The week started at *${(new Date(weekObj.start)).toUTCString()}* and ended *${(new Date(weekObj.end)).toUTCString()}*.
### End of week players score summary
${getEndOfWeekSummaryMarkdown(inProgressObj.scoreboard)}
### Completed challenges
${getCompletedChallengesMarkdown(inProgressObj.scoreboard)}


`// end of srting
    const newDataBuffer = Buffer.from(newStringToAppend)
    return (new Promise(
        (resolve, reject) => {
            fs.readFile(filePath, (err, data) => {// Reads current file data
                if (err) return reject({err})
                fs.open(filePath, 'w', (err, fd) => {// Opens file to write on it
                    if (err) {
                        err.fd = fd
                        return reject(err)
                    }
                    fs.writeSync(fd, newDataBuffer, 0, newDataBuffer.length, 0)
                    fs.writeSync(fd, data, 0, data.length, newDataBuffer.length)
                    fs.closeSync(fd)
                    resolve()
                })
            })
        }
    )).catch(err => {
        if(typeof err.fd === 'number') {
            fs.closeSync(err.fd)
        }
        throw err
    })
}

    


module.exports = {
    updateRankingJsonFile,
    updateRankingMarkdownFile,
    updateHistoryLog
}
