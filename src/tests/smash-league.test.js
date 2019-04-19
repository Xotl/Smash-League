'use strict'
const {
    RANKING_ARRAY1, RANKING_ARRAY2, SCOREBOARD1, ACTIVE_CHALLENGES1, COMPLETED_CHALLENGES1,
    REPORTED_RESULTS1, CHALLENGES1
} = require('./smash-league.test.constants')

const {
    getNextWeekTimes, applyEndOfWeekRulesToPlayerScore, applyActivitiesToRanking
} = require('../smash-league')


describe('Smash League Challenges & Scoreboard', () => {

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
        },
        activities1 = [
            {// Valid index #0
                winner: 'U6457D5KQ',
                player1: 'U6457D5KQ', player2: 'U87CK0E4A', 
                player1Result: 3, player2Result: 2,
                players: ['U6457D5KQ', 'U87CK0E4A']
            },
            {// Invalid due to UDBD59WLT is unreachable for U6457D5KQ
                winner: 'UDBD59WLT',
                player1: 'U6457D5KQ', player2: 'UDBD59WLT', 
                player1Result: 0, player2Result: 3,
                players: ['U6457D5KQ', 'UDBD59WLT']
            },
            {// Valid index #2
                winner: 'UBA5M220K',
                player1: 'U6457D5KQ', player2: 'UBA5M220K', 
                player1Result: 0, player2Result: 3,
                players: ['U6457D5KQ', 'UBA5M220K']
            },
            {// Invalid because U6457D5KQ previuosly fought against U87CK0E4A and won
                winner: 'U6457D5KQ',
                player1: 'U6457D5KQ', player2: 'U87CK0E4A', 
                player1Result: 3, player2Result: 1,
                players: ['U6457D5KQ', 'U87CK0E4A']
            },
            {// Valid index #4
                winner: 'UBA5M220K',
                player1: 'U6457D5KQ', player2: 'UBA5M220K', 
                player1Result: 1, player2Result: 3,
                players: ['U6457D5KQ', 'UBA5M220K']
            },
            {// Valid index #5
                winner: 'UDBD59WLT',
                player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
                player1Result: 3, player2Result: 0,
                players: ['U61MBQTR8', 'UDBD59WLT']
            },
            {// Invalid because doesn't have coins left
                winner: 'U61MBQTR8',
                player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
                player1Result: 2, player2Result: 3,
                players: ['U61MBQTR8', 'UDBD59WLT']
            }
        ]

        const newRankingObj = applyActivitiesToRanking( {challenges: activities1}, rankingObj )
        expect(newRankingObj.ranking).toEqual(RANKING_ARRAY2)// No change in ranking table
        expect(newRankingObj.in_progress.scoreboard).toEqual({
            ...newRankingObj.in_progress.scoreboard,
            "U6457D5KQ": {
                "stand_points": 0,
                "points": 37,
                "coins": 0,
                "range": 3,
                "completed_challenges": [
                    activities1[0],
                    activities1[2],
                    activities1[4]
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
                "completed_challenges": [ activities1[5] ]
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
