// ═══════════════════════════════════════════════════════
// PANCHO & MELI — AVISO A LA FAMILIA (botón de salud cálido)
// La ÚNICA excepción a la confidencialidad: Pancho no cuenta
// las charlas, pero SÍ puede pedir ayuda si el abuelo se siente mal.
//
// 1) Registra el pedido de ayuda en Supabase (alertas_familia).
// 2) Busca el teléfono del familiar (tabla familiares) y le manda
//    un WhatsApp REAL vía /api/avisar-whatsapp.
// ═══════════════════════════════════════════════════════
import { supabase } from './supabase';

// Registra un pedido de ayuda del abuelo Y avisa por WhatsApp a la familia
export async function avisarAFamilia(elderId, nombreAbuelo, motivo = 'No me siento bien') {
  const resultado = {
    ok: false,
    mensaje: '',
    whatsapp: false
  };

  if (!elderId) {
    // Sin elderId no podemos registrar, pero igual devolvemos algo cálido
    resultado.mensaje = 'aviso_local';
    return resultado;
  }

  // 1) Registrar la alerta en la base (queda como historial)
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
    console.warn('Error al registrar la alerta:', err);
    resultado.mensaje = 'error_registro';
  }

  // 2) Buscar el teléfono del familiar y mandarle el WhatsApp real
  try {
    const { data: fams, error: errFam } = await supabase
      .from('familiares')
      .select('contacto_telefono, contacto_nombre')
      .eq('elder_id', elderId)
      .limit(1);

    const familiar = fams && fams[0];

    if (errFam) {
      console.warn('No se pudo buscar al familiar:', errFam);
    } else if (familiar && familiar.contacto_telefono) {
      const resp = await fetch('/api/avisar-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono: familiar.contacto_telefono,
          nombreAbuelo
        })
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.ok) {
        resultado.whatsapp = true;
      } else {
        console.warn('No se pudo enviar el WhatsApp:', data);
      }
    } else {
      console.warn('El abuelo no tiene un familiar con telefono cargado.');
    }
  } catch (err) {
    console.warn('Error al enviar el WhatsApp a la familia:', err);
  }

  return resultado;
}

// Mensaje cálido que dice Pancho/Meli cuando se aprieta el botón
export function mensajeTranquilizador(companionGender, nombreAbuelo) {
  if (companionGender === 'male') {
    return `Quedate tranquilo, ${nombreAbuelo}. Ya le avisé a tu familia que no te sentís bien, en un ratito se comunican con vos. No estás solo/a, yo me quedo acá con vos. ¿Querés que charlemos un poco mientras tanto? 💛`;
  }
  return `Quedate tranquilo, ${nombreAbuelo}. Ya le avisé a tu familia que no te sentís bien, enseguida se comunican con vos. No estás solo/a, acá me quedo con vos. ¿Querés que te acompañe charlando un ratito? 💛`;
}
