import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <div style={S.avatars}>
          <img src="/pancho.jpg" alt="Pancho" style={S.avatar} />
          <img src="/meli.jpg" alt="Meli" style={S.avatar} />
        </div>
        <h1 style={S.title}>Pancho&Meli</h1>
        <p style={S.tagline}>Compañía real para quienes más querés</p>
        <p style={S.desc}>
          Un compañero de charlas con inteligencia artificial que acompaña,
          escucha, juega y le da fuerza a tu ser querido todos los días.
          Como un amigo que nunca falta.
        </p>
        <Link to="/entrar" style={S.btnPrimary}>
          Quiero esto para mi ser querido
        </Link>
        <Link to="/chat" style={S.btnSecondary}>
          Probar una charla gratis
        </Link>
        <p style={S.trial}>7 días gratis · Sin tarjeta · Sin instalar nada</p>
      </div>

      {/* Qué hace */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>¿Qué hace Pancho&Meli?</h2>
        <div style={S.features}>
          <div style={S.feature}>
            <span style={S.featureIcon}>💬</span>
            <h3 style={S.featureName}>Charla de verdad</h3>
            <p style={S.featureDesc}>Conversaciones cálidas, con ida y vuelta. No es un robot que solo pregunta: es un compañero que también comparte.</p>
          </div>
          <div style={S.feature}>
            <span style={S.featureIcon}>🧠</span>
            <h3 style={S.featureName}>Juegos y ejercicios</h3>
            <p style={S.featureDesc}>Trivia, refranes, adivinanzas, idiomas y ejercicios cognitivos. Todo mezclado y natural, sin menús complicados.</p>
          </div>
          <div style={S.feature}>
            <span style={S.featureIcon}>🎵</span>
            <h3 style={S.featureName}>Música de su época</h3>
            <p style={S.featureDesc}>Le pide tango, folklore o boleros y Pancho se lo busca. La música que lo emociona, a un mensaje de distancia.</p>
          </div>
          <div style={S.feature}>
            <span style={S.featureIcon}>🆘</span>
            <h3 style={S.featureName}>Botón de emergencia</h3>
            <p style={S.featureDesc}>Si no se siente bien, Pancho avisa a la familia con un toque. Compañía con red de seguridad.</p>
          </div>
          <div style={S.feature}>
            <span style={S.featureIcon}>🔒</span>
            <h3 style={S.featureName}>Charlas privadas</h3>
            <p style={S.featureDesc}>Las conversaciones son 100% del abuelo. Pancho no es espía: acompaña con respeto y confidencialidad.</p>
          </div>
          <div style={S.feature}>
            <span style={S.featureIcon}>💛</span>
            <h3 style={S.featureName}>Aliento y fuerza</h3>
            <p style={S.featureDesc}>Felicita, celebra, da confianza. Que tu ser querido termine cada charla un poquito más arriba de como empezó.</p>
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div style={{ ...S.section, background: '#fff', maxWidth: '100%', padding: '2.5rem 1.5rem' }}>
        <h2 style={S.sectionTitle}>¿Cómo funciona?</h2>
        <div style={S.steps}>
          <div style={S.step}>
            <div style={S.stepNum}>1</div>
            <p style={S.stepText}><strong>Vos te registrás</strong> como familiar (2 minutos)</p>
          </div>
          <div style={S.step}>
            <div style={S.stepNum}>2</div>
            <p style={S.stepText}><strong>Configurás a tu ser querido</strong> (nombre, gustos, compañero)</p>
          </div>
          <div style={S.step}>
            <div style={S.stepNum}>3</div>
            <p style={S.stepText}><strong>Le mandás el link</strong> por WhatsApp y listo: ya tiene compañía</p>
          </div>
        </div>
      </div>

      {/* Precio */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>Simple y accesible</h2>
        <div style={S.priceCard}>
          <p style={S.priceAmount}>ARS $13.500<span style={S.pricePer}>/mes</span></p>
          <p style={S.priceNote}>Primeros 7 días gratis. Cancelá cuando quieras.</p>
          <p style={S.priceDetail}>Charlas ilimitadas · Juegos · Música · Botón de emergencia</p>
          <Link to="/entrar" style={S.btnPrimary}>
            Empezar los 7 días gratis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={S.footer}>
        <p style={S.footerText}>Pancho&Meli · Compañero IA para adultos mayores</p>
        <p style={S.footerText}>Hecho con 💛 en Argentina · VIGIA Apps</p>
        <p style={S.footerText}>
          <a href="/privacidad" style={{color:'#999', marginRight: 16}}>Política de Privacidad</a>
          <a href="/terminos" style={{color:'#999'}}>Términos y Condiciones</a>
        </p>
      </footer>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#1a1a1a',
    background: '#FAFAFA'
  },
  hero: {
    textAlign: 'center',
    padding: '2.5rem 1.2rem 2rem',
    background: 'linear-gradient(170deg, #075E54 0%, #0a7a6d 100%)',
    color: '#fff'
  },
  avatars: {
    display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1rem'
  },
  avatar: {
    width: 75, height: 75, borderRadius: '50%', objectFit: 'cover',
    border: '3px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 15px rgba(0,0,0,0.25)'
  },
  title: {
    fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.3rem', letterSpacing: '-0.5px'
  },
  tagline: {
    fontSize: '1.15rem', opacity: 0.92, marginBottom: '1rem', fontWeight: 400
  },
  desc: {
    fontSize: '1rem', opacity: 0.82, maxWidth: 480, margin: '0 auto 1.8rem',
    lineHeight: 1.6
  },
  btnPrimary: {
    display: 'block', padding: '1rem 1.5rem', background: '#fff',
    color: '#075E54', borderRadius: 14, fontSize: '1.1rem', fontWeight: 700,
    textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    margin: '0 auto 0.8rem', maxWidth: 320, textAlign: 'center'
  },
  btnSecondary: {
    display: 'block', padding: '0.85rem 1.5rem',
    background: 'rgba(255,255,255,0.15)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: 14, fontSize: '1rem', fontWeight: 600,
    textDecoration: 'none', margin: '0 auto 0.8rem', maxWidth: 320, textAlign: 'center'
  },
  trial: {
    fontSize: '0.85rem', opacity: 0.7, marginTop: '0.8rem'
  },
  section: {
    padding: '2.5rem 1.5rem', maxWidth: 700, margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '1.8rem', fontWeight: 800, color: '#1a1a1a', textAlign: 'center',
    marginBottom: '1.5rem'
  },
  features: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem'
  },
  feature: {
    background: '#fff', borderRadius: 16, padding: '1.3rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  featureIcon: { fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' },
  featureName: { fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#075E54' },
  featureDesc: { fontSize: '0.9rem', color: '#555', lineHeight: 1.5, margin: 0 },
  steps: {
    display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400, margin: '0 auto'
  },
  step: {
    display: 'flex', alignItems: 'center', gap: '1rem'
  },
  stepNum: {
    width: 44, height: 44, borderRadius: '50%', background: '#075E54', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', fontWeight: 800, flexShrink: 0
  },
  stepText: { fontSize: '1.05rem', color: '#333', lineHeight: 1.5, margin: 0 },
  priceCard: {
    background: '#fff', borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: 380, margin: '0 auto'
  },
  priceAmount: { fontSize: '2.4rem', fontWeight: 800, color: '#075E54', margin: '0 0 0.3rem' },
  pricePer: { fontSize: '1rem', fontWeight: 400, color: '#777' },
  priceNote: { fontSize: '0.95rem', color: '#777', marginBottom: '0.5rem' },
  priceDetail: { fontSize: '0.85rem', color: '#999', marginBottom: '1.5rem' },
  footer: {
    textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid #eee'
  },
  footerText: { margin: '0.2rem 0', fontSize: '0.85rem', color: '#999' }
};
