// /api/voz.js — Genera la voz de Pancho/Meli con Google Cloud Text-to-Speech
// El frontend manda el texto, este archivo le pide el audio a Google y devuelve un MP3.
// Usa las voces Chirp 3 HD (es-US, español latino neutro), cálidas y naturales.

// ─────────────────────────────────────────────────────────────
// VOCES (se cambian acá fácil cuando quieras probar otras)
//
// Masculinas disponibles (Chirp 3 HD es-US):
//   es-US-Chirp3-HD-Charon  → grave, serena (la más grave, pega con la cara)
//   es-US-Chirp3-HD-Orus    → rica, narrativa (cálida pero más aguda)
//   es-US-Chirp3-HD-Puck    → brillante, expresiva (más viva) ← buena para el Pancho pícaro
//   es-US-Chirp3-HD-Fenrir  → enérgica, juvenil
//
// Femeninas disponibles:
//   es-US-Chirp3-HD-Gacrux  → cálida y dulce ← elegida
//   es-US-Chirp3-HD-Leda    → cálida, conversacional
//   es-US-Chirp3-HD-Aoede   → calma, suave
//   es-US-Chirp3-HD-Kore    → neutra, informativa
// ─────────────────────────────────────────────────────────────
const VOZ_PANCHO = 'es-US-Chirp3-HD-Charon'; // masculina grave, pega con la cara de Pancho
const VOZ_MELI   = 'es-US-Chirp3-HD-Gacrux'; // femenina cálida y dulce

// Velocidad de cada voz (1.0 = natural; más alto = más ágil).
// Subidas para que no suenen lentas: los abuelos entienden bien igual,
// pero la conversación se siente más viva y natural.
const VELOCIDAD_PANCHO = 1.18; // antes 1.05 (sonaba algo lento)
const VELOCIDAD_MELI   = 1.15; // antes 0.92 (sonaba muy lento)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { texto, genero } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: 'Falta el texto' });
    }
    // Limpiar el texto: sacar links y emojis para que no los "lea"
    const limpio = texto
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, '')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!limpio) {
      return res.status(400).json({ error: 'Texto vacío después de limpiar' });
    }
    // Elegir voz según el personaje.
    // OJO: las voces Chirp 3 HD NO soportan "pitch" (tono). Solo speakingRate.
    // La diferencia de voz entre Pancho y Meli ya viene dada por ser dos voces distintas.
    const esMeli = genero === 'female';
    const voiceName = esMeli ? VOZ_MELI : VOZ_PANCHO;
    const speakingRate = esMeli ? VELOCIDAD_MELI : VELOCIDAD_PANCHO;
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      console.error('Falta GOOGLE_TTS_API_KEY en las variables de entorno');
      return res.status(500).json({ error: 'Configuración de voz incompleta' });
    }
    // Pedir el audio a Google Cloud TTS
    const googleResp = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: limpio },
          voice: {
            languageCode: 'es-US',
            name: voiceName
          },
          audioConfig: {
            audioEncoding: 'MP3',
            // Chirp 3 HD solo acepta speakingRate (NO pitch)
            speakingRate: speakingRate
          }
        })
      }
    );
    if (!googleResp.ok) {
      const errText = await googleResp.text();
      console.error('Error de Google TTS:', errText);
      return res.status(500).json({ error: 'No se pudo generar la voz' });
    }
    const data = await googleResp.json();
    // Google devuelve el audio en base64
    return res.status(200).json({ audio: data.audioContent });
  } catch (error) {
    console.error('Error en /api/voz:', error);
    return res.status(500).json({ error: 'Error al generar la voz' });
  }
}
