// /api/upscale.js  — Vercel Serverless Function (Node.js)

const HF_MODEL = 'nateraw/real-esrgan'; // super-resolución (Real-ESRGAN)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.json({ detail: 'Usa POST enviando el binario de la imagen en el body' });
    }

    const apiKey = (process.env.HF_API_KEY || '').trim();
    if (!apiKey) {
      res.statusCode = 500;
      return res.json({ detail: 'Falta HF_API_KEY en el servidor' });
    }

    // Leemos el cuerpo completo como Buffer (para poder reintentar si hace falta)
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const imageBuffer = Buffer.concat(chunks);

    if (!imageBuffer?.length) {
      res.statusCode = 400;
      return res.json({ detail: 'No llegó imagen en el body' });
    }

    const contentTypeIn =
      (req.headers['content-type'] && String(req.headers['content-type'])) ||
      'application/octet-stream';

    // Función que llama a HF con reintentos si el modelo está cargando
    async function callHFWithRetry(buffer, tries = 3) {
      let lastText = '';
      for (let i = 0; i < tries; i++) {
        const hfRes = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': contentTypeIn, // image/png o image/jpeg normalmente
            Accept: 'image/png',           // pedimos imagen
          },
          body: buffer, // Buffer (no stream) → no hace falta 'duplex'
        });

        // Si el modelo está "cargando", HF devuelve 503 con JSON (estimated_time)
        if (hfRes.status === 503) {
          const j = await hfRes.json().catch(() => null);
          const waitMs = Math.ceil((j?.estimated_time ?? 5) * 1000);
          await new Promise(r => setTimeout(r, waitMs));
          continue; // reintenta
        }

        const ct = hfRes.headers.get('Content-Type') || '';
        const text = await (ct.includes('application/json') ? hfRes.text() : Promise.resolve(''));
        lastText = text;

        if (!hfRes.ok) {
          // Error real (no es 503 de carga)
          throw new Error(text || `HF error ${hfRes.status}`);
        }

        // Ok: devolvemos la imagen
        const arrBuf = await hfRes.arrayBuffer();
        return { buf: Buffer.from(arrBuf), ct: ct || 'image/png' };
      }
      throw new Error(lastText || 'Modelo ocupado. Intenta de nuevo.');
    }

    const { buf, ct } = await callHFWithRetry(imageBuffer);

    res.setHeader('Content-Type', ct);
    res.statusCode = 200;
    return res.end(buf);
  } catch (e) {
    console.error('Error en /api/upscale (HF):', e);
    res.statusCode = 500;
    return res.json({ detail: e?.message || 'Error interno' });
  }
}
