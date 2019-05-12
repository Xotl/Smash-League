'use strict'

const validSlackEvent = {
    ts: "500000000", user: 'U622XCTAA', //thread_ts,
    text: 'valid reported_result'
}

describe('app.js - digetsWitReponseFromSlackEvent', () => {
    let messageMockFn = jest.fn(), randomMsgSpy
    beforeAll( () => {
        jest.mock('../../slack-api')
        jest.mock('node-wit')

        const WitLib = require('node-wit')
        jest.spyOn(WitLib, 'Wit').mockImplementation( function () {
            return { message: messageMockFn }
        } )

        const Slack = require('../../slack-api')
        Slack.postMessageInChannel = jest.fn()

        const Utils = require('../../utils')
        randomMsgSpy = jest.spyOn(Utils, 'getRandomMessageById')
    } )

    beforeEach(() => {
        messageMockFn.mockReset()
        randomMsgSpy.mockClear()
    })
      
    afterAll( () => {
        jest.restoreAllMocks()
        jest.resetAllMocks()
        jest.resetModules()
    } )

    test('Valid reported result', async () => {
        const { digetsWitReponseFromSlackEvent } = require('../app')
        messageMockFn.mockResolvedValueOnce({ "entities": {
                "player1": [ { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" } ],
                "player1_score": [ { "confidence": 0.98622021352969, "value": 2 } ],
                "player2_score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                "player2": [ { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" } ],
                "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
        } })

        await digetsWitReponseFromSlackEvent(validSlackEvent)
        expect(messageMockFn).toHaveBeenCalled()
        expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result valid', expect.anything())
    })
})
