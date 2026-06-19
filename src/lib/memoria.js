// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE MEMORIA (Nivel 1, Camino A)
// Guarda y recupera al abuelo y sus charlas desde Supabase.
// Las charlas (conversations) ahora pasan por funciones seguras
// (cargar_historial / guardar_mensaje) para no exponer la tabla
// a la clave pública.
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';

// ───────────────────────────────────────────
// Identificador del abuelo en ESTE dispositivo
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
// (sigue usando la tabla elders directo — esa tabla la blindamos
//  en una etapa posterior)
// ───────────────────────────────────────────
export async function obtenerOCrearAbuelo({ nombre, companionName, companionGender }) {
  const existingId = getDeviceElderId();

  if (existingId) {
    try {
      const { data, error } = await supabase
        .from('elders')
        .select('*')
        .eq('id', existingId)
        .single();
      if (!error && data) {
        return data;
      }
    } catch {
      // si falla, seguimos a crear uno nuevo
    }
  }

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

  return null;
}

// ───────────────────────────────────────────
// Cargar el historial de charlas (vía función segura)
// ───────────────────────────────────────────
export async function cargarHistorial(elderId, limite = 50) {
  if (!elderId) return [];
  try {
    const { data, error } = await supabase.rpc('cargar_historial', {
      p_elder_id: elderId,
      p_limite: limite
    });

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
// Guardar un mensaje (vía función segura)
// ───────────────────────────────────────────
export async function guardarMensaje(elderId, role, content) {
  if (!elderId) return;
  try {
    await supabase.rpc('guardar_mensaje', {
      p_elder_id: elderId,
      p_role: role,
      p_content: content
    });
  } catch (err) {
    console.warn('No se pudo guardar el mensaje:', err);
    // No frenamos la app si falla el guardado
  }
}
