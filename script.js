const uploadInput = document.getElementById('uploadInput');
const originalCanvas = document.getElementById('originalCanvas');
const processButton = document.getElementById('processButton');
const statusText = document.getElementById('status');

let originalFile = null;

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
    processButton.textContent = "Iniciar Diagnóstico";
    statusText.textContent = "Listo para iniciar prueba.";
});

processButton.addEventListener('click', async () => {
    if (!originalFile) {
        alert("Por favor, sube una imagen primero.");
        return;
    }
    processButton.disabled = true;
    statusText.textContent = "Ejecutando prueba de diagnóstico en el servidor...";

    try {
        // Llamamos a nuestra función de prueba
        const response = await fetch("/api/upscale", { method: "POST" });
        const data = await response.json();

        // Mostramos el resultado de la prueba en una alerta para que sea muy claro
        alert(`Resultado del diagnóstico del servidor:\n\nStatus: ${data.status}\nMensaje: ${data.message}`);
        
        statusText.textContent = "Prueba completada.";

    } catch (error) {
        alert(`Error al contactar la función de prueba: ${error.message}`);
    }

    processButton.disabled = false;
});