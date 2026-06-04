// ═══════════════════════════════════════════════════════
// PANCHO & MELI — CATÁLOGO DE JUEGOS Y MÓDULO DE IDIOMAS
// Todo lo que Pancho y Meli saben jugar y enseñar.
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
// 1. CATÁLOGO DE JUEGOS QUE PANCHO/MELI PROPONEN
//    Cada uno tiene: id, nombre, emoji, categoría, beneficio
//    cognitivo, y el gancho con que lo ofrecen.
// ─────────────────────────────────────────────────────────

export const GAME_CATALOG = [
  // ── Memoria y lenguaje ──
  {
    id: 'palabra_encadenada',
    nombre: 'Palabra Encadenada',
    emoji: '🧠',
    categoria: 'lenguaje',
    beneficio: 'Vocabulario y agilidad mental',
    gancho: '¿Jugamos a la palabra encadenada? Yo digo una y vos seguís con la última letra. ¡Te apuesto que no aguantás 10 rondas! 😄'
  },
  {
    id: 'completar_refran',
    nombre: 'Completá el Refrán',
    emoji: '📖',
    categoria: 'memoria',
    beneficio: 'Memoria a largo plazo',
    gancho: 'Tengo refranes guardados que seguro tu abuela usaba. ¿Los completamos juntos? 📖'
  },
  {
    id: 'cancion_misterio',
    nombre: '¿De Quién es la Canción?',
    emoji: '🎵',
    categoria: 'memoria',
    beneficio: 'Memoria musical y emocional',
    gancho: 'Te describo una canción de tu época y vos adivinás quién la cantaba. ¿Le entramos? 🎵'
  },

  // ── Conocimiento ──
  {
    id: 'trivia',
    nombre: 'Trivia del Día',
    emoji: '🌍',
    categoria: 'conocimiento',
    beneficio: 'Atención y memoria',
    gancho: '¿Te animás a una trivia? 5 preguntas, y si ganás te debo un café imaginario ☕😄'
  },
  {
    id: 'verdadero_falso',
    nombre: '¿Verdadero o Falso?',
    emoji: '🎭',
    categoria: 'conocimiento',
    beneficio: 'Razonamiento crítico',
    gancho: 'Te tiro datos locos y vos me decís si son verdad o mentira. ¡Algunos te van a sorprender! 🎭'
  },
  {
    id: 'donde_queda',
    nombre: '¿Dónde Queda?',
    emoji: '🗺️',
    categoria: 'conocimiento',
    beneficio: 'Memoria espacial',
    gancho: '¿Jugamos a la geografía? Te nombro lugares y me decís dónde quedan. ¿Listo/a para viajar? 🗺️'
  },

  // ── Cálculo ──
  {
    id: 'cuentas_rapidas',
    nombre: 'Cuentas Rápidas',
    emoji: '🔢',
    categoria: 'calculo',
    beneficio: 'Cálculo y concentración',
    gancho: 'Vamos con unas cuentitas, pero de las divertidas, con empanadas y asados de por medio 🔢😄'
  },

  // ── Vínculo / evocación ──
  {
    id: 'historia_del_dia',
    nombre: 'Contame una Historia',
    emoji: '📝',
    categoria: 'vinculo',
    beneficio: 'Evocación y bienestar emocional',
    gancho: 'Hoy tengo ganas de escucharte. ¿Me contás algo lindo de cuando eras joven? 📝'
  },

  // ── Idiomas (NUEVO) ──
  {
    id: 'idioma_ingles',
    nombre: 'Inglés Fácil',
    emoji: '🇬🇧',
    categoria: 'idioma',
    beneficio: 'Estimulación cognitiva y conexión con nietos',
    gancho: '¿Y si aprendemos unas palabritas en inglés? Así sorprendés a los nietos. Empezamos con lo más fácil 🇬🇧😊'
  },
  {
    id: 'idioma_portugues',
    nombre: 'Portugués Fácil',
    emoji: '🇧🇷',
    categoria: 'idioma',
    beneficio: 'Estimulación cognitiva y turismo',
    gancho: '¿Te gustaría aprender portugués? Por si algún día te escapás a las playas de Brasil 🇧🇷😄'
  },

  // ── Nuevos juegos de mesa conocidos ──
  {
    id: 'tutti_frutti',
    nombre: 'Tutti Frutti',
    emoji: '🍎',
    categoria: 'lenguaje',
    beneficio: 'Fluidez verbal y categorización',
    gancho: '¿Jugamos al Tutti Frutti? Elijo una letra y decimos nombre, animal, comida... ¡el clásico de siempre! 🍎'
  },
  {
    id: 'adivinanzas',
    nombre: 'Adivinanzas',
    emoji: '🤔',
    categoria: 'conocimiento',
    beneficio: 'Razonamiento y lenguaje',
    gancho: 'Tengo adivinanzas de las buenas. "Oro parece, plata no es..." ¿Sabés cuál sigue? 🤔'
  }
];

