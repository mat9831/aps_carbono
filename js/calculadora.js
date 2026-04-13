// ── Estado ──
let tipo = 'pessoa';
let calculado = false;

// ── Tipo de cálculo ──
function setTipo(t) {
  tipo = t;
  document.getElementById('btn-pessoa').classList.toggle('active', t === 'pessoa');
  document.getElementById('btn-empresa').classList.toggle('active', t === 'empresa');
  document.querySelectorAll('.empresa-field').forEach(el => el.style.display = t === 'empresa' ? '' : 'none');
  document.querySelectorAll('.pessoa-field').forEach(el => el.style.display = t === 'pessoa' ? '' : 'none');
  document.getElementById('meter-ref').textContent =
    t === 'empresa' ? 'Referência: ~25 tCO₂/empresa pequena/ano' : 'Referência: 2,2 tCO₂/pessoa/ano (BR)';
  limparResultado();
}

// ── Formata número brasileiro ──
function fmt(n, dec = 1) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtInt(n) {
  return Math.round(n).toLocaleString('pt-BR');
}

// ── Pega valor do input (0 se vazio/inválido) ──
function val(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) || v < 0 ? 0 : v;
}
function sel(id) {
  return parseFloat(document.getElementById(id).value);
}

// ── CALCULAR ──
function calcular() {
  const km        = val('inp-km');
  const comb      = sel('sel-comb');
  const aviao     = val('inp-aviao');
  const kwh       = val('inp-kwh');
  const fonte     = sel('sel-fonte');
  const gas       = val('inp-gas');
  const lixoKg    = val('inp-lixo');
  const fatorLixo = sel('sel-lixo');

  // Parcelas
  const tCarro   = km * comb * 12 / 1000;
  const tAviao   = aviao * 0.255;
  const tEnergia = kwh * fonte * 12 / 1000;
  const tGas     = gas * 6.6 * 12 / 1000;
  const tLixo    = lixoKg * 52 * fatorLixo / 1000;

  let tDieta = 0, tEmpresa = 0;

  if (tipo === 'pessoa') {
    tDieta = sel('sel-dieta');
    const desp = val('inp-desp') / 100;
    tDieta += tDieta * desp * 0.25;
  }

  if (tipo === 'empresa') {
    const frota = val('inp-frota');
    const setor = sel('sel-setor');
    const func  = val('inp-func');
    const renov = val('inp-renov') / 100;
    tEmpresa = frota * km * comb * 12 / 1000 + func * setor * (1 - renov * 0.6);
  }

  const total = tCarro + tAviao + tEnergia + tGas + tLixo + tDieta + tEmpresa;

  // Exibe total
  const el = document.getElementById('total-num');
  el.textContent = fmt(total);
  el.classList.toggle('zero', total === 0);
  document.getElementById('compare-you').textContent = fmt(total) + ' t';

  // Badge nível
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

  // Breakdown barras
  const parts = [
    { id: 'br-transporte', icon: '🚗', name: 'Transporte', val: tCarro + tAviao },
    { id: 'br-energia',    icon: '⚡', name: 'Energia',    val: tEnergia + tGas },
    { id: 'br-alimentacao',icon: '🥩', name: tipo === 'pessoa' ? 'Alimentação' : 'Produção', val: tDieta + tEmpresa },
    { id: 'br-residuos',   icon: '♻️', name: 'Resíduos',  val: tLixo },
  ];
  const maxPart = Math.max(...parts.map(p => p.val), 0.01);
  parts.forEach(p => {
    const pct = (p.val / maxPart) * 100;
    const fill = document.getElementById(p.id + '-fill');
    const valEl = document.getElementById(p.id + '-val');
    if (fill) fill.style.width = pct + '%';
    if (valEl) valEl.textContent = fmt(p.val) + ' t';
  });
  document.getElementById('breakdown-section').style.display = total > 0 ? '' : 'none';

  // Equivalências
  document.getElementById('equiv-arvores').textContent = fmtInt(total * 16.7);
  document.getElementById('equiv-voos').textContent    = fmtInt(total / 0.255);
  document.getElementById('equiv-km').textContent      = fmtInt(total * 1000 / 0.21);
  document.getElementById('equiv-luz').textContent     = fmtInt(total / 0.018);
  document.getElementById('equiv-card').style.display  = total > 0 ? '' : 'none';

  // Medidor
  const ref = tipo === 'empresa' ? 25 : 2.2;
  const pct = Math.min((total / (ref * 3)) * 100, 100);
  const fill = document.getElementById('meter-fill');
  fill.style.width = pct + '%';
  const status = document.getElementById('meter-status');
  if (total === 0) {
    fill.style.background = '#d1d5db';
    status.textContent = '—';
    status.style.color = '#aaa';
  } else if (total <= ref * 0.8) {
    fill.style.background = '#639922';
    status.textContent = '✓ Abaixo da média — parabéns!';
    status.style.color = '#639922';
  } else if (total <= ref * 1.5) {
    fill.style.background = '#BA7517';
    status.textContent = '⚠ Próximo da média — pode melhorar';
    status.style.color = '#BA7517';
  } else {
    fill.style.background = '#E24B4A';
    status.textContent = '✗ Acima da média — atenção!';
    status.style.color = '#E24B4A';
  }

  document.getElementById('btn-relatorio').disabled = total === 0;
  window._totalCO2 = total;
  calculado = true;
}

