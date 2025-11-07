document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById("diseases-container");
  const langToggle = document.getElementById("lang-toggle");
  const title = document.getElementById("diseases-title");

  function keyForDiseases(lang) { return lang === 'en' ? 'english' : 'nepali'; }

  const pageMap = {
    Cholera: "cholera.html", "होलेरा (Cholera)": "cholera.html",
    Diarrhea: "diarrhea.html", "झाडापखाला (Diarrhea)": "diarrhea.html",
    Typhoid: "typhoid.html", "टाइफाइड (Typhoid)": "typhoid.html",
    "Hepatitis A": "hepatitis.html", "हेपाटाइटिस A (Hepatitis A)": "hepatitis.html"
  };

  function render(lang) {
    const dataKey = keyForDiseases(lang);
    const list = diseasesData[dataKey] || diseasesData.english;
    container.innerHTML = "";
    title.textContent = lang === "en" ? "Waterborne Diseases" : "पानीजन्य रोगहरू";
    list.forEach(disease => {
      const box = document.createElement("div");
      box.className = "disease-box";
      box.innerHTML = `
        <img src="${disease.img}" alt="${disease.name}" />
        <h3>${disease.name}</h3>
        <p>${disease.description}</p>
      `;
      box.addEventListener("click", () => {
        const page = pageMap[disease.name];
        if (page) window.location.href = page;
      });
      container.appendChild(box);
    });
    if (langToggle) langToggle.textContent = (lang === 'en' ? 'E' : 'N');
  }

  if (window.Lang && typeof window.Lang.setupToggle === 'function') {
    window.Lang.setupToggle('#lang-toggle', render);
  } else {
    let current = localStorage.getItem('lang') || 'en';
    render(current);
    if (langToggle) langToggle.addEventListener('click', () => {
      current = current === 'en' ? 'np' : 'en';
      localStorage.setItem('lang', current);
      render(current);
    });
    window.addEventListener('storage', (e) => { if (e.key === 'lang') render(e.newValue || 'en'); });
  }
});