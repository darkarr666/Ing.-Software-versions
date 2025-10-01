const uploadInput = document.getElementById('uploadInput');
const originalCanvas = document.getElementById('originalCanvas');
const processButton = document.getElementById('processButton');
const statusText = document.getElementById('status');
const resultContainer = document.getElementById('result-container');
const resultImage = document.getElementById('resultImage');
const downloadLink = document.getElementById('downloadLink');

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
  processButton.textContent = 'Mejorar con IA (Hugging Face)';
  resultContainer.style.display = 'none';
  statusText.textContent = 'Imagen lista para enviar a la IA.';
});

processButton.addEventListener('click', async () => {
  if (!originalFile) {
    alert('Por favor, sube una imagen primero.');
    return;
  }
  processButton.disabled = true;
  statusText.textContent = 'Enviando imagen a la IA...';
  resultContainer.style.display = 'none';

  try {
    // Enviar el archivo "crudo" como body (SIN FormData)
    const response = await fetch('/api/upscale', {
      method: 'POST',
      headers: {
        'Content-Type': originalFile.type || 'application/octet-stream',
      },
      body: originalFile, // ← binario directo
    });

    if (!response.ok) {
      let msg = 'Ocurrió un error en el servidor.';
      try { const { detail } = await response.json(); if (detail) msg = detail; } catch {}
      throw new Error(msg);
    }

    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);

    resultImage.src = imageUrl;
    downloadLink.href = imageUrl;
    resultContainer.style.display = 'block';
    statusText.textContent = '¡Imagen mejorada por la IA con éxito!';
  } catch (error) {
    statusText.textContent = `Error: ${error.message}`;
    alert(`Error: ${error.message}`);
  } finally {
    processButton.disabled = false;
  }
});
