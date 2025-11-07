document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('lang-toggle');
  const backBtn = document.querySelector('.back-btn');
  const titleEl = document.getElementById('disease-title');
  const symptomsTitle = document.getElementById('symptoms-title');
  const preventionTitle = document.getElementById('prevention-title');
  const remediesTitle = document.getElementById('remedies-title');
  const symptomsList = document.getElementById('symptoms-list');
  const preventionList = document.getElementById('prevention-list');
  const remediesList = document.getElementById('remedies-list');

  function mapCodeToDataLang(code) { return code === 'np' ? 'np' : 'en'; }
  function toggleLabel(code) { return code === 'en' ? 'नेपाली' : 'English'; }

  let currentLangCode = localStorage.getItem('lang') || 'en';

  function renderDisease() {
    const dataLang = mapCodeToDataLang(currentLangCode);
    const disease = choleraData[dataLang];

    if (!disease) return;

    // Update titles
    titleEl.textContent = disease.title;
    symptomsTitle.textContent = dataLang === 'en' ? 'Symptoms' : 'लक्षणहरू';
    preventionTitle.textContent = dataLang === 'en' ? 'Prevention' : 'रोकथाम';
    remediesTitle.textContent = dataLang === 'en' ? 'Home Remedies' : 'घरेलु उपचार';

    // Update back button
    if (backBtn) {
      backBtn.textContent = dataLang === 'en' ? '⬅ Back' : '⬅ पछाडि';
    }

    // Render lists
    renderList(symptomsList, disease.symptoms);
    renderList(preventionList, disease.prevention);
    renderList(remediesList, disease.remedies);

    // Update toggle button
    langToggle.textContent = toggleLabel(currentLangCode);
  }

  function renderList(container, items) {
    container.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      container.appendChild(li);
    });
  }

  // Language toggle
  langToggle.addEventListener('click', () => {
    currentLangCode = currentLangCode === 'en' ? 'np' : 'en';
    localStorage.setItem('lang', currentLangCode);
    renderDisease();
  });

  // Sync with other pages
  window.addEventListener('storage', (e) => {
    if (e.key === 'lang' && e.newValue) {
      currentLangCode = e.newValue;
      renderDisease();
    }
  });

  // Initial render
  renderDisease();
});