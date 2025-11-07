document.addEventListener('DOMContentLoaded', () => {
  // --- Language wiring ---
  let currentLang = localStorage.getItem('lang') || 'en';
  const mobileLangToggle = document.getElementById('mobile-lang-toggle');
  const placeSearch = document.getElementById('place-search');
  const searchIcon = document.getElementById('search-icon');
  let searchPopupTimers = [];

  window.GuideTitles = {
    en: { first: 'First Aid', water: 'Water Purification', flood: 'Flood Safety', diseases: 'Waterborne Diseases', mosquito: 'Mosquito Prevention', food: 'Food & Water Safety' },
    np: { first: 'प्राथमिक उपचार', water: 'पानी शुद्धीकरण', flood: 'बाढी सुरक्षा', diseases: 'जलजन्य रोगहरू', mosquito: 'मच्छर रोकथाम', food: 'खाना र पानी सुरक्षा' }
  };

  function setLangButton(lang) {
    if (mobileLangToggle) mobileLangToggle.textContent = (lang === 'en' ? 'E' : 'N');
  }

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    setLangButton(lang);

    if (placeSearch) placeSearch.placeholder = TRANSLATIONS[lang].searchPlaceholder;
    ['policeLabel','ambulanceLabel','fireLabel','womenLabel','childLabel'].forEach(k => {
      document.querySelectorAll(`[data-i18n="${k}"]`).forEach(el => { el.textContent = TRANSLATIONS[lang][k]; });
    });

    const t = window.GuideTitles[lang];
    const labels = {
      'lnk-firstaid': '🩺 ' + t.first,
      'lnk-water': '💧 ' + t.water,
      'lnk-flood': '🌊 ' + t.flood,
      'lnk-diseases': '🦠 ' + t.diseases,
      'lnk-mosquito': '🦟 ' + t.mosquito,
      'lnk-food': '🍲 ' + t.food
    };
    Object.entries(labels).forEach(([id, text]) => { const el = document.getElementById(id); if (el) el.textContent = text; });

    const peekText = document.querySelector('#guide-peek .peek-text');
    if (peekText) peekText.textContent = (lang === 'en' ? 'Emergency Guide' : 'आपतकालीन मार्गदर्शन');
  }

  applyLang(currentLang);
  if (mobileLangToggle) {
    mobileLangToggle.addEventListener('click', () => {
      const next = currentLang === 'en' ? 'np' : 'en';
      applyLang(next);
      markers.forEach((m, i) => m.setPopupContent(buildPopupHtml(markersData[i], i)));
    });
  }

  // --- Mobile quick controls ---
  const mobileSearchBtn = document.getElementById('mobile-search-btn');
  const mobileGameBtn = document.getElementById('mobile-game-btn');
  const mobilePhoneBtn = document.getElementById('mobile-phone-btn');

  const searchRow = document.getElementById('search-section');

  // Show search row and close it when clicking outside or Esc
  function openSearchRow() {
    if (!searchRow) return;
    searchRow.style.display = 'flex';
    if (placeSearch) placeSearch.focus();

    const onDocClick = (e) => {
      if (!searchRow.contains(e.target) && e.target !== mobileSearchBtn) {
        closeSearchRow();
      }
    };
    const onEsc = (e) => { if (e.key === 'Escape') closeSearchRow(); };

    function closeSearchRow() {
      searchRow.style.display = 'none';
      document.removeEventListener('click', onDocClick, true);
      window.removeEventListener('keydown', onEsc, true);
    }

    document.addEventListener('click', onDocClick, true);
    window.addEventListener('keydown', onEsc, true);
  }

  function handleSearch() {
    if (!placeSearch) return;
    const raw = placeSearch.value.trim();
    if (!raw) return;
    const terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return;

    const matches = [];
    searchPopupTimers.forEach((t) => clearTimeout(t));
    searchPopupTimers = [];
    markersData.forEach((d, index) => {
      const haystack = [
        d.name.en, d.name.np,
        d.role.en, d.role.np,
        d.type,
        d.number
      ].join(' ').toLowerCase();
      if (terms.every(term => haystack.includes(term))) {
        matches.push({ index, data: d });
      }
    });

    if (!matches.length) {
      const msg = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang].noResults) || 'No matching locations found.';
      alert(msg);
      return;
    }

    const latlngs = matches.map(m => [m.data.lat, m.data.lng]);
    if (matches.length === 1) {
      map.setView(latlngs[0], Math.max(map.getZoom(), 16));
      markers[matches[0].index].openPopup();
    } else {
      map.fitBounds(latlngs, { padding: [50, 50], maxZoom: 17 });
      matches.forEach((match, idx) => {
        const timer = setTimeout(() => { markers[match.index].openPopup(); }, idx * 450);
        searchPopupTimers.push(timer);
      });
    }
  }

  if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', openSearchRow);
  if (mobileGameBtn) mobileGameBtn.addEventListener('click', () => { window.location.href = 'game.html'; });
  if (searchIcon) searchIcon.addEventListener('click', handleSearch);
  if (placeSearch) placeSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });

  // --- Map setup (Leaflet with local TileServer MBTiles) ---
  const map = L.map('map', { minZoom: 13, maxZoom: 19, center: [27.7172, 85.3240], zoom: 13 });
  L.tileLayer('http://localhost:8080/data/kathmandu/{z}/{x}/{y}.png', {
    maxZoom: 19,
    tileSize: 256,
    attribution: 'Kathmandu MBTiles',
    crossOrigin: true
  }).addTo(map);

  const WALKING_SPEED_MPS = 1.3;
  let routeTarget = null;
  let routeTargetIndex = null;
  let routeLine = null;
  let routeSummary = null;

  const markersData = [
    { name: { en: 'Sainik Tudikhel', np: 'सैनिक तुँडिखेल' }, lat: 27.703377, lng: 85.315001, role: { en: 'Safe and Open area', np: 'सुरक्षित र खुला क्षेत्र' }, number: '', type: 'park' },
    { name: { en: 'Sifal Playground', np: 'सिफल खेलमैदान' }, lat: 27.711297, lng: 85.340927, role: { en: 'Safe and Open area', np: 'सुरक्षित र खुला क्षेत्र' }, number: '', type: 'park' },
    { name: { en: 'Balaju Park', np: 'बालाजु पार्क' }, lat: 27.733867, lng: 85.301179, role: { en: 'Safe and Open area', np: 'सुरक्षित र खुला क्षेत्र' }, number: '', type: 'park' },

    { name: { en: 'Red Cross Society (Dillibazar)', np: 'रेडक्रस सोसाइटी (दिल्लिबजार)' }, lat: 27.706118, lng: 85.316942, role: { en: 'Emergency shelter, food, water, and medical care', np: 'आश्रय, भोजन, पानी, र स्वास्थ्य सेवा' }, number: '', type: 'redcross' },
    { name: { en: 'Nepal Red Cross Society, Central Blood Transfusion Service (Putalisadak)', np: 'नेपाल रेडक्रस सोसाइटी, केन्द्रीय रक्तसञ्चार सेवा (पुतलीसडक)' }, lat: 27.702153, lng: 85.319866, role: { en: 'Emergency shelter, food, water, and medical care', np: 'आश्रय, भोजन, पानी, र स्वास्थ्य सेवा' }, number: '01-5388485', type: 'redcross' },
    { name: { en: 'Nepal Red Cross Society (Redcross Rd, Kathmandu 44600)', np: 'नेपाल रेडक्रस सोसाइटी (रेडकक्रस रोड, काठमाडौं ४४६००)' }, lat: 27.699281, lng: 85.290253, role: { en: 'Emergency shelter, food, water, and medical care', np: 'आश्रय, भोजन, पानी, र स्वास्थ्य सेवा' }, number: '+977-1-5370650, +977-1-5372761', type: 'redcross' },
    { name: { en: 'Red Cross (Bhrikuti Mandap)', np: 'रेडक्रस (भृकुटी मण्डप)' }, lat: 27.702305, lng: 85.320089, role: { en: 'Emergency shelter, food, water, and medical care', np: 'आश्रय, भोजन, पानी, र स्वास्थ्य सेवा' }, number: '', type: 'redcross' },

    { name: { en: 'Bir Hospital', np: 'वीर अस्पताल' }, lat: 27.705597, lng: 85.313766, role: { en: 'Government hospital', np: 'सरकारी अस्पताल' }, number: '01-4221119', type: 'hospital' },
    { name: { en: 'BP Smriti Hospital', np: 'बीपी स्मृति अस्पताल' }, lat: 27.737364, lng: 85.326062, role: { en: 'Government hospital', np: 'सरकारी अस्पताल' }, number: '01-4987094', type: 'hospital' },
    { name: { en: 'TU Teaching Hospital - Emergency Ward (Maharajgunj)', np: 'टु शिक्षण अस्पताल - आपतकालीन कक्ष (महाराजगञ्ज)' }, lat: 27.735334, lng: 85.330970, role: { en: 'Emergency ward', np: 'आपतकालीन कक्ष' }, number: '01-4412303', type: 'hospital' },

    { name: { en: 'Hami Nepal', np: 'हामी नेपाल' }, lat: 27.730877, lng: 85.329404, role: { en: 'Non profit organization — helps victims', np: 'गैर-नाफामुखी संस्था — पीडितलाई सहायता' }, number: '9802260012 | 9818370435', type: 'ngo' },
    { name: { en: 'Help Nepal Network (Boudhanath Sadak)', np: 'हेल्प नेपाल नेटवर्क (बौद्धनाथ सडक)' }, lat: 27.719070, lng: 85.352689, role: { en: 'Delivered relief materials', np: 'राहत सामग्री वितरण' }, number: '01-4498328', type: 'ngo' },
    { name: { en: 'Global Peace Foundation Nepal', np: 'ग्लोबल पिस फाउन्डेशन नेपाल' }, lat: 27.718692, lng: 85.329266, role: { en: 'Non profit organization — provides aid', np: 'गैर-नाफामुखी संस्था — सहायता प्रदान गर्छ' }, number: '01-4530042', type: 'ngo' },
    { name: { en: 'IOM Nepal (International Organization for Migration)', np: 'आइओएम नेपाल (अन्तर्राष्ट्रिय आप्रवासन संगठन)' }, lat: 27.727797, lng: 85.323959, role: { en: 'Focuses on providing emergency shelter', np: 'आकस्मिक आश्रय प्रदानमा केन्द्रित' }, number: '01-4526250', type: 'ngo' }
  ];

  function svgPin(fill, glyphSvg = '') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
      <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/></filter></defs>
      <g filter="url(#shadow)">
        <path d="M12 1C6.477 1 2 5.477 2 11c0 7.5 8.5 16.5 9.2 17.2a1.2 1.2 0 0 0 1.6 0C13.5 27.5 22 18.5 22 11 22 5.477 17.523 1 12 1z" fill="${fill}"/>
        <circle cx="12" cy="11" r="5.5" fill="white"/>${glyphSvg}
      </g>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function iconPin({ fill, glyph = 'none' }) {
    let glyphSvg = '';
    if (glyph === 'H') glyphSvg = '<text x="12" y="13.8" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="9" fill="#ef4444">H</text>';
    else if (glyph === 'cross') glyphSvg = '<rect x="9.5" y="8.2" width="5" height="2.2" fill="#dc2626"/><rect x="11.15" y="6.5" width="2.2" height="5" fill="#dc2626"/>';
    return L.icon({ iconUrl: svgPin(fill, glyphSvg), iconSize: [24, 36], iconAnchor: [12, 34], popupAnchor: [0, -30] });
  }
  function hospitalIcon() { return iconPin({ fill: '#ef4444', glyph: 'H' }); }
  function parkIcon()     { return iconPin({ fill: '#16a34a' }); }
  function redCrossIcon() { return iconPin({ fill: '#ef4444', glyph: 'cross' }); }
  function ngoIcon()      { return iconPin({ fill: '#3b82f6' }); }
  function getIconFor(d) {
    if (d.type === 'hospital') return hospitalIcon();
    if (d.type === 'redcross') return redCrossIcon();
    if (d.type === 'ngo') return ngoIcon();
    return parkIcon();
  }

  function formatDistance(distanceMeters) {
    if (!Number.isFinite(distanceMeters)) return '—';
    if (distanceMeters >= 1000) return (distanceMeters / 1000).toFixed(2) + ' km';
    return Math.round(distanceMeters) + ' m';
  }

  function formatDuration(minutes) {
    if (!Number.isFinite(minutes)) return '—';
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      if (hrs === 0) return `${mins} min`;
      return mins === 0 ? `${hrs} h` : `${hrs} h ${mins} min`;
    }
    return Math.max(1, Math.round(minutes)) + ' min';
  }

  function wireRouteButton(index) {
    const popup = markers[index].getPopup();
    if (!popup) return;
    const container = popup.getElement();
    if (!container) return;
    const setBtn = container.querySelector('.route-set-btn');
    if (setBtn) setBtn.addEventListener('click', () => setRouteTo(index));
    const unsetBtn = container.querySelector('.route-unset-btn');
    if (unsetBtn) unsetBtn.addEventListener('click', () => unsetRoute(index));
  }

  function setRouteTo(index) {
    routeTargetIndex = index;
    routeTarget = L.latLng(markersData[index].lat, markersData[index].lng);
    routeSummary = null;
    if (!isLocating) startLocationWatch();
    updateRouteVisualization();
    markers[index].setPopupContent(buildPopupHtml(markersData[index], index));
    markers[index].openPopup();
  }

  function unsetRoute(index = routeTargetIndex) {
    if (routeLine) {
      map.removeLayer(routeLine);
      routeLine = null;
    }
    routeSummary = null;
    routeTarget = null;
    routeTargetIndex = null;
    if (typeof index === 'number' && markers[index]) {
      const marker = markers[index];
      const popup = marker.getPopup();
      const wasOpen = popup && map.hasLayer(popup);
      marker.setPopupContent(buildPopupHtml(markersData[index], index));
      if (wasOpen) marker.openPopup();
    }
  }

  function updateRouteVisualization() {
    if (!routeTarget) return;
    if (!lastLatLng) {
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }
      routeSummary = null;
      if (routeTargetIndex !== null) {
        const popup = markers[routeTargetIndex].getPopup();
        const wasOpen = popup && map.hasLayer(popup);
        markers[routeTargetIndex].setPopupContent(buildPopupHtml(markersData[routeTargetIndex], routeTargetIndex));
        if (wasOpen) markers[routeTargetIndex].openPopup();
      }
      return;
    }

    const points = [lastLatLng, routeTarget];
    if (!routeLine) {
      routeLine = L.polyline(points, { color: '#2563eb', weight: 4, opacity: 0.85, dashArray: '6,8' }).addTo(map);
      map.fitBounds(points, { padding: [50, 50], maxZoom: 18 });
    } else {
      routeLine.setLatLngs(points);
    }

    const distanceMeters = lastLatLng.distanceTo(routeTarget);
    const minutes = distanceMeters / WALKING_SPEED_MPS / 60;
    routeSummary = {
      distanceText: formatDistance(distanceMeters),
      durationText: formatDuration(minutes)
    };

    if (routeTargetIndex !== null) {
      const popup = markers[routeTargetIndex].getPopup();
      const wasOpen = popup && map.hasLayer(popup);
      markers[routeTargetIndex].setPopupContent(buildPopupHtml(markersData[routeTargetIndex], routeTargetIndex));
      if (wasOpen) markers[routeTargetIndex].openPopup();
    }
  }

  const markers = [];
  function buildPopupHtml(d, index) {
    const name = d.name[currentLang] ?? d.name.en;
    const role = d.role[currentLang] ?? d.role.en;
    const contact = d.number ? `<br>Contact: ${d.number}` : '';
    let routeDetails = '';
    if (routeTargetIndex === index) {
      if (routeSummary) {
        routeDetails = `<div class="route-summary" style="margin-top:6px;">Distance: ${routeSummary.distanceText}<br>ETA: ${routeSummary.durationText}</div>`;
      } else {
        routeDetails = '<div class="route-summary" style="margin-top:6px;">Route set. Awaiting location…</div>';
      }
    }
    const buttonLabel = routeTargetIndex === index ? 'Update Route' : 'Set Route';
    const unsetButton = routeTargetIndex === index ? `<button type="button" class="route-action-btn route-unset-btn" data-route-unset="${index}">Unset</button>` : '';
    return `
      <div class="popup-body" data-marker-index="${index}">
        <b>${name}</b><br>Role: ${role}${contact}
        ${routeDetails}
        <div class="popup-actions">
          <button type="button" class="route-action-btn route-set-btn" data-route-index="${index}">${buttonLabel}</button>
          ${unsetButton}
        </div>
      </div>
    `;
  }
  markersData.forEach((d, index) => {
    const m = L.marker([d.lat, d.lng], { icon: getIconFor(d) }).addTo(map);
    m.bindPopup(buildPopupHtml(d, index));
    m.on('popupopen', () => wireRouteButton(index));
    markers.push(m);
  });

  // Search activation from button uses openSearchRow() already

  // SOS popdown
  const sosBtn = document.getElementById('sos-btn');
  const sosCard = document.getElementById('sos-card');
  function openSos() { sosCard.classList.remove('hidden'); sosCard.focus(); }
  function closeSos() { sosCard.classList.add('hidden'); }
  if (sosBtn) sosBtn.addEventListener('click', (e) => { e.stopPropagation(); openSos(); });
  document.addEventListener('click', (e) => {
    if (sosCard.classList.contains('hidden')) return;
    const withinCard = sosCard.contains(e.target);
    const onButton = sosBtn && sosBtn.contains(e.target);
    if (!withinCard && !onButton) closeSos();
  });
  if (sosCard) sosCard.addEventListener('click', (e) => e.stopPropagation());

  // Locate
  const locateBtn = document.getElementById('locate-btn');
  let isLocating = false, firstFixDone = false, userMarker = null, userAccuracyCircle = null, watchId = null, lastLatLng = null;
  function renderUserLocation(latlng, accuracy) {
    if (!userMarker) {
      userMarker = L.marker(latlng, {
        icon: L.divIcon({
          className: 'user-location-icon',
          html: '<div style="width:12px;height:12px;background:#2563eb;border:2px solid #93c5fd;border-radius:50%;box-shadow:0 0 0 4px rgba(37,99,235,0.2)"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      }).addTo(map);
    } else { userMarker.setLatLng(latlng); }
    if (!userAccuracyCircle) {
      userAccuracyCircle = L.circle(latlng, { radius: accuracy, color: '#60a5fa', weight: 1, fillColor: '#93c5fd', fillOpacity: 0.2 }).addTo(map);
    } else {
      userAccuracyCircle.setLatLng(latlng);
      userAccuracyCircle.setRadius(accuracy);
    }
  }
  function startLocationWatch() {
    if (!navigator.geolocation) { alert(TRANSLATIONS[currentLang].geoUnsupported); return; }
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    isLocating = true; firstFixDone = false; lastLatLng = null; if (locateBtn) locateBtn.textContent = '⏸️';
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isLocating) return;
        const { latitude, longitude, accuracy } = pos.coords;
        const latlng = L.latLng(latitude, longitude);
        lastLatLng = latlng; renderUserLocation(latlng, accuracy);
        if (routeTarget) updateRouteVisualization();
        if (!firstFixDone) { firstFixDone = true; map.fitBounds(userAccuracyCircle.getBounds(), { maxZoom: 19, padding: [20, 20] }); }
      },
      (err) => { stopLocationWatch(); alert(TRANSLATIONS[currentLang].geoDenied); console.warn('Geolocation error:', err); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }
  function stopLocationWatch() {
    isLocating = false; if (locateBtn) locateBtn.textContent = '📍';
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
    if (userAccuracyCircle) { map.removeLayer(userAccuracyCircle); userAccuracyCircle = null; }
    lastLatLng = null;
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    routeSummary = null;
    if (routeTargetIndex !== null) {
      const popup = markers[routeTargetIndex].getPopup();
      const wasOpen = popup && map.hasLayer(popup);
      markers[routeTargetIndex].setPopupContent(buildPopupHtml(markersData[routeTargetIndex], routeTargetIndex));
      if (wasOpen) markers[routeTargetIndex].openPopup();
    }
  }
  if (locateBtn) {
    locateBtn.addEventListener('click', () => { if (isLocating) stopLocationWatch(); else startLocationWatch(); });
    locateBtn.addEventListener('dblclick', (e) => { if (isLocating && lastLatLng) { e.preventDefault(); map.setView(lastLatLng, Math.max(map.getZoom(), 15)); } });
  }

  // Phone popdown (Helpline) — same structure as helpline page
  const phonePop = document.getElementById('phone-pop');
  const phonePopBody = document.getElementById('phone-pop-body');
  const phonePopClose = document.getElementById('phone-pop-close');
  function renderHelplineQuick() {
    const d = (window.helplineData && window.helplineData[currentLang]) || null;
    if (!d) {
      phonePopBody.innerHTML = '<div style="padding:8px">Data unavailable. Make sure datajs/helpline-data.js is loaded.</div>';
      return;
    }
    phonePopBody.innerHTML = `
      <div class="helpline-box">
        <h2>${d.ambulanceTitle}</h2>
        <ul>
          ${d.ambulances.map(a => `<li>${a.name}: <a href="tel:${a.number}">${a.number}</a></li>`).join('')}
        </ul>
      </div>
      <div class="helpline-box">
        <h2>${d.hospitalTitle}</h2>
        <ul>
          ${d.hospitals.map(h => `<li>${h.name}: <a href="tel:${h.number}">${h.number}</a></li>`).join('')}
        </ul>
      </div>
      <div style="text-align:right;margin-top:6px;">
        <a href="helpline.html">Open full helpline →</a>
      </div>
    `;
  }
  function openPhonePop() { renderHelplineQuick(); phonePop.classList.remove('hidden'); }
  function closePhonePop() { phonePop.classList.add('hidden'); }
  if (mobilePhoneBtn) mobilePhoneBtn.addEventListener('click', (e) => { e.stopPropagation(); openPhonePop(); });
  if (phonePopClose) phonePopClose.addEventListener('click', closePhonePop);
  document.addEventListener('click', (e) => {
    if (phonePop.classList.contains('hidden')) return;
    const within = phonePop.contains(e.target);
    const onBtn = mobilePhoneBtn && mobilePhoneBtn.contains(e.target);
    if (!within && !onBtn) closePhonePop();
  });

  // Bottom sheet (tap to open/close every time, swipe up/down)
  const peek = document.getElementById('guide-peek');
  const sheet = document.getElementById('guide-sheet');
  const sheetClose = document.getElementById('sheet-close');
  const sheetHandle = document.querySelector('#guide-sheet .sheet-handle');

  function openSheet() { sheet.classList.add('open'); sheet.style.display = 'block'; }
  function closeSheet() { sheet.classList.remove('open'); sheet.style.transform = 'translateY(100%)'; setTimeout(() => { if (!sheet.classList.contains('open')) sheet.style.display = 'none'; }, 250); }
  function toggleSheet() { if (sheet.classList.contains('open')) closeSheet(); else openSheet(); }

  if (peek) peek.addEventListener('click', toggleSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheetHandle) sheetHandle.addEventListener('click', toggleSheet); // tapping the top slides it down

  (function enableSheetSwipe() {
    let startY = null, currentY = null, dragging = false;
    function onStart(e) { dragging = true; startY = (e.touches ? e.touches[0].clientY : e.clientY); sheet.style.transition = 'none'; }
    function onMove(e) {
      if (!dragging) return;
      currentY = (e.touches ? e.touches[0].clientY : e.clientY);
      const delta = currentY - startY;
      if (!sheet.classList.contains('open')) {
        const translatePct = Math.min(100, Math.max(0, 100 - (Math.max(0, -delta) / 3)));
        sheet.style.transform = `translateY(${translatePct}%)`;
      } else {
        sheet.style.transform = `translateY(${Math.max(0, delta)}px)`;
      }
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = 'transform 0.25s ease';
      const threshold = 60;
      if (!sheet.classList.contains('open')) {
        if (startY !== null && currentY !== null && (startY - currentY) > threshold) openSheet();
        else closeSheet();
      } else {
        if (startY !== null && currentY !== null && (currentY - startY) > threshold) closeSheet();
        else openSheet();
      }
      startY = null; currentY = null;
    }
    if (sheetHandle) {
      sheetHandle.addEventListener('touchstart', onStart, { passive: true });
      sheetHandle.addEventListener('touchmove', onMove, { passive: true });
      sheetHandle.addEventListener('touchend', onEnd);
      sheetHandle.addEventListener('mousedown', onStart);
    }
    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove', onMove, { passive: true });
    sheet.addEventListener('touchend', onEnd);
    sheet.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  })();

  // Don't auto-open sheet - map should show first

  // Sync language across pages and update popdown if open
  window.addEventListener('storage', (e) => {
    if (e.key === 'lang') {
      const lang = e.newValue || 'en';
      applyLang(lang);
      markers.forEach((m, i) => m.setPopupContent(buildPopupHtml(markersData[i], i)));
      if (!phonePop.classList.contains('hidden')) renderHelplineQuick();
    }
  });
});