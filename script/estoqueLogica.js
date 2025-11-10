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
    status === "Liberada" ? "verde" : status === "Bloqueada" ? "vermelho" : "amarelo";

  function renderizar(filtro = "todas") {
    const bobinas = getBobinas();
    listaBobinas.innerHTML = "";
    let filtradas = bobinas;

    if (filtro !== "todas") filtradas = filtradas.filter((b) => b.status === filtro);

    const filtroData = document.getElementById("filtroData")?.value || "";
    if (filtroData) filtradas = filtradas.filter((b) => String(b.data) === filtroData);

    const filtroRastro = document.getElementById("filtroRastro")?.value?.toLowerCase() || "";
    if (filtroRastro) filtradas = filtradas.filter((b) => (b.rastro || "").toLowerCase().includes(filtroRastro));

    let pesoTotal = 0;
    const modo = localStorage.getItem("modoVisual") || "estilo1";

    filtradas.forEach((b) => {
      const card = document.createElement("div");
      const statusClass = getStatusClass(b.status);
      const cor = b.status === "Liberada" ? "green" : b.status === "Bloqueada" ? "red" : "orange";

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
      } else if (modo === "estilo2") {
        card.className = `card-bobina estilo2 ${statusClass}`;
        card.innerHTML = `
          <div class="left-status" style="background:${cor}"></div>
          <div class="right-info">
            <h3>${b.rastro || "-"}</h3>
            <p><b>Tipo:</b> ${b.tipo || "-"}</p>
            <p><b>Diâmetro:</b> ${b.diametro || "-"}</p>
            <p><b>Peso:</b> ${Number(b.peso || 0).toFixed(2)} kg</p>
            <p><b>Status:</b> ${b.status || "-"}</p>
            <p><b>Data:</b> ${b.data || "-"}</p>
          </div>
        `;
      } else {
        card.className = `card-bobina estilo3 ${
          b.status === "Liberada" ? "liberada" : b.status === "Bloqueada" ? "bloqueada" : "aguardando"
        }`;
        card.innerHTML = `
          <div class="topbar"></div>
          <div class="card-body">
            <h3>${b.rastro || "-"}</h3>
            <ul>
              <li>Tipo: ${b.tipo || "-"}</li>
              <li>Diâmetro: ${b.diametro || "-"}</li>
              <li>Peso: ${Number(b.peso || 0).toFixed(2)} kg</li>
              <li>Status: ${b.status || "-"}</li>
              <li>Data: ${b.data || "-"}</li>
            </ul>
          </div>
        `;
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

  window.mudarVisual = function () {
    const modo = document.getElementById("selectVisual").value;
    localStorage.setItem("modoVisual", modo);
    renderizar();
  };

  const modoSalvo = localStorage.getItem("modoVisual") || "estilo1";
  const elVisual = document.getElementById("selectVisual");
  if (elVisual) elVisual.value = modoSalvo;

  renderizar();
});

/* =========================
   Modal de detalhes + edição
   ========================= */
function abrirDetalhes(bobina) {
  // Rastro original para localizar no storage
  bobina._rastroOriginal = bobina.rastro;

  const modal = document.createElement("div");
  modal.className = "modal-detalhes";

  modal.innerHTML = `
    <div class="modal-content">
      <button class="fechar" onclick="this.closest('.modal-detalhes').remove()">✖</button>
      <h2>Detalhes da Bobina</h2>
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

      <div class="modal-actions">
        <button class="btn-acao editar">✏️ Editar</button>
        <button class="btn-acao excluir">🗑️ Excluir</button>
        <button class="btn-acao exportar">📤 Exportar</button>
        <button class="btn-acao imprimir" onclick="window.print()">🖨️ Imprimir QR</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Ao clicar em editar, monta inputs a partir do OBJETO (não do texto do li)
  modal.querySelector(".btn-acao.editar").addEventListener("click", () => {
    const mapeamento = [
      { chave: "rastro",       label: "Rastro",           tipo: "text" },
      { chave: "data",         label: "Data",             tipo: "date" },
      { chave: "status",       label: "Status",           tipo: "select", options: ["Liberada","Aguardando Laudo","Bloqueada"] },
      { chave: "tipo",         label: "Tipo",             tipo: "text" },
      { chave: "diametro",     label: "Diâmetro",         tipo: "text" },
      { chave: "furos",        label: "Furos",            tipo: "number", step: "1" },
      { chave: "comprimento",  label: "Comprimento (m)",  tipo: "number", step: "0.01" },
      { chave: "peso",         label: "Peso (kg)",        tipo: "number", step: "0.01" },
      { chave: "observacoes",  label: "Observações",      tipo: "text" },
    ];

    const lis = modal.querySelectorAll("ul li");
    mapeamento.forEach((m, i) => {
      const li = lis[i];
      if (!li) return;

      // valor base do objeto
      let val = bobina[m.chave];
      if (m.tipo === "number") val = Number(val ?? 0);
      if (m.tipo === "date")   val = (String(val || "").slice(0,10));

      if (m.tipo === "select") {
        li.innerHTML = `
          <label><b>${m.label}:</b></label>
          <select data-campo="${m.chave}" style="width:90%;background:#0a192f;color:#fff;border:1px solid #5fa8d3;border-radius:5px;padding:6px;">
            ${m.options.map(opt => `<option value="${opt}" ${opt == (bobina[m.chave] || "") ? "selected" : ""}>${opt}</option>`).join("")}
          </select>
        `;
      } else {
        li.innerHTML = `
          <b>${m.label}:</b>
          <input type="${m.tipo}" ${m.step ? `step="${m.step}"` : ""} 
                 value="${val ?? ""}" data-campo="${m.chave}"
                 style="width:90%;background:#0a192f;color:#fff;border:1px solid #5fa8d3;border-radius:5px;padding:6px;">
        `;
      }
    });

    const editarBtn = modal.querySelector(".btn-acao.editar");
    editarBtn.textContent = "💾 Salvar";
    editarBtn.onclick = () => salvarEdicao(bobina, modal); // mantém referência ao objeto
  });
}

/* ==========================================
   Gera QR em base64 aguardando renderização
   ========================================== */
function gerarQRBase64(texto, size = 160) {
  return new Promise((resolve) => {
    if (typeof QRCode === "undefined") return resolve("");
    const tmp = document.createElement("div");
    tmp.style.position = "fixed";
    tmp.style.left = "-9999px";
    document.body.appendChild(tmp);

    try {
      new QRCode(tmp, { text: texto, width: size, height: size });
    } catch (e) {
      tmp.remove();
      return resolve("");
    }

    setTimeout(() => {
      const canvas = tmp.querySelector("canvas");
      const img = tmp.querySelector("img");
      let dataUrl = "";
      if (canvas) dataUrl = canvas.toDataURL("image/png");
      else if (img) dataUrl = img.src || "";
      tmp.remove();
      resolve(dataUrl);
    }, 120);
  });
}

/* ===============================
   Salvar edição + log + QR update
   =============================== */
async function salvarEdicao(bobina, modal) {
  const inputs = modal.querySelectorAll("[data-campo]");
  const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];

  const rastroAntigo = bobina._rastroOriginal || bobina.rastro;
  const index = bobinas.findIndex(b => b.rastro === rastroAntigo);
  if (index === -1) {
    alert("⚠️ Bobina original não encontrada!");
    return;
  }

  const antiga = { ...bobinas[index] };
  const historico = Array.isArray(antiga.historico) ? antiga.historico : [];

  // Atualiza campos a partir dos inputs (com tipagem)
  inputs.forEach(input => {
    const campo = input.dataset.campo;
    let novoValor = input.value;

    // normaliza números (aceita vírgula)
    if (["peso","comprimento"].includes(campo)) {
      const num = parseFloat(String(novoValor).replace(",", "."));
      novoValor = isNaN(num) ? "" : num;
    } else if (campo === "furos") {
      const num = parseInt(novoValor, 10);
      novoValor = isNaN(num) ? "" : num;
    } else {
      novoValor = String(novoValor ?? "").trim();
    }

    const antigoValor = antiga[campo] ?? "";
    if (String(novoValor) !== String(antigoValor)) {
      historico.push({
        campo,
        antigo: antigoValor,
        novo: novoValor,
        data: new Date().toLocaleString(),
        usuario: localStorage.getItem("usuarioLogado") || "Coordenação",
      });
    }

    bobina[campo] = novoValor;
  });

  // Regenera QR se rastro mudou
  if (bobina.rastro !== rastroAntigo) {
    const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
    const link = `${base}bobina.html?rastro=${encodeURIComponent(bobina.rastro)}`;
    bobina.qrCode = await gerarQRBase64(link, 160) || antiga.qrCode || "";
  } else {
    bobina.qrCode = antiga.qrCode || "";
  }

  bobina.historico = historico;
  bobinas[index] = bobina;
  localStorage.setItem("bobinas", JSON.stringify(bobinas));

  // Feedback visual
  const aviso = document.createElement("p");
  aviso.textContent = "✅ Alterações salvas com sucesso!";
  aviso.style.color = "#4ade80";
  aviso.style.textAlign = "center";
  aviso.style.fontWeight = "bold";
  aviso.style.marginTop = "10px";
  modal.querySelector(".modal-content").appendChild(aviso);

  setTimeout(() => {
    modal.remove();
    location.reload();
  }, 1000);
}
