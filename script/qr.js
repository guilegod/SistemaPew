// ===== QR Code – Sistema Bundy =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const val = (id) => document.getElementById(id)?.value?.trim() || "";
    const bobina = {
      rastro: val("rastro"),
      data: val("data"),
      tipo: val("tipo"),
      diametro: val("diametro"),
      comprimento: val("comprimento"),
      peso: parseFloat(val("peso") || 0),
      furos: parseInt(val("furos") || 0),
      status: val("status"),
      observacoes: val("observacoes"),
      turno: val("turno"),
    };

    if (!bobina.rastro) {
      alert("⚠️ Informe o Rastro da Bobina!");
      return;
    }

    // Gera o link da bobina
    const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
    const linkBobina = `${base}bobina.html?rastro=${encodeURIComponent(bobina.rastro)}`;

    // Gera o QR Code dentro de um div temporário invisível
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    const qrcode = new QRCode(tempDiv, {
      text: linkBobina,
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Aguarda o canvas ser desenhado e salva como base64
    setTimeout(() => {
      const canvas = tempDiv.querySelector("canvas");
      if (canvas) {
        bobina.qrCode = canvas.toDataURL("image/png");
      } else {
        console.warn("⚠️ Canvas do QR não encontrado.");
        bobina.qrCode = null;
      }

      // Salva no localStorage
      const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];
      bobinas.push(bobina);
      localStorage.setItem("bobinas", JSON.stringify(bobinas));

      // Remove o div temporário
      tempDiv.remove();

      // Mostra o QR na tela
      mostrarQRCode(linkBobina, bobina.rastro);

      alert(`✅ Bobina ${bobina.rastro} cadastrada com sucesso!`);
      form.reset();
    }, 500);
  });

  // Função para exibir o QR Code na tela
  function mostrarQRCode(url, rastro) {
    let qrContainer = document.getElementById("qrContainer");
    if (!qrContainer) {
      qrContainer = document.createElement("div");
      qrContainer.id = "qrContainer";
      qrContainer.style.textAlign = "center";
      qrContainer.style.marginTop = "20px";
      form.insertAdjacentElement("afterend", qrContainer);
    }

    qrContainer.innerHTML = "";
    new QRCode(qrContainer, { text: url, width: 200, height: 200 });

    const legenda = document.createElement("p");
    legenda.textContent = `📎 QR da Bobina: ${rastro}`;
    legenda.style.color = "#e2e8f0";
    legenda.style.fontWeight = "bold";
    legenda.style.marginTop = "10px";
    qrContainer.appendChild(legenda);
  }
});
