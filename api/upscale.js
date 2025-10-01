export default async function handler(req, res) {
    const apiKey = process.env.DEEPAI_API_KEY;
    
    // Este es el endpoint de DeepAI para mejorar resolución
    const modelEndpoint = "https://api.deepai.org/api/torch-srgan";

    try {
        // DeepAI usa 'multipart/form-data', por lo que reenviamos los headers y el body
        const response = await fetch(modelEndpoint, {
            method: "POST",
            headers: {
                "api-key": apiKey,
                // Pasamos los headers del frontend que contienen la info del form-data
                ...req.headers,
            },
            body: req.body,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error de la API de DeepAI: ${error.err || response.statusText}`);
        }

        const data = await response.json();
        const outputUrl = data.output_url;

        // Descargamos la imagen mejorada para enviarla al usuario
        const imageResponse = await fetch(outputUrl);
        if (!imageResponse.ok) {
            throw new Error("No se pudo descargar la imagen mejorada desde DeepAI.");
        }
        
        const resultBlob = await imageResponse.blob();
        
        res.setHeader('Content-Type', resultBlob.type);
        const buffer = await resultBlob.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Error en la función del servidor:", error.message);
        res.status(500).json({ detail: error.message });
    }
}