// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE VOZ
// Usa la Web Speech API (gratis, integrada en el navegador).
//   - Texto a voz: Pancho/Meli leen sus mensajes en voz alta
//   - Voz a texto: el abuelo habla en vez de tipear
// Todo opcional y controlable por el abuelo (silenciar / activar).
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
// 1. TEXTO A VOZ (Pancho/Meli hablan)
// ─────────────────────────────────────────────────────────

// Elige la MEJOR voz en español disponible en el dispositivo.
// Prioriza voces de calidad (Google/Microsoft/Apple) y según género.
export function elegirMejorVoz(genero = 'male') {
  if (!('speechSynthesis' in window)) return null;
  const voces = window.speechSynthesis.getVoices();
  if (!voces.length) return null;

  // Solo voces en español
  const enEspanol = voces.filter(v => v.lang.toLowerCase().startsWith('es'));
  if (!enEspanol.length) return voces[0];

  // Preferencia regional: español de Latinoamérica primero
  const prioridadLang = ['es-ar', 'es-mx', 'es-us', 'es-co', 'es-cl', 'es-419', 'es-es', 'es'];

  // Nombres típicos de voces de calidad por género (heurística)
  const pistasFemenino = ['mónica', 'monica', 'paulina', 'female', 'mujer', 'helena', 'laura', 'sabina', 'elena'];
  const pistasMasculino = ['jorge', 'diego', 'male', 'hombre', 'carlos', 'enrique', 'pablo'];
  const pistas = genero === 'male' ? pistasMasculino : pistasFemenino;

  // 1) Buscar voz que coincida en idioma prioritario Y género
  for (const lang of prioridadLang) {
    const match = enEspanol.find(v =>
      v.lang.toLowerCase().startsWith(lang) &&
      pistas.some(p => v.name.toLowerCase().includes(p))
    );
    if (match) return match;
  }

  // 2) Buscar voz "premium" (Google/Microsoft suelen sonar mejor) en español
  const premium = enEspanol.find(v =>
    /google|microsoft|natural|premium|enhanced/i.test(v.name)
  );
  if (premium) return premium;

  // 3) Cualquier voz en español del idioma prioritario
  for (const lang of prioridadLang) {
    const match = enEspanol.find(v => v.lang.toLowerCase().startsWith(lang));
    if (match) return match;
  }

  return enEspanol[0];
}

// Lee un texto en voz alta con la voz del compañero
export function hablar(texto, genero = 'male', { onStart, onEnd } = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Este navegador no soporta voz');
    onEnd?.();
    return;
  }

  // Cancelar cualquier lectura en curso (no encimar voces)
  window.speechSynthesis.cancel();

  // Limpiar el texto: sacar emojis para que no los "lea"
  const limpio = texto
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) { onEnd?.(); return; }

  const utter = new SpeechSynthesisUtterance(limpio);
  const voz = elegirMejorVoz(genero);
  if (voz) {
    utter.voice = voz;
    utter.lang = voz.lang;
  } else {
    utter.lang = 'es-AR';
  }

  // Ajustes para que suene cálido y entendible para adultos mayores
  utter.rate = 0.92;   // un poco más lento = más claro
  utter.pitch = genero === 'male' ? 0.95 : 1.05;
  utter.volume = 1.0;

  utter.onstart = () => onStart?.();
  utter.onend = () => onEnd?.();
  utter.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utter);
}

// Detener la lectura inmediatamente
export function callar() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ─────────────────────────────────────────────────────────
// 2. VOZ A TEXTO (el abuelo habla)
// ─────────────────────────────────────────────────────────

export function crearReconocedorVoz({ onResult, onError, onEnd } = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Este navegador no soporta reconocimiento de voz');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.continuous = false;       // una frase por vez (más simple para el abuelo)
  recognition.interimResults = false;   // solo el resultado final, sin parpadeos
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
// 3. DISPONIBILIDAD (para mostrar/ocultar botones)
// ─────────────────────────────────────────────────────────

export const vozDisponible = {
  hablar: typeof window !== 'undefined' && 'speechSynthesis' in window,
  escuchar: typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
};

// Carga las voces (en algunos navegadores tardan en estar listas)
export function precargarVoces(callback) {
  if (!('speechSynthesis' in window)) { callback?.(); return; }
  let voces = window.speechSynthesis.getVoices();
  if (voces.length) { callback?.(voces); return; }
  window.speechSynthesis.onvoiceschanged = () => {
    voces = window.speechSynthesis.getVoices();
    callback?.(voces);
  };
}
