'use strict'

describe('app.js - digetsWitReponseFromSlackEvent', () => {
    const slackEvent1 = {
        ts: "500000000", user: 'U622XCTAA', //thread_ts,
        text: 'valid reported_result'
    }

    let messageMockFn = jest.fn(), slackPostMessageMockFn = jest.fn(), randomMsgSpy
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
        Slack.postMessageInChannel = slackPostMessageMockFn

        const Utils = require('../../utils')
        randomMsgSpy = jest.spyOn(Utils, 'getRandomMessageById')
    } )

    beforeEach(() => {
        slackPostMessageMockFn.mockReset()
        messageMockFn.mockReset()
        randomMsgSpy.mockClear()
    })
      
    afterAll( () => {
        jest.restoreAllMocks()
        jest.resetAllMocks()
        jest.resetModules()
    } )

    describe('Reported Results', () => {
        const slackEvent1 = {
            ts: "500000000", user: 'U622XCTAA', //thread_ts,
            text: 'valid reported_result'
        }

        test('Valid normal', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [
                        { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" },
                        { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" }
                     ],
                    "score": [
                        { "confidence": 0.98622021352969, "value": 2 },
                        { "confidence": 0.98620547818029, "value": -3 }
                    ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result valid', {
                winner: '<@U6457D5KQ>', loser: '<@UB616ENA0>', highScore: 3, lowScore: 2
            })
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })
    
        test('Valid myself', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [
                        { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" },
                        { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" }
                    ],
                    "score": [
                        { "confidence": 0.98622021352969, "value": 2 },
                        { "confidence": 0.98620547818029, "value": -3 }
                    ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result valid', {
                winner: '<@U6457D5KQ>', loser: '<@UB616ENA0>', highScore: 3, lowScore: 2
            })
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Valid onbehalf', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [
                        { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" },
                    ],
                    "onbehalf": [
                        { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" }
                    ],
                    "match_result": [ { "confidence": 0.98849031005298, "value": "win" } ],
                    "score": [
                        { "confidence": 0.98622021352969, "value": 2 },
                        { "confidence": 0.98620547818029, "value": -3 }
                    ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result valid', {
                winner: '<@U6457D5KQ>', loser: '<@UB616ENA0>', highScore: 3, lowScore: 2
            })
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Low Confidence', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "reported_result": [ { "confidence": 0.78849031005298, "value": "Non existent value" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result confidence_low', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Not implemented', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            const invalidType = "Non existent value"
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "reported_result": [ { "confidence": 0.98849031005298, "value": invalidType } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result not_implemented', {type: invalidType})
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Missing Score', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [
                        { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" },
                        { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" }
                    ],
                    "score": [ { "confidence": 0.98620547818029, "value": -3 } ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result missing_score', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Missing players with match result', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "score": [
                        { "confidence": 0.98622021352969, "value": 2 },
                        { "confidence": 0.98620547818029, "value": -3 }
                    ],
                    "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ],
                    "match_result": [ { "confidence": 0.98849031005298, "value": "win" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result myself_missing_player', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Missing players', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                "score": [
                    { "confidence": 0.98622021352969, "value": 2 },
                    { "confidence": 0.98620547818029, "value": -3 }
                ],
                "player": [ { "confidence": 0.95310457331374, "value": "<@U6457D5KQ>" } ],
                "reported_result": [ { "confidence": 0.98849031005298, "value": "normal" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'reported_result normal_missing_player', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
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
            expect(randomMsgSpy).toHaveBeenNthCalledWith(2, 'lookup_challengers myself_all', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Low confidence', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "lookup_challengers": [ { "confidence": 0.78849031005298, "value": "myself_all" } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers confidence_low', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Not implemented', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            const invalidType = 'Non valid type'
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": invalidType } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers not_implemented', {type: invalidType})
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Onbehalf missing', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'onbehalf_all' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers onbehalf_missing')
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Valid Onbehalf', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "onbehalf": [ { "confidence": 0.98849031005298, "value": '<@U6457D5KQ>' } ],
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'onbehalf_all' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers onbehalf_all', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('No coins', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "onbehalf": [ { "confidence": 0.98849031005298, "value": '<@U61MBQTR8>' } ],
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'onbehalf_all' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers onbehalf no_coins', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Specific request', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'myself_specific' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers myself_specific missing_players', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Cannot challenge mentioned players', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [ { "confidence": 0.99038589888413, "value": "<@U61MBQTR8>" } ],
                    "onbehalf": [ { "confidence": 0.98849031005298, "value": '<@U8CEKPXQR>' } ],
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'onbehalf_specific' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers onbehalf_specific cannot_challenge', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Can challenge all mentioned players', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [
                        { "confidence": 0.99038589888413, "value": "<@UB616ENA0>" },
                        { "confidence": 0.99038589888413, "value": "<@U8THDCVJ7>" }
                    ],
                    "onbehalf": [ { "confidence": 0.98849031005298, "value": '<@U6457D5KQ>' } ],
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'onbehalf_specific' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers onbehalf_specific all_players_found', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })

        test('Can challenge just some of the mentioned players', async () => {
            const { digetsWitReponseFromSlackEvent } = require('../app')
            messageMockFn.mockResolvedValueOnce({ "entities": {
                    "player": [
                        { "confidence": 0.99038589888413, "value": "<@U8THDCVJ7>" },
                        { "confidence": 0.99038589888413, "value": "<@U61MBQTR8>" }
                    ],
                    "onbehalf": [ { "confidence": 0.98849031005298, "value": '<@U6457D5KQ>' } ],
                    "lookup_challengers": [ { "confidence": 0.98849031005298, "value": 'onbehalf_specific' } ]
            } })
    
            await digetsWitReponseFromSlackEvent(slackEvent1)
            expect(messageMockFn).toHaveBeenCalled()
            expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'lookup_challengers onbehalf_specific some_players_found', expect.anything())
            expect(slackPostMessageMockFn).toHaveBeenCalled()
        })
    })

    test('No valid intent detected', async () => {
        const { digetsWitReponseFromSlackEvent } = require('../app')
        messageMockFn.mockResolvedValueOnce({ "entities": { } })
        await digetsWitReponseFromSlackEvent(slackEvent1)
        expect(messageMockFn).toHaveBeenCalled()
        expect(randomMsgSpy).toHaveBeenNthCalledWith(1, 'no_interpretation', expect.anything())
    })
})