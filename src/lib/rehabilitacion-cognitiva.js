// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MOTOR DE REHABILITACIÓN COGNITIVA
// Ejercicios con lógica PROGRAMADA (no improvisados por IA)
// para que los resultados sean medibles y comparables día a día.
// Inspirado en los clásicos de Lumosity / CogniFit / Peak.
//
// Cada ejercicio:
//   - genera(nivel) → devuelve { consigna, respuesta, opciones? }
//   - dominio cognitivo que entrena
//   - se puntúa por acierto + tiempo de respuesta
// ═══════════════════════════════════════════════════════

// Helper: número aleatorio entre min y max (inclusive)
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Mezcla confiable (Fisher-Yates)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const EJERCICIOS_COGNITIVOS = {

  // ── 1. SECUENCIAS NUMÉRICAS (razonamiento lógico) ──
  secuencia_numerica: {
    nombre: 'Secuencias',
    dominio: 'Razonamiento lógico',
    emoji: '🔢',
    genera(nivel = 1) {
      // Nivel 1: suma constante | Nivel 2: suma creciente | Nivel 3: multiplicación
      if (nivel === 1) {
        const inicio = rnd(1, 9);
        const paso = rnd(2, 5);
        const serie = [inicio, inicio + paso, inicio + paso * 2, inicio + paso * 3];
        return {
          consigna: `¿Qué número sigue? ${serie.join(', ')}, ___`,
          respuesta: inicio + paso * 4
        };
      }
      if (nivel === 2) {
        const inicio = rnd(1, 5);
        const serie = [inicio, inicio + 1, inicio + 3, inicio + 6]; // +1,+2,+3
        return {
          consigna: `¿Qué número sigue? ${serie.join(', ')}, ___`,
          respuesta: inicio + 10 // +4
        };
      }
      const inicio = rnd(2, 4);
      const serie = [inicio, inicio * 2, inicio * 4, inicio * 8];
      return {
        consigna: `¿Qué número sigue? ${serie.join(', ')}, ___`,
        respuesta: inicio * 16
      };
    }
  },

  // ── 2. MEMORIA DE TRABAJO (recordar secuencia) ──
  memoria_secuencia: {
    nombre: 'Memoria',
    dominio: 'Memoria de trabajo',
    emoji: '🧠',
    genera(nivel = 1) {
      const largo = nivel + 2; // nivel 1 = 3 dígitos, nivel 2 = 4, nivel 3 = 5
      const secuencia = Array.from({ length: largo }, () => rnd(1, 9));
      return {
        consigna: `Te voy a decir unos números. Memorizalos y después me los repetís AL REVÉS:\n${secuencia.join(' - ')}`,
        respuesta: [...secuencia].reverse().join(''),
        respuestaLegible: [...secuencia].reverse().join(' - '),
        requiereMemoria: true
      };
    }
  },

  // ── 3. CÁLCULO MENTAL (en contexto cotidiano) ──
  calculo_mental: {
    nombre: 'Cuentas',
    dominio: 'Cálculo y concentración',
    emoji: '➗',
    genera(nivel = 1) {
      if (nivel === 1) {
        const a = rnd(10, 50), b = rnd(5, 30);
        return {
          consigna: `Si tenías ${a} pesos y gastaste ${b}, ¿cuánto te queda?`,
          respuesta: a - b
        };
      }
      if (nivel === 2) {
        const docenas = rnd(2, 6), precio = rnd(2, 8) * 100;
        return {
          consigna: `Si comprás ${docenas} docenas de empanadas a $${precio} la docena, ¿cuánto gastás en total?`,
          respuesta: docenas * precio
        };
      }
      const personas = rnd(3, 8), total = personas * rnd(2, 5);
      return {
        consigna: `Si repartís ${total} alfajores entre ${personas} nietos en partes iguales, ¿cuántos le tocan a cada uno?`,
        respuesta: total / personas
      };
    }
  },

  // ── 4. ATENCIÓN (encontrar el diferente / contar) ──
  atencion: {
    nombre: 'Atención',
    dominio: 'Atención selectiva',
    emoji: '👁️',
    genera(nivel = 1) {
      const letra = pick(['A', 'E', 'O', 'S', 'M']);
      const cantidad = rnd(3, 4 + nivel);
      const total = cantidad + rnd(3, 6);
      const otras = 'BCDFGHJKLNPRT'.split('');
      let cadena = [];
      for (let i = 0; i < cantidad; i++) cadena.push(letra);
      for (let i = 0; i < total - cantidad; i++) cadena.push(pick(otras));
      // mezclar de forma confiable
      cadena = shuffle(cadena);
      return {
        consigna: `Contá cuántas veces aparece la letra "${letra}" en esta fila:\n${cadena.join(' ')}`,
        respuesta: cantidad
      };
    }
  },

  // ── 5. RAZONAMIENTO VERBAL (palabra intrusa) ──
  palabra_intrusa: {
    nombre: 'El Intruso',
    dominio: 'Razonamiento verbal / categorización',
    emoji: '🎯',
    genera(nivel = 1) {
      const categorias = [
        { grupo: ['Manzana', 'Pera', 'Banana', 'Martillo'], intruso: 'Martillo', razon: 'no es una fruta' },
        { grupo: ['Perro', 'Gato', 'Mesa', 'Caballo'], intruso: 'Mesa', razon: 'no es un animal' },
        { grupo: ['Rojo', 'Azul', 'Verde', 'Silla'], intruso: 'Silla', razon: 'no es un color' },
        { grupo: ['Lunes', 'Martes', 'Enero', 'Viernes'], intruso: 'Enero', razon: 'es un mes, no un día' },
        { grupo: ['Guitarra', 'Piano', 'Violín', 'Cuaderno'], intruso: 'Cuaderno', razon: 'no es un instrumento' },
        { grupo: ['Auto', 'Avión', 'Tren', 'Zapato'], intruso: 'Zapato', razon: 'no es un transporte' }
      ];
      const c = pick(categorias);
      return {
        consigna: `¿Cuál no pertenece al grupo? ${c.grupo.join(', ')}`,
        respuesta: c.intruso.toLowerCase(),
        razon: c.razon
      };
    }
  },

  // ── 6. ACERTIJOS LÓGICOS ──
  acertijo: {
    nombre: 'Acertijos',
    dominio: 'Razonamiento abstracto',
    emoji: '💡',
    genera(nivel = 1) {
      const faciles = [
        { consigna: 'Cuanto más le quitás, más grande se hace. ¿Qué es?', respuesta: 'pozo', alt: ['agujero', 'hoyo'] },
        { consigna: 'Tiene dientes pero no muerde. ¿Qué es?', respuesta: 'peine', alt: ['peineta'] },
        { consigna: 'Vuela sin alas, llora sin ojos. ¿Qué es?', respuesta: 'nube', alt: ['las nubes'] }
      ];
      const dificiles = [
        { consigna: 'Si en una carrera pasás al que va segundo, ¿en qué puesto quedás?', respuesta: 'segundo', alt: ['2do', 'el segundo'] },
        { consigna: 'Un pastor tiene 17 ovejas y se mueren todas menos 9. ¿Cuántas le quedan?', respuesta: '9', alt: ['nueve'] },
        { consigna: '¿Qué pesa más, un kilo de plomo o un kilo de plumas?', respuesta: 'pesan igual', alt: ['lo mismo', 'igual', 'pesan lo mismo'] }
      ];
      const set = nivel >= 2 ? dificiles : faciles;
      const a = pick(set);
      return { consigna: a.consigna, respuesta: a.respuesta, alternativas: a.alt || [] };
    }
  }
};

