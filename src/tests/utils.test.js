'use strict'

const {
    GetEpochUnixFromDate, GetDateObjFromEpochTS, setIgnoredActivityLogObject, logIgnoredActivity,
    logIgnoredMatch, showInConsoleIgnoredActivities
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
        expect( logFnSpy ).toHaveBeenNthCalledWith(3, 'A total of 1 test activities ignored.');
        expect( logFnSpy ).toHaveBeenNthCalledWith(6, 'A total of 2 match activities ignored.');

        logFnSpy.mockRestore()
    })
})
