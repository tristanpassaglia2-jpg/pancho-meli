// ═══════════════════════════════════════════════════════
// PANCHO & MELI — AVISO A LA FAMILIA (botón de salud cálido)
// La ÚNICA excepción a la confidencialidad: Pancho no cuenta
// las charlas, pero SÍ puede pedir ayuda si el abuelo se siente mal.
//
// CAPA 1 (ahora): registra el pedido de ayuda en Supabase.
// CAPA 2 (con el registro): envío real por WhatsApp a los contactos.
// ═══════════════════════════════════════════════════════

import { supabase } from './supabase';

// Registra un pedido de ayuda del abuelo
export async function avisarAFamilia(elderId, nombreAbuelo, motivo = 'No me siento bien') {
  const resultado = {
    ok: false,
    mensaje: ''
  };

  if (!elderId) {
    // Sin elderId no podemos registrar, pero igual devolvemos algo cálido
    resultado.mensaje = 'aviso_local';
    return resultado;
  }

  try {
    const { error } = await supabase
      .from('alertas_familia')
      .insert({
        elder_id: elderId,
        nombre_abuelo: nombreAbuelo,
        motivo,
        estado: 'pendiente'
      });

    if (!error) {
      resultado.ok = true;
      resultado.mensaje = 'registrado';
    } else {
      console.warn('No se pudo registrar la alerta:', error);
      resultado.mensaje = 'error_registro';
    }
  } catch (err) {
    console.warn('Error al avisar a la familia:', err);
    resultado.mensaje = 'error_registro';
  }

  return resultado;
}

// Mensaje cálido que dice Pancho cuando se aprieta el botón
export function mensajeTranquilizador(companionGender, nombreAbuelo) {
  if (companionGender === 'male') {
    return `Quedate tranquilo, ${nombreAbuelo}. Ya le avisé a tu familia que no te sentís bien, en un ratito se comunican con vos. No estás solo/a, yo me quedo acá con vos. ¿Querés que charlemos un poco mientras tanto? 💛`;
  }
  return `Quedate tranquilo, ${nombreAbuelo}. Ya le avisé a tu familia que no te sentís bien, enseguida se comunican con vos. No estás solo/a, acá me quedo con vos. ¿Querés que te acompañe charlando un ratito? 💛`;
}
