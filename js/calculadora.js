// ════════════════════════════════════════════════════
//  LÓGICA DE CÁLCULO — baseada no código fornecido
// ════════════════════════════════════════════════════

function km_para_litros(km) {
  const litros = km / 5.75;
  return litros_para_co2(litros);
}
function litros_para_co2(litros) {
  return ((litros * 0.82) * 0.75) * 3.7;
}
function kwh_para_co2(kwh) {
  const litros_eq = (kwh * 1000) / 8890;
  return litros_para_co2(litros_eq);
}


// ════════════════════════════════════════════════════
//  WIZARD
// ════════════════════════════════════════════════════
const TOTAL_ETAPAS = 5;
let etapaAtual = 1;
let calculado  = false;
let usuarioAtual = null;

function irParaEtapa(n) {
  if (n > etapaAtual && !validarEtapa(etapaAtual)) return;

  document.querySelectorAll('.etapa').forEach(el => el.classList.remove('ativa'));
  document.getElementById('etapa-' + n).classList.add('ativa');

  document.querySelectorAll('.step-item').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 === n) el.classList.add('active');
    if (i + 1 < n)  el.classList.add('done');
  });

  document.querySelectorAll('.ei-dot').forEach((dot, i) => {
    dot.className = 'ei-dot';
    if (i + 1 === n) dot.classList.add('cur');
    if (i + 1 < n)  dot.classList.add('ok');
  });

  etapaAtual = n;
  document.querySelector('.wizard-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function avancar() { if (etapaAtual < TOTAL_ETAPAS) irParaEtapa(etapaAtual + 1); }
function voltar()  { if (etapaAtual > 1) irParaEtapa(etapaAtual - 1); }
function irParaStep(n) { if (n <= etapaAtual) irParaEtapa(n); }
function validarEtapa() { return true; }


// ════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════
function gv(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) || v < 0 ? 0 : v;
}
function fmt(n, dec = 1) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtInt(n) {
  return Math.round(n).toLocaleString('pt-BR');
}


