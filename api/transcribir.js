// /api/transcribir.js — Convierte el audio del abuelo en texto con Google Cloud Speech-to-Text.
// El frontend graba la voz, la manda en formato PCM (LINEAR16) en base64, y este archivo
// se la pasa a Google. Usa la MISMA API key que la voz (GOOGLE_TTS_API_KEY).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { audio, sampleRate } = req.body || {};
    if (!audio) {
      return res.status(400).json({ error: 'Falta el audio' });
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      console.error('Falta GOOGLE_TTS_API_KEY en las variables de entorno');
      return res.status(500).json({ error: 'Configuración incompleta' });
    }

    // Pedir la transcripción a Google Cloud Speech-to-Text
    const googleResp = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: sampleRate || 16000,
            languageCode: 'es-AR',
            enableAutomaticPunctuation: true
          },
          audio: {
            content: audio
          }
        })
      }
    );

    if (!googleResp.ok) {
      const errText = await googleResp.text();
      console.error('Error de Google Speech-to-Text:', errText);
      return res.status(500).json({ error: 'No se pudo transcribir', detalle: errText });
    }

    const data = await googleResp.json();
    // Google devuelve results[].alternatives[].transcript
    const texto = (data.results || [])
      .map(r => (r.alternatives && r.alternatives[0] && r.alternatives[0].transcript) || '')
      .join(' ')
      .trim();

    return res.status(200).json({ texto });
  } catch (error) {
    console.error('Error en /api/transcribir:', error);
    return res.status(500).json({ error: 'Error al transcribir' });
  }
}
