import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFFCF7 0%, #FEF0E0 100%)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
        <img src="/pancho.jpg" alt="Pancho" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }} />
        <span style={{ fontSize: '2rem' }}>💬</span>
        <img src="/meli.jpg" alt="Meli" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#5C3D26' }}>
        Pancho&Meli
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: 500, margin: '0.5rem auto 2rem' }}>
        Tu compañero/a IA de todos los días.<br />
        Charla, juegos y compañía para adultos mayores.
      </p>
      <Link to="/chat/demo" className="btn btn-primary" style={{ fontSize: '1.3rem', padding: '1rem 2.5rem' }}>
        Probar ahora 🎉
      </Link>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999' }}>
        7 días gratis · Sin tarjeta · Sin instalar nada
      </p>
    </div>
  );
}
