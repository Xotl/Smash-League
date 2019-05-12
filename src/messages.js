'use strict'
module.exports = Tag => ({
    // ########## Lookup Challengers ################
    "lookup_challengers confidence_low" : [
        'Es como si quisieras preguntar a quien puedes retar, pero no estoy seguro. :thinking_face:',
    ],
    "lookup_challengers onbehalf_missing": [
        'Creo que preguntas por alguien más, pero no entiendo quién.'
    ],
    "lookup_challengers no_coins": [
        'Parece que ya no te quedan monedas, así que no puedes retar nadie. :disappointed:',
        'Veo que no te quedan monedas... ya no puedes retar nadie. :disappointed:',
        'Sin monedas no puedes retar a nadie, ni modo así son las reglas. :disappointed:',
    ],
    "lookup_challengers all": [
        Tag `Estos son los jugadores que puedes retar:\n\n${'listOfValidPlayers'}`
    ],
    "lookup_challengers specific_missing_players": [
        'Parece que quieres preguntar si puedes retar a alguien en particular, pero no estoy seguro de a quién. :thinking_face:'
    ],
    "lookup_challengers specific_cannot_challenge": [
        ({mentionedPlayersQty}) => `No puedes retar a ${mentionedPlayersQty > 0 ? `ninguno de los ${mentionedPlayersQty} que mencionaste` : 'ese jugador' }.`
    ],
    "lookup_challengers specific_all_players_found": [
        ({mentionedPlayersQty}) => `Claro que puedes retar a ${mentionedPlayersQty > 0 ? `los ${mentionedPlayersQty} que mencionaste` : 'ese jugador' }.`
    ],
    "lookup_challengers specific_some_players_found": [
        Tag `Si puedes, pero nada más a ${'listOfValidPlayers'}.`
    ],
    "lookup_challengers not_implemented": [
        Tag `La función _${'type'}_ aún no está implementada. Dale calma.`,
        Tag `Estoy esperando tu PR para que _${'type'}_ si jale. :simple_smile:`,
        Tag `Aún no charcha la función _${'type'}_... No veo tu PR :unamused:`,
    ],
    "lookup_challengers select_one": [
        Tag `sólo uno de los ${'num'}, tendrás que elegir a quién`
    ],


    // ########## Reported Results ################
    "reported_result valid": [
        Tag `Enterado... <@${'winner'}> le ganó a <@${'loser'}> ${'highScore'} - ${'lowScore'}.`,
        Tag `Órale, así que <@${'loser'}> perdió ${'highScore'} - ${'lowScore'} contra <@${'winner'}>... ¿quién lo habría imaginado?.`,
        Tag `¿${'highScore'} - ${'lowScore'} contra <@${'loser'}>?. Ése <@${'winner'}> va subiendo como la espuma.`
    ],
    "reported_result confidence_low": [
        'Es como si quisieras reportar un resultado, pero no estoy seguro. :thinking_face:',
    ],
    "reported_result missing_score": [
        ({bothScoresMissing}) => `Falta el puntaje de ${bothScoresMissing ? 'ambos jugadores' : 'uno de los jugadores'}`
    ],
    "reported_result myself_missing_player": [
        ({match_result}) => `Indicaste que ${match_result === 'win' ? 'ganaste': 'perdiste'} aunque no dijiste contra quién`
    ],
    "reported_result normal_missing_player": [
        ({bothPlayersMissing}) => `Te faltó indicar ${bothPlayersMissing ? 'los jugadores involucrados' : 'quién es el otro jugador'}`
    ],
    "reported_result not_implemented": [],


    // ########## New Version ################
    "new_version": [
        Tag `¡He sido actualizado a la versiòn *v${'newVersion'}*!... espero que sean nuevos features y no sólo bugs. :unamused:`
    ],
    "new_version no_activity": [
        "Aprovechando el update revisé y no encontré actividad nueva. :disappointed:"
    ],
    "new_version with_activity": [
        "Aprovechando el update actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>."
    ],


    // ########## Daily Update ################
    "daily_update no_activity": [
        "Parece que no hubo actividad desde la ùltima vez que revisé, ¿será que son vacaciones o fin de semana?. :thinking_face:"
    ],
    "daily_update with_activity": [
        "Aquí reportando que ya actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>."
    ],
    "daily_update week_commited": [
        "¡Ha iniciando un nuevo ranking esta semana!, ya <https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|pueden revisar> en qué lugar quedaron."
    ],
    "daily_update ignored_activities": [
        ({numIgnoredActivities, ignoredMessages}) => "Además, parece que aún hay gente que no conoce las reglas, ya que tuve que ignorar " + 
            numIgnoredActivities + (numIgnoredActivities > 1 ? " mensajes" : " mensaje")  + " en donde me taggearon. :unamused:" + 
            "\nEstos fueron los motivos:" +  "\n```\n" + ignoredMessages + "\n```" +  
            "\nLéanse <https://github.com/Xotl/Smash-League#ranking-rules|las reglas> por favor."
    ],


    // ########## Other ################
    "no_interpretation": [
        Tag `¿Qué onda con <${'msgUrl'}|tu mensaje> <@${'user'}>?. No entendí qué querías, sólo soy una máquina. :robot_face:`
    ],
})