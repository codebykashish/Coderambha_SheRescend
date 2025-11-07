document.addEventListener('DOMContentLoaded', () => {
  const data = typhoidData;

  let currentLang = localStorage.getItem('lang') || 'en';
  const langToggle = document.getElementById('lang-toggle');
  const backBtn = document.querySelector('.back-btn');
  const titleEl = document.getElementById('disease-title');
  const symptomsTitle = document.getElementById('symptoms-title');
  const preventionTitle = document.getElementById('prevention-title');
  const remediesTitle = document.getElementById('remedies-title');
  const symptomsList = document.getElementById('symptoms-list');
  const preventionList = document.getElementById('prevention-list');
  const remediesList = document.getElementById('remedies-list');

  function renderDisease() {
    const d = data[currentLang];
    if (!d) return;

    titleEl.textContent = d.title;
    symptomsTitle.textContent = currentLang === 'en' ? "Symptoms" : "लक्षणहरू";
    preventionTitle.textContent = currentLang === 'en' ? "Prevention" : "रोकथाम";
    remediesTitle.textContent = currentLang === 'en' ? "Home Remedies" : "घरेलु उपचार";

    if (backBtn) backBtn.textContent = currentLang === 'en' ? "⬅ Back" : "⬅ पछाडि";

    renderList(symptomsList, d.symptoms);
    renderList(preventionList, d.prevention);
    renderList(remediesList, d.remedies);

    langToggle.textContent = currentLang === 'en' ? "नेपाली" : "English";
  }

  function renderList(container, items) {
    container.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      container.appendChild(li);
    });
  }

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'np' : 'en';
    localStorage.setItem('lang', currentLang);
    renderDisease();
  });

  renderDisease();
});
