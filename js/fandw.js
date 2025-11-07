const container = document.getElementById("fandw-container");
const langToggle = document.getElementById("lang-toggle");

function mapCodeToDataLang(code) { return code === 'np' ? 'nepali' : 'english'; }
function toggleLabel(code) { return code === 'en' ? 'नेपाली' : 'English'; }

let currentLangCode = localStorage.getItem('lang') || 'en';

function renderBoxesByCode(code) {
  const dataLang = mapCodeToDataLang(code);
  container.innerHTML = "";
  fandwData[dataLang].forEach(item => {
    const box = document.createElement("div");
    box.className = "fandw-box";
    box.innerHTML = `
      <div class="icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    `;
    container.appendChild(box);
  });
  langToggle.textContent = toggleLabel(code);
}

langToggle.addEventListener("click", () => {
  currentLangCode = currentLangCode === 'en' ? 'np' : 'en';
  localStorage.setItem('lang', currentLangCode);
  renderBoxesByCode(currentLangCode);
});

window.addEventListener('storage', (e) => {
  if (e.key === 'lang' && e.newValue) {
    currentLangCode = e.newValue;
    renderBoxesByCode(currentLangCode);
  }
});

// Initial
renderBoxesByCode(currentLangCode);