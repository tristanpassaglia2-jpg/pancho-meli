// ═══════════════════════════════════════════════════════
// PANCHO & MELI — AUTENTICACIÓN DEL FAMILIAR (Bloque 1)
// Usa Supabase Auth (incorporado y seguro) para que el
// familiar cree cuenta, entre y salga. NO manejamos
// contraseñas a mano: lo hace Supabase de forma segura.
//
// IMPORTANTE (Bloque A): con "Confirm email" activado en
// Supabase, el familiar NO tiene sesión hasta confirmar
// el mail. Por eso el trial de 7 días YA NO se crea al
// registrarse, sino la PRIMERA vez que entra (login),
// que recién puede pasar después de confirmar el mail.
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';
import { crearSuscripcionTrial } from './suscripcion';

// ───────────────────────────────────────────
// Registrar un familiar nuevo (email + contraseña)
// Solo crea la cuenta. El trial se crea al entrar
// por primera vez (ver iniciarSesion).
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

    // NOTA: NO se crea el trial acá a propósito.
    // Con "Confirm email" activado, el familiar todavía no
    // confirmó su mail. El trial se crea al primer login.

    return { ok: true, usuario: data.user, mensaje: 'registrado' };
  } catch (err) {
    return { ok: false, mensaje: 'Hubo un problema. Probá de nuevo en un momento.' };
  }
}

// ───────────────────────────────────────────
// Iniciar sesión (login)
// Si es la primera vez que entra (ya con el mail confirmado),
// le crea el trial de 7 días. crearSuscripcionTrial es
// idempotente: si ya existe, no crea otro.
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

    // Crear el trial la primera vez que entra (mail ya confirmado).
    if (data.user?.id) {
      await crearSuscripcionTrial(data.user.id);
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
  if (m.includes('not confirmed')) {
    return 'Tenés que confirmar tu mail antes de entrar. Revisá tu casilla (y la carpeta de Spam) y tocá el link que te mandamos.';
  }
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
