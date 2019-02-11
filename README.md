# Smash League ![Travis Status](https://travis-ci.org/Xotl/Smash-League.svg?branch=master)

## Looking for the current ranking?
If your are looking for the current rank table and scoreboard [visit the `ranking-info` folder](./ranking-info/) of this repo.

#### Table of contents
* [Ranking System Rules](#ranking-system-rules)
* [How do i challenge people or report a result?](#how-do-i-challenge-people-or-report-a-result)
    * [Challenge people](#challenge-people)
    * [Reporting a resutl after a match](#reporting-a-resutl-after-a-match)
* [Current Ruleset](#current-ruleset)
    * [Initial stages](#initial-stages)
    * [Counterpicks](#counterpicks)

## Ranking System Rules

This is a point-based ranking system. The more points you have, the best you are placed in the ranking.

To earn points, the players need to challenge the players to earn points in case of a victory. If the challenger wins the match, he will optain 3 points. If the challenged player is the winner, he will gain one single point.

You can have as many challenges as the following table shows:

- 1st place: 0 weekly challanges
- 2nd place: 1 weekly challange
- 3rd to 9th place: 2 weekly challanges
- 10th place: 3 weekly challanges
- 11th place: 4 weekly challanges
- 12th onwards: 5 weekly challanges

Also, the times you can be challenged is limitless.

## How do i challenge people or report a result?
Use the `@Smash League` bot that lives in the `mdc-smash` channel. Always tag it so he can listen to your message, **otherwise will ignore it**.

### Challenge people
Just tag the bot and then continue with the word `reto` and finish with the player or players that you want to challenge.

Examples of valid challenges expressions:
* `@Smash League` reto a `@Xotl` y a `@Aldo`
* `@Smash League` te reto `@Irving`
* `@Smash League` reto a `@Minion`
* `@Smash League` los reto `@Aldo`, `@Irving`, `@Minion`, `@Xotl`... ¿o les da frío?

**NOTE: Any non valid challenge will be ignored by the bot**

You can check [the regexp used](https://github.com/Xotl/Smash-League/blob/master/src/smash_league.js#L5) for more details.

### Reporting a resutl after a match
Tag the bot and then post the result in the next format: {playerA} {result A}-{result B} {playerB}

Examples of valid results expressions:
* `@Smash League` `@Xotl` 3-1 `@César`
* `@Smash League` ¡Toma Pancho! `@Ángel` 3-0 `@Pancho`
* `@Smash League` :snowman: `@Pancho` 2-3 `@José`, ése Pancho no trae nada

**NOTE: Any non valid result will be ignored by the bot**
You can check [the regexp used](https://github.com/Xotl/Smash-League/blob/master/src/smash_league.js#L6) for more details.


## Current Ruleset

Stocks: 3
Time limit: 8 min.
Hazards: off.
Miis: Any moveset.
Game one striking: (p1 - p2 - p2 - p1). In case both players don’t want to strike, the default starter stage will be Smashville.

If case of time out, the winner will be decided by the winner screen. In case of a tie, the winner will be the player with less damage at the end of the match. In case of a tie of damage or double KO, the players will play a one stock 3 minutes round on the same stage to decide the winner. In case of a player SD, the winner will be decided by the winner screen.
After each game, the winner bans 2 stages. Players may not counter pick to any stage they have won on during the set.
In case any player wants to switch characters between rounds, the winner player should change first. Once the loser player changes character the winner player cannot do it.

### Initial stages:

- Smashville
- Pokemon Stadium 2
- Lylat Cruise
- Battlefield (or any stage on Battlefield)
- Final Destination (or any omega)

### Counterpicks:

- Unova Pokemon League
- Town and City
- Kalos Pokemon League
- Castle Siege
- Yoshi’s Story
- Yoshi’s Island (Brawl)
- Delfino Plaza
- Warioware
- Halberd (Brawl)
- Skyloft