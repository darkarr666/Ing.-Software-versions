export default async function handler(req, res) {
    console.log("Iniciando función de prueba de API key.");

    const apiKey = process.env.DEEPAI_API_KEY;

    // Comprobamos si la clave existe y tiene un largo razonable
    if (apiKey && apiKey.length > 10) { 
        console.log("Prueba exitosa: La clave API fue encontrada en el servidor.");
        res.status(200).json({ 
            status: "Éxito", 
            message: "La clave API (DEEPAI_API_KEY) fue encontrada correctamente en el servidor de Vercel." 
        });
    } else {
        console.error("Prueba fallida: La clave API NO fue encontrada o está vacía.");
        res.status(500).json({ 
            status: "Error", 
            message: "La clave API (DEEPAI_API_KEY) NO fue encontrada o está vacía en el servidor de Vercel. Revisa la configuración del proyecto." 
        });
    }
}