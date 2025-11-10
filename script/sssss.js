document.addEventListener("DOMContentLoaded", () => {
  const btn = document.createElement("button");
  btn.textContent = "⚙️ Gerar 100 Bobinas de Teste";
  btn.style = "margin:20px;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;";
  document.body.prepend(btn);

  btn.addEventListener("click", async () => {
    const bobinas = [];
    for (let i = 1; i <= 100; i++) {
      const rastro = `BNDY-${String(i).padStart(4, "0")}`;
      const data = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const status = i % 3 === 0 ? "Bloqueada" : i % 2 === 0 ? "Liberada" : "Aguardando Laudo";

      const bobina = {
        rastro,
        data,
        tipo: ["PEWQ", "PEWS"][i % 2],
        diametro: ["4.00", "4.76"][i % 2],
        comprimento: 1000 + i * 10,
        peso: (Math.random() * 8 + 10).toFixed(2),
        furos: Math.floor(Math.random() * 20),
        status,
        observacoes: "",
      };

      // Gera QR base64
      const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
      const link = `${base}bobina.html?rastro=${encodeURIComponent(rastro)}`;
      const tempDiv = document.createElement("div");
      new QRCode(tempDiv, { text: link, width: 100, height: 100 });
      await new Promise(r => setTimeout(r, 50)); // aguarda canvas
      const canvas = tempDiv.querySelector("canvas");
      bobina.qrCode = canvas?.toDataURL("image/png") || "";
      bobinas.push(bobina);
    }

    localStorage.setItem("bobinas", JSON.stringify(bobinas));
    alert("✅ 100 Bobinas geradas com sucesso!");
    location.reload();
  });
});
