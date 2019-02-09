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
            './release/ranking.json',
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

const getRankingBullets = () => {
    return 'test'
}

const updateRankingMarkdownFile = async rankingObj => {

    const template = await getRankingTemplate()
    const output = template
        .replace(/\{\{last_updated\}\}/gm, Utils.GetDateObjFromEpochTS(rankingObj.last_update_ts).toUTCString())
        .replace(/\{\{ranking_bullets\}\}/gm, getRankingBullets(rankingObj.ranking))
        .replace(/\{\{scoreboard\}\}/gm, getRankingBullets(rankingObj.scoreboard))
        .replace(/\{\{inprogress_last_updated\}\}/gm, Utils.GetDateObjFromEpochTS(rankingObj.in_progress.last_update_ts).toUTCString())
        .replace(/\{\{active_challenges\}\}/gm, getRankingBullets(rankingObj.in_progress.active_challenges))
        .replace(/\{\{completed_challenges\}\}/gm, getRankingBullets(rankingObj.in_progress.active_challenges))
        .replace(/\{\{inprogress_scoreboard\}\}/gm, getRankingBullets(rankingObj.in_progress.scoreboard))

    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '../', 'release', 'RANKING.md'),
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