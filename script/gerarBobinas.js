// ===== GERA 100 BOBINAS AUTOMÁTICAS COM QR CODE =====
document.addEventListener("DOMContentLoaded", () => {
  const btnGerar = document.getElementById("gerarBobinas");
  if (!btnGerar) return;

  btnGerar.addEventListener("click", async () => {
    if (!window.QRCode) {
      alert("⚠️ Biblioteca QRCode.js não carregada!");
      return;
    }

    const confirmar = confirm("Gerar 100 bobinas de teste com QR Codes?");
    if (!confirmar) return;

    const novas = [];
    const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");

    for (let i = 1; i <= 30; i++) {
      const rastro = `BND-${String(i).padStart(3, "0")}`;
      const link = `${base}bobina.html?rastro=${encodeURIComponent(rastro)}`;
      const tempDiv = document.createElement("div");
      document.body.appendChild(tempDiv);

      new QRCode(tempDiv, { text: link, width: 150, height: 150 });
      await new Promise((res) => setTimeout(res, 20)); // tempo pro canvas renderizar

      const canvas = tempDiv.querySelector("canvas");
      const qrBase64 = canvas ? canvas.toDataURL("image/png") : "";
      tempDiv.remove();

      novas.push({
        rastro,
        data: new Date().toISOString().split("T")[0],
        status: ["Liberada", "Bloqueada", "Aguardando Laudo"][Math.floor(Math.random() * 3)],
        tipo: ["PEWQ", "PEWS"][Math.floor(Math.random() * 2)],
        diametro: [4.00, 4.76, 6.00][Math.floor(Math.random() * 3)],
        comprimento: Math.floor(Math.random() * 500) + 500,
        peso: (Math.random() * 20 + 5).toFixed(2),
        furos: Math.floor(Math.random() * 10),
        observacoes: "Gerada automaticamente.",
        qrCode: qrBase64
      });
    }

    const antigas = JSON.parse(localStorage.getItem("bobinas")) || [];
    localStorage.setItem("bobinas", JSON.stringify([...antigas, ...novas]));
    alert("✅ 100 bobinas geradas com sucesso!");
    location.reload();
  });
});
