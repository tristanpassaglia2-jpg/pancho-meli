// ═══════════════════════════════════════════════════════
// PANCHO & MELI — Envío del aviso de salud por WhatsApp
// ⚠️ VERSIÓN DE PRUEBA: usa la plantilla 'alerta_emergencia'
//    (ya aprobada) para testear que todo el caño funciona.
//    👉 Cuando 'pancho_y_meli' esté Activa, volvemos a esa.
// ═══════════════════════════════════════════════════════

const GRAPH_VERSION = 'v22.0';
const PLANTILLA = 'alerta_emergencia';   // ⚠️ PRUEBA — luego volver a 'pancho_y_meli'
const IDIOMA = 'es_AR';

// Normaliza un teléfono argentino al formato que pide WhatsApp (549...)
function normalizarTelefonoAR(raw) {
  let n = String(raw || '').replace(/\D/g, ''); // solo dígitos
  if (!n) return null;
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith('54')) {
    let resto = n.slice(2);
    if (resto.startsWith('0')) resto = resto.slice(1);
    if (!resto.startsWith('9')) resto = '9' + resto; // celular AR lleva 9
    return '54' + resto;
  }
  if (n.startsWith('0')) n = n.slice(1);
  if (n.startsWith('9')) return '54' + n;
  return '549' + n;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'metodo_no_permitido' });
  }

  const TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!TOKEN || !PHONE_ID) {
    console.error('Faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID');
    return res.status(500).json({ ok: false, error: 'config_incompleta' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { telefono, nombreAbuelo } = body || {};

  const para = normalizarTelefonoAR(telefono);
  if (!para) {
    return res.status(400).json({ ok: false, error: 'telefono_invalido' });
  }
  const nombre = (nombreAbuelo && String(nombreAbuelo).trim()) || 'Tu ser querido';

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: para,
    type: 'template',
    template: {
      name: PLANTILLA,
      language: { code: IDIOMA },
      components: [
        { type: 'body', parameters: [{ type: 'text', text: nombre }] }
      ]
    }
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('Error de Meta al enviar WhatsApp:', JSON.stringify(data));
      return res.status(502).json({ ok: false, error: 'meta_error', detalle: data });
    }
    return res.status(200).json({ ok: true, resultado: data });
  } catch (err) {
    console.error('Error al enviar WhatsApp:', err);
    return res.status(500).json({ ok: false, error: 'fallo_envio' });
  }
}
