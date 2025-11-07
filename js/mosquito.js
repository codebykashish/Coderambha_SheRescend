const container = document.getElementById("mosquito-container");
const langToggle = document.getElementById("lang-toggle");

function mapCodeToDataLang(code) { return code === 'np' ? 'nepali' : 'english'; }
function toggleLabel(code) { return code === 'en' ? 'नेपाली' : 'English'; }

let currentLangCode = localStorage.getItem('lang') || 'en';

function renderMosquitoByCode(code) {
  const lang = mapCodeToDataLang(code);
  container.innerHTML = "";
  mosquitoData[lang].forEach(item => {
    const box = document.createElement("div");
    box.className = "mosquito-box";
    box.innerHTML = `
      <div class="icon">${item.icon}</div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
    `;
    container.appendChild(box);
  });
  langToggle.textContent = toggleLabel(code);
}

langToggle.addEventListener("click", () => {
  currentLangCode = currentLangCode === "en" ? "np" : "en";
  localStorage.setItem('lang', currentLangCode);
  renderMosquitoByCode(currentLangCode);
});

window.addEventListener('storage', (e) => {
  if (e.key === 'lang' && e.newValue) {
    currentLangCode = e.newValue;
    renderMosquitoByCode(currentLangCode);
  }
});

renderMosquitoByCode(currentLangCode);