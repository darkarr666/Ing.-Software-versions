export default async function handler(req, res) {
    const apiKey = process.env.HUGGING_FACE_TOKEN;
    
    // Volvemos al modelo correcto y original para esta tarea
    const modelEndpoint = "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN";

    // --- CÓDIGO DE DIAGNÓSTICO ---
    // Esto imprimirá en los logs de Vercel para confirmar que la URL es correcta
    console.log("Intentando llamar a la API en esta URL:", modelEndpoint);

    const contentType = req.headers['content-type'];
    const imageBlob = req.body;

    try {
        const response = await fetch(modelEndpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": contentType,
            },
            body: imageBlob,
        });

        if (!response.ok) {
            // Si hay un error, intentamos leer el texto del error para más detalles
            const errorText = await response.text();
            console.error("Error detallado de la API de Hugging Face:", errorText);
            throw new Error(`Error de la API de Hugging Face: ${response.status} - ${errorText}`);
        }

        const resultBlob = await response.blob();
        
        res.setHeader('Content-Type', resultBlob.type);
        const buffer = await resultBlob.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        // Esto asegura que veamos el error en los logs de Vercel
        console.error("Error en la función del servidor:", error.message);
        res.status(500).json({ detail: error.message });
    }
}