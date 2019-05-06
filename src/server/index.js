const express = require('express')
var bodyParser = require('body-parser');
const Config = require('../../config.json')
const Slack = require('../slack-api')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json()); // for parsing application/json

app.get('/', (req, res) => {
    console.log(`[${(new Date()).toISOString()}]`, req.originalUrl, req.query, req.body)
    return res.send('¡Si charcha!')
})

app.post('/', (req, res) => {
    console.log(`[${(new Date()).toISOString()}] Llegó un POST request, yay!`)

    let slackRequest = req.body || {}
    if (typeof req.body === 'string') {
        slackRequest = JSON.parse(slackRequest)
    }

    if (!slackRequest.type) {
        console.log(`[${(new Date()).toISOString()}] ¡No parece Slack!`)
        return res.send('¡No parece Slack!')
    }

    if (slackRequest.type === 'url_verification') {
        console.log(`[${(new Date()).toISOString()}] Verificación de URL`)
        return res.send(slackRequest.challenge)
    }
    
    if (slackRequest.type === 'app_mention') {
        const isTest = slackRequest.text.trim().toLocaleLowerCase().includes('probando heroku')

        if (isTest) {
            console.log(`[${(new Date()).toISOString()}] Se va a enviar un mensaje`, slackRequest)
            Slack.postMessageInChannel(
                'Hola :simple_smile:',
                Config.slack_channel_id,
                { thread_ts: slackRequest.thread_ts || slackRequest.ts }
            )
            .then(() => console.log(`[${(new Date()).toISOString()}] Se debió lanzar el mensaje`))
            .catch(console.error)
        }
        else {
            console.log(`[${(new Date()).toISOString()}] No es una prueba`, slackRequest)
        }
    }

    console.log(`[${(new Date()).toISOString()}] Nada pasó`)
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