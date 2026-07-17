// ═══════════════════════════════════════════════════════
// PANCHO & MELI — SUSCRIPCIÓN CON MERCADOPAGO
// Crea una suscripción mensual con 7 días gratis.
// El familiar toca "Suscribirme", se va a MercadoPago,
// autoriza el pago, y vuelve a la app.
// ═══════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  const { email, nombre_abuelo, user_id } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Falta el email' });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MercadoPago no configurado' });
  }

  try {
    // Crear suscripción con 7 días gratis usando la API de preapproval
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        reason: `Pancho&Meli - Compañero para ${nombre_abuelo || 'tu ser querido'}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 13500,
          currency_id: 'ARS',
          free_trial: {
            frequency: 7,
            frequency_type: 'days'
          }
        },
        back_url: 'https://pancho-meli.vercel.app/configurar',
        notification_url: 'https://pancho-meli.vercel.app/api/webhook-mp',
        payer_email: email,
        external_reference: user_id || email
      })
    });

    const data = await response.json();

    if (data.init_point) {
      return res.status(200).json({
        ok: true,
        url: data.init_point,
        id: data.id
      });
    } else {
      console.error('Error MercadoPago:', JSON.stringify(data));
      return res.status(400).json({
        ok: false,
        error: data.message || 'No se pudo crear la suscripción',
        detalle: data
      });
    }
  } catch (err) {
    console.error('Error al crear suscripción:', err);
    return res.status(500).json({ error: 'Error interno al procesar el pago' });
  }
}
