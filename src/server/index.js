'use strict'
const express = require('express')
var bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const Config = require('../../config.json')
const Slack = require('../slack-api')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json()); // for parsing application/json

const getLastState = () => new Promise(
    (resolve, reject) => {
        fs.readFile(
            path.join(__dirname, './', 'heroku.state.json'),
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
const writeFile = output => {
    return new Promise(
        (resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, './', 'heroku.state.json'),
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

app.get('/', (req, res) => {
    console.log(`[${(new Date()).toISOString()}]`, req.originalUrl, req.query, req.body)
    return res.send('¡Si charcha!')
})

app.post('/', (req, res) => {
    let slackRequest = req.body || {}

    if (!slackRequest.type) {
        console.log(`[${(new Date()).toISOString()}] ¡No parece Slack!`)
        return res.send('¡No parece Slack!')
    }

    if (slackRequest.type === 'url_verification') {
        console.log(`[${(new Date()).toISOString()}] Verificación de URL`)
        return res.send(slackRequest.challenge)
    }


    const slackEvent = slackRequest.event || slackRequest
    
    if (slackEvent.type === 'app_mention' && slackEvent.user !== Config.bot_id) {
        const slackMsg = slackEvent.text.trim().toLocaleLowerCase()
        
        if (slackMsg.includes('guarda esto')) {
            getLastState().then(
                data => {
                    const messageWithoutBotTag = slackEvent.text.replace(new RegExp(`<@${Config.bot_id}>`, 'gm'), '')
                    const state = JSON.parse(data)
                    if ( !Array.isArray(state.messages) ) {
                        state.messages = []
                    }

                    state.messages.push(messageWithoutBotTag)
                    return state
                }
            )
            .then( state => writeFile(JSON.stringify( state, null, 4 )) )
            .then( () => Slack.postMessageInChannel(
                'Guardado :thumbs_up:',
                Config.slack_channel_id,
                { thread_ts: slackEvent.thread_ts || slackEvent.ts }
            ) )
            .then( () => console.log(`[${(new Date()).toISOString()}] Todo salió bien`) )
            .catch( console.error )
        }
        else if (slackMsg.includes('muestra el estado')) {
            getLastState().then(
                data => {
                    return Slack.postMessageInChannel(
                        'Lo último que tengo es:\n\n' + data,
                        Config.slack_channel_id,
                        { thread_ts: slackEvent.thread_ts || slackEvent.ts }
                    ).then( () => console.log(`[${(new Date()).toISOString()}] Todo salió bien`) )
                }
            )
        }
        else {        
            console.log(`[${(new Date()).toISOString()}] No es de prueba`)
        }
    }

    return res.send('¡Si charcha!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// {
//     "type": "app_mention",
//     "user": "U061F7AUR",
//     "text": "<@U0LAN0Z89> is it everything a river should be?",
//     "ts": "1515449522.000016",
//     "channel": "C0LAN2Q65",
//     "event_ts": "1515449522000016"
// }