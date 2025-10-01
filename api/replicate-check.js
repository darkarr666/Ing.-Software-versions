export default async function handler(req, res) {
    // La clave se lee de forma SEGURA desde las variables de entorno de Vercel
    const apiKey = process.env.REPLICATE_API_KEY;
    
    // Solo necesitamos la URL de predicción que envía el frontend
    const { predictionUrl } = req.body;

    const response = await fetch(predictionUrl, {
        headers: {
            Authorization: `Token ${apiKey}`, // Se usa la clave segura
            "Content-Type": "application/json",
        },
    });

    const prediction = await response.json();
    res.status(200).json(prediction);
}