// ── LIMPAR ──
function limpar() {
  document.querySelectorAll('input[type="number"]').forEach(el => el.value = '');
  document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  limparResultado();
}

function limparResultado() {
  const el = document.getElementById('total-num');
  el.textContent = '—';
  el.classList.add('zero');
  document.getElementById('compare-you').textContent = '—';
  document.getElementById('badge-nivel').className = 'level-badge level-otimo';
  document.getElementById('badge-icon').textContent  = '✦';
  document.getElementById('badge-texto').textContent = 'Preencha e calcule';
  document.getElementById('breakdown-section').style.display = 'none';
  document.getElementById('equiv-card').style.display = 'none';
  document.getElementById('meter-fill').style.width = '0%';
  document.getElementById('meter-status').textContent = '—';
  document.getElementById('meter-status').style.color = '#aaa';
  document.getElementById('btn-relatorio').disabled = true;
  calculado = false;
  window._totalCO2 = 0;
}

// ── RELATÓRIO ──
function gerarRelatorio() {
  if (!calculado || !window._totalCO2) return;
  const total = window._totalCO2;
  const lista = [];

  if ((val('inp-km') > 500) && sel('sel-comb') > 0.1) {
    lista.push({ icon: '🚗', titulo: 'Transporte viário', dica: 'Considere trocar para veículo elétrico ou etanol. Carona compartilhada e transporte público podem reduzir as emissões de deslocamento em até 70%.' });
  }
  if (val('inp-aviao') > 3) {
    lista.push({ icon: '✈️', titulo: 'Aviação', dica: 'Voos são altamente emissores. Prefira videoconferências quando possível, e ao viajar, compense as emissões por programas certificados (REDD+, Verra).' });
  }
  if (val('inp-kwh') > 300) {
    lista.push({ icon: '⚡', titulo: 'Energia elétrica', dica: 'Instale painéis solares ou contrate energia de fonte renovável. Substitua equipamentos antigos por versões eficientes e adote LED em toda a iluminação.' });
  }
  if (tipo === 'pessoa' && sel('sel-dieta') > 2) {
    lista.push({ icon: '🥩', titulo: 'Alimentação', dica: 'Reduzir carne vermelha é uma das ações individuais mais eficazes. Uma dieta flexitariana pode cortar até 1,5 tCO₂/ano da sua pegada alimentar.' });
  }
  if (val('inp-lixo') > 5 || sel('sel-lixo') > 0.3) {
    lista.push({ icon: '♻️', titulo: 'Resíduos', dica: 'Adote compostagem para resíduos orgânicos e separe o lixo reciclável. Reduza itens descartáveis e prefira produtos a granel.' });
  }
  if (tipo === 'empresa' && val('inp-renov') < 30) {
    lista.push({ icon: '🏭', titulo: 'Energia renovável na empresa', dica: 'Aumentar a participação de fontes renováveis na matriz energética da empresa é o caminho mais rápido para reduzir o escopo 2 de emissões.' });
  }
  if (lista.length === 0) {
    lista.push({ icon: '🌿', titulo: 'Continue assim!', dica: 'Sua pegada está baixa. Considere compensar o restante apoiando projetos de reflorestamento certificados no Brasil, como o Programa Arpa.' });
  }

  const itens = lista.map(i => `
    <div class="modal-rec-item">
      <div class="modal-rec-icon">${i.icon}</div>
      <div>
        <div class="modal-rec-title">${i.titulo}</div>
        <p class="modal-rec-text">${i.dica}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('modal-content').innerHTML = `
    <h2 style="font-family:'Playfair Display',serif;font-size:1.75rem;color:#173404;margin-bottom:0.4rem;">Seu relatório</h2>
    <p style="color:#aaa;font-size:0.88rem;margin-bottom:1.5rem;">Emissão calculada: <strong style="color:#639922;">${fmt(total)} tCO₂ / ano</strong></p>
    <p style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.12em;color:#999;margin-bottom:0.5rem;font-weight:500;">Recomendações principais</p>
    ${itens}
    <p style="margin-top:1.5rem;font-size:0.76rem;color:#ccc;line-height:1.6;">
      * Valores estimados com base em fatores médios brasileiros e globais (IPCC, SEEG, IEA, GHG Protocol).
      Para cálculos precisos de inventário corporativo, consulte um especialista em GHG Protocol.
    </p>
  `;
  document.getElementById('modal-overlay').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// Fecha ao clicar fora
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) fecharModal();
});

// Enter nos inputs dispara cálculo
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') calcular();
});

// Inicializa
limparResultado();