(() => {
  const video   = document.getElementById('preview');
  const canvas  = document.getElementById('canvas');
  const ctx     = canvas.getContext('2d');
  const status  = document.getElementById('status');
  const result  = document.getElementById('result');
  const btnStart  = document.getElementById('btnStart');
  const btnSwitch = document.getElementById('btnSwitch');
  const permHint  = document.getElementById('permHint');

  let stream = null;
  let devices = [];
  let currentIndex = 0;
  let scanning = false;
  let rafId = null;

  async function listCameras() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      devices = all.filter(d => d.kind === 'videoinput');
      btnSwitch.disabled = devices.length <= 1;
    } catch (e) {
      console.warn('enumerateDevices falhou:', e);
    }
  }

  async function openCamera(index = 0) {
    stopCamera();

    const preferBack = devices[index]?.deviceId
      ? { deviceId: { exact: devices[index].deviceId } }
      : { facingMode: { ideal: 'environment' } };

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: preferBack, audio: false });
      video.srcObject = stream;
      await video.play();

      // ajusta canvas p/ leitura
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      status.textContent = 'Câmera ativa. Aponte para um QR Code.';
      permHint.textContent = '';
      scanning = true;
      tick();
    } catch (err) {
      status.textContent = 'Não foi possível abrir a câmera: ' + err.message;
      permHint.textContent = 'Dica: use HTTPS (túnel) e permita a câmera no navegador.';
      console.error(err);
    }
  }

  function stopCamera() {
    scanning = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function tick() {
    if (!scanning) return;
    rafId = requestAnimationFrame(tick);

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });

    if (code && code.data) {
      scanning = false;
      if (navigator.vibrate) navigator.vibrate(80);

      const txt = code.data.trim();
      result.style.display = 'block';
      result.textContent = 'QR lido: ' + txt;
      status.textContent = 'QR reconhecido!';

      // Se for link da bobina, abre direto:
      try {
        const url = new URL(txt);
        if (url.pathname.endsWith('/bobina.html') && url.searchParams.get('rastro')) {
          window.location.href = txt;
          return;
        }
      } catch { /* não é URL */ }

      // Se não for URL válido, apenas mostra o texto lido
    }
  }

  btnStart.addEventListener('click', async () => {
    // Primeiro peça permissão, em alguns browsers é necessário gesto do usuário
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status.textContent = 'Seu navegador não suporta acesso à câmera.';
      return;
    }
    await listCameras();
    currentIndex = 0;
    openCamera(currentIndex);
  });

  btnSwitch.addEventListener('click', () => {
    if (!devices.length) return;
    currentIndex = (currentIndex + 1) % devices.length;
    openCamera(currentIndex);
  });

  // dica de permissão
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    permHint.textContent = 'Dica: abra via HTTPS (lt/ngrok) para o navegador liberar a câmera.';
  }
})();
