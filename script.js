// --- OBTENER ELEMENTOS ---
const uploadInput = document.getElementById('uploadInput');
const originalCanvas = document.getElementById('originalCanvas');
const processButton = document.getElementById('processButton');
const statusText = document.getElementById('status');
const resultContainer = document.getElementById('result-container');
const resultImage = document.getElementById('resultImage');
const downloadLink = document.getElementById('downloadLink');

let originalFile = null;

// --- MANEJO DE CARGA DE IMAGEN ---
uploadInput.addEventListener('change', (event) => {
    originalFile = event.target.files[0];
    if (!originalFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const ctx = originalCanvas.getContext('d');
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(originalFile);

    processButton.disabled = false;
    processButton.textContent = "Mejorar con IA";
    resultContainer.style.display = 'none';
    statusText.textContent = "Imagen lista para ser enviada a la IA.";
});

// --- FUNCIÓN PARA ESPERAR ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- LÓGICA DE PROCESAMIENTO CON REPLICATE ---
processButton.addEventListener('click', async () => {
    if (!originalFile) {
        alert("Por favor, sube una imagen primero.");
        return;
    }

    processButton.disabled = true;
    statusText.textContent = "Enviando imagen a la IA...";
    resultContainer.style.display = 'none';

    const dataUrl = originalCanvas.toDataURL('image/png');

    try {
        const startResponse = await fetch("/api/replicate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: dataUrl }),
        });

        let prediction = await startResponse.json();
        if (startResponse.status !== 201) {
            throw new Error(prediction.detail || "Error al iniciar el proceso en la API.");
        }

        statusText.textContent = "La IA está trabajando... Esperando resultado.";

        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await sleep(2000); 
            const checkResponse = await fetch("/api/replicate-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ predictionUrl: prediction.urls.get }),
            });
            prediction = await checkResponse.json();
        }

        if (prediction.status === "succeeded") {
            const imageUrl = prediction.output;
            resultImage.src = imageUrl;
            downloadLink.href = imageUrl;
            resultContainer.style.display = 'block';
            statusText.textContent = "¡Imagen mejorada por la IA con éxito!";
        } else {
            throw new Error(`El proceso de IA falló: ${prediction.error}`);
        }

    } catch (error) {
        statusText.textContent = `Error: ${error.message}`;
        alert(`Error: ${error.message}`);
    }

    processButton.disabled = false;
});