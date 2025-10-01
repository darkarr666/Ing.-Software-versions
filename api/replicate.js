export default async function handler(req, res) {
    // La clave se lee de forma SEGURA desde las variables de entorno de Vercel
    const apiKey = process.env.REPLICATE_API_KEY;

    // Solo necesitamos la URL de la imagen que envía el frontend
    const { imageUrl } = req.body;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
            Authorization: `Token ${apiKey}`, // Se usa la clave segura
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            version: "42fed1c4974146d4d2414e2be2c5236e0a7c665a7c3a031e4442db724245831f",
            input: { img: imageUrl, scale: 2 },
        }),
    });

    if (response.status !== 201) {
        let error = await response.json();
        res.status(500).json({ detail: error.detail });
        return;
    }

    const prediction = await response.json();
    res.status(201).json(prediction);
}