'use strict'
module.exports = Tag => ({
    // ########## Lookup Challengers ################
    "lookup_challengers confidence_low" : [
        'Es como si quisieras preguntar a quien puedes retar, pero no estoy seguro. :thinking_face:',
        'Creo que quieres preguntar a quien puedes retar, pero no tengo idea. Sólo soy una máquina :robot_face:',
        '¿Quieres saber a quién puedes retar?, creo que no entiendo :robot_face:',
        'No entendí muy bien que querías decir, ahora procede a editar tu mensaje con la poca dignidad que te queda',
        'Creo que quieres saber a quién retar, pero que sea un bot no quiere decir que entienda cualquier cosa que escribas :disapproval:',
        'Tu léxico es tan bajo que ni un bot te puede entender :jenkins_triggered:',
    ],
    "lookup_challengers onbehalf_missing": [
        'Creo que preguntas por alguien más, pero no entiendo quién.',
        'Parece que quieres preguntar en lugar de otra persona, pero no entiendo bien a quién.',
        '¿Estás preguntando por alguien más?, no estoy seguro de entender. :thinking_face:',
        'Que te valga verga morro.',
        'Si vas a tirar una indirecta al menos dí a quién.',
    ],
    "lookup_challengers myself no_coins": [
        'Parece que ya no te quedan monedas, así que no puedes retar nadie. :disappointed:',
        'Veo que no te quedan monedas... ya no puedes retar nadie. :disappointed:',
        'Sin monedas no puedes retar a nadie, ni modo así son las reglas. :disappointed:',
        'No traes nada... de monedas :mepanchea:',
        'No te quedan monedas, mejor ponte a trabajar',
        'Tienes tantas monedas como Pancho dinero en su cuenta de banco... 0 :mepanchea:',
        'Ya jugaste demasiado esta semana, no tienes llenadera :disapproval:',
        'Ya no tienes monedas, no te cansas de perder, ¿verdad?',
        'Hasta pareciera que te pagan por jugar, ya no puedes retar esta semana.',
        'A Nadie',
        'Tienes tantas monedas como nivel en Smash... 0 :squidbaging: ',
        'No tienes monedas, pero siempre se pueden armar las amistosas :eyes:',
        'Ya te quedaste sin monedas, no estes de insolente :face_with_rolling_eyes:',
        'Que triste que tengas tantas ganas de jugar pero ya no puedas',
    ],
    "lookup_challengers onbehalf no_coins": [
        Tag `Parece que a ${'user'} no le quedan monedas, así que no puede retar nadie. :disappointed:`,
        Tag `Veo que a ${'user'} no le quedan monedas... ya no puede retar nadie. :disappointed:Tag `,
        Tag `Sin monedas ${'user'} no puede retar a nadie, ni modo así son las reglas. :disappointed:`,
        Tag `*Que te valga verga morrro, tu no traes nada*, ${'user'} no tiene monedas... :mepanchea:`,
        Tag `Se acabaron los puntos gratis que daba ${'user'}, mejor suerte la proxima semana`,
        Tag `A ${'user'} ya le dieron su arrastrada semanal, vuelva prontos`,
        Tag `${'user'} ya no tiene monedas, por lo tanto no puede jugar`,
    ],
    "lookup_challengers myself_all": [
        Tag `Estos son los jugadores que puedes retar:\n\n${'listOfValidPlayers'}.`,
        Tag `Revisando la tabla, veo que estos son los que puedes retar:\n\n${'listOfValidPlayers'}.`,
        Tag `${'listOfValidPlayers'}\n\nLa lista de arriba muestra a quiénes puedes retar.`,
        Tag `Ni les vas a ganar, pero a los jugadores que puedes retar son:\n\n${'listOfValidPlayers'}.`,
        Tag `Te picho una coca si le ganas a todos:\n\n${'listOfValidPlayers'}.`,
        Tag `A la orden jefe, servido:\n\n${'listOfValidPlayers'}.`,
        Tag `Usted pide, el bot provee:\n\n${'listOfValidPlayers'}.`,
        Tag `La lista de las personas a las que les puedes regalar puntos es la siguiente:\n\n${'listOfValidPlayers'}.`,
        Tag `Here's your road to :crown: :\n\n${'listOfValidPlayers'}.`,
        Tag `Sakurai confía en tí, no lo descepciones:\n\n${'listOfValidPlayers'}.`,
        Tag `Gánales, hazlo por Sakurai:\n\n${'listOfValidPlayers'}.`,
        Tag `¿Cuanto a que no le ganas a ninguno? :eyes: :\n\n${'listOfValidPlayers'}\n\nQue se hagan las apuestas. :flyingmoneyparrot:`,
        Tag `Que se arme el *Money Match*:\n\n${'listOfValidPlayers'}\n\n¿O te va a dar frío? :animated_snowman:`,
        Tag `${'listOfValidPlayers'}\n\nNo confies en tí, confia en el bot, que confia en tí.`,
        Tag `Here comes a new challenger!:\n\n${'listOfValidPlayers'}`,
    ],
    "lookup_challengers onbehalf_all": [
        Tag `Estos son los jugadores que ${'user'} puede retar:\n\n${'listOfValidPlayers'}.`,
        Tag `Revisando la tabla, veo que estos son los que puede retar ${'user'}:\n\n${'listOfValidPlayers'}.`,
        Tag `${'listOfValidPlayers'}\n\nLa lista de arriba muestra a quiénes puede retar ${'user'}.`,
        Tag `*A ti que te valga verga morro*. ${'user'} puede retar a quien se le antoje de estos: \n\n${'listOfValidPlayers'}.`,
        Tag `¿Es esa una indirecta? :eyes:`,
        Tag `Si quieres que te rete, dile, no andes con indirectas :face_with_rolling_eyes:`,
        Tag `${'user'} puede retar al que se le de su regalada gana de estos:\n\n${'listOfValidPlayers'}.`,
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
        Tag `No jala _${'type'}_... Y no te veo haciendo el PR :unamused:`,
        Tag `Si asi como piden colaboraran, este bot estaría completo :sadparrot_hd:`,
    ],
    "lookup_challengers select_one": [
        Tag `sólo uno de los ${'num'}, tendrás que elegir a quién`,
        Tag `deberás elegir sólo uno de los ${'num'}`,
        Tag `sólo a uno le puedes partir la madre, elige uno de los ${'num'}`
    ],


    // ########## Reported Results ################
    "reported_result valid": [
        Tag `Enterado... ${'winner'} le ganó a ${'loser'} ${'highScore'} - ${'lowScore'}.`,
        Tag `Órale, así que ${'loser'} perdió ${'highScore'} - ${'lowScore'} contra ${'winner'}... ¿quién lo habría imaginado?.`,
        Tag `¿${'highScore'} - ${'lowScore'} contra ${'loser'}?. Ése ${'winner'} va subiendo como la espuma.`,
        Tag `:musical_note: Nada... ese ${'loser'} no trae nada... :musical_note: ¡Buen trabajo, ${'winner'}, por ganar ${'highScore'} - ${'lowScore'}!`,
        Tag `¿Para eso juegas ${'loser'}? ¿Para perder ${'highScore'} - ${'lowScore'}? Ya mejor ponte a trabajar. Sigue así ${'winner'}, eres un campeón.`,
        Tag `¿${'loser'} perdió ${'highScore'} - ${'lowScore'} contra ${'winner'}? Este resultado pone triste a Sakurai.`,
        Tag `${'winner'} ${'highScore'} - ${'lowScore'} ${'loser'}, ¡que buena partida!`,
        Tag `¡Por poco ${'loser'}!, pero ese ${'winner'} no se deja!.\nQueda registrado el ${'highScore'} - ${'lowScore'}`,
        Tag `Un ${'highScore'} - ${'lowScore'} digno de final de torneo!\nCuidado ${'winner'}, ¡que la proxima ${'loser'} no te la va a perdonar!`,
        Tag `En un mundo paralelo ${'loser'} le ganó a ${'winner'} ${'highScore'} - ${'lowScore'}, pero ese no es este universo :trollface:`,
    ],
    "reported_result valid_obliterated": [
        Tag `Changos, ${'highScore'} - ${'lowScore'}... Que putiza te puso ${'winner'}, ¿eh, ${'loser'}?`,
        Tag `Eres un maldito perdedor ${'loser'}, mejor retirate del Smash. Felicidades por tú ${'highScore'} - ${'lowScore'}, ${'winner'}, sigue así.`,
        Tag `*Que putiza* ${'loser'}!, si Iwata estuviera vivo se moriria al ver el ${'highScore'} - ${'lowScore'} que te plantó el ${'winner'}.`,
        Tag `Hasta a mi me dolio el ${'highScore'} - ${'lowScore'} que te puso el ${'winner'}, ${'loser'} ¡y eso que soy un bot y no estoy programado para sentir dolor!.`,
        Tag `Puedo apostar a que ese ${'highScore'} - ${'lowScore'} te dolió hasta el alma ${'loser'}. Bien hecho ${'winner'}.`,
        Tag `Hasta acá se sintió el triggereo de ${'loser'} despues de su ${'highScore'} - ${'lowScore'}. Eres mi ídolo ${'winner'}.`,
        Tag `${'loser'}, permíteme pulsar F en el teclado más pequeño del mundo. :F:`,
        Tag `${'winner'} felicidades por el ${'highScore'} - ${'lowScore'}, a el otro pobre diablo no vale la pena ni mencionarlo.`,
        Tag `*O B L I T E R A T E D ! ! !* :splatted:, tú muy bien ${'winner'}.`,
        Tag `Si esto no es una putiza, entonces no sé que es :squidbaging:, ${'loser'} por favor levelea.`,
    ],
    "reported_result confidence_low": [
        'Es como si quisieras reportar un resultado, pero no estoy seguro. :thinking_face:',
        'Creo que quieres reportar un resultado, pero no tengo idea. Sólo soy una máquina :robot_face:',
        '¿Quieres reportar un resultado?, creo que no entiendo :robot_face:',
    ],
    "reported_result missing_score": [
        ({bothScoresMissing}) => `Falta el puntaje de ${bothScoresMissing ? 'ambos jugadores' : 'uno de los jugadores'}`,
        ({bothScoresMissing}) => `Creo que no reportaste el puntaje para ${bothScoresMissing ? 'ambos jugadores' : 'uno de los jugadores'}`,
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
        Tag `Si hubieras colaborado, en esta nueva versión (*v${'newVersion'}*) podrían estar tus cambios. :fb_sad: `,
        Tag `¡Nuevo Update *v${'newVersion'}*! espero no pasar de 100 en algun digito de la versión. :sweat_smile:`,
    ],
    "new_version no_activity": [
        "Aprovechando el update revisé y no encontré actividad nueva. :disappointed:",
        "De una vez con la actualización le di una revisada al Slack pero no encontré actividad nueva. :disappointed:",
        "Ahora que me actualicé le di una checada y no encontré actividad desde la última vez que revisé. :disappointed:",
        "El bot está en constante actividad, a diferencia de su liga mugrosa. :disapproval:",
    ],
    "new_version with_activity": [
        "Aprovechando el update actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>.",
        "De una vez con la actualización le di una revisada al Slack y actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>.",
        "Actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard> aprovechando que me actualicé.",
    ],


    // ########## Daily Update ################
    "daily_update no_activity": [
        "Parece que no hubo actividad desde la ùltima vez que revisé, ¿será que son vacaciones o fin de semana?. :thinking_face:",
        "¿No juegan y asi quieren levelear? :unamused:",
        "Este día estuvo tan muerto como la franquicia de Mother. :skull: ",
        "Este día estuvo tan muerto como la franquicia de F-Zero. :skull: ",
        "Este día estuvo tan muerto como las ganas de vivir de Manco. :skull: ",
    ],
    "daily_update with_activity": [
        "Aquí reportando que ya actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>.",
        "<https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|El scoreboard> ha sido actualizado. :simple_smile:",
        "He actualizado <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>. :blush:",
        "He aqui su dosis diaria de <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el updates>.",
        "Actualicé <https://github.com/Xotl/Smash-League/blob/master/ranking-info/README.md|el scoreboard>, por favor, no empiecen de Insolentes :sweat_smile: ",
    ],
    "daily_update week_commited": [
        "¡Ha iniciando un nuevo ranking esta semana!, ya <https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|pueden revisar> en qué lugar quedaron.",
        "¡Nueva semana! <https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|pueden revisar> en qué lugar quedaron.",
        "<https://github.com/Xotl/Smash-League/tree/master/ranking-info/README.md|Pueden revisar> en qué lugar quedaron. ¡Ha iniciado otra semana de la liga!.",
    ],
    "daily_update week_commited_new_champion": [
        ({ newChampionName }) => `Contra todo pronostico, ¡${newChampionName} se corona como el nuevo campeón de la liga! :crown:`,
        ({ newChampionName }) => `¿Pero qué demonios esta pasando? ¿${newChampionName} quedando primero? ¿Qué sigue? ¿Tiburosos voladores de papantla? :bearboss:`,
        ({ newChampionName }) => `Y como nuevo campeón de la liga ha quedado ${newChampionName}, nada fuera de lo esperado... ¿Verdad? ¡¿Verdad?! :sweat_smile:`
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
        Tag `Me gustaría existir en un universo paralelo donde sí pueda entender <${'msgUrl'}|tu mensaje>.<@${'user'}>. :robot_face:`,
        Tag `Si tan solo escribieras bien <${'msgUrl'}|tu mensaje> <@${'user'}>. :sadparrot_hd:`,
    ],
    "grateful": [
        Tag `De nada. :wink:`,
        Tag `Pa' servirle.`,
        Tag `Se hace lo que se puede. :wink:`,
        Tag `Es un placer servirle, patrón.`,
        Tag `Gracias a ti. :fast_parrot:`,
    ],
})
