// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE VOZ
// Voz PREMIUM con Google Cloud TTS (cálida y natural).
// Si Google falla, usa la voz del navegador como respaldo.
//
// CLAVE iOS/Safari: usamos UN SOLO reproductor <audio>
// reutilizable, "desbloqueado" en el primer toque del
// usuario. Así Pancho/Meli suenan aunque la respuesta de
// la IA tarde varios segundos (Safari ya autorizó el audio).
//
// FIX MICRÓFONO iOS: al terminar (o cortar) la voz, VACIAMOS
// el reproductor (src vacío + load) para soltar el canal de
// audio. Si no, el micrófono queda "tomado" y nace sordo.
// ═══════════════════════════════════════════════════════

let audioPlayer = null;        // ÚNICO <audio> reutilizable (clave para iOS)
let audioDesbloqueado = false; // true después del primer toque del usuario

// Cache de voces del navegador (respaldo)
let vocesCache = [];
let vocesListas = false;

const esSafariiOS = typeof navigator !== 'undefined' && (
  /iP(hone|od|ad)/.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
);

// MP3 silencioso (sirve para desbloquear el canal de audio en iOS)
const SILENCIO_MP3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

// ─────────────────────────────────────────────────────────
// Obtener (o crear) el único reproductor de audio
// ─────────────────────────────────────────────────────────
function obtenerPlayer() {
  if (!audioPlayer) {
    audioPlayer = new Audio();
    audioPlayer.preload = 'auto';
  }
  return audioPlayer;
}

// ─────────────────────────────────────────────────────────
// 0. DESBLOQUEAR AUDIO EN SAFARI iOS
// Llamar UNA VEZ en el primer toque del usuario.
// Reproduce un sonido silencioso en el reproductor único,
// lo que "bendice" ese reproductor para toda la sesión.
// ─────────────────────────────────────────────────────────
export function desbloquearAudioiOS() {
  if (audioDesbloqueado) return;
  try {
    const a = obtenerPlayer();
    a.src = SILENCIO_MP3;
    a.volume = 0;
    const p = a.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        try { a.pause(); a.currentTime = 0; a.volume = 1; } catch {}
      }).catch(() => {});
    }
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
// Reusa SIEMPRE el mismo reproductor (clave para iOS).
// ─────────────────────────────────────────────────────────
export async function hablar(texto, genero = 'male', { onStart, onEnd } = {}) {
  // Cortar lo que esté sonando
  callar();

  const limpio = (texto || '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\*\*/g, '')
    // Barras de género: "solo/a" -> "solo", "niño/a" -> "niño", "todos/as" -> "todos"
    .replace(/([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\/(?:as|os|es|a|o|e)\b/gi, '$1')
    // Otras barras entre palabras: "él/ella" -> "él o ella"
    .replace(/([A-Za-zÁÉÍÓÚáéíóúñÑ])\/([A-Za-zÁÉÍÓÚáéíóúñÑ])/g, '$1 o $2')
    // Cualquier barra suelta que quede (fechas, etc.) -> espacio (nunca "barra")
    .replace(/\//g, ' ')
    // Quitar risas escritas (jaja, jajaja, jeje, jiji, jojo, haha...) — leídas por la voz suenan robóticas
    .replace(/\bja(?:ja)+j?a?\b/gi, '')
    .replace(/\bje(?:je)+\b/gi, '')
    .replace(/\bji(?:ji)+\b/gi, '')
    .replace(/\bjo(?:jo)+\b/gi, '')
    .replace(/\b(?:a?ha){2,}h?\b/gi, '')
    // Limpiar puntuación que quedó suelta al sacar la risa
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,;])\s*\1+/g, '$1')
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
        const audio = obtenerPlayer(); // REUSA el reproductor desbloqueado
        audio.onplay = () => onStart?.();
        audio.onended = () => {
          // FIX iOS: al terminar, soltar el canal de audio para que el micrófono lo recupere
          try { audio.removeAttribute('src'); audio.load(); } catch {}
          onEnd?.();
        };
        audio.onerror = () => { onEnd?.(); };
        audio.volume = 1;
        audio.src = 'data:audio/mp3;base64,' + data.audio;
        try {
          await audio.play();
          return; // ¡listo, sonó la voz premium!
        } catch (e) {
          // Si iOS todavía lo bloquea, caemos al respaldo del navegador
          hablarNavegador(limpio, genero, { onStart, onEnd });
          return;
        }
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
// FIX iOS: además de pausar, VACIAMOS el reproductor para
// soltar el canal de audio (si no, el micrófono nace sordo).
// ─────────────────────────────────────────────────────────
export function callar() {
  if (audioPlayer) {
    try {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      // iOS: liberar el canal de reproducción para que el micrófono lo pueda tomar de nuevo
      audioPlayer.removeAttribute('src');
      audioPlayer.load();
    } catch {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
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
  recognition.onresult = (event) => onResult?.(event.results[0][0].transcript);
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = () => onEnd?.();
  return recognition;
}

// ─────────────────────────────────────────────────────────
// 4b. DETENER ESCUCHA — apaga el micrófono del todo
// Importante en iOS: corta el reconocimiento y libera el
// micrófono (para que NO quede el puntito naranja prendido).
// ─────────────────────────────────────────────────────────
export function detenerEscucha(rec) {
  if (!rec) return;
  try { rec.onresult = null; } catch {}
  try { rec.onerror = null; } catch {}
  try { rec.onend = null; } catch {}
  try { rec.abort(); } catch {}
  try { rec.stop(); } catch {}
}

// ─────────────────────────────────────────────────────────
// 5. DISPONIBILIDAD
// ─────────────────────────────────────────────────────────
export const vozDisponible = {
  hablar: true, // siempre, porque la voz premium funciona en todos lados
  escuchar: typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
};
