// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MODO ÁRBITRO / JUEGOS GRUPALES
// Cuando hay familia o amigos en la habitación, Pancho/Meli
// dejan de ser rival y pasan a CONDUCIR el juego para todos:
// canta, lee consignas, lleva el puntaje, anima la mesa.
//
// Objetivo social: la app es la EXCUSA para que la familia
// se junte alrededor del abuelo. Combate la soledad provocando
// encuentro, no reemplazándolo.
//
// Todos NARRADOS (sin tablero táctil). Lo táctil → v2.
// ═══════════════════════════════════════════════════════

// Helpers
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─────────────────────────────────────────────────────────
// CATÁLOGO DE JUEGOS GRUPALES (los 4 del MVP + Tutti Frutti)
// ─────────────────────────────────────────────────────────

export const JUEGOS_GRUPALES = [
  {
    id: 'bingo',
    nombre: 'Bingo',
    emoji: '🎱',
    minJugadores: 2,
    rolPancho: 'Locutor / cantor de números',
    gancho: '¿Están todos ahí? ¡Armamos un bingo! Yo canto los números y ustedes marcan. ¿Cuántos juegan? 🎱'
  },
  {
    id: 'loteria',
    nombre: 'Lotería',
    emoji: '🃏',
    minJugadores: 2,
    rolPancho: 'Cantor de cartas',
    gancho: '¡A la lotería! Yo voy cantando las cartas y ustedes las marcan en su tabla. ¿Listos? 🃏'
  },
  {
    id: 'intruso_grupal',
    nombre: 'El Intruso (en equipo)',
    emoji: '🎯',
    minJugadores: 2,
    rolPancho: 'Lector y juez',
    gancho: 'Les leo grupos de palabras y el primero que diga cuál NO pertenece, suma punto. ¡Yo llevo la cuenta! 🎯'
  },
  {
    id: 'trivia_equipos',
    nombre: 'Trivia por Equipos',
    emoji: '🏆',
    minJugadores: 2,
    rolPancho: 'Presentador y anotador',
    gancho: '¡Trivia por equipos! Familia contra familia. Yo hago las preguntas y anoto los puntos. ¿Cómo se llaman los equipos? 🏆'
  },
  {
    id: 'tutti_frutti_grupal',
    nombre: 'Tutti Frutti / Basta',
    emoji: '🍎',
    minJugadores: 2,
    rolPancho: 'Sorteador de letras y juez',
    gancho: '¡Tutti Frutti para todos! Yo sorteo la letra y ustedes completan las categorías. El primero que termina grita ¡Basta! 🍎'
  }
];

// ─────────────────────────────────────────────────────────
// MOTOR DE BINGO (Pancho canta números reales)
// ─────────────────────────────────────────────────────────

export function crearPartidaBingo() {
  // Bingo clásico de 1 a 90 (estilo LATAM/español)
  const bolillero = shuffle(Array.from({ length: 90 }, (_, i) => i + 1));
  return {
    bolillero,
    cantados: [],
    sacarNumero() {
      if (this.bolillero.length === 0) return null;
      const num = this.bolillero.pop();
      this.cantados.push(num);
      return num;
    }
  };
}

// Frases con que Pancho canta los números (el folklore del bingo)
export const FRASES_BINGO = {
  1: 'el primero, el 1',
  2: 'el patito, el 2',
  5: 'el 5',
  11: 'las banderitas, el 11',
  13: 'la mala suerte... ¡o no!, el 13',
  22: 'los dos patitos, el 22',
  50: 'la mitad, el 50',
  69: 'el 69, ¡no se rían!',
  77: 'las dos hachas, el 77',
  90: 'el abuelo, el 90'
};

export function cantarNumeroBingo(num) {
  return FRASES_BINGO[num] || `el ${num}`;
}

// ─────────────────────────────────────────────────────────
// SISTEMA DE PUNTAJE GRUPAL (Pancho como anotador)
// ─────────────────────────────────────────────────────────

export function crearMarcador(nombresJugadores = []) {
  const marcador = {};
  nombresJugadores.forEach(n => { marcador[n] = 0; });
  return {
    puntos: marcador,
    sumar(jugador, n = 1) {
      if (this.puntos[jugador] === undefined) this.puntos[jugador] = 0;
      this.puntos[jugador] += n;
    },
    tabla() {
      return Object.entries(this.puntos)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, pts], i) => `${i + 1}° ${nombre}: ${pts} pts`)
        .join('  |  ');
    },
    ganador() {
      const orden = Object.entries(this.puntos).sort((a, b) => b[1] - a[1]);
      return orden.length ? orden[0][0] : null;
    }
  };
}

// ─────────────────────────────────────────────────────────
// CONTEXTO PARA EL SYSTEM PROMPT — MODO ÁRBITRO
// ─────────────────────────────────────────────────────────

export const MODO_ARBITRO_CONTEXT = `
═══ MODO ÁRBITRO (JUEGO GRUPAL) ═══
A veces {elderName} no está solo: hay nietos, hijos o amigos en la misma habitación.
Cuando detectes que quieren jugar EN GRUPO (dicen "estamos en familia", "somos varios",
"jugamos todos", "están mis nietos"), CAMBIÁ DE ROL: ya no sos rival, sos el ANIMADOR.

Tu trabajo como árbitro:
• Preguntá quiénes juegan y anotá sus nombres
• Conducí el juego con energía de locutor: "¡Atención la mesa!"
• Llevá el puntaje en voz alta después de cada ronda
• Sé justo e imparcial, pero MUY divertido y animado
• Hacé participar a todos, sobre todo a {elderName} (es el anfitrión)
• Al final, proclamá al ganador con bombos y platillos y aplaudí a todos

Juegos grupales que sabés conducir:
• BINGO 🎱 — cantás números del 1 al 90 con su folklore ("las banderitas, el 11")
• LOTERÍA 🃏 — cantás las cartas ilustradas y describís las figuras
• EL INTRUSO EN EQUIPO 🎯 — leés grupos de palabras, el primero que acierta suma
• TRIVIA POR EQUIPOS 🏆 — preguntás, anotás puntos por equipo, generás picante sano
• TUTTI FRUTTI / BASTA 🍎 — sorteás una letra, todos completan categorías

IMPORTANTE: en modo grupal, el valor es que la familia se JUNTE alrededor de {elderName}.
Reforzá eso: "¡Qué lindo verlos a todos juntos!", "{elderName}, tenés una familia hermosa".
Cuando termine el juego grupal, agradecé el momento y volvé al tono de compañía normal.`;

// Detecta si el abuelo quiere jugar en grupo
export function detectarModoGrupal(mensaje) {
  const m = (mensaje || '').toLowerCase();
  const señales = [
    'en familia', 'somos varios', 'estamos todos', 'jugamos todos',
    'están mis nietos', 'estan mis nietos', 'mis nietos', 'con mi familia',
    'somos', 'en grupo', 'varios', 'todos juntos', 'están mis', 'vinieron'
  ];
  return señales.some(s => m.includes(s));
}

export const LISTA_JUEGOS_GRUPALES = JUEGOS_GRUPALES.map(j => ({
  id: j.id, nombre: j.nombre, emoji: j.emoji, rol: j.rolPancho
}));
