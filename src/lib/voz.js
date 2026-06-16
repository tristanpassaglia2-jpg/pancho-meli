// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE VOZ
// Voz PREMIUM con Google Cloud TTS (cálida y natural).
// Si Google falla, usa la voz del navegador como respaldo.
// Reproduce con <audio>, que SÍ funciona en Safari iOS.
// ═══════════════════════════════════════════════════════

let audioActual = null;        // el <audio> que está sonando ahora
let audioDesbloqueado = false; // para Safari iOS

// Cache de voces del navegador (respaldo)
let vocesCache = [];
let vocesListas = false;

const esSafariiOS = typeof navigator !== 'undefined' && (
  /iP(hone|od|ad)/.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
);

// ─────────────────────────────────────────────────────────
// 0. DESBLOQUEAR AUDIO EN SAFARI iOS
// Llamar UNA VEZ en el primer toque del usuario.
// ─────────────────────────────────────────────────────────
export function desbloquearAudioiOS() {
  if (audioDesbloqueado) return;
  try {
    // Crear y reproducir un audio silencioso desbloquea el canal en iOS
    const a = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    a.volume = 0;
    a.play().catch(() => {});
    audioDesbloqueado = true;
  } catch {}
}

// ─────────────────────────────────────────────────────────
// 1. PRECARGAR VOCES DEL NAVEGADOR (respaldo)
// ─────────────────────────────────────────────────────────
export function precargarVoces(callback) {
  if (!('speechSynthesis' in window)) { callback?.(); return; }
  const cargar = () => {
    vocesCache = window.speechSynthesis.getVoices();
    vocesListas = vocesCache.length > 0;
    callback?.(vocesCache);
  };
  cargar();
  if (!vocesListas) window.speechSynthesis.onvoiceschanged = cargar;
}

// ─────────────────────────────────────────────────────────
// 2. HABLAR — voz premium de Google, con respaldo al navegador
// ─────────────────────────────────────────────────────────
export async function hablar(texto, genero = 'male', { onStart, onEnd } = {}) {
  // Cortar lo que esté sonando
  callar();

  const limpio = (texto || '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) { onEnd?.(); return; }

  try {
    // 1) Pedir la voz premium a nuestro backend (Google TTS)
    const resp = await fetch('/api/voz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: limpio, genero })
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.audio) {
        const audio = new Audio('data:audio/mp3;base64,' + data.audio);
        audioActual = audio;
        audio.onplay = () => onStart?.();
        audio.onended = () => { onEnd?.(); audioActual = null; };
        audio.onerror = () => { onEnd?.(); audioActual = null; };
        await audio.play();
        return; // ¡listo, sonó la voz premium!
      }
    }
    // Si llegamos acá, Google falló → respaldo
    hablarNavegador(limpio, genero, { onStart, onEnd });
  } catch (err) {
    console.warn('Voz premium falló, uso respaldo del navegador:', err);
    hablarNavegador(limpio, genero, { onStart, onEnd });
  }
}

// ─────────────────────────────────────────────────────────
// 2b. RESPALDO: voz del navegador (gratis, robótica)
// ─────────────────────────────────────────────────────────
function hablarNavegador(texto, genero, { onStart, onEnd } = {}) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();

  const decir = () => {
    const utter = new SpeechSynthesisUtterance(texto);
    const voz = elegirMejorVoz(genero);
    if (voz) { utter.voice = voz; utter.lang = voz.lang; } else { utter.lang = 'es-AR'; }
    utter.rate = 0.9;
    utter.pitch = genero === 'male' ? 0.95 : 1.05;
    utter.volume = 1.0;
    utter.onstart = () => onStart?.();
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
  };

  if (esSafariiOS) decir();
  else setTimeout(decir, 80);
}

function elegirMejorVoz(genero = 'male') {
  if (!('speechSynthesis' in window)) return null;
  if (!vocesListas) {
    vocesCache = window.speechSynthesis.getVoices();
    vocesListas = vocesCache.length > 0;
  }
  if (!vocesCache.length) return null;
  const es = vocesCache.filter(v => v.lang.toLowerCase().startsWith('es'));
  if (!es.length) return vocesCache[0];
  const prio = ['es-ar', 'es-mx', 'es-us', 'es-419', 'es-es', 'es'];
  const fem = ['mónica', 'monica', 'paulina', 'female', 'helena', 'laura'];
  const masc = ['jorge', 'diego', 'male', 'carlos', 'enrique'];
  const pistas = genero === 'male' ? masc : fem;
  for (const lang of prio) {
    const m = es.find(v => v.lang.toLowerCase().startsWith(lang) &&
      pistas.some(p => v.name.toLowerCase().includes(p)));
    if (m) return m;
  }
  const prem = es.find(v => /google|microsoft|natural|premium|enhanced/i.test(v.name));
  if (prem) return prem;
  for (const lang of prio) {
    const m = es.find(v => v.lang.toLowerCase().startsWith(lang));
    if (m) return m;
  }
  return es[0];
}

// ─────────────────────────────────────────────────────────
// 3. CALLAR — detener cualquier voz que esté sonando
// ─────────────────────────────────────────────────────────
export function callar() {
  if (audioActual) {
    try { audioActual.pause(); audioActual.currentTime = 0; } catch {}
    audioActual = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ─────────────────────────────────────────────────────────
// 4. VOZ A TEXTO (el abuelo habla) — sin cambios
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
  recognition.onresult = (event) => onResult?.(event.results[0][0].transcript);
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = () => onEnd?.();
  return recognition;
}

// ─────────────────────────────────────────────────────────
// 5. DISPONIBILIDAD
// ─────────────────────────────────────────────────────────
export const vozDisponible = {
  hablar: true, // siempre, porque la voz premium funciona en todos lados
  escuchar: typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
};
