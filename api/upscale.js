// /api/upscale.js  (Vercel Serverless Function - Node runtime)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.json({ detail: 'Usa POST con multipart/form-data y el campo "image"' });
    }

    const apiKey = (process.env.DEEPAI_API_KEY || '').trim();
    if (!apiKey) {
      res.statusCode = 500;
      return res.json({ detail: 'Falta DEEPAI_API_KEY en el servidor' });
    }

    // Diagnóstico (no expongas la key completa en prod)
    console.log('DeepAI key starts with:', apiKey.slice(0, 6));

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (!contentType.startsWith('multipart/form-data')) {
      res.statusCode = 400;
      return res.json({ detail: 'Content-Type debe ser multipart/form-data' });
    }

    // Proxy del stream al endpoint de DeepAI
    const deepaiRes = await fetch('https://api.deepai.org/api/torch-srgan', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': req.headers['content-type'], // conserva el boundary
      },
      body: req,             // <--- stream
      duplex: 'half',        // <--- CLAVE en Node 18+ cuando envías streams
    });

    const deepaiText = await deepaiRes.text();
    if (!deepaiRes.ok) {
      res.statusCode = deepaiRes.status;
      return res.json({ detail: `DeepAI: ${deepaiText}` });
    }

    let data;
    try { data = JSON.parse(deepaiText); }
    catch {
      res.statusCode = 502;
      return res.json({ detail: 'Respuesta no válida de DeepAI' });
    }

    const outputUrl = data?.output_url;
    if (!outputUrl) {
      res.statusCode = 502;
      return res.json({ detail: 'DeepAI no devolvió output_url' });
    }

    const imgRes = await fetch(outputUrl);
    if (!imgRes.ok) {
      res.statusCode = 502;
      return res.json({ detail: 'No se pudo descargar la imagen resultante' });
    }

    const buf = Buffer.from(await imgRes.arrayBuffer());
    res.setHeader('Content-Type', imgRes.headers.get('Content-Type') || 'image/png');
    res.statusCode = 200;
    return res.end(buf);
  } catch (e) {
    console.error('Error en /api/upscale:', e);
    res.statusCode = 500;
    return res.json({ detail: e?.message || 'Error interno' });
  }
}