// ─────────────────────────────────────────────────────────
// 2. SISTEMA DE PROPUESTA PROACTIVA DE JUEGOS
//    Pancho/Meli rotan juegos según el día y los gustos.
//    Esto se inyecta en el system prompt.
// ─────────────────────────────────────────────────────────

export function buildGameProposalContext(elderInterests = []) {
  const catalogList = GAME_CATALOG
    .map(g => `• ${g.nombre} (${g.emoji}) — ${g.beneficio}`)
    .join('\n');

  return `
═══ JUEGOS QUE SABÉS PROPONER ═══
Tenés esta lista de juegos y actividades. Proponelos de forma natural, 
rotando para que no se repita siempre el mismo. Nunca los listes todos juntos 
de golpe — ofrecé uno o dos por vez, con entusiasmo y según el momento del día.

${catalogList}

REGLAS para proponer juegos:
• Proponé un juego cuando notes que la charla decae o el abuelo está aburrido
• Adaptá la propuesta a sus gustos${elderInterests.length ? ` (le gusta: ${elderInterests.join(', ')})` : ''}
• Si ya jugaron algo hoy, ofrecé algo distinto
• A la mañana: algo activador (trivia, cuentas). A la tarde: algo tranquilo (historias, refranes)
• Nunca obligues. Si dice que no, seguí charlando normal y probá más tarde`;
}

// ─────────────────────────────────────────────────────────
// 3. SISTEMA DE IMPROVISACIÓN — JUEGOS QUE PROPONE EL ABUELO
//    El abuelo propone un juego. Pancho/Meli lo conocen y juegan.
// ─────────────────────────────────────────────────────────

export const IMPROV_GAME_PROMPT = `
═══ CUANDO EL ABUELO PROPONE UN JUEGO ═══
Si ${'{elderName}'} propone un juego (truco, chinchón, dominó, damas, tutti frutti, 
ahorcado, veo-veo, dígalo con mímica adaptado, etc.), VOS YA LO CONOCÉS.

Cómo actuar:
1. Mostrá entusiasmo: "¡Uy, [juego]! Hace mucho que no juego, ¡dale!"
2. Confirmá las reglas brevemente por si hay variantes regionales: 
   "¿Lo jugamos como siempre o tenés tu versión?"
3. Jugá adaptándolo al chat (texto). Para juegos de cartas/fichas, 
   simulá la partida narrándola.
4. Mantené tu personalidad: festejá, hacé bromas, alentá.

Si es un juego que de verdad no reconocés (algo muy raro o inventado):
1. Sé honesto con gracia: "¡Ese no lo conozco! Me intrigás. ¿Me explicás cómo se juega?"
2. Aprendé de su explicación y jugá con esas reglas.
3. NUNCA inventes reglas falsas haciendo de cuenta que lo conocés — quedaría raro.

IMPORTANTE: La mayoría de juegos tradicionales (truco, chinchón, dominó, damas, 
ajedrez, tutti frutti, ahorcado, batalla naval, veo-veo, adivinanzas, dígalo con 
mímica, generala) ya los sabés perfectamente. Jugá directo, sin dudar.`;

// ─────────────────────────────────────────────────────────
// 4. MÓDULO DE IDIOMAS — Mini-lecciones temáticas
//    Inglés y Portugués. Estructura: temas → frases.
// ─────────────────────────────────────────────────────────

export const LANGUAGE_MODULE = {
  ingles: {
    nombre: 'Inglés',
    bandera: '🇬🇧',
    temas: [
      {
        tema: 'Saludos',
        frases: [
          { es: 'Hola', target: 'Hello', pron: 'jelóu' },
          { es: 'Buenos días', target: 'Good morning', pron: 'gud mórning' },
          { es: '¿Cómo estás?', target: 'How are you?', pron: 'jáu ar iú' },
          { es: 'Muy bien, gracias', target: 'Very well, thank you', pron: 'véri uél, zénk iú' },
          { es: 'Adiós', target: 'Goodbye', pron: 'gudbái' }
        ]
      },
      {
        tema: 'La familia',
        frases: [
          { es: 'Mi nieto', target: 'My grandson', pron: 'mai gránson' },
          { es: 'Mi nieta', target: 'My granddaughter', pron: 'mai grándóter' },
          { es: 'Mi hijo', target: 'My son', pron: 'mai son' },
          { es: 'Mi hija', target: 'My daughter', pron: 'mai dóter' },
          { es: 'Te quiero', target: 'I love you', pron: 'ái lav iú' }
        ]
      },
      {
        tema: 'La comida',
        frases: [
          { es: 'Agua', target: 'Water', pron: 'uóter' },
          { es: 'Café', target: 'Coffee', pron: 'cófi' },
          { es: 'Pan', target: 'Bread', pron: 'bred' },
          { es: 'Rico / delicioso', target: 'Delicious', pron: 'dilíshes' },
          { es: 'Tengo hambre', target: "I'm hungry", pron: 'aim jángri' }
        ]
      }
    ]
  },
  portugues: {
    nombre: 'Portugués',
    bandera: '🇧🇷',
    temas: [
      {
        tema: 'Saludos',
        frases: [
          { es: 'Hola', target: 'Olá', pron: 'olá' },
          { es: 'Buenos días', target: 'Bom dia', pron: 'bon día' },
          { es: '¿Cómo estás?', target: 'Tudo bem?', pron: 'túdu beñ' },
          { es: 'Todo bien, gracias', target: 'Tudo bem, obrigado/a', pron: 'túdu beñ, obrigádu' },
          { es: 'Chau', target: 'Tchau', pron: 'chau' }
        ]
      },
      {
        tema: 'La familia',
        frases: [
          { es: 'Mi nieto', target: 'Meu neto', pron: 'méu néto' },
          { es: 'Mi nieta', target: 'Minha neta', pron: 'míña néta' },
          { es: 'Mi hijo', target: 'Meu filho', pron: 'méu fílho' },
          { es: 'Mi hija', target: 'Minha filha', pron: 'míña fílha' },
          { es: 'Te quiero', target: 'Eu te amo', pron: 'éu chi ámu' }
        ]
      },
      {
        tema: 'La comida',
        frases: [
          { es: 'Agua', target: 'Água', pron: 'água' },
          { es: 'Café', target: 'Café', pron: 'café' },
          { es: 'Pan', target: 'Pão', pron: 'paun' },
          { es: 'Rico / delicioso', target: 'Gostoso', pron: 'gostóso' },
          { es: 'Tengo hambre', target: 'Estou com fome', pron: 'estóu con fómi' }
        ]
      }
    ]
  }
};

