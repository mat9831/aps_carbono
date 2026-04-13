// ── Estado global ──
let tipo = 'pessoa';

// ── Alternância pessoa / empresa ──
function setTipo(t) {
  tipo = t;

  document.getElementById('btn-pessoa').classList.toggle('active', t === 'pessoa');
  document.getElementById('btn-empresa').classList.toggle('active', t === 'empresa');

  document.querySelectorAll('.empresa-field').forEach(el => {
    el.style.display = t === 'empresa' ? '' : 'none';
  });
  document.querySelectorAll('.pessoa-field').forEach(el => {
    el.style.display = t === 'pessoa' ? '' : 'none';
  });

  // Labels dinâmicos
  document.getElementById('lbl-km').textContent =
    t === 'empresa' ? 'Km percorridos por veículo/mês (média)' : 'Km percorridos por mês (carro)';
  document.getElementById('hint-kwh').textContent =
    t === 'empresa' ? 'Média escritório pequeno: ~2.000 kWh/mês' : 'Média residencial BR: ~170 kWh/mês';
  document.getElementById('meter-ref').textContent =
    t === 'empresa' ? 'Referência: ~25 tCO₂/empresa pequena/ano' : 'Referência: 2,2 tCO₂/pessoa/ano (BR)';

  update();
}

