// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE MEMORIA (Nivel 1, Camino A)
// Guarda y recupera al abuelo y sus charlas desde Supabase.
// Usa un identificador local en el dispositivo para reconocer
// al abuelo cuando vuelve a abrir la app.
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';

// ───────────────────────────────────────────
// Identificador del abuelo en ESTE dispositivo
// Se guarda en el navegador. Si ya existe, lo reusa.
// ───────────────────────────────────────────
const STORAGE_KEY = 'pancho_meli_elder_id';

export function getDeviceElderId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    return id || null;
  } catch {
    return null;
  }
}

function saveDeviceElderId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Si el navegador bloquea localStorage, seguimos sin persistencia local
  }
}

// ───────────────────────────────────────────
// Crear o recuperar el abuelo en Supabase
// Devuelve el registro del abuelo (con su id).
// ───────────────────────────────────────────
export async function obtenerOCrearAbuelo({ nombre, companionName, companionGender }) {
  const existingId = getDeviceElderId();

  // 1. Si ya tenemos un id guardado en el dispositivo, intentamos recuperarlo
  if (existingId) {
    try {
      const { data, error } = await supabase
        .from('elders')
        .select('*')
        .eq('id', existingId)
        .single();
      if (!error && data) {
        return data; // ¡Abuelo encontrado! Pancho lo recuerda.
      }
    } catch {
      // si falla, seguimos a crear uno nuevo
    }
  }

  // 2. Si no existe, creamos un abuelo nuevo
  try {
    const { data, error } = await supabase
      .from('elders')
      .insert({
        nombre,
        companion_name: companionName,
        companion_gender: companionGender
      })
      .select()
      .single();

    if (!error && data) {
      saveDeviceElderId(data.id);
      return data;
    }
  } catch (err) {
    console.warn('No se pudo crear el abuelo en Supabase:', err);
  }

  // 3. Si Supabase falla del todo, devolvemos null (la app sigue funcionando sin memoria)
  return null;
}

// ───────────────────────────────────────────
// Cargar el historial de charlas de un abuelo
// Devuelve los últimos N mensajes (más recientes primero, los damos vuelta)
// ───────────────────────────────────────────
export async function cargarHistorial(elderId, limite = 50) {
  if (!elderId) return [];
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('role, content, created_at')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(limite);

    if (error || !data) return [];
    // Vienen del más nuevo al más viejo; los damos vuelta para mostrar en orden
    return data.reverse().map((m, i) => ({
      id: `hist_${i}_${m.created_at}`,
      role: m.role,
      text: m.content,
      time: new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }));
  } catch {
    return [];
  }
}

// ───────────────────────────────────────────
// Guardar un mensaje (del abuelo o de Pancho)
// ───────────────────────────────────────────
export async function guardarMensaje(elderId, role, content) {
  if (!elderId) return;
  try {
    await supabase
      .from('conversations')
      .insert({ elder_id: elderId, role, content });
  } catch (err) {
    console.warn('No se pudo guardar el mensaje:', err);
    // No frenamos la app si falla el guardado
  }
}
