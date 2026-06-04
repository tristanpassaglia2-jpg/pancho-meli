// ═══════════════════════════════════════════════════════
// PANCHO & MELI — BASE DE JUEGOS CULTURALES POR PAÍS (LATAM)
// Fuentes verificadas por investigación web (abril 2026).
//
// CLAVE "modo":
//   "chat"      → se puede jugar de verdad por chat (texto)
//   "evocacion" → es físico, NO se juega por chat, pero Pancho/Meli
//                 lo usan para charlar y traer recuerdos
//   "adaptado"  → físico, pero tiene una versión adaptable al chat
// ═══════════════════════════════════════════════════════

export const JUEGOS_POR_PAIS = {
  mexico: {
    nombre: 'México',
    bandera: '🇲🇽',
    juegos: [
      { nombre: 'Lotería Mexicana', modo: 'chat', desc: 'Bingo con cartas ilustradas (El Gallo, La Dama, El Catrín...). Pancho canta las cartas y describe las figuras; el abuelo dice si la tiene.' },
      { nombre: 'Basta / Stop', modo: 'chat', desc: 'Por una letra, decir Nombre, Apellido, Cosa, Comida, País. El primero en completar grita ¡Basta!' },
      { nombre: 'Serpientes y Escaleras', modo: 'adaptado', desc: 'Tablero con dados narrado. Pancho tira por ambos y narra el avance.' },
      { nombre: 'El Juego de la Oca', modo: 'adaptado', desc: 'Tablero clásico narrado con sus casillas especiales.' },
      { nombre: 'Memoria (Memorama)', modo: 'evocacion', desc: 'Encontrar pares de cartas. Charlar sobre cómo lo jugaba en familia.' }
    ]
  },
  colombia: {
    nombre: 'Colombia',
    bandera: '🇨🇴',
    juegos: [
      { nombre: 'Parqués', modo: 'adaptado', desc: 'El juego de mesa más querido de Colombia. Versión local del parchís. Pancho narra la partida con dados.' },
      { nombre: 'Tejo', modo: 'evocacion', desc: 'Deporte nacional, lanzar discos metálicos a un blanco con pólvora. Físico: usar para recordar ferias y reuniones.' },
      { nombre: 'Rana / Sapo', modo: 'evocacion', desc: 'Lanzar fichas a la boca de una rana metálica. Físico: evocar bares y fiestas patronales.' },
      { nombre: 'Stop (geográfico)', modo: 'chat', desc: 'Variante del Basta enfocada en países, ciudades, nombres por letra.' },
      { nombre: 'Adivina el refrán paisa', modo: 'chat', desc: 'Refranes y dichos típicos colombianos para completar.' }
    ]
  },
  argentina: {
    nombre: 'Argentina',
    bandera: '🇦🇷',
    juegos: [
      { nombre: 'Truco', modo: 'chat', desc: 'Juego de cartas españolas con envido y flor. Pancho reparte mentalmente, canta y juega la mano narrando.' },
      { nombre: 'Chinchón', modo: 'chat', desc: 'Juego de cartas de formar combinaciones y cortar con menos de 5 puntos. Se narra por turnos.' },
      { nombre: 'Tutti Frutti', modo: 'chat', desc: 'Por una letra, completar categorías (nombre, color, país, animal, comida).' },
      { nombre: 'Generala', modo: 'chat', desc: 'Juego de 5 dados (escalera, full, póker, generala). Pancho narra las tiradas.' },
      { nombre: 'Lotería de cartones', modo: 'chat', desc: 'Bingo familiar de números. Pancho canta los números.' }
    ]
  },
  chile: {
    nombre: 'Chile',
    bandera: '🇨🇱',
    juegos: [
      { nombre: 'Cacho (dados)', modo: 'chat', desc: 'Juego de dados muy popular en Chile, similar a la generala. Se narra por tiradas.' },
      { nombre: 'Brisca', modo: 'chat', desc: 'Juego de cartas españolas por bazas y triunfo.' },
      { nombre: 'Cachipún (piedra-papel-tijera)', modo: 'chat', desc: 'Clásico rápido, ronda a ronda.' },
      { nombre: 'Luche (rayuela)', modo: 'evocacion', desc: 'Saltar casillas numeradas. Físico: evocar la infancia en el barrio.' },
      { nombre: 'Adivina el dicho chileno', modo: 'chat', desc: 'Refranes y modismos chilenos para completar.' }
    ]
  },
  peru: {
    nombre: 'Perú',
    bandera: '🇵🇪',
    juegos: [
      { nombre: 'Sapo', modo: 'evocacion', desc: 'Lanzar fichas a la boca de un sapo metálico. Físico: evocar reuniones.' },
      { nombre: 'Casino / Cartas', modo: 'chat', desc: 'Juegos de cartas de mesa narrados.' },
      { nombre: 'Yan-ken-po', modo: 'chat', desc: 'Piedra, papel o tijera peruano, rápido por rondas.' },
      { nombre: 'Bingo', modo: 'chat', desc: 'Bingo de números cantado por Pancho.' },
      { nombre: 'Adivina la jerga peruana', modo: 'chat', desc: 'Dichos y expresiones típicas para completar.' }
    ]
  }
};

// Genera contexto para el system prompt según el país del abuelo
export function buildCountryGamesContext(country = 'argentina') {
  const data = JUEGOS_POR_PAIS[country] || JUEGOS_POR_PAIS.argentina;
  const jugables = data.juegos.filter(j => j.modo === 'chat' || j.modo === 'adaptado');
  const evocacion = data.juegos.filter(j => j.modo === 'evocacion');

  let ctx = `\n═══ JUEGOS TÍPICOS DE ${data.nombre.toUpperCase()} ${data.bandera} ═══\n`;
  ctx += `Estos los podés JUGAR por chat:\n`;
  ctx += jugables.map(j => `• ${j.nombre}: ${j.desc}`).join('\n');
  if (evocacion.length) {
    ctx += `\n\nEstos son FÍSICOS (no se juegan por chat) pero sirven para charlar y traer recuerdos:\n`;
    ctx += evocacion.map(j => `• ${j.nombre}: ${j.desc}`).join('\n');
    ctx += `\nNunca propongas "juguemos" a estos; en cambio preguntá "¿te acordás cuando jugabas a...?"`;
  }
  return ctx;
}

export const PAISES_DISPONIBLES = Object.keys(JUEGOS_POR_PAIS);
