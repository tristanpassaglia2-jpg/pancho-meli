// ═══════════════════════════════════════════════════════
// PANCHO & MELI — MÓDULO DE SUSCRIPCIÓN (Bloque 3A)
// Maneja los 7 días gratis del familiar.
// El estado para el chat del abuelo (que entra sin login) ahora
// se pide vía función segura (estado_suscripcion_por_elder), así
// no exponemos las tablas suscripciones/familiares a la clave pública.
// ═══════════════════════════════════════════════════════
import { supabase } from './supabase';

// ───────────────────────────────────────────
// Crear suscripción al registrarse el familiar (lado familiar, logueado)
// ───────────────────────────────────────────
export async function crearSuscripcionTrial(userId) {
  try {
    const { data: existe } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (existe) return existe;
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
// Obtener el estado actual (lado familiar, logueado)
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
    const ahora = new Date();
    const fin = new Date(data.trial_fin);
    const msRestantes = fin - ahora;
    const diasRestantes = Math.max(0, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)));
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
      activa: data.estado === 'trial' || data.estado === 'activa'
    };
  } catch (err) {
    console.warn('Error al obtener suscripción:', err);
    return null;
  }
}

// ───────────────────────────────────────────
// Obtener el estado a partir del abuelo (para el chat, sin login)
// Ahora pasa por una función segura: no toca las tablas directo.
// ───────────────────────────────────────────
export async function obtenerEstadoPorElder(elderId) {
  if (!elderId) return null;
  try {
    const { data, error } = await supabase.rpc('estado_suscripcion_por_elder', {
      p_elder_id: elderId
    });
    if (error || !data || data.length === 0) return null;
    const r = data[0];
    return {
      estado: r.estado,
      diasRestantes: r.dias_restantes,
      trial_inicio: r.trial_inicio,
      trial_fin: r.trial_fin,
      activa: r.activa
    };
  } catch {
    return null;
  }
}
