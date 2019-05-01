# Smash League [![Travis Status](https://travis-ci.org/Xotl/Smash-League.svg?branch=master)](https://travis-ci.org/Xotl/Smash-League)

## Looking for the current ranking?
If your are looking for the current rank table and scoreboard [visit the `ranking-info` folder](./ranking-info/README.md) of this repo.

#### Table of contents
* [Ranking Rules](#ranking-rules)
    * [Rules](#rules)
    * [How many coins do i start with?](#How-many-coins-do-i-start-with)
    * [How many range do i start with?](#How-many-range-do-i-start-with)
    * [How many people can i challenge?](#How-many-people-can-i-challenge)
    * [Example of how the points are calculated & earned](#Example-of-how-the-points-are-calculated-&-earned)
* [How do i report a result?](#How-do-i-report-a-result)
* [Match Rules](#match-rules)
    * [Initial stages](#initial-stages)
    * [Counterpicks](#counterpicks)
    * [Current Smash ruleset](#Current-Smash-ruleset)
* [Want to contribute?](#Want-to-contribute)
    * [Running and debugging with VS Code](#Running-and-debugging-with-VS-Code)
    * [How to run the project locally using Docker](#How-to-run-the-project-locally-using-Docker)

Smash League is a bot used to handle the ranking of the Official Internal Smash League.

## Ranking Rules

This is a custom point-based ranking system. The more points you have, the best you are placed in the ranking.

To earn points, the players needs to challenge other players and win. If the challenger wins the match, he will keep their **coins** intact while losing will drain 1 coin from their **coins** pool. Also a challenger winning the match will increase his **range** by 1. If the challenged player is the winner, he will gain one **stand point**.

At the end of the week the bot will calculate the earned points using the next formula:
```
"Earned points" = "Range" - "Coins at the start of week" - "Coins left at the end of week" + "Stand Points"
```

Then the **earned points** will be added to your current points and the other values will be reseted.

### Rules to challenge
The rules to challenge or be challenged by someone are:
1. You may challenge any player that has a rank superior of yours up to the **range** you currently have. <sup>[(check the list below)](#How-many-people-can-i-challenge)</sup>
1. You cannot challenge people in the same place that you are.
1. People with 0 points can't be challenged.
1. Unranked people cannot be challenged.
1. In the case of a tie in rank, you may only challenge one player of said rank.
1. You cannot challenge a player you have defeated this week.
1. Also, the times You may be challenged is limitless.


To know if you can challenge someone, you have to follow this three questions:
- Is the person above you in the ranking?
- Do you have **coins** left?
- is your place in the ranking plus the **range** you currently have is lower or equals the player place you want to challenge?

If the answer is *yes* to the 3 questions, then you're good to challenge that player only if you haven't defeated that player this week.

For **example**: John Doe (rank 6) wants to challenge Rick (7), but Rick is a rank lower than him, so he may not challenge him. Then, he looks the ranking list, and saw that Mary (4) is two places above him. John still has 1 **coin** left and his **range** is 2, so the challenge is possible.

### How many coins do i start with?
The number of coins is calculated using your current place in the ranking and divided by 5, except for the first place which has 0 coins. Also only the integer part of the result is used.

### How many range do i start with?
The exact same as your coins, except for the first place which starts with 0.

### How many people can i challenge?
You can challenge as many people you want only if you still have **coins** and if there are still players you haven't defeated.

To see the rules during a match see [the Match Rules](#Match-Rules) section below.


### Example of how the points are calculated & earned

> Player _Mai Sakurajima_ (rank 8) started the week with 2 **coins**, 2 of **range** and 10 **points** on the 
> scoreboard. Then she won a match against _Chika Fujiwara_ (rank 7) so the **range** of _Mai_ incresaed 
> by 1 resulting in having now a **range** of 3. This means she now can challenge places _6_ & _5_ (She can no 
> longer challenge place 7 because she won already against that place).
> 
> Then she (_Mai Sakurajima_) challenges player _Nadeko_ (5) and loses, so she lost a **coin** and _Nadeko_ won 
> a **stand point**. The match between _Mai Sakurajima_ & _Nadeko_ was a close one, so _Mai Sakurajima_ tries 
> again betting her last coin in another match but unfortunately _Nadeko_ is too much for her to handle so she
> rans out of coins and therefore she can no longer challenge players in that week. In this case _Nadeko_ doesn't
> increases her **stand points** because players only can get 1 **stand point** per player, this is to avoid 
> farming players.
>
> During the same week player _Shinobu_ (rank 10) challenges _Mai Sakurajima_, the match was close but 
> _Mai Sakurajima_ stands in his place strongly not letting _Shinobu_ increase her **range** and earning 1
> **stand point** for winning.

Well it was a fun week, so let's calculate how many points _Mai Sakurajima_ earned this week. At the end of the week she ended up like this:

|                | Coins | Range | Stand Points | Points |
|----------------|-------|-------|--------------|--------|
| Mai Sakurajima |   0   |   3   |      1       |   10   |

So we can calculate the earned points using the formula above and replacing the values, like this: 
````
Earned Points = 3 - 2 - 0 + 1

Result: 2
````

Then we add the earned points to the points we have, in this case 10 **points**. So _Mai Sakurajima_ now will have a total of 12 points.

## How do i report a result?
Use the `@Smash League` bot that lives in the `mdc-smash` channel. Always tag it so he can listen to your message, **otherwise will ignore it**.

Tag the bot and then post the result in the next format: {playerA} {result A}-{result B} {playerB}

Examples of valid results expressions:
* `@Smash League` `@Xotl` 3-1 `@César`
* `@Smash League` ¡Toma Pancho! `@Ángel` 3-0 `@Pancho`
* `@Smash League` :snowman: `@Pancho` 2-3 `@José`, ése Pancho no trae nada

**NOTE: Any non valid result will be ignored by the bot**
You can check [the regexp used](src/smash-league.js#L7) for more details.


## Match Rules

The players must play a *1vs1* match to determine a winner. The winner is the first one to win 3 games.

Couching during an in progress game is not allowed. Please stick to the rules.

### Current Smash ruleset

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

#### Initial stages:

- Smashville
- Pokemon Stadium 2
- Lylat Cruise
- Battlefield (or any stage on Battlefield)
- Final Destination (or any omega)

#### Counterpicks:

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
* Add your Slack API token in a `.env` file. You can use [the `.env.TEMPLATE` file](/.env.TEMPLATE) as example.
* Press `F5` to run & debug the project in VS Code

*Note: Might not work on Windows*

### How to run the project locally using Docker
* Install Docker
* Add your Slack API token in a `.env` file. You can use [the `.env.TEMPLATE` file](/.env.TEMPLATE) as example.
* Run `docker build -t smash-league .`
* Run `docker run -it --rm -v ${PWD}/src:/usr/app/src -v ${PWD}/ranking-info:/usr/app/ranking-info -e SLACK_API_TOKEN="Your Slack API token here" smash-league npm run start:debug`
* You can run the test by running the `docker run -it --rm -v ${PWD}/src:/usr/app/src -v ${PWD}/ranking-info:/usr/app/ranking-info -e SLACK_API_TOKEN="Your Slack API token here" smash-league npm test` command

Note: We mount the `src` & `ranking-info` folders for development, so you can see your changes without building again the Docker image.

 