// ════════════════════════════════════════════════════
//  CÁLCULO PRINCIPAL
// ════════════════════════════════════════════════════
async function calcular() {
  // Etapa 1 — Combustão Móvel
  const km_empresa = gv('inp-km-empresa');
  const km_entrega = gv('inp-km-entrega');
  const kg_viagem  = km_para_litros(km_empresa);
  const kg_entrega = km_para_litros(km_entrega);

  // Etapa 2 — Estacionária
  const litros_estac = gv('inp-litros-estac');
  const kg_movel     = litros_para_co2(litros_estac);

  // Etapa 3 — Energia + Funcionários
  const kwh_empresa = gv('inp-kwh-empresa');
  const km_func     = gv('inp-km-func');
  const kg_energia  = kwh_para_co2(kwh_empresa);
  const kg_func     = km_para_litros(km_func);

  // Etapa 4 — Fugitivas + Resíduos
  const kwh_fugit = gv('inp-kwh-fugit');
  const pessoas   = gv('inp-pessoas');
  const kg_fugit  = kwh_para_co2(kwh_fugit);
  const kg_res    = pessoas * 190;

  // Etapa 5 — Créditos
  const creditos = gv('inp-creditos');

  // ── ÍNDICE TOTAL ──
  const indice    = kg_viagem + kg_movel + kg_energia + kg_func + kg_fugit + kg_res + kg_entrega;
  const toneladas = indice / 1000;
  const compensamento = Math.floor(toneladas);
  const saldo     = creditos - compensamento;
  const lucros    = saldo * 12;

  // ════ ATUALIZA UI ════

  // Total
  const elT = document.getElementById('total-num');
  elT.textContent = fmt(toneladas);
  elT.classList.remove('zero');
  document.getElementById('total-kg').textContent = fmtInt(indice) + ' kg CO₂';

  // Badge nível
  const badge = document.getElementById('lv-badge');
  badge.className = 'lv-badge';
  if (toneladas < 5) {
    badge.classList.add('lv-b');
    document.getElementById('lv-icon').textContent = '🌿';
    document.getElementById('lv-text').textContent = 'Emissão baixa';
  } else if (toneladas < 50) {
    badge.classList.add('lv-m');
    document.getElementById('lv-icon').textContent = '⚡';
    document.getElementById('lv-text').textContent = 'Emissão moderada';
  } else {
    badge.classList.add('lv-a');
    document.getElementById('lv-icon').textContent = '🔥';
    document.getElementById('lv-text').textContent = 'Emissão alta';
  }

  // Breakdown por categoria
  const partes = [
    { id: 'br-frota',   val: kg_viagem + kg_entrega },
    { id: 'br-energia', val: kg_energia + kg_fugit },
    { id: 'br-estac',   val: kg_movel },
    { id: 'br-func',    val: kg_func + kg_res },
  ];
  const maxP = Math.max(...partes.map(p => p.val), 1);
  partes.forEach(p => {
    const fill  = document.getElementById(p.id + '-fill');
    const valEl = document.getElementById(p.id + '-val');
    if (fill)  fill.style.width = (p.val / maxP * 100) + '%';
    if (valEl) valEl.textContent = fmtInt(p.val) + ' kg';
  });
  document.getElementById('brk-section').style.display = '';

  // ── EQUIVALÊNCIAS ──
  const arvores = Math.round(toneladas * 16.7);
  const voos    = Math.round(toneladas / 0.255);
  const kmCarro = Math.round(toneladas * 1000 / 0.21);
  const luz     = Math.round(toneladas / 0.018);

  document.getElementById('equiv-arvores').textContent = fmtInt(arvores);
  document.getElementById('equiv-voos').textContent    = fmtInt(voos);
  document.getElementById('equiv-km').textContent      = fmtInt(kmCarro);
  document.getElementById('equiv-luz').textContent     = fmtInt(luz);
  document.getElementById('equiv-card').style.display  = '';

  // Créditos
  document.getElementById('cc-compensar').textContent  = fmtInt(compensamento + 1);
  document.getElementById('cc-saldo-num').textContent  = (saldo >= 0 ? '+' : '') + saldo + ' créditos';
  const lucroEl = document.getElementById('cc-lucro-val');
  lucroEl.textContent = 'R$ ' + fmtInt(Math.abs(lucros));
  lucroEl.className   = 'cc-lucro-val' + (lucros < 0 ? ' negativo' : '');
  document.getElementById('cc-lucro-label').textContent =
    lucros >= 0 ? 'Lucro estimado com créditos (R$)' : 'Custo estimado para compensar (R$)';
  document.getElementById('credit-card').style.display = '';

  // Medidor
  const ref = 100;
  const pct = Math.min((toneladas / (ref * 2)) * 100, 100);
  const mf  = document.getElementById('meter-fill');
  mf.style.width = pct + '%';
  const ms = document.getElementById('meter-status');
  if (toneladas < ref * 0.5) {
    mf.style.background = '#639922'; ms.textContent = '✓ Abaixo da média empresarial'; ms.style.color = '#639922';
  } else if (toneladas < ref * 1.2) {
    mf.style.background = '#BA7517'; ms.textContent = '⚠ Próximo da média empresarial'; ms.style.color = '#BA7517';
  } else {
    mf.style.background = '#E24B4A'; ms.textContent = '✗ Acima da média — ação urgente'; ms.style.color = '#E24B4A';
  }

  // Guarda dados
  window._dados = {
    indice, toneladas, kg_viagem, kg_movel, kg_energia,
    kg_func, kg_fugit, kg_res, kg_entrega,
    compensamento, creditos, saldo, lucros
  };
  calculado = true;
  document.getElementById('btn-rel').disabled = false;

  // ── SALVA NO SUPABASE ──
  if (usuarioAtual) {
    const entradas  = { km_empresa, km_entrega, litros_estac, kwh_empresa, km_func, pessoas, kwh_fugit, creditos };
    const resultados= { kg_total: indice, toneladas, compensamento, lucros, saldo };
    const { error } = await sbSalvarCalculo(entradas, resultados);
    if (error) console.warn('Supabase: erro ao salvar cálculo —', error);
    else       mostrarToast('✓ Cálculo salvo no histórico!');
  }
}


// ════════════════════════════════════════════════════
//  LIMPAR
// ════════════════════════════════════════════════════
function resetar() {
  document.querySelectorAll('input[type="number"]').forEach(el => el.value = '');
  document.getElementById('total-num').textContent = '—';
  document.getElementById('total-num').classList.add('zero');
  document.getElementById('total-kg').textContent = '';
  document.getElementById('lv-badge').className = 'lv-badge lv-b';
  document.getElementById('lv-icon').textContent = '✦';
  document.getElementById('lv-text').textContent = 'Preencha as etapas';
  document.getElementById('brk-section').style.display = 'none';
  document.getElementById('equiv-card').style.display  = 'none';
  document.getElementById('credit-card').style.display = 'none';
  document.getElementById('meter-fill').style.width    = '0%';
  document.getElementById('meter-status').textContent  = '—';
  document.getElementById('meter-status').style.color  = '#aaa';
  document.getElementById('btn-rel').disabled = true;
  calculado = false;
  window._dados = null;
  irParaEtapa(1);
}


