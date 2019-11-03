'use strict'
const {
    RANKING_ARRAY1, RANKING_ARRAY2, SCOREBOARD1, ACTIVITIES1,
    RANKING_OBJECT1, RANKING_OBJECT2
} = require('./smash-league.test.constants')

const {
    getNextWeekObject, updateInProgressScoreboard,
    commitInProgress, isReportedResultValid
} = require('../smash-league')


describe('Smash League Challenges & Scoreboard', () => {

    test('commitInProgress', () => {
        const endOfWeekScoreboard = RANKING_OBJECT1.in_progress.scoreboard
        expect( commitInProgress(RANKING_OBJECT1) )
        .toEqual({
            ...RANKING_OBJECT2, 
            scoreboard: Object.keys(endOfWeekScoreboard).reduce(
                (finalScore, playerId) => {
                    finalScore[playerId] = {
                        ...endOfWeekScoreboard[playerId], 
                        points: RANKING_OBJECT2.in_progress.scoreboard[playerId].points
                    }
                    return finalScore
                },
                {}
            )
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
                "points": 3690,
                "coins": 0,
                "range": 3,
                "completed_challenges": [
                    ACTIVITIES1[0], ACTIVITIES1[2], ACTIVITIES1[4]
                ]
            },
            "UBA5M220K": {
                "initial_coins": 0,
                "points": 3807,
                "coins": 1,
                "range": 1,
                "completed_challenges": []
            },
            "U61MBQTR8": {
                "initial_coins": 0,
                "points": 4419,
                "coins": 1,
                "range": 2,
                "completed_challenges": [ ACTIVITIES1[10] ]
            },
            "UB616ENA0": {
                "initial_coins": 0,
                "points": 3987,
                "coins": 0,
                "range": 1,
                "completed_challenges": [ ACTIVITIES1[5] ]
            },
            "UDBD59WLT": {
                "initial_coins": 0,
                "points": 4387,
                "coins": 0,
                "range": 0,
                "completed_challenges": []
            },
            "newPlayer": {
                "initial_coins": 3,
                "points": 1013,
                "coins": 1,
                "range": 4,
                "completed_challenges": [ ACTIVITIES1[7], ACTIVITIES1[8], ACTIVITIES1[9] ]
            },
            "U7VAPLNCR": {
                "initial_coins": 0,
                "points": 3132,
                "coins": 0,
                "range": 0,
                "completed_challenges": []
            },
            "Another unranked player": {
                "initial_coins": 3,
                "points": 984,
                "coins": 2,
                "range": 3,
                "completed_challenges": [ ACTIVITIES1[11] ]
            },
            "Unranked player": {
                "initial_coins": 3,
                "points": 1048,
                "coins": 3,
                "range": 3,
                "completed_challenges": [ ACTIVITIES1[11] ]
            },
        })
    })

    test('isReportedResultValid', () => {
        const rankingTable = [
            ['Xotl'],
            ['José', 'Lee'],
            ['Paco'],
            ['Neku'],
            ['Roberto']
        ]

        const unrankedScore = {
            "initial_coins": 2, "coins": 2, "range": 2,
            "points": 0, "stand_points": 0, "completed_challenges": []
        }

        expect(
            isReportedResultValid(
                {
                    challengerId: 'Medininja', challengerPlace: 6,
                    playerChallengedId: 'Manco', playerChallengedPlace: 6
                },
                rankingTable, unrankedScore, unrankedScore, {}
            )
        ).toBe(true)

        expect(
            isReportedResultValid(
                {
                    challengerId: 'Medininja', challengerPlace: 6,
                    playerChallengedId: 'Paco', playerChallengedPlace: 4
                },
                rankingTable,
                {
                    "initial_coins": 2, "coins": 2, "range": 2,
                    "points": 0, "stand_points": 0, "completed_challenges": []
                },
                unrankedScore, unrankedScore, {}
            )
        ).toBe(true)

        expect(
            isReportedResultValid(
                {
                    challengerId: 'Medininja', challengerPlace: 6,
                    playerChallengedId: 'Xotl', playerChallengedPlace: 1
                },
                rankingTable, unrankedScore, unrankedScore, {}
            )
        ).toBe(false)
    })
})
