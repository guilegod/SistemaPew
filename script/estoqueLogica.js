document.addEventListener("DOMContentLoaded", () => {
  const listaBobinas = document.getElementById("listaBobinas");
  const totalSpan = document.getElementById("totalBobinas");
  const pesoSpan = document.getElementById("pesoTotal");

  // ================================
  // Helpers
  // ================================
  const API_HOST = window.location.hostname.includes("192.168")
    ? `http://${window.location.hostname}:8000`
    : "http://127.0.0.1:8000";
  const API_URL = `${API_HOST}/bobinas`;

  const getBobinasLocal = () => JSON.parse(localStorage.getItem("bobinas")) || [];
  const setBobinasLocal = (arr) => localStorage.setItem("bobinas", JSON.stringify(arr || []));

  const getStatusClass = (status) =>
    status === "Liberada" ? "verde" :
    status === "Bloqueada" ? "vermelho" : "amarelo";

  const hasValidRastro = (r) => String(r || "").trim().length > 0 && r !== "-";

  // ================================
  // Carregar bobinas da API
  // ================================
  async function getBobinas() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Falha ao buscar API");
      const data = await res.json();
      setBobinasLocal(data);
      return data;
    } catch (err) {
      console.warn("⚠️ API offline, usando dados locais", err);
      return getBobinasLocal();
    }
  }

  // ================================
  // Renderização
  // ================================
  async function renderizar(filtro = "todas") {
    const bobinas = await getBobinas();
    listaBobinas.innerHTML = "";

    let filtradas = [...bobinas];
    if (filtro !== "todas") filtradas = filtradas.filter((b) => b.status === filtro);

    const filtroData = document.getElementById("filtroData")?.value || "";
    if (filtroData) filtradas = filtradas.filter((b) => String(b.data) === filtroData);

    const filtroRastro = document.getElementById("filtroRastro")?.value?.toLowerCase() || "";
    if (filtroRastro)
      filtradas = filtradas.filter((b) => (b.rastro || "").toLowerCase().includes(filtroRastro));

    let pesoTotal = 0;
    filtradas.forEach((b) => {
      const card = document.createElement("div");
      const statusClass = getStatusClass(b.status);

      card.className = `card-bobina estilo1 ${statusClass}`;
      card.innerHTML = `
        <div class="left-status ${statusClass}"></div>
        <div class="right-info">
          <div class="badge-status ${statusClass}">${(b.status || "").toUpperCase()}</div>
          <h3>${b.rastro || "-"}</h3>
          <p>👷 <b>Operador:</b> ${b.operador || "—"}</p>
          <p>🪪 <b>Matrícula:</b> ${b.matricula || "—"}</p>
          <p>🏭 <b>Linha:</b> ${b.linha || "—"}</p>
          <p>⏰ <b>Turno:</b> ${b.turno || "—"}</p>
          <p>⚙️ <b>Tipo:</b> ${b.tipo || "-"}</p>
          <p>📏 <b>Diâmetro:</b> ${b.diametro || "-"}</p>
          <p>🧩 <b>Furos:</b> ${b.furos ?? "-"}</p>
          <p>📐 <b>Comprimento:</b> ${b.comprimento ?? 0} m</p>
          <p>⚖️ <b>Peso:</b> ${Number(b.peso || 0).toFixed(2)} kg</p>
          <p>📅 <b>Data:</b> ${b.data || "-"}</p>
          <div class="card-actions">
            <button class="btn-detalhes">🔍 Ver Detalhes</button>
          </div>
        </div>
      `;
      card.querySelector(".btn-detalhes").addEventListener("click", () => abrirDetalhes(b));
      listaBobinas.appendChild(card);
      pesoTotal += parseFloat(b.peso || 0);
    });

    totalSpan.textContent = filtradas.length;
    pesoSpan.textContent = pesoTotal.toFixed(2);
  }

  window.filtrar = renderizar;
  window.filtrarData = () => renderizar();
  window.filtrarRastro = () => renderizar();
  renderizar();
});


// =============================
// Modal de Detalhes + Edição
// =========================
// Modal de detalhes + edição
// =========================
async function abrirDetalhes(bobina) {
  bobina._rastroOriginal = bobina.rastro;
  const modal = document.createElement("div");
  modal.className = "modal-detalhes";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="fechar" onclick="this.closest('.modal-detalhes').remove()">✖</button>
      <h2>Detalhes da Bobina</h2>
      <div class="modal-body">
        <ul>
          <li><b>Rastro:</b> ${bobina.rastro}</li>
          <li><b>Data:</b> ${bobina.data}</li>
          <li><b>Operador:</b> ${bobina.operador}</li>
          <li><b>Matrícula:</b> ${bobina.matricula}</li>
          <li><b>Linha:</b> ${bobina.linha}</li>
          <li><b>Turno:</b> ${bobina.turno}</li>
          <li><b>Status:</b> ${bobina.status}</li>
          <li><b>Tipo:</b> ${bobina.tipo}</li>
          <li><b>Diâmetro:</b> ${bobina.diametro}</li>
          <li><b>Furos:</b> ${bobina.furos}</li>
          <li><b>Comprimento:</b> ${bobina.comprimento} m</li>
          <li><b>Peso:</b> ${bobina.peso} kg</li>
          <li><b>Observações:</b> <em>${bobina.observacoes || "Sem observações."}</em></li>
        </ul>
        <div id="qrHolder" class="qr-section"><p>Gerando QR Code...</p></div>
      </div>
      <div class="modal-actions">
        <button class="btn-acao editar">✏️ Editar</button>
        <button class="btn-acao imprimir" onclick="window.print()">🖨️ Imprimir QR</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  injectModalCssOnce();

  // 🔗 IP fixo da sua máquina — para o QRCode apontar corretamente no celular
  const backendHost = "192.168.18.3:5500"; // <- se o front roda na porta 5500
  const qr = await gerarQRBase64(`http://${backendHost}/bobina.html?rastro=${bobina.rastro}`, 180);

  const holder = modal.querySelector("#qrHolder");
  holder.innerHTML = `<img src="${qr}" width="180" alt="QR Code" class="qr-image">`;

  modal.querySelector(".btn-acao.editar").addEventListener("click", () => editarBobina(bobina, modal));
}


