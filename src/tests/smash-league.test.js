'use strict'
const {
    RANKING_ARRAY1, RANKING_ARRAY2, SCOREBOARD, ACTIVE_CHALLENGES1, COMPLETED_CHALLENGES1,
    REPORTED_RESULTS1, CHALLENGES1
} = require('./smash-league.test.constants')

const {
    applyScoreForChallengesNotCompleted, isItTimeToCommitInProgress, getRankingPlaceByPlayerId,
    getNumberOfChallengesAllowed, canPlayerAChallengePlayerB, isValidChallenge
} = require('../smash-league')


describe('Smash League Challenges & Scoreboard', () => {
    test('isValidChallenge', () => {
        expect(// Already consumed the max of 2 challenges 
            isValidChallenge('UB616ENA0', 'U8THDCVJ7', ACTIVE_CHALLENGES1['UB616ENA0'], COMPLETED_CHALLENGES1['UB616ENA0'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)

        expect(// Duplicated challenge
            isValidChallenge('UEWUZCYJF', 'UE82A6MNY', ACTIVE_CHALLENGES1['UEWUZCYJF'], COMPLETED_CHALLENGES1['UEWUZCYJF'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)

        expect(// Same place challenge
            isValidChallenge('U8THDCVJ7', 'UBA5M220K', ACTIVE_CHALLENGES1['U8THDCVJ7'], COMPLETED_CHALLENGES1['U8THDCVJ7'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)

        expect(// Same place challenge with unranked
            isValidChallenge('Non ranked player', 'UBHGVCY4X', ACTIVE_CHALLENGES1['Non ranked player'], COMPLETED_CHALLENGES1['Non ranked player'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)

        expect(// Completed challenge between players
            isValidChallenge('UBHGVCY4X', 'UBRCZ6G4B', ACTIVE_CHALLENGES1['UBHGVCY4X'], COMPLETED_CHALLENGES1['UBHGVCY4X'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)

        expect(// More than one player on the same place challenge
            isValidChallenge('U87CK0E4A', 'UBA5M220K', ACTIVE_CHALLENGES1['U87CK0E4A'], COMPLETED_CHALLENGES1['U87CK0E4A'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)

        expect(// Player fought already with another player in the same place
            isValidChallenge('UBHGVCY4X', 'UBRMBGR6Z', ACTIVE_CHALLENGES1['UBHGVCY4X'], COMPLETED_CHALLENGES1['UBHGVCY4X'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(false)
        
        expect(// Simple valid challenge with unranked player
            isValidChallenge('Another unranked player', 'UBRMBGR6Z', ACTIVE_CHALLENGES1['Another unranked player'], COMPLETED_CHALLENGES1['Another unranked player'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(true)

        expect(// Simple valid challenge
            isValidChallenge('UEWUZCYJF', 'U7VAPLNCR', ACTIVE_CHALLENGES1['UEWUZCYJF'], COMPLETED_CHALLENGES1['UEWUZCYJF'], RANKING_ARRAY2, SCOREBOARD)
        ).toBe(true)
    })

    test('applyScoreForChallengesNotCompleted', () => {
        let newScoreboard
        
        newScoreboard = applyScoreForChallengesNotCompleted(SCOREBOARD, ACTIVE_CHALLENGES1)
        expect(newScoreboard['UB616ENA0']).toBe(21)// Wins points
        expect(newScoreboard['UEWUZCYJF']).toBe(3)// Wins points
        expect(newScoreboard['Non ranked player']).toBe(3)// Wins points
        expect(newScoreboard['U8THDCVJ7']).toBe(14)// Loses points
        expect(newScoreboard['U8QS8T0CX']).toBe(17)// Loses points
        expect(newScoreboard['UE82A6MNY']).toBe(0)// Loses points
    })


    // test('getUpdatedChallengesAndScoreboard', () => {
    //     const newInprogressObj = getUpdatedChallengesAndScoreboard(
    //         SmashLeagueTestConstants.reportedResults1, 
    //         RANKING_ARRAY1, SCOREBOARD, 
    //         SmashLeagueTestConstants.completedChallenges1, 
    //         ACTIVE_CHALLENGES1
    //     )

    //     expect(newInprogressObj).toBe(1);
    // })
})


describe('Smash League - Other functionality', () => {
    test('isItTimeToCommitInProgress', () => {
        let lastDate, currentDate

        lastDate = new Date('2019-02-12T03:24:00')
        currentDate = new Date('2019-02-14T00:22:00')
        expect(
            isItTimeToCommitInProgress(currentDate, lastDate)
        ).toBe(false)

        lastDate = new Date('2019-02-10T02:02:00')
        currentDate = new Date('2019-02-10T05:11:00')
        expect(
            isItTimeToCommitInProgress(currentDate, lastDate)
        ).toBe(false)

        lastDate = new Date('2019-02-09T12:02:00')
        currentDate = new Date('2019-02-10T01:11:00')
        expect(
            isItTimeToCommitInProgress(currentDate, lastDate)
        ).toBe(true)

        lastDate = new Date('2019-02-10T02:02:00')
        currentDate = new Date('2019-02-17T05:11:00')
        expect(
            isItTimeToCommitInProgress(currentDate, lastDate)
        ).toBe(true)
    })
})


describe('Smash League - Ranking', () => {

    test('getRankingPlaceByPlayerId', () => {
        expect(
            getRankingPlaceByPlayerId('Xotl', RANKING_ARRAY1)
        ).toBe(1);

        expect(
            getRankingPlaceByPlayerId('Aldo', RANKING_ARRAY1)
        ).toBe(2);

        expect(
            getRankingPlaceByPlayerId('David', RANKING_ARRAY1)
        ).toBe(14);

        expect(
            getRankingPlaceByPlayerId('Carlos Lopez', RANKING_ARRAY1)
        ).toBe(14);

        expect(
            getRankingPlaceByPlayerId('Player not yet in ranking', RANKING_ARRAY1)
        ).toBe(RANKING_ARRAY1.length + 1);
    });

    test('getNumberOfChallengesAllowed', () => {
        expect(
            getNumberOfChallengesAllowed(1)
        ).toBe(0);

        expect(
            getNumberOfChallengesAllowed(2)
        ).toBe(1);

        for (let place = 3; place <= 9; place++) {//3rd to 9th
            expect(
                getNumberOfChallengesAllowed(place)
            ).toBe(2);
        }

        expect(
            getNumberOfChallengesAllowed(10)
        ).toBe(3);

        expect(
            getNumberOfChallengesAllowed(11)
        ).toBe(4);

        for (let place = 12; place <= 50; place++) {//12th and beyond
            expect(
                getNumberOfChallengesAllowed(place)
            ).toBe(5);
        }
    })

    test('canPlayerAChallengePlayerB', () => {
        expect(
            canPlayerAChallengePlayerB('Aldo', 'Gustavo', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Non ranked', 'Another non ranked', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'Aldo', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Carlos Lopez', 'David', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Beto', 'Carlos Lopez', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'Carlos Lopez', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('KntrllMester', 'Xotl', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('michxrt', 'KntrllMester', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('FerSeñior', 'Non ranked player', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Pancho', 'Non ranked player', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Beto', 'Non ranked player', RANKING_ARRAY1)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Carlos Lopez', 'Samuel', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('David', 'Gustavo', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('KntrllMester', 'Angel_Lee', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('FerSeñior', 'Chino', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('medinilla', 'Chino', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('michxrt', 'Chino', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('FerSeñior', 'Niightz', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'Niightz', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'michxrt', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Non ranked player', 'David', RANKING_ARRAY1)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Non ranked player', 'FerSeñior', RANKING_ARRAY1)
        ).toBe(true);
    })

})