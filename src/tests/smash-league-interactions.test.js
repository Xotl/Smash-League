'use strict'
const {
    SLACK_MESSAGES1,
} = require('./smash-league.test.constants')

const {
    categorizeSlackMessages
} = require('../smash-league-interactions')


// describe('Smash League interactions', () => {

//     test('categorizeSlackMessages', () => {
//         expect( _ => categorizeSlackMessages() )
//             .toThrowError('The argument messagesArray must be an Array.')

//         expect(
//             categorizeSlackMessages(SLACK_MESSAGES1)
//         ).toEqual({
//             ignoredMessages: [ SLACK_MESSAGES1[4], SLACK_MESSAGES1[5], SLACK_MESSAGES1[6] ],
//             challenges: [],
//             reportedResults: [
//                 {
//                     winner: 'U61MBQTR8',
//                     player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
//                     player1Result: 1, player2Result: 3,
//                     players: ['UDBD59WLT', 'U61MBQTR8']
//                 },
//                 {
//                     winner: 'UDBD59WLT',
//                     player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
//                     player1Result: 3, player2Result: 2,
//                     players: ['UDBD59WLT', 'U61MBQTR8']
//                 },
//                 {
//                     winner: 'UDBD59WLT',
//                     player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
//                     player1Result: 3, player2Result: 2,
//                     players: ['UDBD59WLT', 'U61MBQTR8']
//                 },
//                 {
//                     winner: 'U61MBQTR8',
//                     player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
//                     player1Result: 1, player2Result: 3,
//                     players: ['UDBD59WLT', 'U61MBQTR8']
//                 },
//             ]
//         })
//     })
// })
