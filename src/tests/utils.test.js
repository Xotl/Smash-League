'use strict'

const {
    GetEpochUnixFromDate, GetDateObjFromEpochTS, setIgnoredActivityLogObject, logIgnoredActivity,
    logIgnoredMatch, showInConsoleIgnoredActivities, removeAlreadyChallengedPlayers, 
    removeEmptyArray, eloCalculation
} = require('../utils')


describe('Utils', () => {

    test('GetDateObjFromEpochTS', () => {
        expect( GetDateObjFromEpochTS(1554012202.785).toISOString() )
        .toBe( '2019-03-31T06:03:22.785Z' )
    })

    test('GetEpochUnixFromDate', () => {
        expect( _ => GetEpochUnixFromDate( 1554012202785 ) )
        .toThrow()

        expect( GetEpochUnixFromDate( new Date(1554012202785) ) )
        .toBe( 1554012202.785 )
    })

    const reason = 'My message',  tmpActivities = {}, activity = {},
          ignoredActivityObj ={ reason, activity },
          expectObj1 = { test: [ ignoredActivityObj ] }
    test('logIgnoredActivity', () => {
        expect( _ => logIgnoredActivity() )
            .not.toThrow()
        
        setIgnoredActivityLogObject(tmpActivities)
        logIgnoredActivity(reason, activity, 'test')
        expect( tmpActivities ).toEqual(expectObj1)
    })

    test('logIgnoredMatch', () => {
        logIgnoredMatch(reason, activity)
        expect( tmpActivities ).toEqual({
            ...expectObj1, 
            match: [ ignoredActivityObj ]
        })

        logIgnoredMatch(reason, activity)
        expect( tmpActivities ).toEqual({
            ...expectObj1, 
            match: [ ignoredActivityObj, ignoredActivityObj ]
        })
    })

    test('showInConsoleIgnoredActivities', () => {
        const logFnSpy = jest.spyOn(console, 'log')
                            .mockImplementation(_ => { return })// NoOp

        showInConsoleIgnoredActivities(tmpActivities)
        expect( logFnSpy ).toHaveBeenCalledTimes(6)
        expect( logFnSpy ).toHaveBeenNthCalledWith(3, 'A total of 1 test activities ignored.')
        expect( logFnSpy ).toHaveBeenNthCalledWith(6, 'A total of 2 match activities ignored.')

        logFnSpy.mockRestore()
    })

    test('removeAlreadyChallengedPlayers', () => {

        expect(
            removeAlreadyChallengedPlayers(
                [ ["Xotl"], ["Paco", "José"], ["Lee"] ],
                "Sammy",
                {
                    "scoreboard": {
                        "Sammy": {
                            "initial_coins": 2, "coins": 2, "range": 2,
                            "points": 0, "stand_points": 0,
                            "completed_challenges": [
                                {
                                    "winner": "Sammy", "player1": "Sammy", "player2": "Lee",
                                    "player1Result": 3, "player2Result": 0,
                                    "players": [ "Lee", "Sammy" ]
                                },
                            ]
                        }
                    }
                }
            )
        ).toEqual([ ["Xotl"], ["Paco", "José"], [] ])

        expect(
            removeAlreadyChallengedPlayers(
                [ ["Paco"], ["José", "Lee"], ["Sammy"] ],
                "Minion",
                {
                    "scoreboard": {
                        "Minion": {
                            "initial_coins": 2, "coins": 2, "range": 2,
                            "points": 0, "stand_points": 0,
                            "completed_challenges": [
                                {
                                    "winner": "Minion", "player1": "Minion", "player2": "Lee",
                                    "player1Result": 3, "player2Result": 0,
                                    "players": [ "Lee", "Minion" ]
                                },
                            ]
                        }
                    }
                }
            )
        ).toEqual([ ["Paco"], ["José"], ["Sammy"] ])
    })


    test('removeAlreadyChallengedPlayers', () => {
        expect(
            removeEmptyArray([ ["Paco"], [], ["Sammy"] ])
        ).toEqual(
            [ ["Paco"], ["Sammy"] ]
        )
    })

    test('EloCalculateForPlayerAIFPlayerAIsBetterAndWinsBy3to2', () => {
        expect(
            eloCalculation(2400, 1500, 3, 2)
        ).toEqual({
            playerANewElo: 2460,
            playerBNewElo: 1548
        })
    })

    test('EloCalculateForPlayerBIFPlayerAIsBetterAndWinsBy3to2', () => {
        expect(
            eloCalculation(2500, 1500, 2, 3)
        ).toEqual({
            playerANewElo: 2524,
            playerBNewElo: 1580
        })
    })

    test('EloCalculateForPlayerAIFPlayerAIsBetterAndWinsBy3to0', () => {
        expect(
            eloCalculation(2500, 1500, 3, 0)
        ).toEqual({
            playerANewElo: 2540,
            playerBNewElo: 1484
        })
    })

    test('EloCalculateForPlayerBIFPlayerAIsBetterAndWinsBy3to0', () => {
        expect(
            eloCalculation(2500, 1500, 0, 3)
        ).toEqual({
            playerANewElo: 2492,
            playerBNewElo: 1580
        })
    })

    test('EloCalculateForPlayerAIFSimilarEloAndWinsBy3to0', () => {
        expect(
            eloCalculation(1500, 1500, 3, 0)
        ).toEqual({
            playerANewElo: 1580,
            playerBNewElo: 1484
        })
    })

    test('EloCalculateForPlayerBIFAIsAGodAndWinsBy3to0', () => {
        expect(
            eloCalculation(3000, 1000, 0, 3)
        ).toEqual({
            playerANewElo: 2992,
            playerBNewElo: 1080
        })
    })

})
