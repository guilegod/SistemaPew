document.addEventListener("DOMContentLoaded", () => {
  // Aceita <form id="formMaterial"> (seu layout novo) ou <form id="formEstoque"> (layout antigo)
  const form = document.getElementById("formMaterial") || document.getElementById("formEstoque");
  if (!form) {
    console.warn("⚠️ Formulário de cadastro não encontrado (id=formMaterial ou id=formEstoque).");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Normaliza data para YYYY-MM-DD (igual ao <input type="date">)
    const today = new Date();
    const hoje = today.toISOString().split("T")[0];

    // Coleta compatível com os dois modelos de formulário
    const novaBobina = {
      rastro: document.getElementById("rastro")?.value || document.getElementById("codigo")?.value || "",
      data: document.getElementById("data")?.value || document.getElementById("dataEstoque")?.value || hoje,
      tipo: document.getElementById("tipo")?.value || "",
      diametro: document.getElementById("diametro")?.value || "",
      comprimento: parseFloat(document.getElementById("comprimento")?.value || 0),
      peso: parseFloat(document.getElementById("peso")?.value || 0),
      furos: parseInt(document.getElementById("furos")?.value || 0),
      observacoes: document.getElementById("observacoes")?.value || document.getElementById("observacao")?.value || "",
      status: document.getElementById("status")?.value || document.getElementById("statusFinal")?.value || "Aguardando Laudo",
      turno: document.getElementById("turno")?.value || "",
    };

    if (!novaBobina.rastro) {
      alert("Por favor, preencha o Rastro/Código da bobina.");
      return;
    }

    // Lê lista ATUAL do localStorage (robusto)
    let lista;
    try { lista = JSON.parse(localStorage.getItem("bobinas")) || []; }
    catch { lista = []; }

    // (Opcional) Impede rastro duplicado — comente se não quiser
    // if (lista.some(b => b.rastro === novaBobina.rastro)) {
    //   return alert("Já existe uma bobina com esse rastro/código.");
    // }

    lista.push(novaBobina);
    localStorage.setItem("bobinas", JSON.stringify(lista));

    // Feedback e limpeza
    alert("✅ Bobina cadastrada com sucesso!");
    form.reset();

    // (Opcional) Levar direto ao estoque após salvar:
    // window.location.href = "estoqueCompleto.html";
  });
});
