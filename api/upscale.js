export default async function handler(req, res) {
    const apiKey = process.env.HUGGING_FACE_TOKEN;
    
    // HEMOS CAMBIADO LA URL POR UN MODELO MÁS ESTABLE
    const modelEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-x4-upscaler";

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