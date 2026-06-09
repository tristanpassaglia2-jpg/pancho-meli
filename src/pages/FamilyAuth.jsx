import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarFamiliar, iniciarSesion } from '../lib/auth';

export default function FamilyAuth() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('registro'); // 'registro' o 'login'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleSubmit = async () => {
    setError('');
    setExito('');

    if (!email.trim() || !password.trim()) {
      setError('Completá email y contraseña.');
      return;
    }
    if (modo === 'registro' && !nombre.trim()) {
      setError('Decinos tu nombre.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña tiene que tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    if (modo === 'registro') {
      const r = await registrarFamiliar(email, password, nombre);
      setCargando(false);
      if (r.ok) {
        setExito('¡Cuenta creada! Ya podés configurar a tu ser querido.');
        setTimeout(() => navigate('/configurar'), 1200);
      } else {
        setError(r.mensaje);
      }
    } else {
      const r = await iniciarSesion(email, password);
      setCargando(false);
      if (r.ok) {
        navigate('/configurar');
      } else {
        setError(r.mensaje);
      }
    }
  };

  return (
    <div style={S.pantalla}>
      <div style={S.tarjeta}>
        <div style={S.logo}>
          <img src="/pancho.jpg" alt="Pancho" style={S.logoImg} />
          <img src="/meli.jpg" alt="Meli" style={S.logoImg} />
        </div>
        <h1 style={S.titulo}>Pancho&Meli</h1>
        <p style={S.subtitulo}>
          {modo === 'registro'
            ? 'Creá tu cuenta para acompañar a tu ser querido'
            : 'Entrá a tu cuenta'}
        </p>

        {/* Selector de modo */}
        <div style={S.tabs}>
          <button
            style={{ ...S.tab, ...(modo === 'registro' ? S.tabActivo : {}) }}
            onClick={() => { setModo('registro'); setError(''); }}
          >
            Crear cuenta
          </button>
          <button
            style={{ ...S.tab, ...(modo === 'login' ? S.tabActivo : {}) }}
            onClick={() => { setModo('login'); setError(''); }}
          >
            Ya tengo cuenta
          </button>
        </div>

        {modo === 'registro' && (
          <div style={S.campo}>
            <label style={S.label}>Tu nombre</label>
            <input
              style={S.input}
              type="text"
              placeholder="Ej: María"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
        )}

        <div style={S.campo}>
          <label style={S.label}>Tu email</label>
          <input
            style={S.input}
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={S.campo}>
          <label style={S.label}>Contraseña</label>
          <input
            style={S.input}
            type="password"
            placeholder="Al menos 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div style={S.error}>{error}</div>}
        {exito && <div style={S.exito}>{exito}</div>}

        <button style={S.botonPrincipal} onClick={handleSubmit} disabled={cargando}>
          {cargando ? 'Un momento...' : modo === 'registro' ? 'Crear mi cuenta' : 'Entrar'}
        </button>

        <p style={S.nota}>
          {modo === 'registro'
            ? 'Es la cuenta del familiar. Tu ser querido no necesita registrarse: recibe un link y listo. 💛'
            : ''}
        </p>
      </div>
    </div>
  );
}

const S = {
  pantalla: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #FFFCF7 0%, #FEF0E0 100%)', padding: '1.5rem',
    fontFamily: "'Nunito', system-ui, sans-serif"
  },
  tarjeta: {
    background: '#fff', borderRadius: 24, padding: '2.2rem 1.8rem', maxWidth: 420, width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)', textAlign: 'center'
  },
  logo: { display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12 },
  logoImg: { width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  titulo: { fontSize: '2rem', fontWeight: 800, color: '#5C3D26', margin: 0 },
  subtitulo: { color: '#777', fontSize: '1rem', marginTop: 6, marginBottom: 20 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, background: '#F0EAE2', borderRadius: 12, padding: 4 },
  tab: {
    flex: 1, padding: '0.7rem', border: 'none', borderRadius: 9, fontSize: '0.95rem',
    fontWeight: 700, color: '#888', background: 'transparent', cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif"
  },
  tabActivo: { background: '#fff', color: '#5C3D26', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  campo: { textAlign: 'left', marginBottom: 14 },
  label: { display: 'block', fontWeight: 700, color: '#5C3D26', marginBottom: 6, fontSize: '0.95rem' },
  input: {
    width: '100%', padding: '0.9rem 1rem', border: '2px solid #E8E4DE', borderRadius: 12,
    fontSize: '1.05rem', fontFamily: "'Nunito', sans-serif", color: '#1a1a1a', outline: 'none',
    boxSizing: 'border-box'
  },
  error: { background: '#FDECEA', color: '#C0392B', padding: '0.8rem', borderRadius: 10, fontSize: '0.9rem', marginBottom: 14 },
  exito: { background: '#E8F5ED', color: '#2D8A4E', padding: '0.8rem', borderRadius: 10, fontSize: '0.9rem', marginBottom: 14 },
  botonPrincipal: {
    width: '100%', padding: '1rem', background: '#C47A3A', color: '#fff', border: 'none',
    borderRadius: 14, fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif", marginTop: 4
  },
  nota: { fontSize: '0.82rem', color: '#999', marginTop: 16, lineHeight: 1.5 }
};
