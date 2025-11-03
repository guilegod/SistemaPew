document.addEventListener("DOMContentLoaded", () => {
  const btnDemo = document.getElementById("gerarDemo");
  if (!btnDemo) return;

  btnDemo.addEventListener("click", () => {
    if (!confirm("Deseja gerar 100 bobinas de demonstração? Isso substituirá as atuais.")) return;

    const tipos = ["PEWQ", "PEWS",];
    const statusList = ["Liberada", "Aguardando Laudo", "Bloqueada"];
    const turnos = ["1º Turno", "2º Turno"];
    const diametros = ["4.00", "4.76", "6.35", "7.94"];
    const hoje = new Date();

    const bobinas = [];

    for (let i = 1; i <= 100; i++) {
      // gera data nos últimos 30 dias
      const dataOffset = Math.floor(Math.random() * 30);
      const dataBobina = new Date(hoje);
      dataBobina.setDate(hoje.getDate() - dataOffset);

      const bobina = {
        rastro: "BNDY-" + String(i).padStart(4, "0"),
        data: dataBobina.toISOString().split("T")[0],
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        diametro: diametros[Math.floor(Math.random() * diametros.length)],
        comprimento: parseFloat((Math.random() * 100 + 50).toFixed(2)), // 50–150
        peso: parseFloat((Math.random() * 20 + 5).toFixed(2)), // 5–25kg
        furos: Math.floor(Math.random() * 10) + 1,
        observacoes: Math.random() > 0.85 ? "Reanálise solicitada" : "OK",
        status: statusList[Math.floor(Math.random() * statusList.length)],
        turno: turnos[Math.floor(Math.random() * turnos.length)],
      };
      bobinas.push(bobina);
    }

    localStorage.setItem("bobinas", JSON.stringify(bobinas));
    alert("✅ 100 bobinas de demonstração geradas com sucesso!");
    location.reload(); // recarrega pra atualizar visualmente
  });
});
