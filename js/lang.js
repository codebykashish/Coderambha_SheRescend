// lang.js
(function () {
  const KEY = 'lang';
  const DEFAULT = 'en';
  const listeners = [];

  function getLang() {
    return localStorage.getItem(KEY) || DEFAULT;
  }

  function setLang(lang) {
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
    listeners.forEach(fn => fn(lang));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  // Sync across tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      document.documentElement.lang = e.newValue;
      listeners.forEach(fn => fn(e.newValue));
    }
  });

  // Wire a toggle button and call your per-page UI updater
  function setupToggle(btnSelector, applyPageLang) {
    const btn = document.querySelector(btnSelector);
    if (!btn) return;
    const refreshBtnText = () => {
      const lang = getLang();
      btn.textContent = (window.TRANSLATIONS?.[lang]?.langToggleTo) || (lang === 'en' ? 'नेपाली' : 'English');
    };
    onChange((lang) => {
      refreshBtnText();
      if (typeof applyPageLang === 'function') applyPageLang(lang);
    });
    btn.addEventListener('click', () => {
      const next = getLang() === 'en' ? 'np' : 'en';
      setLang(next);
    });
    // Initial render
    const lang = getLang();
    document.documentElement.lang = lang;
    refreshBtnText();
    if (typeof applyPageLang === 'function') applyPageLang(lang);
  }

  window.Lang = { getLang, setLang, onChange, setupToggle };
})();