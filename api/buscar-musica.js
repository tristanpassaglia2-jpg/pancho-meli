// /api/buscar-musica.js — Busca un video en YouTube por nombre y devuelve su ID.
// El frontend manda "Artista - Canción", esto consulta la YouTube Data API
// y devuelve el videoId del primer resultado para embeberlo en el chat.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query } = req.body || {};
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Falta la búsqueda' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('Falta YOUTUBE_API_KEY en las variables de entorno');
      return res.status(500).json({ error: 'Configuración de música incompleta' });
    }

    const url = 'https://www.googleapis.com/youtube/v3/search'
      + '?part=snippet&type=video&videoEmbeddable=true&maxResults=1'
      + '&q=' + encodeURIComponent(query.trim())
      + '&key=' + apiKey;

    const yt = await fetch(url);
    if (!yt.ok) {
      const errText = await yt.text();
      console.error('Error de YouTube API:', errText);
      return res.status(500).json({ error: 'No se pudo buscar la música' });
    }

    const data = await yt.json();
    const item = (data.items || [])[0];
    const videoId = item?.id?.videoId || null;
    const titulo = item?.snippet?.title || '';

    if (!videoId) {
      return res.status(200).json({ videoId: null });
    }
    return res.status(200).json({ videoId, titulo });
  } catch (error) {
    console.error('Error en /api/buscar-musica:', error);
    return res.status(500).json({ error: 'Error al buscar la música' });
  }
}
