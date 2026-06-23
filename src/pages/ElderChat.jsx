import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ElderChat.css';
import { hablar, callar, iniciarGrabacion, vozDisponible, precargarVoces, desbloquearAudioiOS } from '../lib/voz';
import { obtenerOCrearAbuelo, cargarHistorial, guardarMensaje, getDeviceElderId } from '../lib/memoria';
import { avisarAFamilia, mensajeTranquilizador } from '../lib/aviso-familia';
import { obtenerEstadoPorElder } from '../lib/suscripcion';

// Imágenes reales de Pancho y Meli (están en la carpeta public)
const PANCHO_AVATAR = '/panchoarg2.jpg';
const MELI_AVATAR = '/meliarg.jpg';

// ───────────────────────────────────────────
// ETIQUETAS INVISIBLES (música y viaje)
// Pancho/Meli mandan [MUSICA: Artista - Canción] o [VIAJE: lugar].
// Acá las sacamos del texto y las convertimos en reproductor/botón.
// ───────────────────────────────────────────
function parseMensaje(texto) {
  let limpio = texto || '';
  let musica = null;
  let viaje = null;

  const mMus = limpio.match(/\[MUSICA:\s*([^\]]+)\]/i);
  if (mMus) musica = mMus[1].trim();

  const mVia = limpio.match(/\[VIAJE:\s*([^\]]+)\]/i);
  if (mVia) viaje = mVia[1].trim();

  limpio = limpio
    .replace(/\[MUSICA:\s*[^\]]+\]/gi, '')
    .replace(/\[VIAJE:\s*[^\]]+\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { limpio, musica, viaje };
}

// Reproductor de YouTube embebido en el chat
function ReproductorMusica({ query }) {
  const [videoId, setVideoId] = useState(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const resp = await fetch('/api/buscar-musica', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await resp.json();
        if (!activo) return;
        if (data && data.videoId) { setVideoId(data.videoId); setEstado('listo'); }
        else setEstado('error');
      } catch {
        if (activo) setEstado('error');
      }
    })();
    return () => { activo = false; };
  }, [query]);

  if (estado === 'cargando') {
    return (
      <div style={{
        marginTop: 8, padding: '12px 16px', borderRadius: 14,
        background: '#FFF8E1', border: '1px solid #EFE3C4',
        color: '#7a5a2a', fontSize: 15
      }}>
        🎵 Buscando la canción...
      </div>
    );
  }

  if (estado === 'error' || !videoId) {
    return (
      
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 8, padding: '14px 18px', borderRadius: 14,
          background: '#C25E3C', color: '#fff', fontSize: 16, fontWeight: 700,
          textDecoration: 'none'
        }}
      >
        🎵 Escuchar "{query}" en YouTube
      </a>
    );
  }

  return (
    <div style={{
      marginTop: 8, borderRadius: 14, overflow: 'hidden',
      border: '1px solid #EFE3C4', background: '#000'
    }}>
      <iframe
        width="100%"
        height="200"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={query}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: 'block', border: 'none' }}
      ></iframe>
    </div>
  );
}

// Viaje: vista aérea satelital que se carga SOLA dentro del chat.
// Sin botón externo a Google Earth: queremos cero fricción para el abuelo.
function BotonViaje({ lugar }) {
  // Embed legado de Google Maps: NO necesita API key, satelital (t=k), se carga solo.
  const mapaUrl = `https://maps.google.com/maps?q=${encodeURIComponent(lugar)}&t=k&z=13&output=embed`;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 16px', borderRadius: '14px 14px 0 0',
        background: '#075E54', color: '#fff', fontSize: 16, fontWeight: 700
      }}>
        🌎 Estás paseando por {lugar}
      </div>
      <div style={{
        borderRadius: '0 0 14px 14px', overflow: 'hidden',
        border: '1px solid #EFE3C4', borderTop: 'none', background: '#000'
      }}>
        <iframe
          title={`Vista aérea de ${lugar}`}
          width="100%"
          height="240"
          frameBorder="0"
          style={{ display: 'block', border: 'none' }}
          src={mapaUrl}
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// BLOQUE B — Huella única de este celular.
// ───────────────────────────────────────────
function obtenerDeviceId() {
  try {
    let id = localStorage.getItem('pancho_meli_device_id');
    if (!id) {
      id = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      localStorage.setItem('pancho_meli_device_id', id);
    }
    return id;
  } catch {
    return null;
  }
}