// ─────────────────────────────────────────────────────────
// VERIFICACIÓN DE RESPUESTA (tolerante a variaciones)
// ─────────────────────────────────────────────────────────
export function verificarRespuesta(ejercicio, datosEjercicio, respuestaUsuario) {
  const limpia = String(respuestaUsuario).toLowerCase().trim().replace(/[.,!¡?¿]/g, '');
  const correcta = String(datosEjercicio.respuesta).toLowerCase().trim();

  if (limpia === correcta) return true;
  // Para números: comparar como número
  if (!isNaN(datosEjercicio.respuesta) && Number(limpia) === Number(datosEjercicio.respuesta)) return true;
  // Alternativas aceptadas
  if (datosEjercicio.alternativas?.some(alt => limpia.includes(alt.toLowerCase()))) return true;
  // Contiene la respuesta correcta
  if (correcta.length > 2 && limpia.includes(correcta)) return true;

  return false;
}

// ─────────────────────────────────────────────────────────
// SISTEMA DE PUNTUACIÓN + DIFICULTAD ADAPTATIVA
// ─────────────────────────────────────────────────────────
export function calcularNuevoNivel(historial) {
  // historial: array de { acierto: bool, tiempoSegundos: number }
  if (historial.length < 3) return 1;
  const ultimos = historial.slice(-5);
  const aciertos = ultimos.filter(h => h.acierto).length;
  const ratio = aciertos / ultimos.length;
  if (ratio >= 0.8) return Math.min(3, (historial.nivelActual || 1) + 1);
  if (ratio <= 0.4) return Math.max(1, (historial.nivelActual || 1) - 1);
  return historial.nivelActual || 1;
}

// Genera el contexto para que la IA presente un ejercicio cognitivo
// (la IA lo "viste" con personalidad, pero el contenido viene de acá)
export function presentarEjercicio(tipoEjercicio, nivel = 1) {
  const ej = EJERCICIOS_COGNITIVOS[tipoEjercicio];
  if (!ej) return null;
  const datos = ej.genera(nivel);
  return {
    tipo: tipoEjercicio,
    nombre: ej.nombre,
    dominio: ej.dominio,
    emoji: ej.emoji,
    nivel,
    ...datos
  };
}

export const LISTA_EJERCICIOS = Object.entries(EJERCICIOS_COGNITIVOS).map(([id, e]) => ({
  id, nombre: e.nombre, dominio: e.dominio, emoji: e.emoji
}));
