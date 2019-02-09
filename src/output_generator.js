'use strict'

const fs = require('fs')
const path = require('path')

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


const updateRankingMarkdownFile = async rankingObj => {

    const template = await getRankingTemplate()
    const rankingMarkdown = rankingObj.rank
    const output = ''

    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                './release/RANKING.md',
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