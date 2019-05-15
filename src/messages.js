'use strict'
module.exports = Tag => ({
    // ########## Lookup Challengers ################
    "lookup_challengers confidence_low" : [
        'Es como si quisieras preguntar a quien puedes retar, pero no estoy seguro. :thinking_face:',
        'Creo que quieres preguntar a quien puedes retar, pero no tengo idea. Sólo soy una máquina :robot_face:',
        '¿Quieres saber a quién puedes retar?, creo que no entiendo :robot_face:',
    ],
    "lookup_challengers onbehalf_missing": [
        'Creo que preguntas por alguien más, pero no entiendo quién.',
        'Parece que quieres preguntar en lugar de otra persona, pero no entiendo bien a quién.',
        '¿Estás preguntando por alguien más?, no estoy seguro de entender. :thinking_face:',
    ],
    "lookup_challengers myself no_coins": [
        'Parece que ya no te quedan monedas, así que no puedes retar nadie. :disappointed:',
        'Veo que no te quedan monedas... ya no puedes retar nadie. :disappointed:',
        'Sin monedas no puedes retar a nadie, ni modo así son las reglas. :disappointed:',
    ],
    "lookup_challengers onbehalf no_coins": [
        Tag `Parece que a ${'user'} no le quedan monedas, así que no puede retar nadie. :disappointed:`,
        Tag `Veo que a ${'user'} no le quedan monedas... ya no puede retar nadie. :disappointed:Tag `,
        Tag `Sin monedas ${'user'} no puede retar a nadie, ni modo así son las reglas. :disappointed:`,
    ],
    "lookup_challengers myself_all": [
        Tag `Estos son los jugadores que puedes retar:\n\n${'listOfValidPlayers'}.`,
        Tag `Revisando la tabla, veo que estos son los que puedes retar:\n\n${'listOfValidPlayers'}.`,
        Tag `${'listOfValidPlayers'}\n\nLa lista de arriba muestra a quiénes puedes retar.`,
    ],
    "lookup_challengers onbehalf_all": [
        Tag `Estos son los jugadores que ${'user'} puede retar:\n\n${'listOfValidPlayers'}.`,
        Tag `Revisando la tabla, veo que estos son los que puede retar ${'user'}:\n\n${'listOfValidPlayers'}.`,
        Tag `${'listOfValidPlayers'}\n\nLa lista de arriba muestra a quiénes puede retar ${'user'}.`,
    ],
    "lookup_challengers myself_specific missing_players": [
        'Parece que quieres preguntar si puedes retar a alguien en particular, pero no estoy seguro de a quién. :thinking_face:',
        '¿Quieres saber si puedes retar a alguien en particular?, no te entendí bien. Se más claro. :thinking_face:',
        '¿Será que quieres saber si puedes retar a alguien?, yo no lo sé. :thinking_face:',
    ],
    "lookup_challengers onbehalf_specific missing_players": [
        Tag `Parece que quieres preguntar si ${'user'} puede retar a alguien en particular, pero no estoy seguro de a quién. :thinking_face:`,
        Tag `¿Quieres saber si ${'user'} puede retar a alguien en particular?, no te entendí bien. Se más claro. :thinking_face:`,
        Tag `¿Será que quieres saber si ${'user'} puede retar a alguien?, yo no lo sé. :thinking_face:`,
    ],
    "lookup_challengers myself_specific cannot_challenge": [
        ({mentionedPlayersQty}) => `No puedes retar a ${mentionedPlayersQty > 1 ? `ninguno de los ${mentionedPlayersQty} que mencionaste` : 'ese jugador' }.`,
        ({mentionedPlayersQty}) => `${mentionedPlayersQty > 1 ? `De todos los jugadores que mencionas, no puedes retar a ninguno` : 'A ese jugador no lo puedes retar' }.`,
        ({mentionedPlayersQty, mentionedPlayers}) => `${mentionedPlayersQty > 1 ? `Veamos, creo que no puedes retar a ${mentionedPlayers.join(', ni a ')}` : 'Nope, a ése jugador no lo puedes retar' }.`,
    ],
    "lookup_challengers onbehalf_specific cannot_challenge": [
        ({mentionedPlayersQty, user}) => `${user} No puede retar a ${mentionedPlayersQty > 1 ? `ninguno de los ${mentionedPlayersQty} que mencionaste` : 'ese jugador' }.`,
        ({mentionedPlayersQty, user}) => `${mentionedPlayersQty > 1 ? `De todos los jugadores que mencionas, ${user} no puedes retar a ninguno` : `A ese jugador no lo puede retar ${user}` }.`,
        ({mentionedPlayersQty, mentionedPlayers, user}) => `${mentionedPlayersQty > 1 ? `Veamos, creo que ${user} no puede retar a ${mentionedPlayers.join(', ni a ')}` : `Nope, a ése jugador no lo puede retar ${user}` }.`,
    ],
    "lookup_challengers myself_specific all_players_found": [
        ({mentionedPlayersQty}) => `Claro que puedes retar a ${mentionedPlayersQty > 1 ? `los ${mentionedPlayersQty} que mencionaste` : 'ese jugador' }.`,
        ({mentionedPlayersQty}) => `${mentionedPlayersQty > 1 ? `A todos esos que mencionaste los puedes retar` : 'Si puedes, ¡Ahora ve gánale!. :simple_smile:' }.`,
        ({mentionedPlayers}) => `Déjame ver... parece que sí puedes jugar contra los de esta lista:\n\n${mentionedPlayers.map(p => `- ${p}\n`)}\n¡Suerte! :simple_smile:`,
    ],
    "lookup_challengers onbehalf_specific all_players_found": [
        ({mentionedPlayersQty, user}) => `Claro que ${user} puede retar a ${mentionedPlayersQty > 1 ? `los ${mentionedPlayersQty} que mencionaste` : 'ese jugador' }.`,
        ({mentionedPlayersQty, user}) => `${mentionedPlayersQty > 1 ? `A todos esos que mencionaste los puede retar ${user}` : `Sí puede, ahora sólo falta que ${user} le gane. :simple_smile:` }.`,
        ({mentionedPlayers, user}) => `Déjame ver... parece que sí ${user} puede jugar contra los de esta lista:\n\n${mentionedPlayers.map(p => `- ${p}\n`)}\n¡Suerte! :simple_smile:`,
    ],
    "lookup_challengers myself_specific some_players_found": [
        Tag `Si puedes, pero nada más a ${'listOfValidPlayers'}.`
    ],
    "lookup_challengers onbehalf_specific some_players_found": [
        Tag `${'user'} sí puede, pero nada más a ${'listOfValidPlayers'}.`
    ],
    "lookup_challengers not_implemented": [
        Tag `La función _${'type'}_ aún no está implementada. Dale calma.`,
        Tag `Estoy esperando tu PR para que _${'type'}_ si jale. :simple_smile:`,
        Tag `Aún no charcha la función _${'type'}_... No veo tu PR :unamused:`,
    ],
    "lookup_challengers select_one": [
        Tag `sólo uno de los ${'num'}, tendrás que elegir a quién`,
        Tag `deberás elegir sólo uno de los ${'num'}`,
        Tag `sólo a uno le puedes partir la madre, elige uno de los ${'num'}`
    ],


    // ########## Reported Results ################
    "reported_result valid": [
        Tag `Enterado... <@${'winner'}> le ganó a <@${'loser'}> ${'highScore'} - ${'lowScore'}.`,
        Tag `Órale, así que <@${'loser'}> perdió ${'highScore'} - ${'lowScore'} contra <@${'winner'}>... ¿quién lo habría imaginado?.`,
        Tag `¿${'highScore'} - ${'lowScore'} contra <@${'loser'}>?. Ése <@${'winner'}> va subiendo como la espuma.`,
        Tag `:musical_note: Nada... ese <@${'loser'}> no trae nada... :musical_note: ¡Buen trabajo, <@${'winner'}>, por ganar ${'highScore'} - ${'lowScore'}!`,
        Tag `Changos, ${'highScore'} - ${'lowScore'}... Que putiza te puso <@${'winner'}>, ¿eh, <@${'loser'}>?`,
        Tag `Eres un maldito perdedor <@${'loser'}>, mejor retirate del Smash. Felicidades por tú ${'highScore'} - ${'lowScore'}, <@${'winner'}>, sigue así.`,
        Tag `¿Para eso juegas <@${'loser'}>? ¿Para perder ${'highScore'} - ${'lowScore'}? Ya mejor ponte a trabajar. Sigue así <@${'winner'}>, eres un campeón.`
    ],
    "reported_result confidence_low": [
        'Es como si quisieras reportar un resultado, pero no estoy seguro. :thinking_face:',
        'Creo que quieres reportar un resultado, pero no tengo idea. Sólo soy una máquina :robot_face:',
        '¿Quieres reportar un resultado?, creo que no entiendo :robot_face:',
    ],
    "reported_result missing_score": [
        ({bothScoresMissing}) => `Falta el puntaje de ${bothScoresMissing ? 'ambos jugadores' : 'uno de los jugadores'}`,
        ({bothScoresMissing}) => `Creo que no reportaste el puntaje para ${bothScoresMissing ? 'ambos jugadores' : 'uno de los jugadores'}`
    ],
    "reported_result myself_missing_player": [
        ({match_result}) => `Indicaste que ${match_result === 'win' ? 'ganaste': 'perdiste'} aunque no dijiste contra quién`
    ],
    "reported_result normal_missing_player": [
        ({bothPlayersMissing}) => `Te faltó indicar ${bothPlayersMissing ? 'los jugadores involucrados' : 'quién es el otro jugador'}`
    ],
    "reported_result not_implemented": [
        Tag `La función _${'type'}_ para reportar resultados aún no se ha implementado. Puedes hacer tu PR. :blush:`
    ],


    // ########## New Version ################
    "new_version": [
        Tag `¡He sido actualizado a la versiòn *v${'newVersion'}*!... espero que sean nuevos features y no sólo bugs. :unamused:`,
        Tag `¡Nuevo Update! ahora a la versión *v${'newVersion'}*.`,
        Tag `¡Ahora estoy en la versión *v${'newVersion'}*! Esperemos sean buenas noticias. :sweat_smile:`,
    ],
    "new_version no_activity": [
        "Aprovechando el update revisé y no encontré actividad nueva. :disappointed:",
        "De una vez con la actualización le di una revisada al Slack pero no encontré actividad nueva. :disappointed:",
        "Ahora que me actualicé le di una checada y no encontré actividad desde la última vez que revisé. :disappointed:",
    ],
    "new_version with_activity": [
        "Aprovechando el update actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>.",
        "De una vez con la actualización le di una revisada al Slack y actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>.",
        "Actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard> aprovechando que me actualicé.",
    ],


    // ########## Daily Update ################
    "daily_update no_activity": [
        "Parece que no hubo actividad desde la ùltima vez que revisé, ¿será que son vacaciones o fin de semana?. :thinking_face:",
    ],
    "daily_update with_activity": [
        "Aquí reportando que ya actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>.",
        "<https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|El scoreboard> ha sido actualizado. :simple_smile:",
        "He actualizado <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>. :blush:",
    ],
    "daily_update week_commited": [
        "¡Ha iniciando un nuevo ranking esta semana!, ya <https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|pueden revisar> en qué lugar quedaron.",
        "¡Nueva semana! <https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|pueden revisar> en qué lugar quedaron.",
        "<https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|Pueden revisar> en qué lugar quedaron. ¡Ha iniciado otra semans de la liga!.",
    ],
    "daily_update ignored_activities": [
        ({numIgnoredActivities, ignoredMessages}) => "Además, parece que aún hay gente que no conoce las reglas, ya que tuve que ignorar " + 
            numIgnoredActivities + (numIgnoredActivities > 1 ? " mensajes" : " mensaje")  + " en donde me taggearon. :unamused:" + 
            "\nEstos fueron los motivos:" +  "\n```\n" + ignoredMessages + "\n```" +  
            "\nLéanse <https://github.com/Xotl/Smash-League#ranking-rules|las reglas> por favor."
    ],


    // ########## Other ################
    "no_interpretation": [
        Tag `¿Qué onda con <${'msgUrl'}|tu mensaje> <@${'user'}>?. No entendí qué querías, sólo soy una máquina. :robot_face:`,
        Tag `<${'msgUrl'}|¿Qué?...>. No entendí qué quieres <@${'user'}>. :robot_face:`,
        Tag `¿Podrías se más claro en <${'msgUrl'}|tu mensaje>?. Ni idea qué quieres <@${'user'}>. :robot_face:`,
    ],
    "grateful": [
        Tag `De nada. :wink:`,
        Tag `Pa' servirle.`,
        Tag `Se hace lo que se puede. :wink:`,
        Tag `Es un placer servirle, patrón.`,
        Tag `Gracias a ti. :fast_parrot:`,
    ],
})