document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('helpline-container');
  const langToggle = document.getElementById('lang-toggle');
  const titleEl = document.getElementById('helpline-title');

  let currentLang = localStorage.getItem('lang') || 'en';

  function renderHelpline() {
    const data = (window.helplineData && window.helplineData[currentLang]) || helplineData[currentLang];
    titleEl.textContent = data.title;
    langToggle.textContent = currentLang === 'en' ? 'E' : 'N';

    container.innerHTML = `
      <div class="helpline-box">
        <h2>${data.ambulanceTitle}</h2>
        <ul>
          ${data.ambulances.map(a => `<li>${a.name}: <a href="tel:${a.number}">${a.number}</a></li>`).join('')}
        </ul>
      </div>

      <div class="helpline-box">
        <h2>${data.hospitalTitle}</h2>
        <ul>
          ${data.hospitals.map(h => `<li>${h.name}: <a href="tel:${h.number}">${h.number}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'np' : 'en';
    localStorage.setItem('lang', currentLang);
    renderHelpline();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'lang') {
      currentLang = e.newValue || 'en';
      renderHelpline();
    }
  });

  renderHelpline();
});