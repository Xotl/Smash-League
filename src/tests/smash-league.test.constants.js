'use strict'

module.exports = {
    RANKING_ARRAY1: [
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
    ],

    RANKING_ARRAY2: [
        [ "UDBD59WLT" ],
        [ "U61MBQTR8" ],
        [ "U8QS8T0CX" ],// 3rd
        [ "UBA5M220K", "U8THDCVJ7"  ],
        [ "UB616ENA0" ],// 5th
        [ "U87CK0E4A" ],
        [ "U6457D5KQ" ],
        [ "U8M6QT7EF" ],
        [ "U7VAPLNCR" ],
        [ "UAGR4S57G" ],// 10th
        [ "UBRCZ6G4B", "UBRMBGR6Z" ],
        [ "U8A96RCEA", "UE82A6MNY", "UEWUZCYJF", "U6H8DDV25", "U622XCTAA", "U8CEKPXQR", "UBHGVCY4X" ]// 12th
    ],
    
    SCOREBOARD1: {
        "U8A96RCEA": {
            "stand_points": 0,
            "points": 3,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "U61MBQTR8": {
            "stand_points": 2,
            "points": 44,
            "coins": 1,
            "range": 1,
            "completed_challenges": []
        },
        "U7VAPLNCR": {
            "stand_points": 0,
            "points": 31,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UBRMBGR6Z": {
            "stand_points": 0,
            "points": 29,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UB616ENA0": {
            "stand_points": 0,
            "points": 40,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UEWUZCYJF": {
            "stand_points": 0,
            "points": 18,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UDBD59WLT": {
            "stand_points": 0,
            "points": 42,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "U8M6QT7EF": {
            "stand_points": 0,
            "points": 33,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "U87CK0E4A": {
            "stand_points": 0,
            "points": 27,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "U8THDCVJ7": {
            "stand_points": 0,
            "points": 36,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "U6457D5KQ": {
            "stand_points": 0,
            "points": 37,
            "coins": 2,
            "range": 2,
            "completed_challenges": []
        },
        "UBA5M220K": {
            "stand_points": 0,
            "points": 37,
            "coins": 1,
            "range": 1,
            "completed_challenges": []
        },
        "UAGR4S57G": {
            "stand_points": 0,
            "points": 16,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UBRCZ6G4B": {
            "stand_points": 0,
            "points": 3,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UDR61HJCD": {
            "stand_points": 0,
            "points": 27,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "UBD38N45P": {
            "stand_points": 0,
            "points": 10,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        },
        "U6H8DDV25": {
            "stand_points": 0,
            "points": 9,
            "coins": 0,
            "range": 0,
            "completed_challenges": []
        }
    },

    ACTIVITIES1: [
        {// Valid index #0
            winner: 'U6457D5KQ',
            player1: 'U6457D5KQ', player2: 'U87CK0E4A', 
            player1Result: 3, player2Result: 2,
            players: ['U6457D5KQ', 'U87CK0E4A']
        },
        {// Invalid due to UDBD59WLT is unreachable for U6457D5KQ
            winner: 'UDBD59WLT',
            player1: 'U6457D5KQ', player2: 'UDBD59WLT', 
            player1Result: 0, player2Result: 3,
            players: ['U6457D5KQ', 'UDBD59WLT']
        },
        {// Valid index #2
            winner: 'UBA5M220K',
            player1: 'U6457D5KQ', player2: 'UBA5M220K', 
            player1Result: 0, player2Result: 3,
            players: ['U6457D5KQ', 'UBA5M220K']
        },
        {// Invalid because U6457D5KQ previuosly fought against U87CK0E4A and won
            winner: 'U6457D5KQ',
            player1: 'U6457D5KQ', player2: 'U87CK0E4A', 
            player1Result: 3, player2Result: 1,
            players: ['U6457D5KQ', 'U87CK0E4A']
        },
        {// Valid index #4
            winner: 'UBA5M220K',
            player1: 'U6457D5KQ', player2: 'UBA5M220K', 
            player1Result: 1, player2Result: 3,
            players: ['U6457D5KQ', 'UBA5M220K']
        },
        {// Valid index #5
            winner: 'UDBD59WLT',
            player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
            player1Result: 3, player2Result: 0,
            players: ['U61MBQTR8', 'UDBD59WLT']
        },
        {// Invalid because doesn't have coins left
            winner: 'U61MBQTR8',
            player1: 'UDBD59WLT', player2: 'U61MBQTR8', 
            player1Result: 2, player2Result: 3,
            players: ['U61MBQTR8', 'UDBD59WLT']
        }
    ],

    SLACK_MESSAGES1: [
        {// Valid, spaces both sides of result
            "text": "<@UFY8P0WRF> <@UDBD59WLT> 3 - 2 <@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 2
        },
        {// Valid spaces only on one side of result
            "text": "<@UFY8P0WRF> <@UDBD59WLT>1- 3 <@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 1
        },
        {// Valid spaces only on one second side of result
            "text": "<@UFY8P0WRF> <@UDBD59WLT> 1 -3<@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 10
        },
        {// Invalid first result
            "text": "<@UFY8P0WRF> <@UDBD59WLT> adasd - 3 <@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 7
        },
        {// Invalid second result
            "text": "<@UFY8P0WRF> <@UDBD59WLT> 2 - 12sdasd <@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 8
        },
        {// Invalid both results
            "text": "<@UFY8P0WRF> <@UDBD59WLT> 122adasd - tres <@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 9
        },
        {// Invalid, bot not tagged
            "text": "<@sasdasdas> <@UDBD59WLT> 3 - 2 <@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 5
        },
        {// Valid no spaces
            "text": "<@UFY8P0WRF><@UDBD59WLT>3-2<@U61MBQTR8>",
            "user": "UDBD59WLT",
            "ts": 6
        }
    ]
}