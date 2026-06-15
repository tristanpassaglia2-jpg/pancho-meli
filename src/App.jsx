import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ElderChat from './pages/ElderChat';
import FamilySetup from './pages/FamilySetup';
import FamilyDashboard from './pages/FamilyDashboard';
import FamilyAuth from './pages/FamilyAuth';
import Suscribir from './pages/Suscribir';
import Privacidad from './pages/Privacidad';
import Terminos from './pages/Terminos';
import Landing from './pages/Landing';
import { desbloquearAudioiOS, precargarVoces } from './lib/voz';

export default function App() {
  useEffect(() => {
    precargarVoces();

    const desbloquear = () => {
      desbloquearAudioiOS();
      document.removeEventListener('touchstart', desbloquear);
      document.removeEventListener('click', desbloquear);
    };
    document.addEventListener('touchstart', desbloquear, { once: true });
    document.addEventListener('click', desbloquear, { once: true });

    return () => {
      document.removeEventListener('touchstart', desbloquear);
      document.removeEventListener('click', desbloquear);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<FamilyAuth />} />
        <Route path="/suscribir" element={<Suscribir />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/setup" element={<FamilySetup />} />
        <Route path="/configurar" element={<FamilySetup />} />
        <Route path="/chat/:elderId" element={<ElderChat />} />
        <Route path="/chat" element={<ElderChat />} />
        <Route path="/dashboard" element={<FamilyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
