'use strict'
module.exports = {
    WIT_RESPONSE1: {
        "_text": "le gané a <@UDBD59WLT> 3 - 0",
        "entities": {
            "player": [
                {
                    "suggested": true,
                    "confidence": 0.9947211388674,
                    "value": "<@UDBD59WLT>",
                    "type": "value"
                }
            ],
            "score": [
                {
                    "confidence": 0.9960193796968,
                    "value": 3,
                    "type": "value"
                },
                {
                    "confidence": 0.98964198288954,
                    "value": 0,
                    "type": "value"
                }
            ],
            "match_result": [
                {
                    "confidence": 0.93206722450152,
                    "value": "win"
                }
            ],
            "reported_result": [
                {
                    "confidence": 0.98961739779145,
                    "value": "myself"
                }
            ]
        },
        "msg_id": "1emq382H0QqksZbJB"
    },
    WIT_RESPONSE2: {
        "_text": "<@UB616ENA0> 2 - 3 <@U6457D5KQ>",
        "entities": {
            "player": [
                {
                    "suggested": true,
                    "confidence": 0.99038589888413,
                    "value": "<@UB616ENA0>",
                    "type": "value"
                },
                {
                    "suggested": true,
                    "confidence": 0.95310457331374,
                    "value": "<@U6457D5KQ>",
                    "type": "value"
                }
            ],
            "score": [
                {
                    "confidence": 0.98622021352969,
                    "value": 2,
                    "type": "value"
                },
                {
                    "confidence": 0.98620547818029,
                    "value": -3,
                    "type": "value"
                }
            ],
            "reported_result": [
                {
                    "confidence": 0.98849031005298,
                    "value": "normal"
                }
            ]
        },
        "msg_id": "12UT9ThOTNIOmj3Dz"
    },
    WIT_RESPONSE3: {
        "_text": "El viento de las gardenias toca la puerta 3 veces",
        "entities": {},
        "msg_id": "52UT9ThOTNIOmj5Dd"
    },
    WIT_RESPONSE4: {
        "_text": "El viento de las gardenias toca la puerta 3 veces",
        "entities": {
            "reported_result": [
                {
                    "confidence": 0.58849031005298,
                    "value": "normal"
                }
            ]
        },
        "msg_id": "52UT9ThOTNIOmj5Dd"
    },
    SLACK_MESSAGES1: [
        {// Valid, spaces both sides of result
            "text": "<@UFY8P0WRF> le gané a <@UDBD59WLT> 3 - 0",
            "user": "U8A96RCEA",
            "ts": 2,
            "thread_ts": 2
        },
        {// invalidated by administrator
            "text": "<@UFY8P0WRF> le gané a <@UDBD59WLT> 3 - 0",
            "user": "U8A96RCEA",
            "ts": 2,
            "thread_ts": 2,
            "reactions": [
                { name: "no_entry", users: [ "admin_user1" ] }
            ],
        },
        {// Ignored, but not invalidated by admin
            "text": "<@UFY8P0WRF> El viento de las gardenias toca la puerta 3 veces",
            "user": "U6H8DDV25",
            "ts": 6,
            "thread_ts": 6,
            "reactions": [
                { name: "fast_parrot", users: [ "admin_user1" ] }
            ],
        },
        {// Valid spaces only on one side of result
            "text": "<@UFY8P0WRF> <@UB616ENA0> 2 - 3 <@U6457D5KQ>",
            "user": "UEWUZCYJF",
            "ts": 1,
            "thread_ts": 1,
            "reactions": [
                { name: "no_entry", users: [ "non_admin_user" ] }
            ],
        },
        {// Valid, spaces both sides of result
            "text": "<@UFY8P0WRF> le gané a <@UDBD59WLT> 3 - 0",
            "user": "U6H8DDV25",
            "ts": 10,
            "thread_ts": 10
        },
    ]
}