// ════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════
function mostrarToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
      background:#173404; color:#C0DD97; font-family:'DM Sans',sans-serif;
      font-size:0.9rem; font-weight:500; padding:0.75rem 1.5rem;
      border-radius:999px; z-index:9999;
      box-shadow:0 4px 16px rgba(23,52,4,0.3);
      opacity:0; transition:opacity 0.3s;
      pointer-events:none;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 3000);
}


// ════════════════════════════════════════════════════
//  RELATÓRIO / MODAL
// ════════════════════════════════════════════════════
function abrirRelatorio() {
  if (!calculado || !window._dados) return;
  const d = window._dados;
  const lista = [];

  if (d.kg_viagem > 1000)
    lista.push({ ico: '🚗', t: 'Frota de veículos', txt: 'A maior fonte de emissão da sua empresa. Considere migrar parte da frota para elétricos ou bicombustível, e implante gestão de rota para reduzir km rodados.' });
  if (d.kg_movel > 500)
    lista.push({ ico: '⛽', t: 'Combustão estacionária', txt: 'Geradores e caldeiras a fóssil são emissores intensivos. Avalie co-geração ou substituição por fontes renováveis.' });
  if (d.kg_energia > 1000)
    lista.push({ ico: '⚡', t: 'Energia elétrica', txt: 'Contrate energia renovável (I-REC), instale painéis solares ou invista em eficiência energética — equipamentos eficientes, LED e automação predial.' });
  if (d.kg_func > 500)
    lista.push({ ico: '👥', t: 'Deslocamento de funcionários', txt: 'Implante home office, subsídio a transporte coletivo e carpooling. Reduz emissões e melhora retenção.' });
  if (d.kg_fugit > 200)
    lista.push({ ico: '🌬️', t: 'Emissões fugitivas', txt: 'Substitua gases refrigerantes de alto GWP (R-22, R-410A) por alternativas de menor impacto. Faça manutenção preventiva nos sistemas de climatização.' });
  if (d.kg_res > 500)
    lista.push({ ico: '♻️', t: 'Resíduos', txt: 'Implante coleta seletiva, compostagem orgânica e parceria com cooperativas. Reduza envio de resíduos a aterros.' });
  if (lista.length === 0)
    lista.push({ ico: '🌿', t: 'Empresa com baixa emissão!', txt: 'Parabéns! Considere avançar para carbono neutro comprando créditos certificados e publicando seu relatório ESG.' });

  const itens = lista.map(i => `
    <div class="mr-item">
      <div class="mr-ico">${i.ico}</div>
      <div><div class="mr-title">${i.t}</div><p class="mr-text">${i.txt}</p></div>
    </div>`).join('');

  document.getElementById('modal-content').innerHTML = `
    <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;color:#173404;margin-bottom:0.3rem;">Relatório de Emissões</h2>
    <p style="color:#aaa;font-size:0.86rem;margin-bottom:0.3rem;">Índice total: <strong style="color:#639922;">${fmtInt(d.indice)} kg CO₂</strong> = <strong style="color:#639922;">${Math.floor(d.toneladas)} toneladas</strong></p>
    <p style="color:#aaa;font-size:0.86rem;margin-bottom:1.5rem;">Créditos p/ compensação: <strong style="color:#BA7517;">${d.compensamento + 1}</strong></p>
    <p style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:#999;margin-bottom:0.4rem;font-weight:500;">Recomendações</p>
    ${itens}
    <p style="margin-top:1.5rem;font-size:0.74rem;color:#ccc;line-height:1.6;">
      Metodologia: GHG Protocol, IPCC AR6 e SEEG Brasil.
      Fórmula base: (litros × 0,82 × 0,75) × 3,7 kg CO₂.
    </p>`;

  document.getElementById('modal-ov').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal-ov').style.display = 'none';
}
document.getElementById('modal-ov').addEventListener('click', function(e) {
  if (e.target === this) fecharModal();
});

// Enter na etapa 5 dispara cálculo
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && etapaAtual === TOTAL_ETAPAS) calcular();
});


// ════════════════════════════════════════════════════
//  INICIALIZAÇÃO — auth guard + carrega usuário
// ════════════════════════════════════════════════════
(async () => {
  // Redireciona para login se não autenticado
  const user = await requireAuth('login.html');
  if (!user) return;
  usuarioAtual = user;

  // Exibe nome da empresa no nav
  const nomeEl = document.getElementById('nav-user');
  if (nomeEl) nomeEl.textContent = user.user_metadata?.nome_empresa || user.email;

  irParaEtapa(1);
})();