// =============================
// Edição e Salvamento
// =============================
function editarBobina(bobina, modal) {
  const lista = modal.querySelectorAll(".modal-body ul li");
  const campos = [
    { chave: "rastro", label: "Rastro", tipo: "text" },
    { chave: "data", label: "Data", tipo: "date" },
    { chave: "status", label: "Status", tipo: "select", options: ["Aguardando Laudo", "Liberada", "Bloqueada"] },
    { chave: "tipo", label: "Tipo", tipo: "text" },
    { chave: "diametro", label: "Diâmetro", tipo: "text" },
    { chave: "furos", label: "Furos", tipo: "number" },
    { chave: "comprimento", label: "Comprimento (m)", tipo: "number" },
    { chave: "peso", label: "Peso (kg)", tipo: "number" },
    { chave: "observacoes", label: "Observações", tipo: "text" }
  ];

  campos.forEach((m, i) => {
    const li = lista[i];
    if (!li) return;
    let val = bobina[m.chave] || "";

    if (m.tipo === "select") {
      li.innerHTML = `
        <label><b>${m.label}:</b></label>
        <select data-campo="${m.chave}" class="edit-input">
          ${m.options.map(opt => `<option value="${opt}" ${opt === val ? "selected" : ""}>${opt}</option>`).join("")}
        </select>`;
    } else {
      li.innerHTML = `
        <label><b>${m.label}:</b></label>
        <input type="${m.tipo}" value="${val}" data-campo="${m.chave}" class="edit-input">`;
    }
  });

  const btn = modal.querySelector(".btn-acao.editar");
  btn.textContent = "💾 Salvar";
  btn.onclick = () => salvarEdicao(bobina, modal);
}

async function salvarEdicao(bobina, modal) {
  const inputs = modal.querySelectorAll("[data-campo]");
  inputs.forEach(i => bobina[i.dataset.campo] = i.value);

  try {
    const res = await fetch(`http://${window.location.hostname}:8000/bobinas/${bobina.rastro}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bobina),
    });
    if (!res.ok) throw new Error("Erro ao salvar");
    alert("✅ Alterações salvas no servidor!");
  } catch (err) {
    console.warn("⚠️ API offline, salvando localmente:", err);
    const arr = JSON.parse(localStorage.getItem("bobinas")) || [];
    const idx = arr.findIndex(x => x.rastro === bobina._rastroOriginal);
    if (idx !== -1) arr[idx] = bobina;
    localStorage.setItem("bobinas", JSON.stringify(arr));
  }

  modal.remove();
  location.reload();
}

// =============================
// CSS e QR
// =============================
function injectModalCssOnce() {
  if (document.getElementById("modal-css-injected")) return;
  const style = document.createElement("style");
  style.id = "modal-css-injected";
  style.textContent = `
    .modal-detalhes {
      position: fixed; inset: 0; background: rgba(0,0,0,.7);
      display:flex; justify-content:center; align-items:center; z-index:9999; padding:20px;
    }
    .modal-content {
      background:#142c44; color:#fff; padding:20px; border-radius:12px;
      width:95%; max-width:520px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden;
    }
    .modal-body { flex:1; overflow-y:auto; margin-bottom:15px; }
    .qr-image { display:block; margin:10px auto; border-radius:10px; }
    .btn-acao { background:#2563eb; border:none; color:#fff; padding:8px 12px; border-radius:8px; cursor:pointer; }
    .btn-acao:hover { filter:brightness(1.1); }
    .edit-input { width:90%; background:#0a192f; color:#fff; border:1px solid #5fa8d3; border-radius:6px; padding:6px; }
  `;
  document.head.appendChild(style);
}

function gerarQRBase64(texto, size = 180) {
  return new Promise((resolve) => {
    if (!texto || typeof QRCode === "undefined") return resolve("");
    const tmp = document.createElement("div");
    tmp.style.position = "fixed";
    tmp.style.left = "-9999px";
    document.body.appendChild(tmp);
    new QRCode(tmp, { text: texto, width: size, height: size });
    setTimeout(() => {
      const canvas = tmp.querySelector("canvas");
      const dataUrl = canvas ? canvas.toDataURL("image/png") : "";
      tmp.remove();
      resolve(dataUrl);
    }, 150);
  });
}
