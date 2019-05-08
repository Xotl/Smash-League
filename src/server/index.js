'use strict'
const express = require('express')
var bodyParser = require('body-parser')
const MyApp = require('./app.js')

const app = express()
const port = process.env.PORT || 3000
const slackRetryDict = {}

app.use(bodyParser.json()); // for parsing application/json

app.get('/', async (req, res) => {
    console.log(`[${(new Date()).toISOString()}]`, req.originalUrl, req.query, req.body)
    return res.send('¡Si charcha!')
})

app.post('/', async (req, res) => {
    let slackRequest = req.body || {}
    console.log(`[${(new Date()).toISOString()}] retry header: `, req.get('X-Slack-Retry-Num'))

    if (slackRetryDict[ slackRequest.event_id ]) {
        console.log(`[${(new Date()).toISOString()}] it's a retry!`)
        return res.send('¡Si charcha!')
    }

    slackRetryDict[ slackRequest.event_id ] = true// Avoids retires

    if (!slackRequest.type) {
        console.log(`[${(new Date()).toISOString()}] ¡No parece Slack!`)
        return res.send('¡No parece Slack!')
    }

    if (slackRequest.type === 'url_verification') {
        console.log(`[${(new Date()).toISOString()}] Verificación de URL`)
        return res.send(slackRequest.challenge)
    }

    await MyApp.digetsWitReponseFromSlackEvent(slackRequest.event)
    return res.send('¡Si charcha!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))