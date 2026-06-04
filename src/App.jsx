import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ElderChat from './pages/ElderChat';
import FamilySetup from './pages/FamilySetup';
import FamilyDashboard from './pages/FamilyDashboard';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup" element={<FamilySetup />} />
        <Route path="/chat/:elderId" element={<ElderChat />} />
        <Route path="/dashboard" element={<FamilyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
