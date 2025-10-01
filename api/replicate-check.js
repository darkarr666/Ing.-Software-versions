export default async function handler(req, res) {
    const apiKey = process.env.REPLICATE_API_KEY;
    const { predictionUrl } = req.body;

    const response = await fetch(predictionUrl, {
        headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
        },
    });

    const prediction = await response.json();
    res.status(200).json(prediction);
}