'use strict'

const fs = require('fs')
const path = require('path')
const Utils = require('../src/utils')

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

const getRankingBulletsMarkdown = rankingObj => {
    return 'Ranking Bullets'
}

const getScoreboardMarkdown = scoreboardObj => {
    return 'Scoreboard'
}

const getActiveChallengesMarkdown = activeChallengesArray => {
    return 'Active Challenges'
}

const getCompletedChallengesMarkdown = completedChallengesArray => {
    return 'Completed Challenges'
}

const updateRankingMarkdownFile = async rankingObj => {

    const template = await getRankingTemplate()
    const output = template
        .replace(/\{\{last_updated\}\}/gm, Utils.GetDateObjFromEpochTS(rankingObj.last_update_ts).toUTCString())
        .replace(/\{\{ranking_bullets\}\}/gm, getRankingBulletsMarkdown(rankingObj.ranking))
        .replace(/\{\{scoreboard\}\}/gm, getScoreboardMarkdown(rankingObj.scoreboard))
        .replace(/\{\{inprogress_last_updated\}\}/gm, Utils.GetDateObjFromEpochTS(rankingObj.in_progress.last_update_ts).toUTCString())
        .replace(/\{\{active_challenges\}\}/gm, getActiveChallengesMarkdown(rankingObj.in_progress.active_challenges))
        .replace(/\{\{completed_challenges\}\}/gm, getCompletedChallengesMarkdown(rankingObj.in_progress.completed_challenges))
        .replace(/\{\{inprogress_scoreboard\}\}/gm, getScoreboardMarkdown(rankingObj.in_progress.scoreboard))

    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '../', 'ranking-info', 'README.md'),
                output,
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


module.exports = {
    updateRankingJsonFile,
    updateRankingMarkdownFile
}