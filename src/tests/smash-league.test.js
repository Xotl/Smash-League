'use strict'
const {
    RANKING_ARRAY1, RANKING_ARRAY2, SCOREBOARD1, ACTIVITIES1, SLACK_MESSAGES1,
    REPORTED_RESULTS1, CHALLENGES1
} = require('./smash-league.test.constants')

const {
    getNextWeekTimes, applyEndOfWeekRulesToPlayerScore, applyActivitiesToRanking,
    categorizeSlackMessages
} = require('../smash-league')


describe('Smash League Challenges & Scoreboard', () => {

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

    test('getNextWeekTimes', () => {
        const date1 =  new Date(2019, 2, 31), date2 =  new Date(2019, 3, 7)
        expect(
            getNextWeekTimes(date1.getTime())
        ).toEqual({
            start: date1.getTime() + 1, end: date2.getTime()
        })
    })

    test('applyEndOfWeekRulesToPlayerScore', () => {
        const playerScore1 = { "stand_points": 3, "points": 4, "coins": 2, "range": 1 }
        expect(
            applyEndOfWeekRulesToPlayerScore( 'Xotl', playerScore1, RANKING_ARRAY1 )
        ).toEqual({
            stand_points: 0, points: 6, coins: 0, range: 0,
            completed_challenges: []
        })
        expect(
            applyEndOfWeekRulesToPlayerScore( 'FerSeñior', playerScore1, RANKING_ARRAY1 )
        ).toEqual({
            stand_points: 0, points: 6, coins: 2, range: 2,
            completed_challenges: []
        })

        const playerScore2 = { "stand_points": 1, "points": 2, "coins": 0, "range": 2 }
        expect(
            applyEndOfWeekRulesToPlayerScore( 'lrgilberto', playerScore2, RANKING_ARRAY1 )
        ).toEqual({
            stand_points: 0, points: 5, coins: 1, range: 1,
            completed_challenges: []
        })
        expect(
            applyEndOfWeekRulesToPlayerScore( 'David', playerScore2, RANKING_ARRAY1 )
        ).toEqual({
            stand_points: 0, points: 5, coins: 3, range: 3,
            completed_challenges: []
        })
    })

    test('applyActivitiesToRanking', () => {
        const rankingObj = {
            ranking: RANKING_ARRAY2,  in_progress: { scoreboard: SCOREBOARD1 }
        }

        const newRankingObj = applyActivitiesToRanking( {challenges: ACTIVITIES1}, rankingObj )
        expect(newRankingObj.ranking).toEqual(RANKING_ARRAY2)// No change in ranking table
        expect(newRankingObj.in_progress.scoreboard).toEqual({
            ...newRankingObj.in_progress.scoreboard,
            "U6457D5KQ": {
                "stand_points": 0,
                "points": 37,
                "coins": 0,
                "range": 3,
                "completed_challenges": [
                    ACTIVITIES1[0], ACTIVITIES1[2], ACTIVITIES1[4]
                ]
            },
            "UBA5M220K": {
                "stand_points": 2,
                "points": 37,
                "coins": 1,
                "range": 1,
                "completed_challenges": []
            },
            "U61MBQTR8": {
                "stand_points": 2,
                "points": 44,
                "coins": 0,
                "range": 1,
                "completed_challenges": [ ACTIVITIES1[5] ]
            },
            "UDBD59WLT": {
                "stand_points": 1,
                "points": 42,
                "coins": 0,
                "range": 0,
                "completed_challenges": []
            }
        })
    })
})
