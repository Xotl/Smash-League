'use strict'
jest.mock('node-wit')
const WitLib = require('node-wit');
const {
    SLACK_MESSAGES1, WIT_RESPONSE1, WIT_RESPONSE2, WIT_RESPONSE3
} = require('./smash-league-interactions.test.constants')

const {
    categorizeSlackMessages
} = require('../smash-league-interactions')


describe('Smash League interactions', () => {

    test('categorizeSlackMessages', async () => {
        const messageMockFn = jest.fn()
            .mockResolvedValueOnce(WIT_RESPONSE1)// partial result
            .mockResolvedValueOnce(WIT_RESPONSE3)// no entities
            .mockResolvedValueOnce(WIT_RESPONSE2)// complete result
            .mockResolvedValue(WIT_RESPONSE1)
        const witFnSpy = jest.spyOn(WitLib, 'Wit').mockImplementation( function () {
            return { message: messageMockFn }
        } )

        await expect( categorizeSlackMessages() )
            .rejects.toThrow('The argument messagesArray must be an Array.')

        expect(witFnSpy).not.toHaveBeenCalled()

        await expect(
            categorizeSlackMessages(SLACK_MESSAGES1)
        ).resolves.toEqual({
            ignoredMessages: [ ],
            challenges: [],
            reportedResults: [
                {
                    winner: 'U6457D5KQ',
                    player1: 'UB616ENA0', player2: 'U6457D5KQ', 
                    player1Result: 2, player2Result: 3,
                    players: ['UB616ENA0', 'U6457D5KQ']
                },
                {
                    winner: 'U8A96RCEA',
                    player1: 'UDBD59WLT', player2: 'U8A96RCEA', 
                    player1Result: 0, player2Result: 3,
                    players: ['UDBD59WLT', 'U8A96RCEA']
                },
                {
                    winner: 'U6H8DDV25',
                    player1: 'UDBD59WLT', player2: 'U6H8DDV25', 
                    player1Result: 0, player2Result: 3,
                    players: ['UDBD59WLT', 'U6H8DDV25']
                }
            ]
        })
        witFnSpy.mockRestore()
    })
})
