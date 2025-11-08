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
  let isFirstRouteCalculation = true;

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
    isFirstRouteCalculation = true; // Reset for new route
    if (!isLocating) startLocationWatch();
    // If we have a location, request GraphHopper route immediately
    if (lastLatLng) {
      requestRouteToMarker(lastLatLng, routeTarget, index);
    } else {
      // Wait for location, updateRouteVisualization will be called when location is available
      updateRouteVisualization();
    }
    markers[index].setPopupContent(buildPopupHtml(markersData[index], index));
    // Re-wire the buttons after updating popup content
    wireRouteButton(index);
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
    isFirstRouteCalculation = true; // Reset flag
    if (typeof index === 'number' && markers[index]) {
      const marker = markers[index];
      const popup = marker.getPopup();
      const wasOpen = popup && map.hasLayer(popup);
      marker.setPopupContent(buildPopupHtml(markersData[index], index));
      // Re-wire the buttons after updating popup content
      wireRouteButton(index);
      if (wasOpen) marker.openPopup();
    }
    // Also clear GraphHopper route line if it exists separately
    if (graphHopperRouteLine) {
      map.removeLayer(graphHopperRouteLine);
      graphHopperRouteLine = null;
    }
  }

  function requestRouteToMarker(start, end, markerIndex) {
    // Request route from user's location to marker using GraphHopper
    const url = `http://localhost:8989/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=car&points_encoded=false`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.paths && data.paths.length > 0) {
          const path = data.paths[0];
          let coordinates = [];

          // Extract coordinates from the response
          if (path.points && path.points.coordinates) {
            path.points.coordinates.forEach(coord => {
              coordinates.push([coord[1], coord[0]]);
            });
          } else if (path.points && typeof path.points === 'string') {
            coordinates = decodePolyline(path.points);
          } else if (path.geometry && path.geometry.coordinates) {
            path.geometry.coordinates.forEach(coord => {
              coordinates.push([coord[1], coord[0]]);
            });
          } else if (Array.isArray(path.points)) {
            path.points.forEach(point => {
              if (Array.isArray(point) && point.length >= 2) {
                coordinates.push([point[1], point[0]]);
              }
            });
          }

          if (coordinates.length > 0) {
            // Remove existing route line if any
            if (routeLine) {
              map.removeLayer(routeLine);
            }

            // Draw the route
            routeLine = L.polyline(coordinates, {
              color: '#2563eb',
              weight: 5,
              opacity: 0.8,
              smoothFactor: 1
            }).addTo(map);

            // Fit map to show the entire route only on first calculation
            if (isFirstRouteCalculation) {
              const bounds = routeLine.getBounds();
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
              isFirstRouteCalculation = false;
            }

            // Calculate route summary from GraphHopper data
            if (path.distance && path.time) {
              const distanceMeters = path.distance;
              const minutes = path.time / 60000; // Convert milliseconds to minutes
              routeSummary = {
                distanceText: formatDistance(distanceMeters),
                durationText: formatDuration(minutes)
              };
            } else {
              // Fallback to straight-line distance if GraphHopper doesn't provide it
              const distanceMeters = start.distanceTo(end);
              const minutes = distanceMeters / WALKING_SPEED_MPS / 60;
              routeSummary = {
                distanceText: formatDistance(distanceMeters),
                durationText: formatDuration(minutes)
              };
            }

            // Update marker popup with route info
            if (routeTargetIndex !== null && routeTargetIndex === markerIndex) {
              const popup = markers[routeTargetIndex].getPopup();
              const wasOpen = popup && map.hasLayer(popup);
              markers[routeTargetIndex].setPopupContent(buildPopupHtml(markersData[routeTargetIndex], routeTargetIndex));
              // Re-wire the buttons after updating popup content
              wireRouteButton(routeTargetIndex);
              if (wasOpen) markers[routeTargetIndex].openPopup();
            }
          } else {
            console.warn('No coordinates found in route response', path);
            // Fallback to straight line if GraphHopper fails
            updateRouteVisualizationFallback();
          }
        } else {
          console.warn('No paths in route response', data);
          // Fallback to straight line if no route found
          updateRouteVisualizationFallback();
        }
      })
      .catch(error => {
        console.error('Error fetching route:', error);
        // Fallback to straight line visualization if GraphHopper fails
        updateRouteVisualizationFallback();
      });
  }

  function updateRouteVisualizationFallback() {
    // Fallback to simple straight-line visualization if GraphHopper fails
    if (!routeTarget || !lastLatLng) return;

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
      // Re-wire the buttons after updating popup content
      wireRouteButton(routeTargetIndex);
      if (wasOpen) markers[routeTargetIndex].openPopup();
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
        // Re-wire the buttons after updating popup content
        wireRouteButton(routeTargetIndex);
        if (wasOpen) markers[routeTargetIndex].openPopup();
      }
      return;
    }

    // Use GraphHopper routing instead of straight line
    if (routeTargetIndex !== null) {
      requestRouteToMarker(lastLatLng, routeTarget, routeTargetIndex);
    }
  }

  const markers = [];
  function buildPopupHtml(d, index) {
    const name = d.name[currentLang] ?? d.name.en;
    const role = d.role[currentLang] ?? d.role.en;
    const contact = d.number ? `<br>Contact: ${d.number}` : '';
    const buttonLabel = routeTargetIndex === index ? 'Update Route' : 'Set Route';
    const unsetButton = routeTargetIndex === index ? `<button type="button" class="route-action-btn route-unset-btn" data-route-unset="${index}">Unset</button>` : '';
    return `
      <div class="popup-body" data-marker-index="${index}">
        <b>${name}</b><br>Role: ${role}${contact}
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

  // --- GraphHopper Routing ---
  const routeBtn = document.getElementById('route-btn');
  let isRoutingMode = false;
  let routeStartPoint = null;
  let routeEndPoint = null;
  let routeStartMarker = null;
  let routeEndMarker = null;
  let graphHopperRouteLine = null;
  let routeClickHandler = null;

  function createRouteMarker(latlng, isStart) {
    const color = isStart ? '#16a34a' : '#ef4444';
    const icon = L.divIcon({
      className: 'route-marker-icon',
      html: `<div style="width:20px;height:20px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    return L.marker(latlng, { icon, draggable: true, zIndexOffset: 1000 });
  }

  function clearRoute() {
    if (routeStartMarker) {
      map.removeLayer(routeStartMarker);
      routeStartMarker = null;
    }
    if (routeEndMarker) {
      map.removeLayer(routeEndMarker);
      routeEndMarker = null;
    }
    if (graphHopperRouteLine) {
      map.removeLayer(graphHopperRouteLine);
      graphHopperRouteLine = null;
    }
    routeStartPoint = null;
    routeEndPoint = null;
  }

  // Simple polyline decoder for GraphHopper encoded polylines
  function decodePolyline(encoded) {
    const coordinates = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push([lat * 1e-5, lng * 1e-5]);
    }
    return coordinates;
  }

  function requestRoute(start, end) {
    // Request points_encoded=false to get coordinates directly, or we'll decode the polyline
    const url = `http://localhost:8989/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=car&points_encoded=false`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.paths && data.paths.length > 0) {
          const path = data.paths[0];
          let coordinates = [];

          // Try to extract coordinates from the response
          if (path.points && path.points.coordinates) {
            // GraphHopper returns [lng, lat] format, Leaflet needs [lat, lng]
            path.points.coordinates.forEach(coord => {
              coordinates.push([coord[1], coord[0]]);
            });
          } else if (path.points && typeof path.points === 'string') {
            // Encoded polyline string
            coordinates = decodePolyline(path.points);
          } else if (path.geometry && path.geometry.coordinates) {
            // Alternative geometry field
            path.geometry.coordinates.forEach(coord => {
              coordinates.push([coord[1], coord[0]]);
            });
          } else if (Array.isArray(path.points)) {
            // Direct array of points
            path.points.forEach(point => {
              if (Array.isArray(point) && point.length >= 2) {
                coordinates.push([point[1], point[0]]);
              }
            });
          }

          if (coordinates.length > 0) {
            // Remove existing route line if any
            if (graphHopperRouteLine) {
              map.removeLayer(graphHopperRouteLine);
            }

            // Draw the route
            graphHopperRouteLine = L.polyline(coordinates, {
              color: '#2563eb',
              weight: 5,
              opacity: 0.8,
              smoothFactor: 1
            }).addTo(map);

            // Fit map to show the entire route
            const bounds = graphHopperRouteLine.getBounds();
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });

            // Display route info if available
            if (path.distance && path.time) {
              const distanceKm = (path.distance / 1000).toFixed(2);
              const timeMinutes = Math.round(path.time / 60000);
              console.log(`Route: ${distanceKm} km, ${timeMinutes} min`);
              
              // Update marker popups with route info
              if (routeStartMarker) {
                routeStartMarker.setPopupContent(`Start point<br>Distance: ${distanceKm} km<br>Time: ${timeMinutes} min`);
              }
              if (routeEndMarker) {
                routeEndMarker.setPopupContent(`End point<br>Distance: ${distanceKm} km<br>Time: ${timeMinutes} min`);
              }
            }

            // Setup drag handlers for markers
            setupMarkerDrag();
          } else {
            console.warn('No coordinates found in route response', path);
            alert('Route received but could not parse coordinates. Check console for details.');
          }
        } else {
          console.warn('No paths in route response', data);
          alert('No route found between the selected points.');
        }
      })
      .catch(error => {
        console.error('Error fetching route:', error);
        alert('Failed to fetch route. Make sure GraphHopper server is running at http://localhost:8989');
      });
  }

  function handleMapClickForRouting(e) {
    if (!isRoutingMode) return;

    const latlng = e.latlng;

    if (!routeStartPoint) {
      // Set start point
      routeStartPoint = latlng;
      routeStartMarker = createRouteMarker(latlng, true).addTo(map);
      routeStartMarker.bindPopup('Start point').openPopup();
      console.log('Start point set:', latlng);
    } else if (!routeEndPoint) {
      // Set end point
      routeEndPoint = latlng;
      routeEndMarker = createRouteMarker(latlng, false).addTo(map);
      routeEndMarker.bindPopup('End point').openPopup();
      console.log('End point set:', latlng);

      // Request route
      requestRoute(routeStartPoint, routeEndPoint);

      // Disable routing mode after both points are set
      toggleRoutingMode();
    }
  }

  function toggleRoutingMode() {
    isRoutingMode = !isRoutingMode;
    
    if (isRoutingMode) {
      routeBtn.classList.add('active');
      routeBtn.title = 'Click two points on the map (routing mode active)';
      map.getContainer().style.cursor = 'crosshair';
      
      // Clear any existing route
      clearRoute();
      
      // Add click handler
      if (!routeClickHandler) {
        routeClickHandler = map.on('click', handleMapClickForRouting);
      }
    } else {
      routeBtn.classList.remove('active');
      routeBtn.title = 'Click two points to create a route';
      map.getContainer().style.cursor = '';
      
      // Remove click handler
      if (routeClickHandler) {
        map.off('click', handleMapClickForRouting);
        routeClickHandler = null;
      }
    }
  }

  if (routeBtn) {
    routeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleRoutingMode();
    });
  }

  // Allow dragging markers to update route
  function setupMarkerDrag() {
    if (routeStartMarker) {
      // Remove existing handlers to avoid duplicates
      routeStartMarker.off('dragend');
      routeStartMarker.on('dragend', function() {
        routeStartPoint = this.getLatLng();
        if (routeStartPoint && routeEndPoint) {
          requestRoute(routeStartPoint, routeEndPoint);
        }
      });
    }
    if (routeEndMarker) {
      // Remove existing handlers to avoid duplicates
      routeEndMarker.off('dragend');
      routeEndMarker.on('dragend', function() {
        routeEndPoint = this.getLatLng();
        if (routeStartPoint && routeEndPoint) {
          requestRoute(routeStartPoint, routeEndPoint);
        }
      });
    }
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