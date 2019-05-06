'use strict'
const fs = require('fs')
const {
    updateRankingMarkdownFile, updateHistoryLog, updateRankingJsonFile
} = require('../output-generator')

const {
    RANKING_OBJ1
} = require('./output-generator.test.constants')



describe('Utils', () => {

    let writeFileFnSpy = jest.spyOn(fs, 'writeFile').mockImplementation(
        (...params) => {
            const cb = params.reverse().find(a => typeof a === 'function')
            cb && cb()// Executes callback
        }
    )
    beforeEach( writeFileFnSpy.mockClear )
    afterAll(jest.restoreAllMocks)


    test('updateRankingMarkdownFile', async () => {
        expect.assertions(2);
        await expect( updateRankingMarkdownFile(RANKING_OBJ1, { 
            stand_points: 0, points: 0, initial_coins: 0, coins: 0, range: 0
        }) ).resolves.not.toThrow()
        expect( writeFileFnSpy ).toHaveBeenCalledTimes(1)
    })

    test('updateRankingJsonFile', async () => {
        expect.assertions(2);
        await expect( updateRankingJsonFile(RANKING_OBJ1) ).resolves.not.toThrow()
        expect( writeFileFnSpy ).toHaveBeenCalledTimes(1)
    })

    test('updateHistoryLog', async () => {
        const readFileFnSpy = jest.spyOn(fs, 'readFile').mockImplementation( (...params) => params[1](null, '') )
        const openFileFnSpy = jest.spyOn(fs, 'open').mockImplementation( (...params) => params[2](null, null) )
        const writeSyncFnSpy = jest.spyOn(fs, 'writeSync').mockImplementation(jest.fn())
        const closeSyncFnSpy = jest.spyOn(fs, 'closeSync').mockImplementation(jest.fn())

        expect.assertions(3);
        await expect( updateHistoryLog(RANKING_OBJ1.in_progress, RANKING_OBJ1.current_week) ).resolves.not.toThrow()
        expect( writeSyncFnSpy ).toHaveBeenCalledTimes(2)
        expect( closeSyncFnSpy ).toHaveBeenCalledTimes(1)
    })
})
