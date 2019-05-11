'use strict'
const {Wit, log} = require('node-wit');
const Config = require('../../config.json')
const Ranking = require('../../ranking-info/ranking.json')
const SmashLeague = require('../smash-league')
const SmashLeagueInteractions = require('../smash-league-interactions')
const Slack = require('../slack-api')
const Utils = require('../utils')

const WitClient = new Wit({
    accessToken: process.env.WIT_TOKEN,
    logger: new log.Logger(log.DEBUG) // optional
})


const digetsWitReponseFromSlackEvent = async (slackEvent = {}) => {
    let msg = slackEvent.text || ""
    msg = msg
        .replace(new RegExp(`<@${Config.bot_id}>`, 'gm'), '')// Removes bot tag from message
        .trim()

    if (msg.length === 0) {// Nothing here
        return
    }

    const thread_ts = slackEvent.thread_ts || slackEvent.ts

    const { entities } = await WitClient.message(msg, {})
    entities.intent.forEach(
        ({ value, confidence }) => {
            
            if (confidence < 0.6) {
                let msgToPost = 'Lo siento, no entendí. Sólo soy una máquina. :disappointed:'
                return Slack.postMessageInChannel(msgToPost, Config.slack_channel_id, { thread_ts })
            }

            if (confidence < 0.8) {
                let msgToPost = null
                switch (value) {
                    case 'grateful':
                        msgToPost = "Pa' servirle. :wink:"
                        break

                    case 'lookup_challengers':
                        msgToPost = 'No estoy muy seguro, pero creo que quieres ver a quién puedes retar ¿no?. :thinking_face:'
                        break

                    case 'validate_challenge':
                        msgToPost = 'No estoy muy seguro, pero pareciera que quieres saber si puedes retar a ' +
                                    ( entities.slack_user_id && entities.slack_user_id.length > 0 ?
                                        entities.slack_user_id.map(e => e.value ).join(', ') :
                                        'alguien'
                                    ) +
                                    '. ¿O me equivoco?. :thinking_face:'
                        break
                    default:
                        msgToPost = 'Sospecho con el pecho y calculo con el... pie derecho que hace falta un PR para que funcione eso. _(' + value +')_'
                }
                return Slack.postMessageInChannel(msgToPost, Config.slack_channel_id, { thread_ts })
            }

            let blocks, title
            switch(value) {
                case 'grateful':
                    title = 'De nada. :wink:'
                    break
                case 'lookup_challengers':
                    title = 'Respondiendo a lo de tus retos...'
                    blocks = getBlocksForLookUpChallengers(slackEvent.user)
                    break
                case 'validate_challenge':
                    title = 'La respuesta a tu pregunta...'
                    blocks = getBlocksForChallengeValidation(slackEvent.user, ...entities.slack_user_id.map(e => e.value.slice(2, -1) ))
                    break
                case 'reported_result':
                    const reportedResult = SmashLeagueInteractions.getReportedResultObjFromWitEntities(
                        slackEvent.user, entities.player1, entities.player1_score,
                        entities.player2, entities.player2_score, entities.match_result
                    )
                    title = 'Resultado reportado...'
                    blocks = getBlocksForReportedResult(reportedResult)
                    break
                default:
                    title = `Se está trabajando para que si charche esa función _(${value})_. Puedes hacer tu PR también. :simple_smile:`
            }

            return Slack.postMessageInChannel(title, Config.slack_channel_id, { blocks, thread_ts })
        }
    )
}

const getBlocksForReportedResult = (reportedResult) => {
    if (!reportedResult.ok) {
        return JSON.stringify([{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Parece que quieres reportar un resultado, pero ${reportedResult.error.toLowerCase()}. :sweat:`
            }
        }])
    }

    const { winner, player1, player2, player1Result, player2Result} = reportedResult.value
    const highScore = player1Result > player2Result ? player1Result : player2Result
    const lowScore = player1Result > player2Result ? player2Result : player1Result

    return JSON.stringify([
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Enterado... <@${winner}> le ganó a <@${winner === player1 ? player2 : player1}> ${highScore} - ${lowScore}`
            }
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Durante la noche es cuando los cambios se aplican, puede que aún estés a tiempo de hacer alguna corrección."
                }
            ]
        }
    ])
}

const getBlocksForChallengeValidation = (challengerId, playerChallengedId) => {
    const playerPlace = SmashLeague.getRankingPlaceByPlayerId(challengerId, Ranking.ranking)
    let playerScore = Ranking.in_progress.scoreboard[challengerId]
    const playersArray = SmashLeague.getPlayersThatCanBeChallenged(playerPlace, playerScore.range, Ranking.ranking)

    const playerCanChallenge = playersArray.find(
        placeArray => placeArray.includes(playerChallengedId)
    )

    if (playerCanChallenge) {
        return JSON.stringify([{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Si puedes retar a <@${playerChallengedId}>. ¡Suerte! :blush:`
            }
        }])
    }

    return JSON.stringify([{
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `Ya revisé y no puedes retar a <@${playerChallengedId}>. :no_entry_sign:`
        }
    }])
}

const getBlocksForLookUpChallengers = playerId => {
    const playerPlace = SmashLeague.getRankingPlaceByPlayerId(playerId, Ranking.ranking)
    let playerScore = Ranking.in_progress.scoreboard[playerId]
    const isUnrankedPlayer = !playerScore

    if (isUnrankedPlayer) {// Unranked Player
        playerScore = SmashLeague.getUnrankedPlayerScore(playerPlace)
    }
    const blocksToPost = []

    if (!isUnrankedPlayer && playerScore.coins <= 0) {
        blocksToPost.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Ya no te quedan monedas, así que ya no puedes retar a nadie. :disappointed:"
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

                    return '- ' +  playersString + ( placeArray.length > 1 ? ' _(sólo uno de los ' + placeArray.length + ', tendrás que elegir a quién)_' : '' )
                }
            ).join('\n')

            const isPlural = playersArray.length > 1
            if (isUnrankedPlayer) {
                blocksToPost.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Parece que no estas rankeado... así que " + 
                                ( isPlural ? "serían estos:" : "sería este:" ) + "\n\n" + playersList
                    }
                })
            }
            else {
                blocksToPost.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": ( isPlural ? "Estos son los jugadores" : "Este sería el jugador" ) + 
                                " que puedes retar:\n\n" + playersList
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

    return JSON.stringify(blocksToPost)
}

module.exports = {
    getBlocksForLookUpChallengers,
    digetsWitReponseFromSlackEvent
}