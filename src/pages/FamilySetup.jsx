import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function FamilySetup() {
  const navigate = useNavigate();
  const [nombreAbuelo, setNombreAbuelo] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('Argentina');
  const [companion, setCompanion] = useState('Pancho');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTel, setContactoTel] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [linkGenerado, setLinkGenerado] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate('/entrar');
        return;
      }
      setUsuario(data.user);
      setContactoNombre(data.user.user_metadata?.nombre || '');
    })();
  }, [navigate]);

  const generarSlug = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let slug = '';
    for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
    return slug;
  };

  const handleGuardar = async () => {
    setError('');
    if (!nombreAbuelo.trim()) { setError('Poné el nombre de tu ser querido.'); return; }
    if (!contactoNombre.trim() || !contactoTel.trim()) {
      setError('Completá tu nombre y teléfono de contacto (es para el botón de emergencia).');
      return;
    }

    setCargando(true);
    try {
      const slug = generarSlug();
      const gender = companion === 'Pancho' ? 'male' : 'female';

      // Crear abuelo + familiar juntos vía RPC segura (atómico)
      const { data, error: rpcErr } = await supabase.rpc('registrar_abuelo_y_familiar', {
        p_user_id: usuario.id,
        p_nombre_abuelo: nombreAbuelo.trim(),
        p_edad: edad ? parseInt(edad) : null,
        p_pais: pais,
        p_companion_name: companion,
        p_companion_gender: gender,
        p_slug: slug,
        p_nombre_familiar: contactoNombre.trim(),
        p_contacto_nombre: contactoNombre.trim(),
        p_contacto_telefono: contactoTel.trim()
      });

      if (rpcErr) throw rpcErr;
      if (!data || !data.ok) {
        throw new Error(data?.error || 'No se pudo guardar');
      }

      // Generar el link para el abuelo
      const base = window.location.origin;
      setLinkGenerado(`${base}/chat/${slug}`);

    } catch (err) {
      console.error(err);
      setError('Hubo un problema al guardar. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGenerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  const compartirWhatsApp = () => {
    const texto = `¡Hola! Te preparé un compañero de charlas que se llama ${companion}. Tocá este link para empezar a hablar: ${linkGenerado}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  // Si ya se generó el link, mostramos la pantalla de éxito
  if (linkGenerado) {
    return (
      <div style={S.pantalla}>
        <div style={S.tarjeta}>
          <div style={S.exitoIcon}>🎉</div>
          <h1 style={S.titulo}>¡Todo listo!</h1>
          <p style={S.subtitulo}>
            {companion} ya está esperando a {nombreAbuelo}.<br />
            Mandále este link por WhatsApp:
          </p>
          <div style={S.linkBox}>
            <p style={S.linkTexto}>{linkGenerado}</p>
          </div>
          <button style={S.btnWhatsApp} onClick={compartirWhatsApp}>
            Enviar por WhatsApp 💬
          </button>
          <button style={S.btnCopiar} onClick={copiarLink}>
            {copiado ? '¡Copiado! ✅' : 'Copiar link 📋'}
          </button>
          <p style={S.nota}>
            Cuando tu ser querido toque el link, va a entrar directo a charlar con {companion}. No necesita registrarse ni hacer nada más.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.pantalla}>
      <div style={S.tarjeta}>
        <div style={S.logoArea}>
          <img src="/pancho.jpg" alt="Pancho" style={S.logoImg} />
          <img src="/meli.jpg" alt="Meli" style={S.logoImg} />
        </div>
        <h1 style={S.titulo}>Configurá a tu ser querido</h1>
        <p style={S.subtitulo}>Completá estos datos y le generamos un link para que empiece a charlar.</p>

        {/* Nombre del abuelo */}
        <div style={S.campo}>
          <label style={S.label}>¿Cómo se llama?</label>
          <input style={S.input} type="text" placeholder="Ej: Juan, María, Abuela Rosa..." value={nombreAbuelo} onChange={(e) => setNombreAbuelo(e.target.value)} />
        </div>

        {/* Edad */}
        <div style={S.campo}>
          <label style={S.label}>Edad (opcional)</label>
          <input style={S.input} type="number" placeholder="Ej: 78" value={edad} onChange={(e) => setEdad(e.target.value)} />
        </div>

        {/* País */}
        <div style={S.campo}>
          <label style={S.label}>País</label>
          <select style={S.input} value={pais} onChange={(e) => setPais(e.target.value)}>
            <option>Argentina</option>
            <option>México</option>
            <option>Colombia</option>
            <option>Chile</option>
            <option>Perú</option>
            <option>Uruguay</option>
            <option>Ecuador</option>
            <option>Venezuela</option>
            <option>Bolivia</option>
            <option>Paraguay</option>
            <option>España</option>
            <option>Otro</option>
          </select>
        </div>

        {/* Elegir compañero */}
        <div style={S.campo}>
          <label style={S.label}>¿Quién lo va a acompañar?</label>
          <div style={S.companionRow}>
            <button
              style={{ ...S.companionBtn, ...(companion === 'Pancho' ? S.companionActivo : {}) }}
              onClick={() => setCompanion('Pancho')}
            >
              <img src="/pancho.jpg" alt="Pancho" style={S.companionImg} />
              <span>Pancho</span>
            </button>
            <button
              style={{ ...S.companionBtn, ...(companion === 'Meli' ? S.companionActivo : {}) }}
              onClick={() => setCompanion('Meli')}
            >
              <img src="/meli.jpg" alt="Meli" style={S.companionImg} />
              <span>Meli</span>
            </button>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div style={S.separador}>
          <span style={S.separadorTexto}>🆘 Contacto de emergencia</span>
        </div>
        <p style={S.notaEmergencia}>
          Si tu ser querido toca el botón de emergencia, le avisamos a esta persona.
        </p>

        <div style={S.campo}>
          <label style={S.label}>Tu nombre</label>
          <input style={S.input} type="text" placeholder="Ej: María" value={contactoNombre} onChange={(e) => setContactoNombre(e.target.value)} />
        </div>

        <div style={S.campo}>
          <label style={S.label}>Tu teléfono (con código de país)</label>
          <input style={S.input} type="tel" placeholder="Ej: +5491155667788" value={contactoTel} onChange={(e) => setContactoTel(e.target.value)} />
        </div>

        {error && <div style={S.error}>{error}</div>}

        <button style={S.btnGuardar} onClick={handleGuardar} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Generar link para mi ser querido'}
        </button>
      </div>
    </div>
  );
}

const S = {
  pantalla: {
    minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    background: 'linear-gradient(160deg, #FFFCF7 0%, #FEF0E0 100%)', padding: '1.5rem',
    fontFamily: "'Segoe UI', system-ui, sans-serif"
  },
  tarjeta: {
    background: '#fff', borderRadius: 24, padding: '2rem 1.5rem', maxWidth: 460, width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)', marginTop: '1rem'
  },
  logoArea: { display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12 },
  logoImg: { width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  titulo: { fontSize: '1.6rem', fontWeight: 800, color: '#5C3D26', textAlign: 'center', margin: '0 0 4px' },
  subtitulo: { color: '#777', fontSize: '0.95rem', textAlign: 'center', marginBottom: 20 },
  campo: { marginBottom: 14 },
  label: { display: 'block', fontWeight: 700, color: '#5C3D26', marginBottom: 6, fontSize: '0.95rem' },
  input: {
    width: '100%', padding: '0.85rem 1rem', border: '2px solid #E8E4DE', borderRadius: 12,
    fontSize: '1.05rem', fontFamily: "'Segoe UI', sans-serif", color: '#1a1a1a', outline: 'none',
    boxSizing: 'border-box', background: '#FAFAFA'
  },
  companionRow: { display: 'flex', gap: 12, justifyContent: 'center' },
  companionBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '0.8rem 1.5rem', border: '2px solid #E8E4DE', borderRadius: 16,
    background: '#FAFAFA', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
    color: '#555', fontFamily: "'Segoe UI', sans-serif"
  },
  companionActivo: { borderColor: '#075E54', background: '#E8F5F2', color: '#075E54' },
  companionImg: { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' },
  separador: { textAlign: 'center', margin: '20px 0 8px', borderTop: '1px solid #eee', paddingTop: 16 },
  separadorTexto: { fontSize: '1rem', fontWeight: 700, color: '#5C3D26' },
  notaEmergencia: { fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: 14 },
  error: { background: '#FDECEA', color: '#C0392B', padding: '0.8rem', borderRadius: 10, fontSize: '0.9rem', marginBottom: 14, textAlign: 'center' },
  btnGuardar: {
    width: '100%', padding: '1.1rem', background: '#075E54', color: '#fff', border: 'none',
    borderRadius: 14, fontSize: '1.15rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif", marginTop: 8
  },
  exitoIcon: { fontSize: '3.5rem', textAlign: 'center', marginBottom: 8 },
  linkBox: {
    background: '#F0F0F0', borderRadius: 12, padding: '1rem', marginBottom: 16,
    wordBreak: 'break-all'
  },
  linkTexto: { margin: 0, fontSize: '0.95rem', color: '#075E54', fontWeight: 600 },
  btnWhatsApp: {
    width: '100%', padding: '1.1rem', background: '#25D366', color: '#fff', border: 'none',
    borderRadius: 14, fontSize: '1.15rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif", marginBottom: 10
  },
  btnCopiar: {
    width: '100%', padding: '0.9rem', background: '#F0EAE2', color: '#5C3D26', border: 'none',
    borderRadius: 14, fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif", marginBottom: 16
  },
  nota: { fontSize: '0.85rem', color: '#999', textAlign: 'center', lineHeight: 1.5 }
};
