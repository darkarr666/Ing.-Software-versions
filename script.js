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
            const ctx = originalCanvas.getContext('2d');
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(originalFile);

    processButton.disabled = false;
    processButton.textContent = "Mejorar con IA (Hugging Face)";
    resultContainer.style.display = 'none';
    statusText.textContent = "Imagen lista para ser enviada a la IA.";
});


// --- LÓGICA DE PROCESAMIENTO CON HUGGING FACE ---
processButton.addEventListener('click', async () => {
    if (!originalFile) {
        alert("Por favor, sube una imagen primero.");
        return;
    }

    processButton.disabled = true;
    statusText.textContent = "Enviando imagen a la IA... (El primer uso puede tardar un minuto)";
    resultContainer.style.display = 'none';

    try {
        // Obtenemos el tipo de archivo para enviarlo en el header
        const fileType = originalFile.type;

        const response = await fetch("/api/upscale", {
            method: "POST",
            headers: { "Content-Type": fileType }, // Enviamos el tipo de archivo correcto
            body: originalFile, 
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Ocurrió un error en el servidor.");
        }
        
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        resultImage.src = imageUrl;
        downloadLink.href = imageUrl;
        resultContainer.style.display = 'block';
        statusText.textContent = "¡Imagen mejorada por la IA con éxito!";

    } catch (error) {
        statusText.textContent = `Error: ${error.message}`;
        alert(`Error: ${error.message}`);
    }

    processButton.disabled = false;
});