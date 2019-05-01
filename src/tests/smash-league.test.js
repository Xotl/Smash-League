'use strict'
const {
    RANKING_ARRAY1, RANKING_ARRAY2, SCOREBOARD1, ACTIVITIES1, SLACK_MESSAGES1,
    RANKING_OBJECT1, RANKING_OBJECT2
} = require('./smash-league.test.constants')

const {
    getNextWeekObject, calculatePointsFromPlayerScore, updateInProgressScoreboard,
    categorizeSlackMessages, commitInProgress
} = require('../smash-league')


describe('Smash League Challenges & Scoreboard', () => {

    test('commitInProgress', () => {
        expect( commitInProgress(RANKING_OBJECT1) )
        .toEqual({
            ...RANKING_OBJECT2, 
            scoreboard: RANKING_OBJECT2.in_progress.scoreboard
        })
    })


    test('categorizeSlackMessages', () => {
        expect( _ => categorizeSlackMessages() )
            .toThrowError('The argument messagesArray must be an Array.')

        expect(
            categorizeSlackMessages(SLACK_MESSAGES1)
        ).toEqual({
            challenges: [],
            reportedResults: [
                {
                    winner: 'U61MBQTR8',
                    player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
                    player1Result: 1, player2Result: 3,
                    players: ['UDBD59WLT', 'U61MBQTR8']
                },
                {
                    winner: 'UDBD59WLT',
                    player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
                    player1Result: 3, player2Result: 2,
                    players: ['UDBD59WLT', 'U61MBQTR8']
                },
                {
                    winner: 'UDBD59WLT',
                    player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
                    player1Result: 3, player2Result: 2,
                    players: ['UDBD59WLT', 'U61MBQTR8']
                },
                {
                    winner: 'U61MBQTR8',
                    player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
                    player1Result: 1, player2Result: 3,
                    players: ['UDBD59WLT', 'U61MBQTR8']
                },
            ]
        })
    })

    test('getNextWeekObject', () => {
        const date1 =  new Date(2019, 2, 31), date2 =  new Date(2019, 3, 7)
        expect(
            getNextWeekObject(date1.getTime())
        ).toEqual({
            start: date1.getTime() + 1, end: date2.getTime()
        })
    })

    test('calculatePointsFromPlayerScore', () => {
        const playerScore1 = { "initial_coins": 0, "stand_points": 1, "points": 2, "coins": 0, "range": 2 }
        expect(
            calculatePointsFromPlayerScore( playerScore1 )// Xotl
        ).toBe( 5 )
                
        const playerScore2 = { "initial_coins": 2, "stand_points": 3, "points": 4, "coins": 1, "range": 5 }
        expect(
            calculatePointsFromPlayerScore( playerScore2 )// lrgilberto
        ).toBe( 9 )
    })

    test('updateInProgressScoreboard', () => {

        expect( _ => updateInProgressScoreboard() )
            .toThrowError('The "activities" argument must be an object but received "undefined" instead.')
        expect( _ => updateInProgressScoreboard({}) )
            .toThrowError('The "rankingObj" argument must be an object but received "undefined" instead.')

        const rankingObj = {
            ranking: RANKING_ARRAY2,  in_progress: { scoreboard: SCOREBOARD1 }
        }

        const newInProgress = updateInProgressScoreboard( {reportedResults: ACTIVITIES1}, rankingObj )
        expect(newInProgress.scoreboard).toEqual({
            ...SCOREBOARD1,
            "U6457D5KQ": {
                "initial_coins": 0,
                "stand_points": 0,
                "points": 37,
                "coins": 0,
                "range": 3,
                "completed_challenges": [
                    ACTIVITIES1[0], ACTIVITIES1[2], ACTIVITIES1[4]
                ]
            },
            "UBA5M220K": {
                "initial_coins": 0,
                "stand_points": 1,
                "points": 37,
                "coins": 1,
                "range": 1,
                "completed_challenges": []
            },
            "U61MBQTR8": {
                "initial_coins": 0,
                "stand_points": 2,
                "points": 44,
                "coins": 0,
                "range": 1,
                "completed_challenges": [ ACTIVITIES1[5] ]
            },
            "UDBD59WLT": {
                "initial_coins": 0,
                "stand_points": 1,
                "points": 42,
                "coins": 0,
                "range": 0,
                "completed_challenges": []
            },
            "newPlayer": {
                "initial_coins": 3,
                "stand_points": 0,
                "points": 0,
                "coins": 1,
                "range": 4,
                "completed_challenges": [ ACTIVITIES1[7], ACTIVITIES1[8], ACTIVITIES1[9] ]
            },
            "U7VAPLNCR": {
                "initial_coins": 0,
                "stand_points": 1,
                "points": 31,
                "coins": 0,
                "range": 0,
                "completed_challenges": []
            }
        })
    })
})
