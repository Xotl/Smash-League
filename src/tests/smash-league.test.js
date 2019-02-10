const SmashLeague = require('../smash-league')

const RankingArray = [
    ['Xotl'],
    ['Manco', 'Aldo'],
    ['Pancho'],
    ['Angel_Lee'],
    ['lrgilberto'],// 5th
    ['KntrllMester'],
    ['Chino'],
    ['Niightz'],
    ['Samuel'],
    ['FerSeñior'],// 10th
    ['medinilla'],
    ['michxrt'],
    ['Gustavo'],
    ['Carlos Lopez', 'David', 'Beto']// 14th
]

const Scoreboard = {
    'Xotl': 6,
    'Manco': 6,
    'Aldo': 6,
    'Pancho': 6,
    'Angel_Lee': 6,
    'lrgilberto': 6,
    'KntrllMester': 6,
    'Chino': 6,
    'Niightz': 6,
    'Samuel': 6,
    'FerSeñior': 6,
    'medinilla': 6,
    'michxrt': 6,
}

// describe('Smash League Challenges & Scoreboard', ()=> {
    
//     test('getUpdatedChallengesAndScoreboard', () => {
//         expect(
//             SmashLeague.getUpdatedChallengesAndScoreboard('Xotl', RankingArray)
//         ).toBe(1);
//     })
// })


describe('Smash League Ranking', ()=> {

    test('getRankingPlaceByPlayerId', () => {
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Xotl', RankingArray)
        ).toBe(1);
    
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Aldo', RankingArray)
        ).toBe(2);
    
        expect(
            SmashLeague.getRankingPlaceByPlayerId('David', RankingArray)
        ).toBe(14);

        expect(
            SmashLeague.getRankingPlaceByPlayerId('Carlos Lopez', RankingArray)
        ).toBe(14);
    
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Player not yet in ranking', RankingArray)
        ).toBe(RankingArray.length + 1);
    });

    test('getNumberOfChallengesAllowed', () => {
        expect(
            SmashLeague.getNumberOfChallengesAllowed(1)
        ).toBe(0);

        expect(
            SmashLeague.getNumberOfChallengesAllowed(2)
        ).toBe(1);

        for (let place = 3; place <= 9; place++) {//3rd to 9th
            expect(
                SmashLeague.getNumberOfChallengesAllowed(place)
            ).toBe(2);
        }

        expect(
            SmashLeague.getNumberOfChallengesAllowed(10)
        ).toBe(3);

        expect(
            SmashLeague.getNumberOfChallengesAllowed(11)
        ).toBe(4);

        for (let place = 12; place <= 50; place++) {//12th and beyond
            expect(
                SmashLeague.getNumberOfChallengesAllowed(place)
            ).toBe(5);
        }
    })

    test('canPlayerAChallengePlayerB', () => {
        expect(
            SmashLeague.canPlayerAChallengePlayerB('Aldo', 'Gustavo', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Gustavo', 'Aldo', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Carlos Lopez', 'David', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Beto', 'Carlos Lopez', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Gustavo', 'Carlos Lopez', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('KntrllMester', 'Xotl', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('michxrt', 'KntrllMester', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('FerSeñior', 'Non ranked player', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Pancho', 'Non ranked player', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Beto', 'Non ranked player', RankingArray)
        ).toBe(false);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Carlos Lopez', 'Samuel', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('David', 'Gustavo', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('KntrllMester', 'Angel_Lee', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('FerSeñior', 'Chino', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('medinilla', 'Chino', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('michxrt', 'Chino', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('FerSeñior', 'Niightz', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Gustavo', 'Niightz', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Gustavo', 'michxrt', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Non ranked player', 'David', RankingArray)
        ).toBe(true);

        expect(
            SmashLeague.canPlayerAChallengePlayerB('Non ranked player', 'FerSeñior', RankingArray)
        ).toBe(true);
    })

})