# Smash League [![Travis Status](https://travis-ci.org/Xotl/Smash-League.svg?branch=master)](https://travis-ci.org/Xotl/Smash-League)

## Looking for the current ranking?
If your are looking for the current rank table and scoreboard [visit the `ranking-info` folder](./ranking-info/) of this repo.

#### Table of contents
* [Ranking Rules](#ranking-rules)
    * [Rules](#rules)
    * [How many people can i challenge?](#How-many-people-can-i-challenge)
* [How do i challenge people or report a result?](#how-do-i-challenge-people-or-report-a-result)
    * [Challenge people](#challenge-people)
    * [Reporting a result after a match](#reporting-a-result-after-a-match)
* [Current Ruleset](#current-ruleset)
    * [Initial stages](#initial-stages)
    * [Counterpicks](#counterpicks)
* [Want to contribute?](#Want-to-contribute)
    * [Running and debugging with VS Code](#Running-and-debugging-with-VS-Code)
    * [How to run the project locally using Docker](#How-to-run-the-project-locally-using-Docker)

Smash League is a bot used to handle the ranking of the Official Internal Smash League.

## Ranking Rules

This is a point-based ranking system. The more points you have, the best you are placed in the ranking.

To earn points, the players need to challenge the players to earn points in case of a victory. If the challenger wins the match, he will optain 3 points. If the challenged player is the winner, he will gain one single point.


### Rules
The rules to challenge or be challenged by someone are:
1. You may challenge any player that has a rank superior of yours up to the number of challenges you have that week. [^(check the list below)^]((#How-many-people-can-i-challenge))
1. You cannot challenge people in the same place that you are.
1. People with 0 points can't be challenged.
1. Unranked people cannot be challenged.
1. In the case of a tie in rank, you may only challenge one player of said rank.
1. Also, the times You may be challenged is limitless.


To know if you can challenge someone, you have to follow this three questions:
- Is the person above you in the ranking?
- Do you have challenges left?
- is the difference of ranking places between you and the player you want to challenge no more than the maximum weekly challenges that you have?

If the answer is *yes* to the 3 questions, then you're good to challenge that player. 

For **example**: Jon Doe (rank 6) wants to challenge Rick (5), but Rick is a rank lower than him, so he may not challenge him. Then, he looks the ranking list, and saw that Mary (7) is one rank above him. So the challenge is possible.

### How many people can i challenge?
You can have as many challenges as the following table shows:

- 1st place: 0 weekly challanges
- 2nd place: 1 weekly challange
- 3rd to 9th place: 2 weekly challanges
- 10th place: 3 weekly challanges
- 11th place: 4 weekly challanges
- 12th onwards: 5 weekly challanges

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

You can check [the regexp used](src/smash-league.js#L5) for more details.

### Reporting a result after a match
Tag the bot and then post the result in the next format: {playerA} {result A}-{result B} {playerB}

Examples of valid results expressions:
* `@Smash League` `@Xotl` 3-1 `@César`
* `@Smash League` ¡Toma Pancho! `@Ángel` 3-0 `@Pancho`
* `@Smash League` :snowman: `@Pancho` 2-3 `@José`, ése Pancho no trae nada

**NOTE: Any non valid result will be ignored by the bot**
You can check [the regexp used](src/smash-league.js#L6) for more details.


## Current Ruleset

This is the recommended ruleset for the offcial league matches:

- Stocks: 3
- Time limit: 8 min.
- Hazards: off.
- Miis: Any moveset.
- Game one striking: (p1 - p2 - p2 - p1). In case both players don’t want to strike, the default starter stage will be **Smashville**.

If case of time out, the winner will be decided by the winner screen. In case of a tie, the winner will be the player with less damage at the end of the match. In case of a tie of damage or double KO, the players will play a one stock 3 minutes round on the same stage to decide the winner. In case of a player SD, the winner will be decided by the winner screen.

After each game, the winner bans 2 stages. Players may not counter pick to any stage they have won on during the set.
In case any player wants to switch characters between rounds, the winner player should change first. Once the loser player changes character the winner player cannot do it.

If both players agree, they can play on any stage without bans nor restrictions, but the players should pick only legal stages. If the players can't decide the stage to pick, then they should use the striking rules.

A player cannot deliberately persuade another player to play on a stage that the character or player has a clear advantage over the other player or character. If any witness of the match identifies this kind of behavior, the match will be declared invalid and the offender player will be punished by losing league points.

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


## Want to contribute?
If you want to contribute, you can rise issues or create your PR.

### Running and debugging with VS Code
* Install Docker
* Install Visual Studio Code
* Add your [Slack API token in `.vscode/launch.json`(./.vscode/launch.json#18) file
* Press `F5` to run & debug the project in VS Code

*Note: Might not work on Windows*

### How to run the project locally using Docker
* Install Docker
* Run `docker build -t smash-league .`
* Run `docker run -it --rm -v ${PWD}/src:/usr/app/src -v ${PWD}/ranking-info:/usr/app/ranking-info -e SLACK_API_TOKEN="Your Slack API token here" smash-league`
* You can run the test by running the `docker run -it --rm -v ${PWD}/src:/usr/app/src -v ${PWD}/ranking-info:/usr/app/ranking-info -e SLACK_API_TOKEN="Your Slack API token here" smash-league npm test` command

Note: We mount the `src` & `ranking-info` folders for development, so you can see your changes without building again the Docker image.

 