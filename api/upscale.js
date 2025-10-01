export default async function handler(req, res) {
    const apiKey = process.env.HUGGING_FACE_TOKEN;
    
    // Usamos el modelo original que es el correcto para esta tarea
    const modelEndpoint = "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN";

    // --- CÓDIGO DE DIAGNÓSTICO #1 ---
    // Esta línea se imprimirá en los logs de Vercel para ver la URL que se está usando.
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
            const errorText = await response.text();
            console.error("Error detallado de la API de Hugging Face:", errorText);
            
            // --- CÓDIGO DE DIAGNÓSTICO #2 ---
            // Este es el nuevo mensaje de error que debemos ver para confirmar la actualización.
            throw new Error(`ESTOY USANDO LA VERSIÓN NUEVA DEL CÓDIGO. El error original fue: ${response.status} - ${errorText}`);
        }

        const resultBlob = await response.blob();
        
        res.setHeader('Content-Type', resultBlob.type);
        const buffer = await resultBlob.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Error en la función del servidor:", error.message);
        res.status(500).json({ detail: error.message });
    }
}