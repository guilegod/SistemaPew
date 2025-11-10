document.addEventListener("DOMContentLoaded", () => {
  const listaBobinas = document.getElementById("listaBobinas");
  const totalSpan = document.getElementById("totalBobinas");
  const pesoSpan = document.getElementById("pesoTotal");

  // Helpers
  const getBobinas = () => {
    try { return JSON.parse(localStorage.getItem("bobinas")) || []; }
    catch { return []; }
  };

  const getStatusClass = (status) =>
    status === "Liberada" ? "verde" :
    status === "Bloqueada" ? "vermelho" : "amarelo";

  function renderizar(filtro = "todas") {
    const bobinas = getBobinas();
    listaBobinas.innerHTML = "";
    let filtradas = bobinas;

    if (filtro !== "todas") filtradas = filtradas.filter((b) => b.status === filtro);

    const filtroData = document.getElementById("filtroData")?.value || "";
    if (filtroData) filtradas = filtradas.filter((b) => String(b.data) === filtroData);

    const filtroRastro = document.getElementById("filtroRastro")?.value?.toLowerCase() || "";
    if (filtroRastro)
      filtradas = filtradas.filter((b) => (b.rastro || "").toLowerCase().includes(filtroRastro));

    let pesoTotal = 0;
    const modo = localStorage.getItem("modoVisual") || "estilo1";

    filtradas.forEach((b) => {
      const card = document.createElement("div");
      const statusClass = getStatusClass(b.status);
      const cor = b.status === "Liberada" ? "green" :
                  b.status === "Bloqueada" ? "red" : "orange";

      if (modo === "estilo1") {
        card.className = `card-bobina estilo1 ${statusClass}`;
        card.innerHTML = `
          <div class="left-status ${statusClass}"></div>
          <div class="right-info">
            <div class="badge-status ${statusClass}">${(b.status || "").toUpperCase()}</div>
            <h3>${b.rastro || "-"}</h3>
            <p>⚙️ <b>Tipo:</b> ${b.tipo || "-"}</p>
            <p>📏 <b>Diâmetro:</b> ${b.diametro || "-"}</p>
            <p>🧩 <b>Furos:</b> ${b.furos ?? "-"}</p>
            <p>📐 <b>Comprimento:</b> ${b.comprimento ?? 0} m</p>
            <p>⚖️ <b>Peso:</b> ${Number(b.peso || 0).toFixed(2)} kg</p>
            <p>🧾 <b>Observações:</b> <em>${b.observacoes || "Sem observações."}</em></p>
            <p>📅 <b>Data:</b> ${b.data || "-"}</p>
            <div class="card-actions">
              <button class="btn-detalhes">🔍 Ver Detalhes</button>
            </div>
          </div>
        `;
        card.querySelector(".btn-detalhes").addEventListener("click", () => abrirDetalhes(b));
      }

      listaBobinas.appendChild(card);
      pesoTotal += parseFloat(b.peso || 0);
    });

    totalSpan.textContent = filtradas.length;
    pesoSpan.textContent = pesoTotal.toFixed(2);
  }

  window.filtrar = renderizar;
  window.filtrarData = () => renderizar();
  window.filtrarRastro = () => renderizar();

  const modoSalvo = localStorage.getItem("modoVisual") || "estilo1";
  const elVisual = document.getElementById("selectVisual");
  if (elVisual) elVisual.value = modoSalvo;

  renderizar();
});

/* =========================
   Modal de detalhes + edição
   ========================= */
