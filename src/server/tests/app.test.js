'use strict'

describe('app.js - digetsWitReponseFromSlackEvent', () => {
    let messageMockFn = jest.fn(), randomMsgSpy
    beforeAll( () => {
        const { RANKING_OBJ1 } = require('./app.test.constants')
        jest.mock('../../slack-api', () => jest.fn())
        jest.mock('node-wit')
        jest.mock('../../../ranking-info/ranking.json')
        
        const Ranking = require('../../../ranking-info/ranking.json')
        Ranking.ranking = RANKING_OBJ1.ranking
        Ranking.scoreboard = RANKING_OBJ1.scoreboard
        Ranking.in_progress = RANKING_OBJ1.in_progress

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

    describe('Reported Results', () => {
        const slackEvent = {
            ts: "500000000", user: 'U622XCTAA', //thread_ts,
            text: 'valid reported_result'
        }

        test('Valid normal', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player1": [ { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" } ],
                    "player1_score": [ { "confidence": 0.98622021352969, "value": 2 } ],
                    "player2_score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                    "player2": [ { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" } ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result valid', expect.anything())
        })
    
        test('Valid myself', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player1": [ { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" } ],
                    "player1_score": [ { "confidence": 0.98622021352969, "value": 2 } ],
                    "player2_score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                    "player2": [ { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" } ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result valid', expect.anything())
        })

        test('Low Confidence', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "reported_result": [ { "confidence": 0.78849031005298, "value": "Non existent value" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result confidence_low', expect.anything())
        })

        test('Not implemented', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            const invalidType = "Non existent value"
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "reported_result": [ { "confidence": 0.98849031005298, "value": invalidType } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result not_implemented', {type: invalidType})
        })

        test('Missing Score', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player1": [ { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" } ],
                    "player2_score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                    "player2": [ { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" } ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result missing_score', expect.anything())
        })

        test('Missing players with match result', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player1_score": [ { "confidence": 0.98622021352969, "value": 2 } ],
                    "player2_score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ],
                    "match_result": [ { "confidence": 0.98849031005298, "value": "win" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result myself_missing_player', expect.anything())
        })

        test('Missing players', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                "player1_score": [ { "confidence": 0.98622021352969, "value": 2 } ],
                "player2_score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                "player2": [ { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" } ],
                "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result normal_missing_player', expect.anything())
        })

    })




    describe('Lookup Challengers', () => {
        
        test('Valid myself_all', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "slack_user_id": [ { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" } ],
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": "myself_all" } ]
            } })
    
            await digetsWitReponseFromSlackEvent({
                ts: "500000000", user: 'U622XCTAA', //thread_ts,
                text: 'Valid lookup for challengers'
            })
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers select_one', expect.anything())
            expect(randomMsgSpy).toHaveBeenNthCalledWith(2, 'lookup_challengers all', expect.anything())
        })
    })


})