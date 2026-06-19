import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ElderChat.css';
import { hablar, callar, iniciarGrabacion, vozDisponible, precargarVoces, desbloquearAudioiOS } from '../lib/voz';
import { obtenerOCrearAbuelo, cargarHistorial, guardarMensaje, getDeviceElderId } from '../lib/memoria';
import { avisarAFamilia, mensajeTranquilizador } from '../lib/aviso-familia';
import { obtenerEstadoPorElder } from '../lib/suscripcion';

// Imágenes reales de Pancho y Meli (están en la carpeta public)
const PANCHO_AVATAR = '/pancho.jpg';
const MELI_AVATAR = '/meli.jpg';

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
  useEffect(() => {
    if (!vozActivada || messages.length === 0) return;
    const ultimo = messages[messages.length - 1];
    if (ultimo.role === 'companion') {
      hablar(ultimo.text, companionGender, {
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
    const msg = mensajeTranquilizador(companionGender, elderName);
    const companionMsg = { id: Date.now(), role: 'companion', text: msg, time: now() };
    setMessages(prev => [...prev, companionMsg]);
    if (elderId) guardarMensaje(elderId, 'companion', msg);
  };

  // Cambiar entre Pancho y Meli
  const cambiarCompanero = async () => {
    const nuevoGender = companionGender === 'male' ? 'female' : 'male';
    const nuevoName = nuevoGender === 'male' ? 'Pancho' : 'Meli';

    setCompanionGender(nuevoGender);
    setCompanionName(nuevoName);

    if (elderId) {
      try {
        const { supabase } = await import('../lib/supabase');
        await supabase.from('elders').update({
          companion_name: nuevoName,
          companion_gender: nuevoGender
        }).eq('id', elderId);
      } catch {}
    }

    const transicion = nuevoGender === 'male'
      ? `¡Hola ${elderName}! Soy Pancho. Meli me dijo que estaban charlando, así que acá me sumo yo. ¿Cómo andás?`
      : `¡Hola ${elderName}! Soy Meli. Pancho me contó que estaban de charla, así que vine a hacerte compañía. ¿Cómo estás?`;

    const msg = { id: Date.now(), role: 'companion', text: transicion, time: now() };
    setMessages(prev => [...prev, msg]);
    if (elderId) guardarMensaje(elderId, 'companion', transicion);
  };

  // Juegos disponibles
  const games = [
    { id: 'trivia', emoji: '🌍', name: 'Trivia' },
    { id: 'refran', emoji: '📖', name: 'Refranes' },
    { id: 'palabra', emoji: '🧠', name: 'Palabras' },
    { id: 'vf', emoji: '🎭', name: '¿V o F?' },
    { id: 'cuentas', emoji: '🔢', name: 'Cuentas' },
    { id: 'historia', emoji: '📝', name: 'Contame' },
  ];

  const startGame = (gameId) => {
    const gameNames = {
      trivia: 'Trivia del Día',
      refran: 'Completá el Refrán',
      palabra: 'Palabra Encadenada',
      vf: '¿Verdadero o Falso?',
      cuentas: 'Cuentas Rápidas',
      historia: 'Contame una Historia'
    };
    setInput(`¡Quiero jugar a ${gameNames[gameId]}!`);
    setShowGames(false);
    setTimeout(() => handleSend(), 100);
  };

  // ─── PANTALLA BLOQUEADO (link ya usado en otro celular) ───
  if (bloqueado) {
    return (
      <div className="setup-screen">
        <div className="setup-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🔒</div>
          <h1 className="setup-title">Este acceso ya está en uso</h1>
          <p style={{ color: '#5E4F45', fontSize: '1.05rem', lineHeight: 1.6, margin: '12px 0' }}>
            Este enlace ya se está usando en otro celular. Cada cuenta de
            Pancho&Meli funciona en un solo teléfono.
          </p>
          <div style={{
            background: '#FFF8E1', border: '1px solid #EFE3C4', borderRadius: 14,
            padding: '1rem', fontSize: '0.95rem', color: '#7a5a2a', lineHeight: 1.5, marginTop: 8
          }}>
            Si cambiaste de teléfono, pedile a tu familiar que te genere un acceso nuevo. 💛
          </div>
        </div>
      </div>
    );
  }

  // ─── PANTALLA DE SETUP ───
  if (!isSetup) {
    return (
      <div className="setup-screen">
        <div className="setup-card animate-slide">
          <div className="setup-avatars">
            <img className="setup-avatar-img" src="/pancho.jpg" alt="Pancho" />
            <span className="setup-ampersand">&</span>
            <img className="setup-avatar-img" src="/meli.jpg" alt="Meli" />
          </div>
          <h1 className="setup-title">Pancho&Meli</h1>
          <p className="setup-subtitle">Tu compañero/a de charlas de todos los días</p>

          <form onSubmit={handleSetup} className="setup-form">
            <label className="setup-label">¿Cómo te llamás?</label>
            <input
              type="text"
              className="input-elder"
              placeholder="Tu nombre..."
              value={elderName}
              onChange={(e) => setElderName(e.target.value)}
              autoFocus
            />

            <label className="setup-label mt-3">¿Con quién querés charlar?</label>
            <div className="companion-choice">
              <button
                type="button"
                className={`companion-option ${companionGender === 'male' ? 'active' : ''}`}
                onClick={() => { setCompanionGender('male'); setCompanionName('Pancho'); }}
              >
                <img className="companion-option-img" src="/pancho.jpg" alt="Pancho" />
                <span className="companion-option-name">Pancho</span>
              </button>
              <button
                type="button"
                className={`companion-option ${companionGender === 'female' ? 'active' : ''}`}
                onClick={() => { setCompanionGender('female'); setCompanionName('Meli'); }}
              >
                <img className="companion-option-img" src="/meli.jpg" alt="Meli" />
                <span className="companion-option-name">Meli</span>
              </button>
            </div>

            <button type="submit" className="btn btn-primary setup-btn mt-4">
              ¡Empezar a charlar! 💬
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── PANTALLA DE CHAT ───
  return (
    <div className="chat-screen">
      {/* Header */}
      <header className="chat-header">
        <div className={`chat-header-avatar ${hablando ? 'hablando' : ''}`}><img src={avatar} alt={companionName} /></div>
        <div className="chat-header-info">
          <h1 className="chat-header-name">{companionName}</h1>
          <span className="chat-header-status">
            {isTyping ? 'Escribiendo...' : hablando ? '🔊 Hablando...' : 'En línea'}
          </span>
        </div>
        {vozDisponible.hablar && (
          <button
            className="chat-header-voice"
            onClick={toggleVoz}
            title={vozActivada ? 'Silenciar voz' : 'Activar voz'}
          >
            {vozActivada ? '🔊' : '🔇'}
          </button>
        )}
        <button
          className="chat-header-games"
          onClick={() => setShowGames(!showGames)}
          title="Juegos"
        >
          🎮
        </button>
        <button
          className="chat-header-sos"
          onClick={() => setMostrarAviso(true)}
          title="Avisar a mi familia"
        >
          🆘
        </button>
      </header>

      {/* Barra para cambiar de compañero */}
      <button
        onClick={cambiarCompanero}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, width: '100%', border: 'none', cursor: 'pointer',
          background: '#FFF8E1', borderBottom: '1px solid #EFE3C4',
          padding: '11px 16px', fontFamily: 'inherit'
        }}
      >
        <span style={{ fontSize: 15, color: '#5E4F45' }}>
          Estás charlando con <b style={{ color: '#075E54' }}>{companionName}</b>
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#C25E3C' }}>
          · Tocá para cambiar a {companionGender === 'male' ? 'Meli' : 'Pancho'} 🔄
        </span>
      </button>

      {/* Banner de trial */}
      {suscripcion && suscripcion.estado === 'trial' && suscripcion.diasRestantes <= 3 && suscripcion.diasRestantes > 0 && (
        <div className="trial-banner">
          ⏰ Te quedan {suscripcion.diasRestantes} {suscripcion.diasRestantes === 1 ? 'día' : 'días'} de prueba gratis
        </div>
      )}

      {/* Suscripción vencida */}
      {suscripcion && suscripcion.estado === 'vencida' && (
        <div className="trial-vencido-overlay">
          <div className="trial-vencido-card">
            <div className="trial-vencido-emoji">💛</div>
            <h2 className="trial-vencido-titulo">Tu prueba terminó</h2>
            <p className="trial-vencido-texto">
              Esperamos que hayas disfrutado las charlas con {companionName}.
              Para seguir charlando, pedile a tu familiar que entre a la app
              y active la suscripción.
            </p>
            <p className="trial-vencido-precio">ARS $13.500 / mes</p>
            <a href="/suscribir" style={{
              display: 'inline-block', marginTop: '1rem', padding: '0.9rem 1.8rem',
              background: '#075E54', color: '#fff', borderRadius: 14,
              fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none'
            }}>
              Activar suscripción
            </a>
          </div>
        </div>
      )}

      {/* Modal de aviso a la familia */}
      {mostrarAviso && (
        <div className="aviso-overlay" onClick={() => setMostrarAviso(false)}>
          <div className="aviso-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aviso-emoji">💛</div>
            <h2 className="aviso-titulo">¿Avisamos a tu familia?</h2>
            <p className="aviso-texto">
              Si no te sentís bien, le aviso a tu familia para que se comuniquen con vos.
              No estás solo/a.
            </p>
            <button className="aviso-btn-si" onClick={confirmarAviso}>
              Sí, avisá a mi familia
            </button>
            <button className="aviso-btn-no" onClick={() => setMostrarAviso(false)}>
              No, estoy bien
            </button>
          </div>
        </div>
      )}

      {/* Panel de juegos */}
      {showGames && (
        <div className="games-panel animate-slide">
          <p className="games-title">¿A qué jugamos hoy? 🎲</p>
          <div className="games-grid">
            {games.map(g => (
              <button
                key={g.id}
                className="game-btn"
                onClick={() => startGame(g.id)}
              >
                <span className="game-btn-emoji">{g.emoji}</span>
                <span className="game-btn-name">{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensajes */}
      <main className="chat-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-bubble ${msg.role === 'companion' ? 'companion' : 'elder'} animate-fade`}
          >
            {msg.role === 'companion' && (
              <div className="chat-bubble-avatar"><img src={avatar} alt={companionName} /></div>
            )}
            <div className="chat-bubble-content">
              <p className="chat-bubble-text">{msg.text}</p>
              <span className="chat-bubble-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble companion escribiendo animate-fade">
            <div className="chat-bubble-avatar"><img src={avatar} alt={companionName} /></div>
            <div className="chat-bubble-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="chat-input-bar">
        {vozDisponible.escuchar && (
          <button
            className={`chat-mic-btn ${escuchando ? 'escuchando' : ''}`}
            onClick={escucharAlAbuelo}
            title={escuchando ? 'Escuchando... tocá para parar' : 'Hablar'}
            disabled={isTyping}
          >
            {escuchando ? '🔴' : '🎤'}
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={escuchando ? 'Te escucho...' : `Escribile a ${companionName}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          ➤
        </button>
      </footer>
    </div>
  );
}
