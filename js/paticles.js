// Gera partículas flutuantes nas telas de fundo para criar um efeito visual mais dinâmico e interessante,
// reforçando a temática ambiental do site. As partículas são círculos coloridos que se movem lentamente para cima,
// simulando folhas ou bolhas de ar, e desaparecem ao atingir o topo da tela. O script cria um número aleatório de partículas
// com tamanhos, cores e velocidades variadas para garantir uma aparência natural e fluida.

(function () {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#639922', '#3B6D11', '#BA7517', '#C0DD97'];

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 60 + 20;

    p.className = 'particle';
    p.style.cssText = [
      `width: ${size}px`,
      `height: ${size}px`,
      `left: ${Math.random() * 100}%`,
      `background: ${colors[Math.floor(Math.random() * colors.length)]}`,
      `animation-duration: ${Math.random() * 20 + 15}s`,
      `animation-delay: ${Math.random() * -25}s`
    ].join(';');

    container.appendChild(p);
  }
})();