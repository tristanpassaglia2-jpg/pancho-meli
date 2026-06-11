// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE SUSCRIPCIÓN (Bloque 3A)
// Maneja los 7 días gratis del familiar.
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';

// ───────────────────────────────────────────
// Crear suscripción al registrarse el familiar
// Arranca el trial de 7 días automáticamente
// ───────────────────────────────────────────
export async function crearSuscripcionTrial(userId) {
  try {
    // Primero ver si ya existe (por si vuelve a entrar)
    const { data: existe } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existe) return existe;

    // Crear nueva con 7 días gratis
    const { data, error } = await supabase
      .from('suscripciones')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.warn('No se pudo crear la suscripción:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Error al crear suscripción:', err);
    return null;
  }
}

// ───────────────────────────────────────────
// Obtener el estado actual de la suscripción
// Devuelve: { estado, diasRestantes, trial_fin, activa }
// ───────────────────────────────────────────
export async function obtenerEstadoSuscripcion(userId) {
  if (!userId) return null;

  try {
    const { data } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    // Calcular días restantes
    const ahora = new Date();
    const fin = new Date(data.trial_fin);
    const msRestantes = fin - ahora;
    const diasRestantes = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)));

    // Si el trial terminó y todavía dice 'trial', marcarlo vencido
    if (data.estado === 'trial' && diasRestantes === 0) {
      await supabase
        .from('suscripciones')
        .update({ estado: 'vencida' })
        .eq('user_id', userId);
      data.estado = 'vencida';
    }

    return {
      estado: data.estado,
      diasRestantes,
      trial_inicio: data.trial_inicio,
      trial_fin: data.trial_fin,
      // activa = puede usar la app (trial vigente o suscripción activa)
      activa: data.estado === 'trial' || data.estado === 'activa'
    };
  } catch (err) {
    console.warn('Error al obtener suscripción:', err);
    return null;
  }
}

// ───────────────────────────────────────────
// Obtener el estado a partir del abuelo (para el chat)
// Busca al familiar dueño del abuelo y devuelve su estado.
// ───────────────────────────────────────────
export async function obtenerEstadoPorElder(elderId) {
  if (!elderId) return null;
  try {
    const { data: familiar } = await supabase
      .from('familiares')
      .select('user_id')
      .eq('elder_id', elderId)
      .single();
    if (!familiar?.user_id) return null;
    return await obtenerEstadoSuscripcion(familiar.user_id);
  } catch {
    return null;
  }
}