// ── Formatação de número ──
function fmtNum(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// ── Cálculo principal ──
function update() {
  const km       = parseFloat(document.getElementById('sl-km').value);
  const comb     = parseFloat(document.getElementById('sel-comb').value);
  const aviao    = parseFloat(document.getElementById('sl-aviao').value);
  const kwh      = parseFloat(document.getElementById('sl-kwh').value);
  const fonte    = parseFloat(document.getElementById('sel-fonte').value);
  const gas      = parseFloat(document.getElementById('sl-gas').value);
  const lixo     = parseFloat(document.getElementById('sl-lixo').value);
  const fatorLixo = parseFloat(document.getElementById('sel-lixo').value);

  // Atualiza displays dos sliders
  document.getElementById('val-km').textContent    = km.toLocaleString('pt-BR') + ' km';
  document.getElementById('val-aviao').textContent = aviao;
  document.getElementById('val-kwh').textContent   = kwh.toLocaleString('pt-BR') + ' kWh';
  document.getElementById('val-gas').textContent   = gas;
  document.getElementById('val-lixo').textContent  = lixo + ' kg';

  let total = 0;

  // Transporte — carro
  total += km * comb * 12 / 1000;

  // Aviões
  total += aviao * 0.255;

  // Energia elétrica
  total += kwh * fonte * 12 / 1000;

  // Gás de cozinha
  total += gas * 6.6 * 12 / 1000;

  // Resíduos
  total += lixo * 52 * fatorLixo / 1000;

  // Campos exclusivos de pessoa física
  if (tipo === 'pessoa') {
    const dieta = parseFloat(document.getElementById('sel-dieta').value);
    const desp  = parseFloat(document.getElementById('sl-desp').value) / 100;

    total += dieta;
    total += dieta * desp * 0.25;

    document.getElementById('val-desp').textContent =
      document.getElementById('sl-desp').value + '%';
  }

  // Campos exclusivos de empresa
  if (tipo === 'empresa') {
    const frota = parseFloat(document.getElementById('sl-frota').value);
    const setor = parseFloat(document.getElementById('sel-setor').value);
    const func  = parseFloat(document.getElementById('sl-func').value);
    const renov = parseFloat(document.getElementById('sl-renov').value) / 100;

    document.getElementById('val-frota').textContent = frota;
    document.getElementById('val-func').textContent  = func;
    document.getElementById('val-renov').textContent =
      document.getElementById('sl-renov').value + '%';

    total += frota * km * comb * 12 / 1000;
    total += func * setor * (1 - renov * 0.6);
  }

  // ── Exibe resultado ──
  document.getElementById('total-num').textContent  = fmtNum(total);
  document.getElementById('compare-you').textContent = fmtNum(total) + ' t';

  // Equivalências
  document.getElementById('equiv-arvores').textContent =
    Math.round(total * 16.7).toLocaleString('pt-BR') + ' árvores necessárias para compensar';
  document.getElementById('equiv-voos').textContent =
    Math.round(total / 0.255).toLocaleString('pt-BR') + ' voos São Paulo → Rio de Janeiro';
  document.getElementById('equiv-km').textContent =
    Math.round(total * 1000 / 0.21).toLocaleString('pt-BR') + ' km rodados a gasolina';
  document.getElementById('equiv-luz').textContent =
    Math.round(total / 0.018).toLocaleString('pt-BR') + ' meses de conta de luz média';

  // ── Medidor ──
  const ref  = tipo === 'empresa' ? 25 : 2.2;
  const pct  = Math.min((total / (ref * 3)) * 100, 100);
  const fill = document.getElementById('meter-fill');
  fill.style.width = pct + '%';

  const status = document.getElementById('meter-status');
  if (total <= ref * 0.8) {
    fill.style.background = '#639922';
    status.textContent    = '✓ Abaixo da média — parabéns!';
    status.style.color    = '#639922';
  } else if (total <= ref * 1.5) {
    fill.style.background = '#BA7517';
    status.textContent    = '⚠ Próximo da média — pode melhorar';
    status.style.color    = '#BA7517';
  } else {
    fill.style.background = '#E24B4A';
    status.textContent    = '✗ Acima da média — atenção!';
    status.style.color    = '#E24B4A';
  }

  // ── Badge de nível ──
  const badge = document.getElementById('badge-nivel');
  badge.className = 'level-badge';

  if (total < 1.5) {
    badge.classList.add('level-otimo');
    document.getElementById('badge-icon').textContent  = '🌿';
    document.getElementById('badge-texto').textContent = 'Pegada baixa — excelente!';
  } else if (total < 5) {
    badge.classList.add('level-medio');
    document.getElementById('badge-icon').textContent  = '⚡';
    document.getElementById('badge-texto').textContent = 'Pegada moderada';
  } else {
    badge.classList.add('level-alto');
    document.getElementById('badge-icon').textContent  = '🔥';
    document.getElementById('badge-texto').textContent = 'Pegada alta — reduzir é urgente';
  }

  // Guarda para o relatório
  window._totalCO2 = total;
}

// ── Modal de recomendações ──
function gerarRelatorio() {
  const total = window._totalCO2 || 0;
  const lista = [];

  if (parseFloat(document.getElementById('sl-km').value) > 500 &&
      parseFloat(document.getElementById('sel-comb').value) > 0.1) {
    lista.push({
      icon: '🚗',
      titulo: 'Transporte',
      dica: 'Considere trocar para um veículo elétrico ou a etanol. Carona compartilhada e transporte público podem reduzir suas emissões de transporte em até 70%.'
    });
  }

  if (parseFloat(document.getElementById('sl-aviao').value) > 3) {
    lista.push({
      icon: '✈️',
      titulo: 'Aviação',
      dica: 'Voos são altamente emissores. Prefira videoconferências, e quando precisar viajar, compense suas emissões através de programas certificados.'
    });
  }

  if (parseFloat(document.getElementById('sl-kwh').value) > 300) {
    lista.push({
      icon: '⚡',
      titulo: 'Energia elétrica',
      dica: 'Instale painéis solares ou contrate energia de fonte renovável. Substitua equipamentos por modelos mais eficientes e adote LED em toda a iluminação.'
    });
  }

  if (tipo === 'pessoa') {
    const dieta = parseFloat(document.getElementById('sel-dieta').value);
    if (dieta > 2) {
      lista.push({
        icon: '🥩',
        titulo: 'Alimentação',
        dica: 'Reduzir o consumo de carne vermelha é uma das ações mais eficazes. Uma dieta flexitariana pode cortar até 1,5 tCO₂/ano da sua pegada.'
      });
    }
  }

  if (parseFloat(document.getElementById('sl-lixo').value) > 5 ||
      parseFloat(document.getElementById('sel-lixo').value) > 0.3) {
    lista.push({
      icon: '♻️',
      titulo: 'Resíduos',
      dica: 'Adote compostagem para resíduos orgânicos e separe o lixo reciclável. Reduza o consumo de itens descartáveis e dê preferência a produtos a granel.'
    });
  }

  if (lista.length === 0) {
    lista.push({
      icon: '🌿',
      titulo: 'Continue assim!',
      dica: 'Sua pegada está baixa. Considere compensar o restante plantando árvores ou apoiando projetos de reflorestamento certificados como REDD+ e Verra.'
    });
  }

  const itens = lista.map(i => `
    <div style="display:flex; gap:1rem; padding:1rem 0; border-bottom:1px solid #f0f0f0;">
      <div style="font-size:1.5rem; line-height:1;">${i.icon}</div>
      <div>
        <div style="font-weight:500; color:#173404; margin-bottom:0.25rem;">${i.titulo}</div>
        <p style="font-size:0.9rem; color:#555; line-height:1.65; font-weight:300;">${i.dica}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('modal-content').innerHTML = `
    <h2 style="font-family:'Playfair Display',serif; font-size:1.75rem; color:#173404; margin-bottom:0.5rem;">Seu relatório</h2>
    <p style="color:#888; font-size:0.9rem; margin-bottom:1.5rem;">
      Emissão estimada: <strong style="color:#639922;">${fmtNum(total)} tCO₂/ano</strong>
    </p>
    <h3 style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.12em; color:#999; margin-bottom:0.5rem;">
      Recomendações principais
    </h3>
    ${itens}
    <p style="margin-top:1.5rem; font-size:0.8rem; color:#bbb;">
      * Os valores são estimativas baseadas em fatores médios brasileiros e globais.
      Para cálculos precisos, consulte um especialista em sustentabilidade.
    </p>
  `;

  document.getElementById('modal-overlay').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// Fecha ao clicar fora da caixa
document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) fecharModal();
});

// ── Inicializa ──
update();