export default function ElderChat() {
  const { elderId: slugParam } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [companionName, setCompanionName] = useState('Pancho');
  const [companionGender, setCompanionGender] = useState('male');
  const [elderName, setElderName] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [elderId, setElderId] = useState(null);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [suscripcion, setSuscripcion] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  // ── Voz ──
  const [vozActivada, setVozActivada] = useState(true);
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const grabadorRef = useRef(null); // controlador de la grabación en curso
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const avatar = companionGender === 'male' ? PANCHO_AVATAR : MELI_AVATAR;

  // Precargar voces del navegador al montar
  useEffect(() => { precargarVoces(); }, []);

  // ── DESBLOQUEAR AUDIO en el primer toque del usuario (clave para iOS/Safari) ──
  useEffect(() => {
    const desbloquear = () => desbloquearAudioiOS();
    document.addEventListener('touchend', desbloquear, { once: true });
    document.addEventListener('click', desbloquear, { once: true });
    return () => {
      document.removeEventListener('touchend', desbloquear);
      document.removeEventListener('click', desbloquear);
    };
  }, []);

  // ── APAGAR EL MICRÓFONO al salir del chat o minimizar la app ──
  useEffect(() => {
    const apagarTodo = () => {
      if (grabadorRef.current) {
        try { grabadorRef.current.detener(); } catch {}
        grabadorRef.current = null;
      }
      setEscuchando(false);
      callar();
    };
    const onVisibilidad = () => { if (document.hidden) apagarTodo(); };
    document.addEventListener('visibilitychange', onVisibilidad);
    window.addEventListener('pagehide', apagarTodo);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilidad);
      window.removeEventListener('pagehide', apagarTodo);
      apagarTodo();
    };
  }, []);

  // Al abrir: si viene por link del familiar (slug) o si ya tiene sesión en el dispositivo
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');

        if (slugParam && slugParam !== 'demo') {
          const { data } = await supabase.from('elders').select('*').eq('slug', slugParam).single();
          if (data) {
            const deviceId = obtenerDeviceId();
            if (deviceId) {
              if (!data.device_id) {
                try {
                  await supabase.from('elders').update({ device_id: deviceId }).eq('id', data.id);
                } catch {}
              } else if (data.device_id !== deviceId) {
                setBloqueado(true);
                return;
              }
            }

            setElderId(data.id);
            setElderName(data.nombre);
            setCompanionName(data.companion_name || 'Pancho');
            setCompanionGender(data.companion_gender || 'male');
            obtenerEstadoPorElder(data.id).then(s => setSuscripcion(s));
            try { localStorage.setItem('pancho_meli_elder_id', data.id); } catch {}
            const hist = await cargarHistorial(data.id);
            if (hist.length > 0) {
              setMessages(hist);
            } else {
              const g = (data.companion_gender || 'male') === 'male'
                ? `¡Hola ${data.nombre}! Soy Pancho, tu compañero de charlas. ¡Qué bueno conocerte! 😄 ¿Cómo andás?`
                : `¡Hola ${data.nombre}! Soy Meli, tu compañera de charlas. ¡Qué alegría conocerte! 😊 ¿Cómo estás?`;
              setMessages([{ id: 1, role: 'companion', text: g, time: now() }]);
              guardarMensaje(data.id, 'companion', g);
            }
            setIsSetup(true);
            return;
          }
        }

        const idGuardado = getDeviceElderId();
        if (!idGuardado) return;
        const { data } = await supabase.from('elders').select('*').eq('id', idGuardado).single();
        if (data) {
          const deviceId = obtenerDeviceId();
          if (deviceId && data.device_id && data.device_id !== deviceId) {
            setBloqueado(true);
            return;
          }

          setElderId(data.id);
          setElderName(data.nombre);
          setCompanionName(data.companion_name || 'Pancho');
          setCompanionGender(data.companion_gender || 'male');
          obtenerEstadoPorElder(data.id).then(s => setSuscripcion(s));
          const hist = await cargarHistorial(data.id);
          if (hist.length > 0) {
            setMessages(hist);
          } else {
            const g = (data.companion_gender || 'male') === 'male'
              ? `¡Hola de nuevo ${data.nombre}! Soy Pancho. ¡Qué bueno verte otra vez! ¿Cómo venís? 😄`
              : `¡Hola de nuevo ${data.nombre}! Soy Meli. ¡Qué alegría que volviste! ¿Cómo andás? 😊`;
            setMessages([{ id: 1, role: 'companion', text: g, time: now() }]);
          }
          setIsSetup(true);
        }
      } catch {
        // si falla, dejamos el setup normal
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Cuando llega un mensaje nuevo del compañero y la voz está activada, leerlo
  // (sacamos las etiquetas invisibles antes de que la voz lo lea)
  useEffect(() => {
    if (!vozActivada || messages.length === 0) return;
    const ultimo = messages[messages.length - 1];
    if (ultimo.role === 'companion') {
      const { limpio } = parseMensaje(ultimo.text);
      hablar(limpio, companionGender, {
        onStart: () => setHablando(true),
        onEnd: () => setHablando(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Silenciar/activar voz
  const toggleVoz = () => {
    if (vozActivada) { callar(); setHablando(false); }
    setVozActivada(!vozActivada);
  };

  // El abuelo habla (voz a texto) — graba y manda a Google al quedarse callado
  const escucharAlAbuelo = async () => {
    // Toque del usuario: desbloquear audio (clave iOS)
    desbloquearAudioiOS();

    // Si ya está grabando, cortar y mandar lo que haya
    if (escuchando) {
      if (grabadorRef.current) {
        grabadorRef.current.detener();
        grabadorRef.current = null;
      }
      return;
    }

    // Cortar la voz de Pancho si está sonando (libera el canal de audio)
    callar();
    setHablando(false);
    setEscuchando(true);

    const grabador = await iniciarGrabacion({
      onResultado: (texto) => {
        grabadorRef.current = null;
        setEscuchando(false);
        handleSendText(texto);
      },
      onError: (err) => {
        grabadorRef.current = null;
        setEscuchando(false);
        if (err === 'not-allowed') {
          alert('Para usar el micrófono, permití el acceso cuando el navegador te lo pida.');
        } else if (err === 'sin-soporte') {
          alert('Tu navegador no soporta el micrófono. Probá actualizando Safari o con Chrome.');
        }
      },
      onFin: () => {
        grabadorRef.current = null;
        setEscuchando(false);
      }
    });

    if (grabador) {
      grabadorRef.current = grabador;
    } else {
      setEscuchando(false);
    }
  };

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup: crea el abuelo en Supabase y arranca la charla
  const handleSetup = async (e) => {
    e.preventDefault();
    if (!elderName.trim()) return;
    desbloquearAudioiOS();
    setIsSetup(true);

    const abuelo = await obtenerOCrearAbuelo({
      nombre: elderName.trim(),
      companionName,
      companionGender
    });
    if (abuelo) setElderId(abuelo.id);

    const greeting = companionGender === 'male'
      ? `¡Hola ${elderName}! Soy Pancho, tu nuevo compañero de charlas. Me dijeron que te gusta conversar, ¡así que ya tenemos tema para rato! 😄 ¿Cómo andás hoy?`
      : `¡Hola ${elderName}! Soy Meli, tu nueva compañera de charlas. Me contaron que sos una persona muy interesante, ¡así que acá estoy para conocerte! 😊 ¿Cómo estás hoy?`;

    setMessages([{ id: 1, role: 'companion', text: greeting, time: now() }]);

    if (abuelo) guardarMensaje(abuelo.id, 'companion', greeting);
  };

  // Enviar mensaje (desde el input de texto)
  const handleSend = () => handleSendText(input);

  // Enviar un texto (sirve tanto para tipeo como para voz)
  const handleSendText = async (rawText) => {
    desbloquearAudioiOS();
    const text = (rawText || '').trim();
    if (!text || isTyping) return;
    if (suscripcion && !suscripcion.activa) return;

    const userMsg = {
      id: Date.now(),
      role: 'elder',
      text,
      time: now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowGames(false);

    if (elderId) guardarMensaje(elderId, 'elder', text);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          elderName,
          companionName,
          companionGender,
          history: messages.slice(-20).map(m => ({
            role: m.role === 'elder' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });

      const data = await response.json();
      const replyText = data.reply || '¡Uy, me trabé un momento! ¿Me repetís eso?';

      const companionMsg = {
        id: Date.now() + 1,
        role: 'companion',
        text: replyText,
        time: now()
      };

      setMessages(prev => [...prev, companionMsg]);

      if (elderId) guardarMensaje(elderId, 'companion', replyText);
    } catch (err) {
      console.error('Error al chatear:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'companion',
        text: '¡Uy, parece que me quedé sin señal un momento! ¿Me escribís de nuevo? 😊',
        time: now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // El abuelo confirma que quiere avisar a su familia
  const confirmarAviso = async () => {
    setMostrarAviso(false);
    await avisarAFamilia(elderId, elderName, 'El abuelo avisó que no se siente bien');
