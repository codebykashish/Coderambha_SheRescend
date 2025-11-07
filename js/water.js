document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("water-container");
  const langToggle = document.getElementById("lang-toggle");
  const titleEl = document.getElementById("water-title");
  const backBtn = document.querySelector(".back-btn");

  function mapCodeToDataLang(code) { return code === 'np' ? 'ne' : 'en'; }
  function toggleLabel(code) { return code === 'en' ? 'नेपाली' : 'English'; }

  let currentLangCode = localStorage.getItem("lang") || "en";

  function render() {
    const dataLang = mapCodeToDataLang(currentLangCode);
    container.innerHTML = "";

    // --- Add video at the top ---
    const videoEl = document.createElement("video");
    videoEl.src = "waterfiltration.mp4"; // your video file
    videoEl.controls = true;
    videoEl.preload = "metadata";
    videoEl.id = "water-video";
    container.appendChild(videoEl);

    // --- Page title ---
    if (titleEl) {
      titleEl.textContent = currentLangCode === "en"
        ? "Water Purification Methods"
        : "पानी शुद्धीकरणका तरिकाहरू";
    }

    // --- Back button label ---
    if (backBtn) {
      backBtn.textContent = currentLangCode === "en" ? "⬅ Back" : "⬅ पछाडि";
    }

    // --- Render water boxes ---
    (waterData[dataLang] || []).forEach(topic => {
      const box = document.createElement("div");
      box.classList.add("water-box");

      const title = document.createElement("h2");
      title.innerHTML = `${topic.icon} ${topic.title}`;
      box.appendChild(title);

      topic.steps.forEach((step, index) => {
        const stepDiv = document.createElement("div");
        stepDiv.classList.add("step");

        const text = document.createElement("div");
        text.classList.add("step-text");
        text.textContent = `Step ${index + 1}: ${step.text}`;

        stepDiv.appendChild(text);
        box.appendChild(stepDiv);
      });

      container.appendChild(box);
    });

    langToggle.textContent = toggleLabel(currentLangCode);
  }

  langToggle.addEventListener("click", () => {
    currentLangCode = currentLangCode === "en" ? "np" : "en";
    localStorage.setItem("lang", currentLangCode);
    render();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "lang" && e.newValue) {
      currentLangCode = e.newValue;
      render();
    }
  });

  render();
});
