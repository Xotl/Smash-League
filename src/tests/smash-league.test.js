const SmashLeague = require('../smash-league')

const RankingArray = [
    ['Xotl'],
    ['Manco', 'Aldo'],
    ['Pancho']
]
describe('Smash League', ()=> {

    test('getRankingPlaceByPlayerId', () => {
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Xotl', RankingArray)
        ).toBe(1);
    
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Aldo', RankingArray)
        ).toBe(2);
    
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Pancho', RankingArray)
        ).toBe(3);
    
        expect(
            SmashLeague.getRankingPlaceByPlayerId('Player not yet in ranking', RankingArray)
        ).toBe(4);
    });
    
})