async function abrirDetalhes(bobina) {
  bobina._rastroOriginal = bobina.rastro;

  // ✅ Gera QR automaticamente se não existir
  if (!bobina.qrCode && typeof QRCode !== "undefined") {
    const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
    const link = `${base}bobina.html?rastro=${encodeURIComponent(bobina.rastro)}`;
    bobina.qrCode = await gerarQRBase64(link, 180);
    const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];
    const idx = bobinas.findIndex(b => b.rastro === bobina.rastro);
    if (idx !== -1) {
      bobinas[idx].qrCode = bobina.qrCode;
      localStorage.setItem("bobinas", JSON.stringify(bobinas));
    }
  }

  const modal = document.createElement("div");
  modal.className = "modal-detalhes";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="fechar" onclick="this.closest('.modal-detalhes').remove()">✖</button>
      <h2>Detalhes da Bobina</h2>

      <div class="modal-body">
        <ul>
          <li><b>Rastro:</b> ${bobina.rastro || "-"}</li>
          <li><b>Data:</b> ${bobina.data || "-"}</li>
          <li><b>Status:</b> ${bobina.status || "-"}</li>
          <li><b>Tipo:</b> ${bobina.tipo || "-"}</li>
          <li><b>Diâmetro:</b> ${bobina.diametro || "-"}</li>
          <li><b>Furos:</b> ${bobina.furos ?? "-"}</li>
          <li><b>Comprimento:</b> ${bobina.comprimento ?? 0} m</li>
          <li><b>Peso:</b> ${Number(bobina.peso || 0).toFixed(2)} kg</li>
          <li><b>Observações:</b> <em>${bobina.observacoes || "Sem observações."}</em></li>
        </ul>

        <div class="qr-section">
          ${
            bobina.qrCode
              ? `<img src="${bobina.qrCode}" width="180" alt="QR Code" class="qr-image">`
              : "<p>⚠️ Nenhum QR Code encontrado.</p>"
          }
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-acao editar">✏️ Editar</button>
        <button class="btn-acao imprimir" onclick="window.print()">🖨️ Imprimir QR</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // CSS Dinâmico
  const style = document.createElement("style");
  style.textContent = `
    .modal-detalhes {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex; justify-content: center; align-items: center;
      z-index: 9999;
    }
    .modal-content {
      background: #142c44; color: #fff;
      padding: 20px; border-radius: 12px;
      width: 90%; max-width: 420px;
      max-height: 90vh; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .modal-body {
      overflow-y: auto;
      flex: 1;
      margin-bottom: 15px;
    }
    .qr-image { display: block; margin: 10px auto; border-radius: 10px; }
  `;
  document.head.appendChild(style);

  modal.querySelector(".btn-acao.editar").addEventListener("click", () => editarBobina(bobina, modal));
}

/* ====== Gerar QR Base64 ====== */
function gerarQRBase64(texto, size = 160) {
  return new Promise((resolve) => {
    if (typeof QRCode === "undefined") return resolve("");
    const tmp = document.createElement("div");
    tmp.style.position = "fixed";
    tmp.style.left = "-9999px";
    document.body.appendChild(tmp);

    new QRCode(tmp, { text: texto, width: size, height: size });
    setTimeout(() => {
      const canvas = tmp.querySelector("canvas");
      let dataUrl = canvas ? canvas.toDataURL("image/png") : "";
      tmp.remove();
      resolve(dataUrl);
    }, 120);
  });
}

/* ====== Editar e Salvar ====== */
async function editarBobina(bobina, modal) {
  const lista = modal.querySelectorAll("ul li");
  const campos = ["rastro", "data", "status", "tipo", "diametro", "furos", "comprimento", "peso", "observacoes"];

  lista.forEach((li, i) => {
    const chave = campos[i];
    if (!chave) return;
    const valor = bobina[chave] || "";
    li.innerHTML = `<b>${chave}:</b>
      <input type="text" data-campo="${chave}" value="${valor}"
      style="width:90%;background:#0a192f;color:#fff;border:1px solid #5fa8d3;border-radius:6px;padding:5px;">`;
  });

  const btn = modal.querySelector(".btn-acao.editar");
  btn.textContent = "💾 Salvar";
  btn.onclick = async () => {
    const inputs = modal.querySelectorAll("input[data-campo]");
    const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];

    const idx = bobinas.findIndex(b => b.rastro === bobina._rastroOriginal);
    if (idx === -1) return alert("Bobina original não encontrada!");

    inputs.forEach(inp => (bobina[inp.dataset.campo] = inp.value.trim()));

    if (bobina.rastro !== bobina._rastroOriginal) {
      const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
      const link = `${base}bobina.html?rastro=${encodeURIComponent(bobina.rastro)}`;
      bobina.qrCode = await gerarQRBase64(link, 180);
    }

    bobinas[idx] = bobina;
    localStorage.setItem("bobinas", JSON.stringify(bobinas));
    alert("✅ Bobina atualizada com sucesso!");
    modal.remove();
    location.reload();
  };
}
