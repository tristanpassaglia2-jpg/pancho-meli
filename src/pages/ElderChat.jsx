import React, { useState, useRef, useEffect } from 'react';
import './ElderChat.css';
import { hablar, callar, crearReconocedorVoz, vozDisponible, precargarVoces } from '../lib/voz';
import { obtenerOCrearAbuelo, cargarHistorial, guardarMensaje, getDeviceElderId } from '../lib/memoria';

// Placeholder avatar hasta que tengamos los de Higgsfield
const PANCHO_AVATAR = '👴';
const MELI_AVATAR = '👵';

export default function ElderChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [companionName, setCompanionName] = useState('Pancho');
  const [companionGender, setCompanionGender] = useState('male');
  const [elderName, setElderName] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [elderId, setElderId] = useState(null); // id del abuelo en Supabase (memoria)
  // ── Voz ──
  const [vozActivada, setVozActivada] = useState(true); // por defecto activada (accesibilidad)
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const reconocedorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const avatar = companionGender === 'male' ? PANCHO_AVATAR : MELI_AVATAR;

  // Precargar voces del navegador al montar
  useEffect(() => { precargarVoces(); }, []);

  // Al abrir: si este dispositivo ya tiene un abuelo guardado, lo reconocemos
  // y entramos directo al chat con su historial (Pancho lo recuerda).
  useEffect(() => {
    const idGuardado = getDeviceElderId();
    if (!idGuardado) return; // abuelo nuevo, mostramos setup normal

    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data } = await supabase.from('elders').select('*').eq('id', idGuardado).single();
        if (data) {
          // Recuperamos su configuración
          setElderId(data.id);
          setElderName(data.nombre);
          setCompanionName(data.companion_name || 'Pancho');
          setCompanionGender(data.companion_gender || 'male');
          // Cargamos el historial de charlas
          const hist = await cargarHistorial(data.id);
          if (hist.length > 0) {
            setMessages(hist);
          } else {
            // Sin historial: saludo de reencuentro
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

  // El abuelo habla (voz a texto)
  const escucharAlAbuelo = () => {
    if (escuchando) {
      reconocedorRef.current?.stop();
      setEscuchando(false);
      return;
    }
    callar(); // si Pancho está hablando, que se calle para escuchar
    setHablando(false);
    const rec = crearReconocedorVoz({
      onResult: (texto) => {
        setInput(texto);
        setEscuchando(false);
        // Enviar automáticamente lo que dijo
        setTimeout(() => handleSendText(texto), 300);
      },
      onError: () => setEscuchando(false),
      onEnd: () => setEscuchando(false)
    });
    if (rec) {
      reconocedorRef.current = rec;
      setEscuchando(true);
      rec.start();
    }
  };

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup: crea el abuelo en Supabase (memoria) y arranca la charla
  const handleSetup = async (e) => {
    e.preventDefault();
    if (!elderName.trim()) return;
    setIsSetup(true);

    // Crear/recuperar el abuelo en Supabase (memoria)
    const abuelo = await obtenerOCrearAbuelo({
      nombre: elderName.trim(),
      companionName,
      companionGender
    });
    if (abuelo) setElderId(abuelo.id);

    // Primer mensaje de bienvenida
    const greeting = companionGender === 'male'
      ? `¡Hola ${elderName}! Soy Pancho, tu nuevo compañero de charlas. Me dijeron que te gusta conversar, ¡así que ya tenemos tema para rato! 😄 ¿Cómo andás hoy?`
      : `¡Hola ${elderName}! Soy Meli, tu nueva compañera de charlas. Me contaron que sos una persona muy interesante, ¡así que acá estoy para conocerte! 😊 ¿Cómo estás hoy?`;

    setMessages([{ id: 1, role: 'companion', text: greeting, time: now() }]);

    // Guardamos el saludo en la memoria
    if (abuelo) guardarMensaje(abuelo.id, 'companion', greeting);
  };

  // Enviar mensaje (desde el input de texto)
  const handleSend = () => handleSendText(input);

  // Enviar un texto (sirve tanto para tipeo como para voz)
  const handleSendText = async (rawText) => {
    const text = (rawText || '').trim();
    if (!text || isTyping) return;

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

    // Guardar el mensaje del abuelo en la memoria
    if (elderId) guardarMensaje(elderId, 'elder', text);

    try {
      // Llamada al backend proxy de Claude API
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

      // Guardar la respuesta de Pancho en la memoria
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

  // ─── PANTALLA DE SETUP ───
  if (!isSetup) {
    return (
      <div className="setup-screen">
        <div className="setup-card animate-slide">
          <div className="setup-avatars">
            <span className="setup-avatar" role="img">👴</span>
            <span className="setup-ampersand">&</span>
            <span className="setup-avatar" role="img">👵</span>
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
                <span className="companion-option-avatar">👴</span>
                <span className="companion-option-name">Pancho</span>
              </button>
              <button
                type="button"
                className={`companion-option ${companionGender === 'female' ? 'active' : ''}`}
                onClick={() => { setCompanionGender('female'); setCompanionName('Meli'); }}
              >
                <span className="companion-option-avatar">👵</span>
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
        <div className="chat-header-avatar">{avatar}</div>
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
      </header>

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
              <div className="chat-bubble-avatar">{avatar}</div>
            )}
            <div className="chat-bubble-content">
              <p className="chat-bubble-text">{msg.text}</p>
              <span className="chat-bubble-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble companion animate-fade">
            <div className="chat-bubble-avatar">{avatar}</div>
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
