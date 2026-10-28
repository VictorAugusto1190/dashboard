   let metricas = JSON.parse(localStorage.getItem('metricas')) || [];
    let rendas = JSON.parse(localStorage.getItem('rendas')) || [];
    let valorCarteira = parseFloat(localStorage.getItem('carteira')) || 0;
    let chart;

    function salvarLocalStorage() {
      localStorage.setItem('metricas', JSON.stringify(metricas));
      localStorage.setItem('rendas', JSON.stringify(rendas));
      localStorage.setItem('carteira', valorCarteira.toFixed(2));
    }

    function atualizarCarteira() {
      const totalRendas = rendas.reduce((acc, r) => acc + r.valor, 0);
      const totalGastos = metricas.reduce((acc, m) => acc + m.valor, 0);
      document.getElementById('carteiraDisplay').textContent = `R$ ${(valorCarteira + totalRendas - totalGastos).toFixed(2).replace('.', ',')}`;
      atualizarGrafico();
    }

    function atualizarListaRendas() {
      const ul = document.getElementById('listaRendas');
      ul.innerHTML = '';
      rendas.forEach((r, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${r.nome}</strong>: R$ ${r.valor.toFixed(2).replace('.', ',')}
          <button class="btn-editar" onclick="editarRenda(${i})">Editar</button>
          <button class="btn-remover" onclick="removerRenda(${i})">Remover</button>`;
        ul.appendChild(li);
      });
    }

    function atualizarListaMetricas() {
      const ul = document.getElementById('listaMetricas');
      ul.innerHTML = '';
      metricas.forEach((m, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${m.nome}</strong>: R$ ${m.valor.toFixed(2).replace('.', ',')}
          <button class="btn-editar" onclick="editarGasto(${i})">Editar</button>
          <button class="btn-remover" onclick="removerGasto(${i})">Remover</button>`;
        ul.appendChild(li);
      });

      atualizarGastosPendentes(); // ADIÇÃO
    }

    // ADIÇÃO: Atualiza a lista de gastos pendentes
    function atualizarGastosPendentes() {
      const ul = document.getElementById('listaGastosPendentes');
      ul.innerHTML = '';
      metricas.forEach((m, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${m.nome}</strong>: R$ ${m.valor.toFixed(2).replace('.', ',')}</span>
          <button onclick="marcarComoPago(this)">Pago</button>`;
        ul.appendChild(li);
      });
    }

    // ADIÇÃO: Marca gasto como pago (risca texto)
    function marcarComoPago(botao) {
      const item = botao.parentElement;
      item.classList.toggle('pago');
    }

    function adicionarRenda() {
      const nome = document.getElementById('nomeRenda').value.trim();
      const valor = parseFloat(document.getElementById('valorRenda').value);
      if(!nome || isNaN(valor) || valor <= 0) return alert('Preencha corretamente!');
      rendas.push({ nome, valor });
      document.getElementById('nomeRenda').value = '';
      document.getElementById('valorRenda').value = '';
      salvarLocalStorage();
      atualizarListaRendas();
      atualizarCarteira();
    }

    function adicionarGasto() {
      const nome = document.getElementById('nomeGasto').value.trim();
      const valor = parseFloat(document.getElementById('valorGasto').value);
      if(!nome || isNaN(valor) || valor <= 0) return alert('Preencha corretamente!');
      metricas.push({ nome, valor }); // Corrigido o erro de sintaxe
      document.getElementById('nomeGasto').value = '';
      document.getElementById('valorGasto').value = '';
      salvarLocalStorage();
      atualizarListaMetricas();
      atualizarCarteira();
    }

    function removerRenda(i) { rendas.splice(i,1); salvarLocalStorage(); atualizarListaRendas(); atualizarCarteira(); }
    function removerGasto(i) { metricas.splice(i,1); salvarLocalStorage(); atualizarListaMetricas(); atualizarCarteira(); }

    function editarRenda(i) {
      const novoNome = prompt('Editar nome da renda', rendas[i].nome);
      if(novoNome === null) return;
      const novoValor = parseFloat(prompt('Editar valor da renda', rendas[i].valor));
      if(isNaN(novoValor) || novoValor <= 0) return alert('Valor inválido!');
      rendas[i] = { nome: novoNome, valor: novoValor };
      salvarLocalStorage();
      atualizarListaRendas();
      atualizarCarteira();
    }

    function editarGasto(i) {
      const novoNome = prompt('Editar nome do gasto', metricas[i].nome);
      if(novoNome === null) return;
      const novoValor = parseFloat(prompt('Editar valor do gasto', metricas[i].valor));
      if(isNaN(novoValor) || novoValor <= 0) return alert('Valor inválido!');
      metricas[i] = { nome: novoNome, valor: novoValor };
      salvarLocalStorage();
      atualizarListaMetricas();
      atualizarCarteira();
    }

    function editarCarteira() {
      const novoValor = parseFloat(prompt('Editar valor da carteira', valorCarteira));
      if(isNaN(novoValor) || novoValor < 0) return alert('Valor inválido!');
      valorCarteira = novoValor;
      salvarLocalStorage();
      atualizarCarteira();
    }

    function atualizarGrafico() {
      const ctx = document.getElementById('grafico').getContext('2d');
      if(chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: metricas.map(m => m.nome),
          datasets: [{
            label: 'Gastos',
            data: metricas.map(m => m.valor),
            backgroundColor: 'rgba(105, 165, 255, 0.72)',
            hoverBackgroundColor: 'rgba(98, 229, 223, 0.88)',
            borderColor: 'rgba(126, 190, 255, 0.95)',
            borderWidth: 1,
            borderRadius: 7,
            borderSkipped: false,
            maxBarThickness: 54
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 850, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(10, 17, 34, 0.96)',
              borderColor: 'rgba(112, 165, 255, 0.3)',
              borderWidth: 1,
              titleColor: '#edf2ff',
              bodyColor: '#aebbd5',
              padding: 11,
              displayColors: false
            }
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: '#8997b4', font: { family: 'Manrope', size: 10 } }
            },
            y: {
              beginAtZero: true,
              border: { display: false },
              grid: { color: 'rgba(141, 164, 220, 0.1)' },
              ticks: { color: '#7886a3', font: { family: 'DM Mono', size: 9 }, padding: 8 }
            }
          }
        }
      });
    }

    // Inicialização
    atualizarListaRendas();
    atualizarListaMetricas();
    atualizarCarteira();