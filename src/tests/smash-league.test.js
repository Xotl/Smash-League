'use strict'
const {
    RANKING_ARRAY1, RANKING_ARRAY2, SCOREBOARD, ACTIVE_CHALLENGES1, COMPLETED_CHALLENGES1,
    REPORTED_RESULTS1, CHALLENGES1
} = require('./smash-league.test.constants')

const {
    calculatePointsFromPlayerScore, applyEndOfWeekRulesToPlayerScore
} = require('../smash-league')


describe('Smash League Challenges & Scoreboard', () => {
    test('calculatePointsFromPlayerScore', () => {
        expect(
            calculatePointsFromPlayerScore({ "stand_points": 0, "points": 3, "coins": 0, "range": 1 })
        ).toBe(4)
        expect(
            calculatePointsFromPlayerScore({ "stand_points": 1, "points": 2, "coins": 0, "range": 2 })
        ).toBe(5)
        expect(
            calculatePointsFromPlayerScore({ "stand_points": 3, "points": 4, "coins": 2, "range": 1 })
        ).toBe(6)
    })

    test('applyEndOfWeekRulesToPlayerScore', () => {
        expect(
            applyEndOfWeekRulesToPlayerScore(
                'Xotl', 
                { "stand_points": 3, "points": 4, "coins": 2, "range": 1 },
                RANKING_ARRAY1
            )
        ).toMatchObject({
            stand_points: 0, points: 6, coins: 0, range: 0,
            completed_challenges: expect.arrayContaining([])
        })
    })
})
