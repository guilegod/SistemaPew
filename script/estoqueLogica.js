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
    // 🔁 Agora lê SEMPRE do localStorage
    const bobinas = getBobinas();

    listaBobinas.innerHTML = "";
    let filtradas = bobinas;

    // Filtro por status
    if (filtro !== "todas") {
      filtradas = filtradas.filter((b) => b.status === filtro);
    }

    // Filtro por data (igualdade direta com YYYY-MM-DD)
    const filtroDataEl = document.getElementById("filtroData");
    const filtroData = filtroDataEl?.value || "";
    if (filtroData) {
      filtradas = filtradas.filter((b) => String(b.data) === filtroData);
    }

    // Filtro por rastro
    const filtroRastroEl = document.getElementById("filtroRastro");
    const filtroRastro = filtroRastroEl?.value?.toLowerCase() || "";
    if (filtroRastro) {
      filtradas = filtradas.filter((b) => (b.rastro || "").toLowerCase().includes(filtroRastro));
    }

    let pesoTotal = 0;
    const modo = localStorage.getItem("modoVisual") || "estilo1";

    filtradas.forEach((b) => {
      const card = document.createElement("div");
      const statusClass = getStatusClass(b.status);
      const cor =
        b.status === "Liberada" ? "green" : b.status === "Bloqueada" ? "red" : "orange";

      // ======= MODO 1: INDUSTRIAL 3D (dashboard visual + badge + cores OK) =======
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
            <p>⚖️ <b>Peso:</b> ${
              typeof b.peso === "number" ? b.peso.toFixed(2) : Number(b.peso || 0).toFixed(2)
            } kg</p>
            <p>🧾 <b>Observações:</b> <em>${b.observacoes || "Sem observações."}</em></p>
            <p>📅 <b>Data:</b> ${b.data || "-"}</p>
            <div class="card-actions">
              <button class="btn-detalhes">🔍 Ver Detalhes</button>
            </div>
          </div>
        `;
        // Evento seguro (sem inline)
        card.querySelector(".btn-detalhes").addEventListener("click", () => abrirDetalhes(b));
      }

      // ======= MODO 2: DASHBOARD TECNOLÓGICO =======
      else if (modo === "estilo2") {
        card.className = `card-bobina estilo2 ${statusClass}`;
        card.innerHTML = `
          <div class="left-status" style="background:${cor}"></div>
          <div class="right-info">
            <h3>${b.rastro || "-"}</h3>
            <p><b>Tipo:</b> ${b.tipo || "-"}</p>
            <p><b>Diâmetro:</b> ${b.diametro || "-"}</p>
            <p><b>Peso:</b> ${
              typeof b.peso === "number" ? b.peso.toFixed(2) : Number(b.peso || 0).toFixed(2)
            } kg</p>
            <p><b>Status:</b> ${b.status || "-"}</p>
            <p><b>Data:</b> ${b.data || "-"}</p>
          </div>
        `;
      }

      // ======= MODO 3: MINIMALISTA =======
      else {
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
              <li>Peso: ${
                typeof b.peso === "number" ? b.peso.toFixed(2) : Number(b.peso || 0).toFixed(2)
              } kg</li>
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

  // Expor filtros
  window.filtrar = renderizar;
  window.filtrarData = () => renderizar();
  window.filtrarRastro = () => renderizar();

  // Troca de visual
  window.mudarVisual = function () {
    const modo = document.getElementById("selectVisual").value;
    localStorage.setItem("modoVisual", modo);
    renderizar();
  };

  // Inicialização: limpa filtros visuais e renderiza com dados ATUAIS
  document.getElementById("filtroData") && (document.getElementById("filtroData").value = "");
  document.getElementById("filtroRastro") && (document.getElementById("filtroRastro").value = "");
  const modoSalvo = localStorage.getItem("modoVisual") || "estilo1";
  document.getElementById("selectVisual").value = modoSalvo;

  renderizar();
});

// === MODAL DE DETALHES ===
function abrirDetalhes(bobina) {
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
        <li><b>Peso:</b> ${
          typeof bobina.peso === "number" ? bobina.peso.toFixed(2) : Number(bobina.peso || 0).toFixed(2)
        } kg</li>
        <li><b>Observações:</b> <em>${bobina.observacoes || "Sem observações."}</em></li>
      </ul>

      <div class="modal-actions">
        <button class="btn-acao editar">✏️ Editar</button>
        <button class="btn-acao excluir">🗑️ Excluir</button>
        <button class="btn-acao exportar">📤 Exportar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
