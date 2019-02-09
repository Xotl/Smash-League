'use strict'

const fs = require('fs')
const MILISECONDS_24HOURS = 86400000// 24 hours in miliseconds

const isItTimeToCommitInProgress = (current, last) => {

    const diff = current.getTime() - last.getTime()
    if (diff < 0) {
        return false
    }

    if ( (current.getDay() === 6 && last.getDay() !== 6) || diff >= MILISECONDS_24HOURS ) {
        // if current is saturday and last is not or there's at least 24 hours of difference
        return true
    }

    return false
}

const updateRankingJsonFile = async rankingObj => new Promise(
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

    const rankingMarkdown = rankingObj.rank
    const output = 
`
# Ranking


`

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
    isItTimeToCommitInProgress,
    updateRankingJsonFile,
    updateRankingMarkdownFile
}