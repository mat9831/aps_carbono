// Formatação utilizada
function fmt(n, dec = 1) {
  if (n === null || n === undefined) return '—';
  return parseFloat(n).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtInt(n) {
  if (!n) return '0';
  return Math.round(n).toLocaleString('pt-BR');
}
function fmtData(iso) {
  const d = new Date(iso);
  return {
    dia:  d.getDate().toString().padStart(2,'0'),
    mes:  d.toLocaleString('pt-BR', { month: 'short' }).replace('.',''),
    full: d.toLocaleString('pt-BR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
  };
}

//  Nível de distintivo 
function badgeNivel(ton) {
  if (ton < 5)  return { cls: 'b', txt: 'Baixo' };
  if (ton < 50) return { cls: 'm', txt: 'Moderado' };
  return           { cls: 'a', txt: 'Alto' };
}

//  Cor do lucro
function lucroClass(lucros) {
  if (lucros > 0) return 'verde';
  if (lucros < 0) return 'vermelho';
  return 'amarelo';
}

//  Equivalências
function calcEquiv(ton) {
  return {
    arvores: Math.round(ton * 16.7),
    voos:    Math.round(ton / 0.255),
    km:      Math.round(ton * 1000 / 0.21),
    luz:     Math.round(ton / 0.018),
  };
}

//  Renderiza um card
function renderCard(c, idx) {
  const ton    = parseFloat(c.toneladas) || 0;
  const kg     = parseFloat(c.kg_total)  || 0;
  const dt     = fmtData(c.criado_em);
  const nivel  = badgeNivel(ton);
  const equiv  = calcEquiv(ton);
  const lucros = parseFloat(c.lucros) || 0;
  const comp   = parseInt(c.compensamento) || 0;
  const cred   = parseInt(c.creditos) || 0;
  const saldo  = cred - comp;

  // retorno  com os dados do dashboard dos calculos da empresas salvos
return `
<div class="calc-card" id="card-${c.id}">
    <div class="calc-card-header" onclick="toggleCard('${c.id}')">
    <div class="cc-left">
        <div class="cc-date-badge">
        <div class="cc-date-day">${dt.dia}</div>
        <div class="cc-date-month">${dt.mes}</div>
        </div>
        <div>
        <div class="cc-info-empresa">${c.nome_empresa || 'Empresa'}</div>
        <div class="cc-info-date">${dt.full}</div>
        </div>
    </div>
    <div class="cc-right">
        <div class="cc-total">
        <div class="cc-total-num">${fmt(ton)}</div>
        <div class="cc-total-unit">toneladas CO₂/ano</div>
        </div>
        <span class="cc-badge ${nivel.cls}">${nivel.txt}</span>
        <span class="cc-chevron">▼</span>
    </div>
    </div>

    <div class="calc-card-body">
    <!-- Entradas principais -->
    <div class="detail-grid">
        <div class="detail-item">
        <div class="detail-label">Frota empresa</div>
        <div class="detail-val">${fmtInt(c.km_empresa)} km</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Entregas / serv.</div>
        <div class="detail-val">${fmtInt(c.km_entrega)} km</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Comb. estacionário</div>
        <div class="detail-val">${fmtInt(c.litros_estac)} L</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Energia elétrica</div>
        <div class="detail-val">${fmtInt(c.kwh_empresa)} kWh</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Km funcionários</div>
        <div class="detail-val">${fmtInt(c.km_func)} km</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Funcionários</div>
        <div class="detail-val">${fmtInt(c.pessoas)} pessoas</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Emissões fugitivas</div>
        <div class="detail-val">${fmtInt(c.kwh_fugit)} kWh</div>
        </div>
        <div class="detail-item">
        <div class="detail-label">Total em kg</div>
        <div class="detail-val">${fmtInt(kg)} kg</div>
        </div>
    </div>

    <!-- Equivalências -->
    <div class="equiv-row">
        <div class="equiv-mini">
        <div class="equiv-mini-ico">🌳</div>
        <div class="equiv-mini-num">${fmtInt(equiv.arvores)}</div>
        <div class="equiv-mini-desc">árvores para compensar</div>
        </div>
        <div class="equiv-mini">
        <div class="equiv-mini-ico">✈️</div>
        <div class="equiv-mini-num">${fmtInt(equiv.voos)}</div>
        <div class="equiv-mini-desc">voos SP → Rio</div>
        </div>
        <div class="equiv-mini">
        <div class="equiv-mini-ico">🚗</div>
        <div class="equiv-mini-num">${fmtInt(equiv.km)}</div>
        <div class="equiv-mini-desc">km a gasolina</div>
        </div>
        <div class="equiv-mini">
        <div class="equiv-mini-ico">💡</div>
        <div class="equiv-mini-num">${fmtInt(equiv.luz)}</div>
        <div class="equiv-mini-desc">meses de luz</div>
        </div>
    </div>

    <!-- Créditos -->
    <div class="credit-row">
        <div class="credit-mini">
        <div class="credit-mini-label">Créditos necessários</div>
        <div class="credit-mini-val amarelo">${comp + 1}</div>
        </div>
        <div class="credit-mini">
        <div class="credit-mini-label">Saldo de créditos</div>
        <div class="credit-mini-val ${saldo >= 0 ? 'verde' : 'vermelho'}">${saldo >= 0 ? '+' : ''}${saldo}</div>
        </div>
        <div class="credit-mini">
        <div class="credit-mini-label">${lucros >= 0 ? 'Lucro estimado' : 'Custo estimado'}</div>
        <div class="credit-mini-val ${lucroClass(lucros)}">R$ ${fmtInt(Math.abs(lucros))}</div>
        </div>
    </div>

    <div class="card-actions">
        <button class="btn-del" onclick="deletar('${c.id}')">🗑 Excluir este cálculo</button>
    </div>
    </div>
</div>`;
}

// Alternar
function toggleCard(id) {
const card = document.getElementById('card-' + id);
card.classList.toggle('open');
}

//  Deletar
async function deletar(id) {
if (!confirm('Excluir este cálculo permanentemente?')) return;
const { error } = await sbDeletarCalculo(id);
if (error) { alert('Erro ao excluir: ' + error.message); return; }
document.getElementById('card-' + id).remove();
  // Atualiza contagem
const restantes = document.querySelectorAll('.calc-card').length;
document.getElementById('hist-count').innerHTML =
    `<strong>${restantes}</strong> ${restantes === 1 ? 'cálculo encontrado' : 'cálculos encontrados'}`;
if (restantes === 0) {
    document.getElementById('calc-list').style.display = 'none';
    document.getElementById('empty').style.display = '';
}
}

//  Carrega histórico
async function carregar() {
  // Auth guard
const user = await requireAuth('login.html');
if (!user) return;

  // Nome no nav
document.getElementById('nav-user').textContent =
    user.user_metadata?.nome_empresa || user.email;

const { data, error } = await sbListarCalculos(50);
document.getElementById('loading').style.display = 'none';

if (error) {
    document.getElementById('hist-count').textContent = 'Erro ao carregar dados.';
    return;
}

const n = data?.length || 0;
document.getElementById('hist-count').innerHTML =
    `<strong>${n}</strong> ${n === 1 ? 'cálculo encontrado' : 'cálculos encontrados'}`;

if (!n) {
    document.getElementById('empty').style.display = '';
    return;
}

document.getElementById('calc-list').innerHTML = data.map(renderCard).join('');
  // Abre o primeiro card por padrão
if (data[0]) document.getElementById('card-' + data[0].id)?.classList.add('open');
}

carregar();