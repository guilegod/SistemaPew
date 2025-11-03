document.addEventListener("DOMContentLoaded", () => {
  const ctxStatus = document.getElementById("graficoStatus");
  const ctxTipo = document.getElementById("graficoTipo");
  const ctxTurno = document.getElementById("graficoTurno");

  let chartStatus, chartTipo, chartTurno;

  // === FUNÇÃO PRINCIPAL: atualiza gráficos ===
  function atualizarGraficos(filtro = {}) {
    const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];

    // === FILTROS ===
    let filtradas = bobinas.filter((b) => {
      if (filtro.data && b.data !== filtro.data) return false;
      if (filtro.tipo && b.tipo !== filtro.tipo) return false;
      if (filtro.status && b.status !== filtro.status) return false;
      if (filtro.turno && b.turno !== filtro.turno) return false;
      return true;
    });

    // === AGRUPAMENTOS ===
    const totalPorStatus = { Liberada: 0, Bloqueada: 0, "Aguardando Laudo": 0 };
    const totalPorTipo = {};
    const pesoPorTurno = { "1º Turno": 0, "2º Turno": 0 };

    filtradas.forEach((b) => {
      totalPorStatus[b.status] = (totalPorStatus[b.status] || 0) + 1;
      totalPorTipo[b.tipo] = (totalPorTipo[b.tipo] || 0) + 1;
      if (pesoPorTurno[b.turno]) pesoPorTurno[b.turno] += parseFloat(b.peso || 0);
    });

    // === REMOVE GRÁFICOS ANTIGOS ===
    chartStatus?.destroy();
    chartTipo?.destroy();
    chartTurno?.destroy();

    // === GERA NOVOS ===
    chartStatus = new Chart(ctxStatus, {
      type: "doughnut",
      data: {
        labels: Object.keys(totalPorStatus),
        datasets: [
          {
            data: Object.values(totalPorStatus),
            backgroundColor: ["#16a34a", "#dc2626", "#eab308"],
          },
        ],
      },
      options: { plugins: { legend: { labels: { color: "#e2e8f0" } } } },
    });

    chartTipo = new Chart(ctxTipo, {
      type: "bar",
      data: {
        labels: Object.keys(totalPorTipo),
        datasets: [
          {
            label: "Quantidade",
            data: Object.values(totalPorTipo),
            backgroundColor: "#5fa8d3",
          },
        ],
      },
      options: {
        scales: {
          x: { ticks: { color: "#e2e8f0" } },
          y: { ticks: { color: "#e2e8f0" } },
        },
        plugins: { legend: { display: false } },
      },
    });

    chartTurno = new Chart(ctxTurno, {
      type: "bar",
      data: {
        labels: Object.keys(pesoPorTurno),
        datasets: [
          {
            label: "Peso Total (kg)",
            data: Object.values(pesoPorTurno),
            backgroundColor: ["#2563eb", "#1e3a5f"],
          },
        ],
      },
      options: {
        scales: {
          x: { ticks: { color: "#e2e8f0" } },
          y: { ticks: { color: "#e2e8f0" } },
        },
      },
    });
  }

  // === BOTÕES DE FILTRO ===
  document.getElementById("btnFiltrar").addEventListener("click", () => {
    const filtro = {
      data: document.getElementById("filtroData").value,
      tipo: document.getElementById("filtroTipo").value,
      status: document.getElementById("filtroStatus").value,
      turno: document.getElementById("filtroTurno").value,
    };
    atualizarGraficos(filtro);
  });

  document.getElementById("btnLimpar").addEventListener("click", () => {
    document.getElementById("filtroData").value = "";
    document.getElementById("filtroTipo").value = "";
    document.getElementById("filtroStatus").value = "";
    document.getElementById("filtroTurno").value = "";
    atualizarGraficos();
  });

  // === Preenche automaticamente os tipos disponíveis ===
  const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];
  const tiposUnicos = [...new Set(bobinas.map((b) => b.tipo).filter(Boolean))];
  const selectTipo = document.getElementById("filtroTipo");
  tiposUnicos.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    selectTipo.appendChild(opt);
  });

  atualizarGraficos();
});
