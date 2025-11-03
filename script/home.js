document.addEventListener('DOMContentLoaded', () => {
  const listaAguardando = document.getElementById('listaAguardando');
  const listaLiberadas = document.getElementById('listaLiberadas');
  const btnExemplo = document.getElementById('btn-exemplo');
  const canvasCtx = document.getElementById('graficoStatusBobinas').getContext('2d');
  const btnPizza = document.getElementById('btn-pizza');
  const btnBar = document.getElementById('btn-bar');

  let chartInstance;
  let curType = 'bar';

  function carregarBobinas() {
    return JSON.parse(localStorage.getItem('bobinas')) || [];
  }

  function salvarBobinas(arr) {
    localStorage.setItem('bobinas', JSON.stringify(arr));
  }

  function gerarExemplo() {
    const tipos = ['PEWQ', 'PEWS'];
    const diametros = ['4.76', '6.35', '7.94', '9.52'];
    const turnos = ['1Turno', '2Turno', '3Turno'];
    const linhas = ['01', '02'];
    const statusList = ['Liberada', 'Aguardando Laudo', 'Bloqueada'];
    const motivosBloqueio = ['Oxidação', 'Solda', 'Resíduo', 'Máquina'];
    const observacoes = ['Verificar próxima OP', 'Deformação leve', 'Solicitar análise extra', 'OK'];

    let arr = [];
    for (let i = 0; i < 120; i++) {
      const status = statusList[Math.floor(Math.random() * statusList.length)];
      const peso = parseFloat((Math.random() * 15 + 5).toFixed(2)); // entre 5 e 20 kg
      const bobina = {
        rastro: `R${('000' + i).slice(-4)}`,
        data: `2025-07-${Math.floor(Math.random() * 20 + 1).toString().padStart(2, '0')}`,
        turno: turnos[Math.floor(Math.random() * turnos.length)],
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        diametro: diametros[Math.floor(Math.random() * diametros.length)],
        furos: Math.random() < 0.5 ? 'Sim' : 'Não',
        comprimento: Math.floor(Math.random() * 100 + 20),
        peso: peso,
        status: status,
        motivo: status === 'Bloqueada' ? motivosBloqueio[Math.floor(Math.random() * motivosBloqueio.length)] : '',
        observacoes: observacoes[Math.floor(Math.random() * observacoes.length)]
      };
      arr.push(bobina);
    }
    salvarBobinas(arr);
    renderizar();
    gerarGrafico(curType);
  }

  function renderizar() {
    const bobinas = carregarBobinas();
    listaAguardando.innerHTML = '';
    listaLiberadas.innerHTML = '';

    let limLiberadas = 0, limAguardando = 0;

    bobinas.forEach((b, i) => {
      if (b.status === 'Liberada' && limLiberadas >= 40) return;
      if (b.status === 'Aguardando Laudo' && limAguardando >= 40) return;

      const card = document.createElement('div');
      card.className = 'card card-produto';
      card.innerHTML = `
        <h3>Rastro: ${b.rastro}</h3>
        <p>Data: ${b.data}</p>
        <p>Turno: ${b.turno}</p>
        <p>Tipo: ${b.tipo}</p>
        <p>Diametro: ${b.diametro}</p>
        <p>Furos: ${b.furos}</p>
        <p>Comprimento: ${b.comprimento}m</p>
        <p>Peso: ${b.peso?.toFixed(2) ?? "0.00"} kg</p>
        <p>Status: ${b.status}</p>
        ${b.status === 'Bloqueada' ? `<p>Motivo: ${b.motivo}</p>` : ''}
        <p>Observações: ${b.observacoes || "Sem observações"}</p>
        <button class="btn-excluir" data-index="${i}">Excluir</button>
      `;

      const link = document.createElement('a');
      link.href = `detalhes.html?rastro=${b.rastro}`;
      link.textContent = 'Ver detalhes';
      card.appendChild(link);

      if (b.status === 'Liberada') {
        listaLiberadas.appendChild(card);
        limLiberadas++;
      } else if (b.status === 'Aguardando Laudo') {
        listaAguardando.appendChild(card);
        limAguardando++;
      }
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.onclick = () => {
        let arr = carregarBobinas();
        arr.splice(parseInt(btn.dataset.index), 1);
        salvarBobinas(arr);
        renderizar();
        gerarGrafico(curType);
      };
    });
  }

  function gerarGrafico(type) {
    curType = type;
    const bobinas = carregarBobinas();

    const statusCount = { Liberada: 0, 'Aguardando Laudo': 0, Bloqueada: 0 };
    const pesoCount = { Liberada: 0, 'Aguardando Laudo': 0, Bloqueada: 0 };

    const motivoCount = {};
    bobinas.forEach(b => {
      const p = parseFloat(b.peso || 0);
      statusCount[b.status] = (statusCount[b.status] || 0) + 1;
      pesoCount[b.status] = (pesoCount[b.status] || 0) + p;

      if (b.status === 'Bloqueada') {
        motivoCount[b.motivo] = (motivoCount[b.motivo] || 0) + 1;
      }
    });

    const data = {
      labels: ['Liberadas', 'Aguardando Laudo', 'Bloqueadas'],
      datasets: [
        {
          label: 'Qtd. Bobinas',
          data: [statusCount.Liberada, statusCount['Aguardando Laudo'], statusCount.Bloqueada],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          yAxisID: 'y'
        },
        {
          label: 'Peso (kg)',
          data: [
            pesoCount.Liberada.toFixed(2),
            pesoCount['Aguardando Laudo'].toFixed(2),
            pesoCount.Bloqueada.toFixed(2)
          ],
          backgroundColor: ['rgba(40,167,69,0.3)', 'rgba(255,193,7,0.3)', 'rgba(220,53,69,0.3)'],
          yAxisID: 'y1'
        }
      ]
    };

    const options = {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Resumo de Bobinas (Quantidade x Peso)'
        }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Quantidade' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Peso (kg)' },
          grid: { drawOnChartArea: false },
        }
      }
    };

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(canvasCtx, {
      type,
      data,
      options
    });

    if (type === 'pie' && statusCount.Bloqueada > 0) {
      setTimeout(() => {
        alert('Motivos de Bloqueio:\n' +
          Object.entries(motivoCount).map(([m, c]) => `${m}: ${c}`).join('\n')
        );
      }, 50);
    }
  }

  btnExemplo.onclick = gerarExemplo;
  btnBar.onclick = () => gerarGrafico('bar');
  btnPizza.onclick = () => gerarGrafico('pie');

  renderizar();
  gerarGrafico('bar');
});
