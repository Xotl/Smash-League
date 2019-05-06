const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    console.log(`[${(new Date()).toISOString()}]`, req.originalUrl, req.query, req.body)
    return res.send('¡Si charcha!')
})

app.post('/', (req, res) => {

    let slackRequest = req.body
    if (typeof req.body === 'string') {
        slackRequest = JSON.parse(slackRequest)
    }

    if (slackRequest.type && slackRequest.type === 'url_verification') {
        return res.send(slackRequest.challenge)
    }
    

    console.log(`[${(new Date()).toISOString()}]`, req.originalUrl, req.query, req.body)
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