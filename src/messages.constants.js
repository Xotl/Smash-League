'use strict'
const { templateString:Tag } = require('./utils')
module.exports = {
    "lookup_challengers confidence_low" : [
        'Es como si quisieras preguntar a quien puedes retar, pero no estoy seguro. :thinking_face:',
    ],
    "lookup_challengers onbehalf_missing": [],
    "lookup_challengers no_coins": [],
    "lookup_challengers all": [],
    "lookup_challengers specific_missing_players": [],
    "lookup_challengers specific_no_players_found": [],
    "lookup_challengers specific_all_players_found": [],
    "lookup_challengers specific_some_players_found": [],
    "lookup_challengers not_implemented": [
        Tag `La función _${'type'}_ aún no está implementada. Dale calma.`,
        Tag `Estoy esperando tu PR para que _${'type'}_ si jale. :simple_smile:`,
        Tag `Aún no charcha la función _${'type'}_... No veo tu PR :unamused:`,
    ],
    "reported_result confidence_low": [
        'Es como si quisieras reportar un resultado, pero no estoy seguro. :thinking_face:',
    ],
    "reported_result not_implemented": [],
    "": [],
}