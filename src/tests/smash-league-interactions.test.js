'use strict'
const {
    SLACK_MESSAGES1, WIT_RESPONSE1, WIT_RESPONSE2, WIT_RESPONSE3
} = require('./smash-league-interactions.test.constants')

describe('Smash League interactions', () => {

    const messageMockFn = jest.fn()
    beforeAll(() => {
        jest.mock('node-wit')
    })

    afterAll( () => {
        jest.restoreAllMocks()
        jest.resetAllMocks()
        jest.resetModules()
    } )

    test('categorizeSlackMessages', async () => {
        const logFnSpy = jest.spyOn(console, 'log')
                            .mockImplementation(_ => { return })// NoOp

        const WitLib = require('node-wit')
        const witFnSpy = jest.spyOn(WitLib, 'Wit').mockImplementation( function () {
            return { message: messageMockFn }
        } )
        
        messageMockFn.mockResolvedValueOnce(WIT_RESPONSE1)// partial result
                     .mockResolvedValueOnce(WIT_RESPONSE3)// no entities
                     .mockResolvedValueOnce(WIT_RESPONSE2)// complete result
                     .mockResolvedValue(WIT_RESPONSE1)
        
        const { categorizeSlackMessages } = require('../smash-league-interactions')
        await expect( categorizeSlackMessages() )
            .rejects.toThrow('The argument messagesArray must be an Array.')

        expect(witFnSpy).not.toHaveBeenCalled()

        await expect(
            categorizeSlackMessages(SLACK_MESSAGES1, [ "admin_user1" ])
        ).resolves.toEqual({
            ignoredMessages: [ ],
            challenges: [],
            reportedResults: [
                {
                    winner: 'U6457D5KQ',
                    player1: 'UB616ENA0', player2: 'U6457D5KQ', 
                    player1Result: 2, player2Result: 3,
                    players: ['UB616ENA0', 'U6457D5KQ'],
                    "ts": 1, "thread_ts": 1
                },
                {
                    winner: 'U8A96RCEA',
                    player1: 'UDBD59WLT', player2: 'U8A96RCEA', 
                    player1Result: 0, player2Result: 3,
                    players: ['UDBD59WLT', 'U8A96RCEA'],
                    "ts": 2, "thread_ts": 2
                },
                {
                    winner: 'U6H8DDV25',
                    player1: 'UDBD59WLT', player2: 'U6H8DDV25', 
                    player1Result: 0, player2Result: 3,
                    players: ['UDBD59WLT', 'U6H8DDV25'],
                    "ts": 10, "thread_ts": 10
                }
            ]
        })

        expect(logFnSpy).toHaveBeenCalled()

        logFnSpy.mockRestore()
        witFnSpy.mockRestore()
    })
})
