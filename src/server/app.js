'use strict'
const Config = require('../../config.json')
const Ranking = require('../ranking-info/ranking.json')
const SmashLeague = require('../smash-league')
const Slack = require('../slack-api')
const Utils = require('../utils')


const isAppMention = (slackEvent = {}) => {
    if (!slackEvent.event) {
        return false
    }

    return slackEvent.event.type === 'app_mention' && slackEvent.event.user !== Config.bot_id
}

const notifyPlayerWhichPlayersCanChallenge = (slackEvent) => {
    const playerId = slackEvent.user
    const playerPlace = SmashLeague.getRankingPlaceByPlayerId(playerId, Ranking.ranking)
    let playerScore = Ranking.in_progress.scoreboard[playerId]
    const isUnrankedPlayer = !playerScore

    if (isUnrankedPlayer) {// Unranked Player
        playerScore = SmashLeague.getUnrankedPlayerScore(playerPlace)
    }
    const blocksToPost = []

    if (playerScore.coins <= 0) {
        blocksToPost.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Ya no te quedan monedas, así que ya no pedes retar a nadie. :disappointed:"
            }
        })
    }
    else {
        const playersArray = SmashLeague.getPlayersThatCanBeChallenged(playerPlace, playerScore.range, Ranking.ranking)

        if (playersArray.length === 0) {
            blocksToPost.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Parece que no puedes retar a nadie, ¿estás en primer lugar?. :thinking_face:"
                }
            })
        }
        else {
            const playersList = playersArray.map(
                placeArray => {
                    const playersString = placeArray.map(
                        playerId => '`' + Utils.getPlayerAlias(playerId) + '`'
                    ).join(', ')

                    return '* ' +  playersString + ( placeArray.length > 1 ? ' _(sólo uno de los ' + placeArray.length + ', tendrás que elegir a quién)_' : '' )
                }
            )
            const isPlural = playersArray.length > 1
            if (isUnrankedPlayer) {
                blocksToPost.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Parece que no estas rankeado, o bien, tienes 0 puntos... así que " + 
                                isPlural ? "serían estos:" : "sería este:" + "\n\n" + playersList
                    }
                })
            }
            else {
                blocksToPost.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": ( isPlural ? "Estos son los jugadores" : "Este sería el jugador" ) + 
                                "que puedes retar:\n\n" + playersList
                    }
                })
            }

            blocksToPost.push({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Sólo recuerda que no puedes volver a jugar contra lugares donde ya ganaste."
                    }
                ]
            })
        }
    }


    return Slack.postMessageInChannel(
        'Estos son los jugadores que puedes retar',
        Config.slack_channel_id,
        {
            blocks: JSON.stringify(blocksToPost),
            thread_ts: slackEvent.thread_ts || slackEvent.ts
        }
    )
}

module.export = {
    isAppMention,
    notifyPlayerWhichPlayersCanChallenge
}