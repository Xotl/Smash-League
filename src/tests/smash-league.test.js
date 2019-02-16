const SmashLeagueTestConstants = require('./smash-league.test.constants')
const {
    applyScoreForChallengesNotCompleted, isItTimeToCommitInProgress, getRankingPlaceByPlayerId,
    getNumberOfChallengesAllowed, canPlayerAChallengePlayerB
} = require('../smash-league')

const RankingArray = SmashLeagueTestConstants.RankingArray
const Scoreboard = SmashLeagueTestConstants.Scoreboard


describe('Smash League Challenges & Scoreboard', () => {
    test('applyScoreForChallengesNotCompleted', () => {
        let newScoreboard
        
        newScoreboard = applyScoreForChallengesNotCompleted(Scoreboard, SmashLeagueTestConstants.activeChallenges1)
        expect(newScoreboard['UB616ENA0']).toBe(21)
        expect(newScoreboard['UEWUZCYJF']).toBe(3)
        expect(newScoreboard['Non-ranked-player']).toBe(3)
        expect(newScoreboard['U8THDCVJ7']).toBe(15)
        expect(newScoreboard['UBA5M220K']).toBe(16)
        expect(newScoreboard['UE82A6MNY']).toBe(0)
    })


    // test('getUpdatedChallengesAndScoreboard', () => {
    //     const newInprogressObj = getUpdatedChallengesAndScoreboard(
    //         SmashLeagueTestConstants.reportedResults1, 
    //         RankingArray, Scoreboard, 
    //         SmashLeagueTestConstants.completedChallenges1, 
    //         SmashLeagueTestConstants.activeChallenges1
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
            getRankingPlaceByPlayerId('Xotl', RankingArray)
        ).toBe(1);

        expect(
            getRankingPlaceByPlayerId('Aldo', RankingArray)
        ).toBe(2);

        expect(
            getRankingPlaceByPlayerId('David', RankingArray)
        ).toBe(14);

        expect(
            getRankingPlaceByPlayerId('Carlos Lopez', RankingArray)
        ).toBe(14);

        expect(
            getRankingPlaceByPlayerId('Player not yet in ranking', RankingArray)
        ).toBe(RankingArray.length + 1);
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
            canPlayerAChallengePlayerB('Aldo', 'Gustavo', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Non ranked', 'Another non ranked', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'Aldo', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Carlos Lopez', 'David', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Beto', 'Carlos Lopez', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'Carlos Lopez', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('KntrllMester', 'Xotl', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('michxrt', 'KntrllMester', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('FerSeñior', 'Non ranked player', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Pancho', 'Non ranked player', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Beto', 'Non ranked player', RankingArray)
        ).toBe(false);

        expect(
            canPlayerAChallengePlayerB('Carlos Lopez', 'Samuel', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('David', 'Gustavo', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('KntrllMester', 'Angel_Lee', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('FerSeñior', 'Chino', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('medinilla', 'Chino', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('michxrt', 'Chino', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('FerSeñior', 'Niightz', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'Niightz', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Gustavo', 'michxrt', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Non ranked player', 'David', RankingArray)
        ).toBe(true);

        expect(
            canPlayerAChallengePlayerB('Non ranked player', 'FerSeñior', RankingArray)
        ).toBe(true);
    })

})