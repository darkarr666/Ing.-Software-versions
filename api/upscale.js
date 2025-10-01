export default async function handler(req, res) {
    const apiKey = process.env.HUGGING_FACE_TOKEN;
    const modelEndpoint = "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN";

    // Obtenemos el tipo de contenido del header que nos envía el script.js
    const contentType = req.headers['content-type'];
    const imageBlob = req.body;

    try {
        const response = await fetch(modelEndpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": contentType, // Usamos el tipo de archivo original
            },
            body: imageBlob,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error de la API de Hugging Face: ${response.status} - ${errorText}`);
        }

        const resultBlob = await response.blob();
        
        res.setHeader('Content-Type', resultBlob.type);
        const buffer = await resultBlob.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: error.message });
    }
}