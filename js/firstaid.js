document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('firstaid-container');
  const langToggle = document.getElementById('lang-toggle');
  const backBtn = document.querySelector('.back-btn');

  // Map shared code -> data keys
  function mapCodeToDataLang(code) { return code === 'np' ? 'ne' : 'en'; }
  function toggleLabel(code) { return code === 'en' ? 'नेपाली' : 'English'; }

  let currentLangCode = localStorage.getItem('lang') || 'en';
  let currentSpeech = null;   // TTS handle
  let currentAudio = null;    // CPR audio handle

  // Text-to-speech
  function speakText(text, lang) {
    if (currentSpeech) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = (lang === 'np') ? 'ne-NP' : 'en-US';
    u.rate = 0.8; u.pitch = 1; u.volume = 1;
    currentSpeech = u;
    u.onend = () => { currentSpeech = null; };
    speechSynthesis.speak(u);
  }

  // CPR audio (Nepali CPR only)
  function playCprAudio(stepIndex) {
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    const audio = new Audio(`audio/${stepIndex + 1}.mp3`);
    currentAudio = audio;
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
    });
  }

  // Expand/collapse helpers (only one open at a time)
  function expandPanel(panel, box, btn) {
    document.querySelectorAll('.topic-box.expanded').forEach(other => {
      if (other !== box) {
        const p = other.querySelector('.topic-panel');
        const b = other.querySelector('.topic-toggle');
        if (p && b) {
          p.style.maxHeight = '0px';
          p.style.opacity = '0';
          other.classList.remove('expanded');
          b.setAttribute('aria-expanded', 'false');
          b.textContent = '▼';
        }
      }
    });
    box.classList.add('expanded');
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = '▲';
    panel.style.maxHeight = '360px';
    panel.style.opacity = '1';
  }
  function collapsePanel(panel, box, btn) {
    panel.style.maxHeight = '0px';
    panel.style.opacity = '0';
    box.classList.remove('expanded');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '▼';
  }
  function toggleAccordion(box) {
    const panel = box.querySelector('.topic-panel');
    const btn = box.querySelector('.topic-toggle');
    if (box.classList.contains('expanded')) collapsePanel(panel, box, btn);
    else expandPanel(panel, box, btn);
  }

  // Build a single accordion card: big emoji icon, title, arrow (no photo, no subtext)
  function buildTopicBox(topic, idx) {
    const box = document.createElement('div');
    box.className = 'topic-box';
    box.dataset.index = idx;
    box.dataset.id = topic.id;

    // Header
    const header = document.createElement('div');
    header.className = 'topic-header';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-controls', `panel-${idx}`);

    const iconEl = document.createElement('div');
    iconEl.className = 'topic-icon';
    iconEl.textContent = topic.icon;  // large emoji

    const titleEl = document.createElement('h2');
    titleEl.className = 'topic-title';
    titleEl.textContent = topic.title;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'topic-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Expand section');
    toggleBtn.textContent = '▼';

    header.appendChild(iconEl);
    header.appendChild(titleEl);
    header.appendChild(toggleBtn);

    // Collapsible panel
    const panel = document.createElement('div');
    panel.className = 'topic-panel';
    panel.id = `panel-${idx}`;

    const panelInner = document.createElement('div');
    panelInner.className = 'topic-panel-inner';

    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container';

    topic.steps.forEach((step, i) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step';
      stepDiv.dataset.stepIndex = i;

      const img = document.createElement('img');
      img.src = step.img;
      img.alt = `Step ${i+1}`;
      img.title = 'Tap to hear text';
      img.addEventListener('click', () => {
        // Get current language and box ID at click time
        const currentLang = localStorage.getItem('lang') || 'en';
        const boxId = box.dataset.id;
        const stepTextEl = stepDiv.querySelector('.step-text');
        const stepText = stepTextEl ? stepTextEl.textContent : '';
        
        // For Nepali language and CPR topic, play audio file
        if (currentLang === 'np' && boxId === 'cpr') {
          playCprAudio(i);
        } else {
          // For other cases, use text-to-speech
          speakText(stepText, currentLang);
        }
      });

      const p = document.createElement('p');
      p.className = 'step-text';
      p.textContent = `Step ${i+1}: ${step.text}`;

      stepDiv.appendChild(img);
      stepDiv.appendChild(p);
      stepsContainer.appendChild(stepDiv);
    });

    panelInner.appendChild(stepsContainer);
    panel.appendChild(panelInner);

    // Wire actions
    const onToggle = () => toggleAccordion(box);
    header.addEventListener('click', onToggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
    });
    toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); onToggle(); });

    box.appendChild(header);
    box.appendChild(panel);
    return box;
  }

  // Build all topics using EN order for stable indexing
  firstAidData.en.forEach((topic, idx) => {
    container.appendChild(buildTopicBox(topic, idx));
  });

  // Language switcher updates titles and steps
  function switchLanguage(langCode) {
    const dataLang = mapCodeToDataLang(langCode);
    const boxes = document.querySelectorAll('.topic-box');

    if (backBtn) backBtn.textContent = langCode === 'en' ? '⬅ Back' : '⬅ पछाडि';

    boxes.forEach(box => {
      const idx = Number(box.dataset.index);
      const topic = firstAidData[dataLang][idx];

      // header title
      box.querySelector('.topic-title').textContent = topic.title;

      // steps
      topic.steps.forEach((step, i) => {
        const stepDiv = box.querySelector(`.step[data-step-index='${i}']`);
        if (stepDiv) {
          stepDiv.querySelector('.step-text').textContent = `Step ${i+1}: ${step.text}`;
        }
      });
    });

    langToggle.textContent = toggleLabel(langCode);
    localStorage.setItem('lang', langCode);
  }

  // Init with saved language
  switchLanguage(currentLangCode);

  // Toggle language
  langToggle.addEventListener('click', () => {
    currentLangCode = currentLangCode === 'en' ? 'np' : 'en';
    switchLanguage(currentLangCode);
  });

  // Sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'lang' && e.newValue) {
      currentLangCode = e.newValue;
      switchLanguage(currentLangCode);
    }
  });
});