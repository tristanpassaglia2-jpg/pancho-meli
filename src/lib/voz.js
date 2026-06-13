// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE VOZ (versión robusta)
// Usa la Web Speech API (gratis, integrada en el navegador).
//   - Texto a voz: Pancho/Meli leen sus mensajes en voz alta
//   - Voz a texto: el abuelo habla en vez de tipear
// ═══════════════════════════════════════════════════════

// Cache de voces (se cargan una sola vez)
let vocesCache = [];
let vocesListas = false;

// ─────────────────────────────────────────────────────────
// 1. PRECARGAR VOCES (llamar al inicio de la app)
// ─────────────────────────────────────────────────────────
export function precargarVoces(callback) {
  if (!('speechSynthesis' in window)) { callback?.(); return; }
  
  const cargar = () => {
    vocesCache = window.speechSynthesis.getVoices();
    vocesListas = vocesCache.length > 0;
    callback?.(vocesCache);
  };
  
  cargar();
  if (!vocesListas) {
    window.speechSynthesis.onvoiceschanged = cargar;
  }
}

// ─────────────────────────────────────────────────────────
// 2. ELEGIR MEJOR VOZ EN ESPAÑOL
// ─────────────────────────────────────────────────────────
export function elegirMejorVoz(genero = 'male') {
  if (!('speechSynthesis' in window)) return null;
  
  // Si no hay voces en cache, intentar cargar
  if (!vocesListas) {
    vocesCache = window.speechSynthesis.getVoices();
    vocesListas = vocesCache.length > 0;
  }
  if (!vocesCache.length) return null;

  const enEspanol = vocesCache.filter(v => v.lang.toLowerCase().startsWith('es'));
  if (!enEspanol.length) return vocesCache[0];

  const prioridadLang = ['es-ar', 'es-mx', 'es-us', 'es-co', 'es-cl', 'es-419', 'es-es', 'es'];
  const pistasFemenino = ['mónica', 'monica', 'paulina', 'female', 'mujer', 'helena', 'laura', 'sabina', 'elena'];
  const pistasMasculino = ['jorge', 'diego', 'male', 'hombre', 'carlos', 'enrique', 'pablo'];
  const pistas = genero === 'male' ? pistasMasculino : pistasFemenino;

  for (const lang of prioridadLang) {
    const match = enEspanol.find(v =>
      v.lang.toLowerCase().startsWith(lang) &&
      pistas.some(p => v.name.toLowerCase().includes(p))
    );
    if (match) return match;
  }

  const premium = enEspanol.find(v =>
    /google|microsoft|natural|premium|enhanced/i.test(v.name)
  );
  if (premium) return premium;

  for (const lang of prioridadLang) {
    const match = enEspanol.find(v => v.lang.toLowerCase().startsWith(lang));
    if (match) return match;
  }

  return enEspanol[0];
}

// ─────────────────────────────────────────────────────────
// 3. TEXTO A VOZ (Pancho/Meli hablan)
// Versión robusta: maneja el bug de Chrome donde cancel()
// antes de speak() a veces causa silencio.
// ─────────────────────────────────────────────────────────
export function hablar(texto, genero = 'male', { onStart, onEnd } = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Este navegador no soporta voz');
    onEnd?.();
    return;
  }

  // Cancelar cualquier lectura en curso
  window.speechSynthesis.cancel();

  // Limpiar el texto: sacar emojis y links para que no los "lea"
  const limpio = texto
    .replace(/https?:\/\/[^\s]+/g, '')       // sacar links
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')  // sacar emojis
    .replace(/\*\*/g, '')                     // sacar negritas markdown
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) { onEnd?.(); return; }

  // Workaround para Chrome: pequeña pausa después del cancel()
  // para evitar el bug de silencio
  setTimeout(() => {
    const utter = new SpeechSynthesisUtterance(limpio);
    const voz = elegirMejorVoz(genero);
    if (voz) {
      utter.voice = voz;
      utter.lang = voz.lang;
    } else {
      utter.lang = 'es-AR';
    }

    // Ajustes para que suene cálido y entendible para adultos mayores
    utter.rate = 0.88;    // un poco más lento = más claro para el abuelo
    utter.pitch = genero === 'male' ? 0.92 : 1.05;
    utter.volume = 1.0;

    utter.onstart = () => onStart?.();
    utter.onend = () => onEnd?.();
    utter.onerror = (e) => {
      console.warn('Error de voz:', e);
      onEnd?.();
    };

    // Workaround Chrome: si está "pausado" (bug conocido), resumir
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utter);
    
    // Workaround Chrome: en textos largos, Chrome se "duerme" después de ~15 seg.
    // Hacemos un resume() periódico para evitarlo.
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);

  }, 100); // 100ms de pausa post-cancel = fix del bug de silencio
}

// Detener la lectura inmediatamente
export function callar() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─────────────────────────────────────────────────────────
// 4. VOZ A TEXTO (el abuelo habla)
// ─────────────────────────────────────────────────────────
export function crearReconocedorVoz({ onResult, onError, onEnd } = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Este navegador no soporta reconocimiento de voz');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript;
    onResult?.(texto);
  };
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = () => onEnd?.();

  return recognition;
}

// ─────────────────────────────────────────────────────────
// 5. DISPONIBILIDAD (para mostrar/ocultar botones)
// ─────────────────────────────────────────────────────────
export const vozDisponible = {
  hablar: typeof window !== 'undefined' && 'speechSynthesis' in window,
  escuchar: typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
};
