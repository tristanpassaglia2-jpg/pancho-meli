import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ElderChat from './pages/ElderChat';
import FamilySetup from './pages/FamilySetup';
import FamilyDashboard from './pages/FamilyDashboard';
import FamilyAuth from './pages/FamilyAuth';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<FamilyAuth />} />
        <Route path="/setup" element={<FamilySetup />} />
        <Route path="/configurar" element={<FamilySetup />} />
        <Route path="/chat/:elderId" element={<ElderChat />} />
        <Route path="/chat" element={<ElderChat />} />
        <Route path="/dashboard" element={<FamilyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
