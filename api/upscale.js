export default async function handler(req, res) {
    const apiKey = process.env.DEEPAI_API_KEY;
    
    // Línea de diagnóstico para estar 100% seguros
    console.log("Revisando la API Key de DeepAI en el servidor:", apiKey ? "Clave encontrada" : "Clave NO encontrada (undefined)");

    const modelEndpoint = "https://api.deepai.org/api/torch-srgan";

    try {
        const response = await fetch(modelEndpoint, {
            method: "POST",
            headers: {
                // ESTA ES LA CORRECCIÓN:
                // Solo enviamos los encabezados estrictamente necesarios.
                "api-key": apiKey,
                "Content-Type": req.headers['content-type'], // El tipo de contenido que nos envió el navegador
            },
            body: req.body,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error de la API de DeepAI: ${error.err || response.statusText}`);
        }

        const data = await response.json();
        const outputUrl = data.output_url;

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