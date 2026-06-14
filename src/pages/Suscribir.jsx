import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { obtenerEstadoSuscripcion } from '../lib/suscripcion';

export default function Suscribir() {
  const [usuario, setUsuario] = useState(null);
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUsuario(data.user);
        const est = await obtenerEstadoSuscripcion(data.user.id);
        setEstado(est);
      }
      setCargando(false);
    })();
  }, []);

  const suscribirse = async () => {
    setProcesando(true);
    setError('');
    try {
      const resp = await fetch('/api/suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: usuario.email,
          user_id: usuario.id,
          nombre_abuelo: ''
        })
      });
      const data = await resp.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'No se pudo iniciar el pago. Intentá de nuevo.');
        setProcesando(false);
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
      setProcesando(false);
    }
  };

  if (cargando) {
    return <div style={S.pantalla}><p style={{color:'#777'}}>Cargando...</p></div>;
  }

  if (!usuario) {
    return (
      <div style={S.pantalla}>
        <div style={S.tarjeta}>
          <h1 style={S.titulo}>Suscripción</h1>
          <p style={S.texto}>Para suscribirte, primero tenés que iniciar sesión.</p>
          <a href="/entrar" style={S.btnPrimario}>Iniciar sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div style={S.pantalla}>
      <div style={S.tarjeta}>
        <div style={S.logos}>
          <img src="/pancho.jpg" alt="Pancho" style={S.logo} />
          <img src="/meli.jpg" alt="Meli" style={S.logo} />
        </div>
        <h1 style={S.titulo}>Pancho&Meli</h1>

        {estado?.estado === 'activa' && (
          <>
            <div style={S.badge}>✅ Suscripción activa</div>
            <p style={S.texto}>Tu suscripción está al día. ¡Tu ser querido tiene compañía!</p>
          </>
        )}

        {estado?.estado === 'trial' && (
          <>
            <div style={{...S.badge, background: '#FEF3C7', color: '#854D0E'}}>
              ⏰ Prueba gratis — {estado.diasRestantes} {estado.diasRestantes === 1 ? 'día' : 'días'} restantes
            </div>
            <p style={S.texto}>
              Estás en los 7 días gratis. Suscribite antes de que termine para que tu
              ser querido no pierda su compañero.
            </p>
          </>
        )}

        {(!estado || estado?.estado === 'vencida') && (
          <>
            <div style={{...S.badge, background: '#FDECEA', color: '#C0392B'}}>
              La prueba gratis terminó
            </div>
            <p style={S.texto}>
              Suscribite para que tu ser querido siga charlando con su compañero.
            </p>
          </>
        )}

        {estado?.estado !== 'activa' && (
          <div style={S.precioBox}>
            <p style={S.precio}>ARS $13.500<span style={S.precioPer}>/mes</span></p>
            <p style={S.precioNota}>7 días gratis · Cancelá cuando quieras</p>
            <p style={S.precioDetalle}>Charlas ilimitadas · Juegos · Música · Botón de emergencia</p>

            {error && <p style={S.error}>{error}</p>}

            <button style={S.btnSuscribir} onClick={suscribirse} disabled={procesando}>
              {procesando ? 'Conectando con MercadoPago...' : 'Suscribirme con MercadoPago'}
            </button>

            <p style={S.seguro}>🔒 Pago seguro con MercadoPago</p>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  pantalla: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #FFFCF7 0%, #FEF0E0 100%)', padding: '1.5rem',
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  },
  tarjeta: {
    background: '#fff', borderRadius: 24, padding: '2rem 1.5rem', maxWidth: 420, width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)', textAlign: 'center'
  },
  logos: { display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12 },
  logo: { width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  titulo: { fontSize: '1.8rem', fontWeight: 800, color: '#5C3D26', margin: '0 0 12px' },
  badge: {
    display: 'inline-block', padding: '0.5rem 1rem', borderRadius: 10,
    background: '#E8F5ED', color: '#2D8A4E', fontWeight: 700, fontSize: '0.95rem', marginBottom: 12
  },
  texto: { color: '#555', fontSize: '1rem', lineHeight: 1.6, marginBottom: 16 },
  precioBox: {
    background: '#FAFAFA', borderRadius: 16, padding: '1.5rem', marginTop: 8
  },
  precio: { fontSize: '2rem', fontWeight: 800, color: '#075E54', margin: '0 0 4px' },
  precioPer: { fontSize: '0.9rem', fontWeight: 400, color: '#777' },
  precioNota: { fontSize: '0.9rem', color: '#777', margin: '4px 0' },
  precioDetalle: { fontSize: '0.82rem', color: '#999', marginBottom: 16 },
  btnSuscribir: {
    width: '100%', padding: '1.1rem', background: '#075E54', color: '#fff', border: 'none',
    borderRadius: 14, fontSize: '1.15rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif"
  },
  btnPrimario: {
    display: 'inline-block', padding: '1rem 2rem', background: '#075E54', color: '#fff',
    borderRadius: 14, fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none'
  },
  seguro: { fontSize: '0.82rem', color: '#999', marginTop: 12 },
  error: { background: '#FDECEA', color: '#C0392B', padding: '0.6rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: 10 }
};
