document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('flood-container');
  const langToggle = document.getElementById('lang-toggle');

  function keyForData(lang) { return lang === 'en' ? 'en' : 'ne'; }

  function render(lang) {
    const dataKey = keyForData(lang);
    const methods = floodData[dataKey] || floodData.en;
    container.innerHTML = '';
    methods.forEach(method => {
      const box = document.createElement('div');
      box.className = 'method-box';
      box.innerHTML = `
        <h2>${method.icon} ${method.title}</h2>
        <div class="steps">
          ${method.steps.map(s => `<div class="step"><p>${s.text}</p></div>`).join('')}
        </div>
      `;
      container.appendChild(box);
    });
    if (langToggle) langToggle.textContent = (lang === 'en' ? 'E' : 'N');
  }

  if (window.Lang && typeof window.Lang.setupToggle === 'function') {
    window.Lang.setupToggle('#lang-toggle', render);
  } else {
    let current = localStorage.getItem('lang') || 'en';
    render(current);
    langToggle.addEventListener('click', () => {
      current = current === 'en' ? 'np' : 'en';
      localStorage.setItem('lang', current);
      render(current);
    });
    window.addEventListener('storage', (e) => { if (e.key === 'lang') render(e.newValue || 'en'); });
  }
});