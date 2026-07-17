// ═══════════════════════════════════════════════════════
// PANCHO & MELI — WEBHOOK DE MERCADOPAGO
// MercadoPago llama a esta URL cuando un pago se procesa.
// Nosotros actualizamos la suscripción en nuestra base de datos.
//
// IMPORTANTE: este webhook corre en el servidor y NO tiene
// un usuario logueado. Por eso usa la llave service_role
// (SUPABASE_SERVICE_ROLE_KEY), que es la única que puede
// escribir en la tabla suscripciones saltándose la seguridad
// por-usuario (RLS). Con la llave pública/anon, el UPDATE
// quedaba bloqueado en silencio y la suscripción NUNCA se
// marcaba como activa aunque el pago fuera exitoso.
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // MercadoPago manda GET para verificar y POST con los datos
  if (req.method === 'GET') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  try {
    const { type, data, action } = req.body;

    console.log('Webhook MP recibido:', JSON.stringify({ type, action, data_id: data?.id }));

    // Solo nos interesan eventos de suscripción (preapproval)
    if (type === 'subscription_preapproval' && data?.id) {
      const accessToken = process.env.MP_ACCESS_TOKEN;

      // Consultar el estado de la suscripción en MercadoPago
      const mpResp = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const suscripcionMP = await mpResp.json();

      console.log('Suscripción MP:', JSON.stringify({
        status: suscripcionMP.status,
        external_reference: suscripcionMP.external_reference,
        payer_email: suscripcionMP.payer_email
      }));

      // Si la suscripción está autorizada o activa en MercadoPago
      if (suscripcionMP.status === 'authorized' || suscripcionMP.status === 'active') {
        const userId = suscripcionMP.external_reference;

        if (userId) {
          // Actualizar nuestra tabla: pasar de 'trial' o 'vencida' a 'activa'
          const { error } = await supabase
            .from('suscripciones')
            .update({
              estado: 'activa',
              metodo_pago: 'mercadopago',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (error) {
            console.error('Error al actualizar suscripción:', error);
          } else {
            console.log('Suscripción activada para user:', userId);
          }
        }
      }

      // Si la suscripción fue cancelada o pausada
      if (suscripcionMP.status === 'cancelled' || suscripcionMP.status === 'paused') {
        const userId = suscripcionMP.external_reference;
        if (userId) {
          await supabase
            .from('suscripciones')
            .update({
              estado: 'cancelada',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          console.log('Suscripción cancelada para user:', userId);
        }
      }
    }

    // Siempre responder 200 para que MercadoPago no reintente
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Error en webhook MP:', err);
    // Igual responder 200 para evitar reintentos infinitos
    return res.status(200).json({ ok: true });
  }
}
