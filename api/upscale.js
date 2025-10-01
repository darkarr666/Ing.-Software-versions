// pages/api/upscale.js

export const config = {
  api: { bodyParser: false }, // ¡Clave! No parses multipart, lo proxyamos como stream
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res
        .status(405)
        .json({ detail: 'Usa POST con multipart/form-data y el campo "image"' });
    }

    const apiKey = (process.env.DEEPAI_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(500).json({ detail: 'Falta DEEPAI_API_KEY en el servidor' });
    }

    // Log de diagnóstico (no expongas la key completa)
    console.log('DeepAI key starts with:', apiKey.slice(0, 6));

    const contentType = req.headers['content-type'] || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      return res.status(400).json({ detail: 'Content-Type debe ser multipart/form-data' });
    }

    // Proxy directo del stream del cliente a DeepAI (conserva el boundary)
    const deepaiRes = await fetch('https://api.deepai.org/api/torch-srgan', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': contentType },
      body: req, // reenviamos el stream crudo
    });

    const deepaiText = await deepaiRes.text();
    if (!deepaiRes.ok) {
      // DeepAI devuelve 401 cuando la key no llega/está mal
      return res.status(deepaiRes.status).json({ detail: `DeepAI: ${deepaiText}` });
    }

    let data;
    try {
      data = JSON.parse(deepaiText);
    } catch {
      return res.status(502).json({ detail: 'Respuesta no válida de DeepAI' });
    }

    const outputUrl = data?.output_url;
    if (!outputUrl) {
      return res.status(502).json({ detail: 'DeepAI no devolvió output_url' });
    }

    const imgRes = await fetch(outputUrl);
    if (!imgRes.ok) {
      return res.status(502).json({ detail: 'No se pudo descargar la imagen resultante' });
    }

    const contentTypeOut = imgRes.headers.get('Content-Type') || 'image/png';
    const buf = Buffer.from(await imgRes.arrayBuffer());
    res.setHeader('Content-Type', contentTypeOut);
    return res.send(buf);
  } catch (e) {
    console.error('Error en /api/upscale:', e);
    return res.status(500).json({ detail: e.message || 'Error interno' });
  }
}
