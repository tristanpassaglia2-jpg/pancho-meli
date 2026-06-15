// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE VOZ (versión robusta + Safari iOS)
// Usa la Web Speech API (gratis, integrada en el navegador).
//   - Texto a voz: Pancho/Meli leen sus mensajes en voz alta
//   - Voz a texto: el abuelo habla en vez de tipear
// ═══════════════════════════════════════════════════════

// Cache de voces (se cargan una sola vez)
let vocesCache = [];
let vocesListas = false;
let audioDesbloqueado = false;

// Detectar si es Safari en iOS
const esSafariiOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

// ─────────────────────────────────────────────────────────
// 0. DESBLOQUEAR AUDIO EN SAFARI iOS
// Llamar UNA VEZ en el primer toque del usuario.
// ─────────────────────────────────────────────────────────
export function desbloquearAudioiOS() {
  if (audioDesbloqueado) return;
  if (!('speechSynthesis' in window)) return;

  const silencio = new SpeechSynthesisUtterance(' ');
  silencio.volume = 0;
  silencio.rate = 1;
  silencio.pitch = 1;
  silencio.lang = 'es-AR';
  window.speechSynthesis.speak(silencio);

  audioDesbloqueado = true;
  console.log('Audio desbloqueado para Safari iOS');
}

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
// ─────────────────────────────────────────────────────────
export function hablar(texto, genero = 'male', { onStart, onEnd } = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Este navegador no soporta voz');
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const limpio = texto
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) { onEnd?.(); return; }

  const ejecutarHabla = () => {
    // Safari iOS: dividir en oraciones cortas (Safari corta en ~200 chars)
    const fragmentos = esSafariiOS
      ? limpio.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [limpio]
      : [limpio];

    let indice = 0;

    const hablarFragmento = () => {
      if (indice >= fragmentos.length) {
        onEnd?.();
        return;
      }

      const frag = fragmentos[indice].trim();
      if (!frag) { indice++; hablarFragmento(); return; }

      const utter = new SpeechSynthesisUtterance(frag);
      const voz = elegirMejorVoz(genero);
      if (voz) {
        utter.voice = voz;
        utter.lang = voz.lang;
      } else {
        utter.lang = 'es-AR';
      }

      utter.rate = 0.88;
      utter.pitch = genero === 'male' ? 0.92 : 1.05;
      utter.volume = 1.0;

      utter.onstart = () => {
        if (indice === 0) onStart?.();
      };

      utter.onend = () => {
        indice++;
        hablarFragmento();
      };

      utter.onerror = (e) => {
        console.warn('Error de voz:', e);
        indice++;
        hablarFragmento();
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utter);
    };

    hablarFragmento();

    // Workaround Chrome: resume periódico (NO en Safari)
    if (!esSafariiOS) {
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(keepAlive);
          return;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
    }
  };

  // Chrome necesita pausa post-cancel, Safari NO
  if (esSafariiOS) {
    ejecutarHabla();
  } else {
    setTimeout(ejecutarHabla, 100);
  }
}

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
// 5. DISPONIBILIDAD
// ─────────────────────────────────────────────────────────
export const vozDisponible = {
  hablar: typeof window !== 'undefined' && 'speechSynthesis' in window,
  escuchar: typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
};
