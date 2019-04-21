'use strict'

const {
    GetDateObjFromEpochTS, setIgnoredActivityLogObject, logIgnoredActivity,
    logIgnoredChallenge, showInConsoleIgnoredActivities
} = require('../utils')


describe('Utils', () => {

    test('GetDateObjFromEpochTS', () => {
        expect( GetDateObjFromEpochTS(1554012202.785).toISOString() )
        .toBe( '2019-03-31T06:03:22.785Z' )
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

    test('logIgnoredChallenge', () => {
        logIgnoredChallenge(reason, activity)
        expect( tmpActivities ).toEqual({
            ...expectObj1, 
            challenge: [ ignoredActivityObj ]
        })

        logIgnoredChallenge(reason, activity)
        expect( tmpActivities ).toEqual({
            ...expectObj1, 
            challenge: [ ignoredActivityObj, ignoredActivityObj ]
        })
    })

    test('showInConsoleIgnoredActivities', () => {
        const logFnSpy = jest.spyOn(console, 'log')
                            .mockImplementation(_ => { return })// NoOp

        showInConsoleIgnoredActivities(tmpActivities)
        expect( logFnSpy ).toHaveBeenCalledTimes(6)
        expect( logFnSpy ).toHaveBeenNthCalledWith(3, 'A total of 1 test activities ignored.');
        expect( logFnSpy ).toHaveBeenNthCalledWith(6, 'A total of 2 challenge activities ignored.');

        logFnSpy.mockRestore()
    })
})
