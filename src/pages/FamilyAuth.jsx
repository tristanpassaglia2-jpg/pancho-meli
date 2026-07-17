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
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false); // muestra "revisá tu mail"
  const [emailConfirmacion, setEmailConfirmacion] = useState(''); // email al que se mandó el link

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
    if (modo === 'registro' && !aceptaTerminos) {
      setError('Tenés que aceptar los Términos y la Política de Privacidad para crear tu cuenta.');
      return;
    }

    setCargando(true);

    if (modo === 'registro') {
      const r = await registrarFamiliar(email, password, nombre);
      setCargando(false);
      if (r.ok) {
        if (r.haySesion) {
          // "Confirm email" DESACTIVADO: el familiar ya quedó adentro.
          // Lo mandamos directo a configurar, sin pantalla de "revisá tu mail".
          navigate('/configurar');
        } else {
          // "Confirm email" ACTIVADO: no hay sesión todavía.
          // Le mostramos la pantalla de "revisá tu mail".
          setEmailConfirmacion(email.trim());
          setRegistroExitoso(true);
        }
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

  const volverALogin = () => {
    setRegistroExitoso(false);
    setModo('login');
    setError('');
    setExito('');
    setPassword('');
    setAceptaTerminos(false);
  };

  // ----- PANTALLA "REVISÁ TU MAIL" (después de registrarse) -----
  if (registroExitoso) {
    return (
      <div style={S.pantalla}>
        <div style={S.tarjeta}>
          <div style={S.iconoMail}>📩</div>
          <h1 style={S.tituloConfirm}>¡Casi listo!</h1>
          <p style={S.textoConfirm}>
            Te mandamos un correo a:
          </p>
          <p style={S.emailDestacado}>{emailConfirmacion}</p>
          <p style={S.textoConfirm}>
            Abrilo y tocá el botón <strong>“Confirmar mi cuenta”</strong>. Después volvé acá y entrá. 💛
          </p>

          <div style={S.avisoSpam}>
            ¿No te llegó? Esperá un minuto y revisá la carpeta de <strong>Spam</strong> o <strong>Correo no deseado</strong>.
          </div>

          <button style={S.botonPrincipal} onClick={volverALogin}>
            Ya confirmé, quiero entrar
          </button>
        </div>
      </div>
    );
  }

  // ----- PANTALLA NORMAL (registro / login) -----
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

        {modo === 'registro' && (
          <label style={S.checkboxLabel}>
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              style={S.checkbox}
            />
            <span style={S.checkboxText}>
              Acepto los{' '}
              <a href="/terminos" target="_blank" style={S.link}>Términos y Condiciones</a>
              {' '}y la{' '}
              <a href="/privacidad" target="_blank" style={S.link}>Política de Privacidad</a>
            </span>
          </label>
        )}

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
  nota: { fontSize: '0.82rem', color: '#999', marginTop: 16, lineHeight: 1.5 },
  checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, textAlign: 'left' },
  checkbox: { marginTop: 3, width: 18, height: 18, flexShrink: 0 },
  checkboxText: { fontSize: '0.85rem', color: '#555', lineHeight: 1.5 },
  link: { color: '#075E54', fontWeight: 600 },

  // ----- Estilos de la pantalla "revisá tu mail" -----
  iconoMail: { fontSize: '3.5rem', marginBottom: 8 },
  tituloConfirm: { fontSize: '1.8rem', fontWeight: 800, color: '#5C3D26', margin: '0 0 14px' },
  textoConfirm: { color: '#555', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 10px' },
  emailDestacado: {
    color: '#C47A3A', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 14px',
    wordBreak: 'break-all'
  },
  avisoSpam: {
    background: '#FFF8EC', color: '#7a5a2a', padding: '0.9rem', borderRadius: 12,
    fontSize: '0.9rem', lineHeight: 1.5, margin: '6px 0 18px', border: '1px solid #F0E2C8'
  }
};