// Genera el prompt de una lección de idioma para inyectar en el system prompt
export function buildLanguageLessonPrompt(idioma, elderName) {
  const lang = LANGUAGE_MODULE[idioma];
  if (!lang) return '';

  const temasJSON = JSON.stringify(lang.temas, null, 2);

  return `
═══ MINI-LECCIÓN DE ${lang.nombre.toUpperCase()} ${lang.bandera} ═══
Vas a enseñarle ${lang.nombre} a ${elderName} de forma DIVERTIDA y MUY de a poco.

Material disponible (temas y frases):
${temasJSON}

CÓMO ENSEÑAR (importante para adultos mayores):
1. Una sola frase por vez. Nunca abrumes.
2. Decí la frase en español, después en ${lang.nombre}, y la pronunciación en "letras como suena".
   Ejemplo: "'Hola' en inglés se dice 'Hello', se pronuncia 'jelóu'. ¡Probá decirlo!"
3. Pedile que lo repita escribiéndolo. Festejá el intento aunque no sea perfecto.
4. Repasá lo de días anteriores antes de enseñar algo nuevo.
5. Conectá con su vida: "Con esto ya podés saludar a tu nieto en inglés 😊"
6. Máximo 2-3 frases nuevas por sesión. Mejor poco y bien.
7. Hacelo un juego, no una clase: "¿Cómo era 'buenos días'? ¡A ver si te acordás!"

NUNCA corrijas con dureza. Si se equivoca: "¡Casi! Es 'jelóu'. Lo decís igual de bien que mi profesora 😄"`;
}

// ─────────────────────────────────────────────────────────
// 5. HELPER: detectar si el mensaje del abuelo activa un juego
// ─────────────────────────────────────────────────────────

export function detectGameIntent(message) {
  const msg = message.toLowerCase();

  // Idiomas
  if (msg.includes('inglés') || msg.includes('ingles') || msg.includes('english')) {
    return { type: 'idioma_ingles', isLanguage: true, lang: 'ingles' };
  }
  if (msg.includes('portugués') || msg.includes('portugues') || msg.includes('brasil')) {
    return { type: 'idioma_portugues', isLanguage: true, lang: 'portugues' };
  }

  // Juegos del catálogo
  const keywords = {
    palabra_encadenada: ['palabra encadenada', 'palabras encadenadas'],
    completar_refran: ['refrán', 'refran', 'dicho'],
    trivia: ['trivia', 'preguntas'],
    verdadero_falso: ['verdadero o falso', 'verdadero', 'falso'],
    cuentas_rapidas: ['cuentas', 'matemática', 'matematica', 'números', 'numeros'],
    donde_queda: ['geografía', 'geografia', 'dónde queda', 'donde queda'],
    cancion_misterio: ['canción', 'cancion', 'música', 'musica'],
    historia_del_dia: ['contar una historia', 'contame', 'recuerdo'],
    tutti_frutti: ['tutti frutti', 'tutti-frutti', 'stop', 'basta'],
    adivinanzas: ['adivinanza', 'adivina']
  };

  for (const [gameId, words] of Object.entries(keywords)) {
    if (words.some(w => msg.includes(w))) {
      return { type: gameId, isLanguage: false };
    }
  }

  // Posible juego propuesto por el abuelo (improvisación)
  if (msg.includes('jugar') || msg.includes('juguemos') || msg.includes('juego')) {
    return { type: 'improv', isLanguage: false, needsImprov: true };
  }

  return null;
}
