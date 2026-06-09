// ═══════════════════════════════════════════════════════
// PANCHO & MELI — AUTENTICACIÓN DEL FAMILIAR (Bloque 1)
// Usa Supabase Auth (incorporado y seguro) para que el
// familiar cree cuenta, entre y salga. NO manejamos
// contraseñas a mano: lo hace Supabase de forma segura.
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';

// ───────────────────────────────────────────
// Registrar un familiar nuevo (email + contraseña)
// ───────────────────────────────────────────
export async function registrarFamiliar(email, password, nombre) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { nombre: nombre?.trim() || '' }
      }
    });

    if (error) {
      return { ok: false, mensaje: traducirError(error.message) };
    }
    return { ok: true, usuario: data.user, mensaje: 'registrado' };
  } catch (err) {
    return { ok: false, mensaje: 'Hubo un problema. Probá de nuevo en un momento.' };
  }
}

// ───────────────────────────────────────────
// Iniciar sesión (login)
// ───────────────────────────────────────────
export async function iniciarSesion(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      return { ok: false, mensaje: traducirError(error.message) };
    }
    return { ok: true, usuario: data.user };
  } catch (err) {
    return { ok: false, mensaje: 'Hubo un problema. Probá de nuevo en un momento.' };
  }
}

// ───────────────────────────────────────────
// Cerrar sesión (logout)
// ───────────────────────────────────────────
export async function cerrarSesion() {
  try {
    await supabase.auth.signOut();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ───────────────────────────────────────────
// Saber si hay un familiar logueado ahora
// ───────────────────────────────────────────
export async function obtenerFamiliarActual() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────
// Traducir los errores de Supabase a español amable
// ───────────────────────────────────────────
function traducirError(mensaje) {
  const m = (mensaje || '').toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'Ese email ya está registrado. ¿Querés iniciar sesión?';
  }
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'El email o la contraseña no son correctos.';
  }
  if (m.includes('password') && m.includes('6')) {
    return 'La contraseña tiene que tener al menos 6 caracteres.';
  }
  if (m.includes('invalid email') || m.includes('email')) {
    return 'Revisá que el email esté bien escrito.';
  }
  return 'Hubo un problema. Probá de nuevo en un momento.';
}
