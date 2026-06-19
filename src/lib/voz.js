// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE VOZ
// Voz PREMIUM con Google Cloud TTS (cálida y natural).
// Si Google falla, usa la voz del navegador como respaldo.
//
// CLAVE iOS/Safari: usamos UN SOLO reproductor <audio>
// reutilizable, "desbloqueado" en el primer toque del usuario.
//
// MICRÓFONO (el abuelo habla): grabamos el audio con getUserMedia
// + Web Audio y lo mandamos a Google Speech-to-Text (api/transcribir).
// Esto SÍ es confiable en iPhone (a diferencia de webkitSpeechRecognition).
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
    // Quitar risas escritas (jaja, jajaja, jeje, jiji, jojo, haha...)
    .replace(/\bja(?:ja)+j?a?\b/gi, '')
    .replace(/\bje(?:je)+\b/gi, '')
    .replace(/\bji(?:ji)+\b/gi, '')
    .replace(/\bjo(?:jo)+\b/gi, '')
    .replace(/\b(?:a?ha){2,}h?\b/gi, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,;])\s*\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) { onEnd?.(); return; }

  try {
    const resp = await fetch('/api/voz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: limpio, genero })
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.audio) {
        const audio = obtenerPlayer();
        audio.onplay = () => onStart?.();
        audio.onended = () => {
          // FIX iOS: al terminar, soltar el canal de audio
          try { audio.removeAttribute('src'); audio.load(); } catch {}
          onEnd?.();
        };
        audio.onerror = () => { onEnd?.(); };
        audio.volume = 1;
        audio.src = 'data:audio/mp3;base64,' + data.audio;
        try {
          await audio.play();
          return;
        } catch (e) {
          hablarNavegador(limpio, genero, { onStart, onEnd });
          return;
        }
      }
    }
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
  if (audioPlayer) {
    try {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      audioPlayer.removeAttribute('src');
      audioPlayer.load();
    } catch {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ═════════════════════════════════════════════════════════
// 4. EL ABUELO HABLA — grabación + Google Speech-to-Text
// (reemplaza al viejo webkitSpeechRecognition, frágil en iPhone)
// ═════════════════════════════════════════════════════════

// Contexto de audio reutilizable (iOS limita cuántos podés crear, así que
// usamos uno solo y lo suspendemos/reactivamos en cada grabación).
let ctxGrabacion = null;
function obtenerContextoGrabacion() {
  if (!ctxGrabacion || ctxGrabacion.state === 'closed') {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctxGrabacion = new AC();
  }
  return ctxGrabacion;
}

// Resamplea a 16000 Hz (lo óptimo para Google) con interpolación lineal.
function resamplearA16k(float32, sampleRateOrigen) {
  const destino = 16000;
  if (sampleRateOrigen === destino) return float32;
  const ratio = sampleRateOrigen / destino;
  const nuevoLargo = Math.round(float32.length / ratio);
  const salida = new Float32Array(nuevoLargo);
  for (let i = 0; i < nuevoLargo; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, float32.length - 1);
    const frac = pos - i0;
    salida[i] = float32[i0] * (1 - frac) + float32[i1] * frac;
  }
  return salida;
}

function floatAInt16(float32) {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    let s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

function int16ABase64(int16) {
  const bytes = new Uint8Array(int16.buffer);
  let binario = '';
  const tam = 0x8000;
  for (let i = 0; i < bytes.length; i += tam) {
    binario += String.fromCharCode.apply(null, bytes.subarray(i, i + tam));
  }
  return btoa(binario);
}

// Arranca a grabar. Detecta cuando el abuelo deja de hablar y manda solo.
// Devuelve un controlador con .detener() para cortar manualmente.
export async function iniciarGrabacion({ onResultado, onError, onFin } = {}) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    onError?.('sin-soporte');
    return null;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const nombre = err && err.name;
    if (nombre === 'NotAllowedError' || nombre === 'SecurityError') onError?.('not-allowed');
    else onError?.(nombre || 'error-microfono');
    return null;
  }

  const ctx = obtenerContextoGrabacion();
  // TRUCO iOS: reactivar el contexto (Apple lo suspende tras reproducir la voz de Pancho)
  try { if (ctx.state === 'suspended') await ctx.resume(); } catch {}

  const sampleRate = ctx.sampleRate;
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const silenciador = ctx.createGain();
  silenciador.gain.value = 0; // que el procesador corra sin que se escuche el micrófono

  const chunks = [];
  let grabando = true;
  let huboVoz = false;
  let ultimoConVoz = Date.now();
  const inicio = Date.now();

  const UMBRAL_VOZ = 0.012;     // por debajo de esto = silencio
  const SILENCIO_CORTE = 1500;  // ms de silencio (tras hablar) para mandar solo
  const MAX_GRABACION = 15000;  // ms tope duro
  const SIN_VOZ_TIMEOUT = 7000; // ms: si nunca habló, cortar sin mandar nada

  processor.onaudioprocess = (e) => {
    if (!grabando) return;
    const entrada = e.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(entrada)); // copia
  };

  source.connect(analyser);
  source.connect(processor);
  processor.connect(silenciador);
  silenciador.connect(ctx.destination);

  const datosVol = new Uint8Array(analyser.fftSize);

  const finalizar = async (mandar) => {
    if (!grabando) return;
    grabando = false;
    clearInterval(poller);

    // Soltar todo y APAGAR el micrófono físicamente (truco iOS)
    try { processor.disconnect(); } catch {}
    try { analyser.disconnect(); } catch {}
    try { source.disconnect(); } catch {}
    try { silenciador.disconnect(); } catch {}
    try { stream.getTracks().forEach(t => t.stop()); } catch {}
    try { if (ctx.state === 'running') ctx.suspend(); } catch {}

    if (!mandar || !huboVoz || chunks.length === 0) {
      onFin?.();
      return;
    }

    // Unir los pedacitos en un solo Float32Array
    let largo = 0;
    for (const c of chunks) largo += c.length;
    const todo = new Float32Array(largo);
    let off = 0;
    for (const c of chunks) { todo.set(c, off); off += c.length; }

    // Resamplear a 16k -> Int16 (LINEAR16) -> base64
    const a16 = resamplearA16k(todo, sampleRate);
    const int16 = floatAInt16(a16);
    const base64 = int16ABase64(int16);

    try {
      const resp = await fetch('/api/transcribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64, sampleRate: 16000 })
      });
      const data = await resp.json();
      const texto = (data && data.texto) ? data.texto.trim() : '';
      if (texto) onResultado?.(texto);
      else onFin?.();
    } catch (err) {
      console.warn('Error al transcribir:', err);
      onError?.('transcripcion');
    }
  };

  // Vigilar el volumen para cortar solo cuando deja de hablar
  const poller = setInterval(() => {
    if (!grabando) return;
    analyser.getByteTimeDomainData(datosVol);
    let suma = 0;
    for (let i = 0; i < datosVol.length; i++) {
      const v = (datosVol[i] - 128) / 128;
      suma += v * v;
    }
    const rms = Math.sqrt(suma / datosVol.length);
    const ahora = Date.now();

    if (rms > UMBRAL_VOZ) { huboVoz = true; ultimoConVoz = ahora; }

    if (ahora - inicio > MAX_GRABACION) { finalizar(true); return; }
    if (!huboVoz && ahora - inicio > SIN_VOZ_TIMEOUT) { finalizar(false); return; }
    if (huboVoz && ahora - ultimoConVoz > SILENCIO_CORTE) { finalizar(true); return; }
  }, 150);

  return {
    detener: () => finalizar(true)
  };
}

// ─────────────────────────────────────────────────────────
// 5. DISPONIBILIDAD
// ─────────────────────────────────────────────────────────
export const vozDisponible = {
  hablar: true,
  escuchar: typeof navigator !== 'undefined' &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
};
