export default async function handler(req, res) {
    const apiKey = process.env.REPLICATE_API_KEY;
    const { imageUrl } = req.body;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            // ESTA ES LA VERSIÓN ACTUALIZADA DEL MODELO
            version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
            input: { 
                image: imageUrl, 
                scale: 2 
            },
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