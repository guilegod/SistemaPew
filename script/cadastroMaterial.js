// ======== CONFIGURAÇÕES ========
const TURNOS = [
  { id: 1, nome: "1º Turno", horario: "06:10 às 14:30" },
  { id: 2, nome: "2º Turno", horario: "14:45 às 23:10" },
  { id: 3, nome: "3º Turno", horario: "22:30 às 06:20" },
];

const OPERADORES = [
  { matricula: 4172, nome: "Marco", setor: "Linha 01" },
  { matricula: 4181, nome: "Milton", setor: "Linha 01" },
  { matricula: 4233, nome: "Gabriel", setor: "Linha 02" },
  { matricula: 4290, nome: "Dirceu", setor: "Linha 02" },
];

// ======== FUNÇÕES ========
function detectarTurno() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 14) return "1º Turno";
  if (hora >= 14 && hora < 22) return "2º Turno";
  return "3º Turno";
}

function proximoRastro() {
  const numero = Math.floor(Math.random() * 1000) + 5380;
  return `BND-${String(numero).padStart(4, "0")}`;
}

// ======== SCRIPT PRINCIPAL ========
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formEstoque");
  const inputRastro = document.getElementById("rastro");
  const inputData = document.getElementById("data");
  const inputTurno = document.getElementById("turno");
  const selectOperador = document.getElementById("operador");
  const inputLinha = document.getElementById("linha");

  // Preenche automáticos
  inputData.value = new Date().toISOString().slice(0, 10);
  inputTurno.value = detectarTurno();
  inputRastro.value = proximoRastro();

  // Define linha conforme operador
  selectOperador.addEventListener("change", () => {
    const op = OPERADORES.find(o => `${o.matricula} - ${o.nome}` === selectOperador.value);
    inputLinha.value = op?.setor || "Não definida";
  });

  // === SUBMIT ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const val = (id) => document.getElementById(id)?.value?.trim() || "";
    const operadorSel = OPERADORES.find(o => `${o.matricula} - ${o.nome}` === val("operador"));

    const bobina = {
      rastro: val("rastro"),
      data: val("data"),
      turno: val("turno") || detectarTurno(),
      tipo: val("tipo"),
      diametro: val("diametro"),
      comprimento: parseFloat(val("comprimento")) || 0,
      peso: parseFloat(val("peso")) || 0,
      furos: parseInt(val("furos")) || 0,
      observacoes: val("observacoes") || "",
      status: "Aguardando Laudo",
      operador: operadorSel?.nome || "Desconhecido",
      matricula: operadorSel?.matricula?.toString() || "N/A",
      linha: operadorSel?.setor || "Não definida",
      criadoEm: new Date().toLocaleString(),
      qrCode: "", // compatível com o backend
    };

    // ====== Salva local (backup offline) ======
    const bobinas = JSON.parse(localStorage.getItem("bobinas")) || [];
    bobinas.push(bobina);
    localStorage.setItem("bobinas", JSON.stringify(bobinas));

    // ====== Envia para o servidor FastAPI ======
    try {
      const response = await fetch("https://sistemapew.onrender.com/bobinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bobina),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao salvar no servidor: ${errorText}`);
      }

      alert(`✅ Bobina ${bobina.rastro} cadastrada!\nOperador: ${bobina.operador} (${bobina.linha})`);
      form.reset();

      // Regenera campos automáticos
      inputRastro.value = proximoRastro();
      inputData.value = new Date().toISOString().slice(0, 10);
      inputTurno.value = detectarTurno();
    } catch (error) {
      console.error("Erro ao enviar para API:", error);
      alert("⚠️ Falha ao enviar para o servidor. Verifique se o backend está rodando.");
    }
  });
});
