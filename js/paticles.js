// Gera partículas flutuantes no hero
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