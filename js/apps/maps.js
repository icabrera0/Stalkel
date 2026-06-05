export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function labelIcon(label) {
    if (!label) return '📍';
    const l = label.toLowerCase();
    if (l === 'casa' || l === 'home') return '🏠';
    if (l === 'trabajo' || l === 'work' || l === 'office') return '💼';
    if (l === 'favorito' || l === 'favourite' || l === 'favorite') return '❤️';
    return '📍';
  }

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.name || item.query || item.contactName || 'Maps';
  }

  function triggerCapture(item, label, detailHtml) {
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, 'Maps', detailHtml);
  }

  // ── Detail view ──────────────────────────────────────────────────────────────

  function showDetail(item, backFn) {
    container.innerHTML = '';
    const detail = document.createElement('div');
    detail.className = 'app-detail';
    detail.style.cssText = 'display:flex;flex-direction:column;height:100%;';

    // Back header (Maps blue style)
    const hdr = document.createElement('div');
    hdr.className = 'detail-header';
    hdr.style.cssText = 'background:white;flex-shrink:0;border-bottom:1px solid #e0e0e0;';
    hdr.innerHTML = `<span class="detail-back" style="color:#1a73e8;">${t('phone.back')}</span><span class="detail-title">${esc(item.name || item.query || item.contactName || 'Maps')}</span>`;
    hdr.querySelector('.detail-back').addEventListener('click', backFn);
    detail.appendChild(hdr);

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;background:#fff;';

    let bodyHtml = '';

    if (item.subtype === 'saved_place') {
      bodyHtml = renderSavedPlaceDetail(item);
    } else if (item.subtype === 'recent_search') {
      bodyHtml = renderRecentSearchDetail(item);
    } else if (item.subtype === 'timeline_entry') {
      bodyHtml = renderTimelineDetail(item);
    } else if (item.subtype === 'shared_location') {
      bodyHtml = renderSharedLocationDetail(item);
    }

    // Fake mini map
    bodyHtml += `<div style="width:100%;height:160px;background:linear-gradient(135deg,#b2dfdb 0%,#80cbc4 30%,#4fc3f7 60%,#29b6f6 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.06) 0px,rgba(255,255,255,0.06) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.06) 0px,rgba(255,255,255,0.06) 1px,transparent 1px,transparent 40px);"></div>
      <div style="background:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.25);z-index:1;">📍</div>
    </div>`;

    content.innerHTML = bodyHtml;
    detail.appendChild(content);

    // Capture button
    const capBtn = document.createElement('div');
    capBtn.style.cssText = 'flex-shrink:0;padding:12px 16px;background:#fff;border-top:1px solid #e0e0e0;';
    capBtn.innerHTML = `<button class="gm-capture-btn" style="width:100%;padding:12px;background:#1a73e8;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${t('phone.screenshot')}</button>`;

    const btn = capBtn.querySelector('.gm-capture-btn');
    btn.addEventListener('click', () => {
      const label = captureLabel(item);
      triggerCapture(item, label, content.innerHTML);
      btn.textContent = t('phone.captured');
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.textContent = t('phone.screenshot');
        btn.style.opacity = '1';
      }, 1500);
    });

    detail.appendChild(capBtn);
    container.appendChild(detail);
  }

  // ── Sub-renderers for detail views ───────────────────────────────────────────

  function renderSavedPlaceDetail(item) {
    const icon = item.icon || labelIcon(item.label);
    const visitHtml = item.visitCount
      ? `<div style="margin-top:12px;padding:10px 12px;background:#e8f0fe;border-radius:8px;font-size:13px;color:#1a73e8;">📊 Visitado ${esc(item.visitCount)} veces este mes</div>`
      : '';
    return `
      <div style="padding:20px 16px 16px;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
          <div style="width:52px;height:52px;background:#1a73e8;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">${esc(icon)}</div>
          <div>
            <div style="font-size:17px;font-weight:600;color:#000;">${esc(item.name)}</div>
            <div style="font-size:13px;color:#999;margin-top:3px;">${esc(item.label || '')}</div>
          </div>
        </div>
        <div style="padding:12px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#444;">
          <div style="font-weight:600;color:#000;margin-bottom:4px;">Dirección</div>
          <div>📍 ${esc(item.address || '')}</div>
        </div>
        ${visitHtml}
      </div>`;
  }

  function renderRecentSearchDetail(item) {
    return `
      <div style="padding:20px 16px 16px;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
          <div style="width:52px;height:52px;background:#ea4335;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">🕐</div>
          <div>
            <div style="font-size:17px;font-weight:600;color:#000;">${esc(item.query)}</div>
            <div style="font-size:13px;color:#999;margin-top:3px;">Búsqueda reciente</div>
          </div>
        </div>
        <div style="padding:12px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#444;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;color:#000;">Hace</span>
            <span>${esc(item.time || '')}</span>
          </div>
        </div>
      </div>`;
  }

  function renderTimelineDetail(item) {
    const placesHtml = (item.places || []).map((p, idx, arr) => {
      const isLast = idx === arr.length - 1;
      return `
        <div style="display:flex;gap:12px;padding-bottom:${isLast ? '0' : '16px'};">
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
            <div style="width:12px;height:12px;border-radius:50%;background:#1a73e8;border:2px solid white;box-shadow:0 0 0 2px #1a73e8;margin-top:3px;"></div>
            ${!isLast ? `<div style="width:2px;flex:1;background:#e0e0e0;margin-top:4px;min-height:24px;"></div>` : ''}
          </div>
          <div style="flex:1;padding-bottom:${isLast ? '0' : '4px'};">
            <div style="font-size:14px;font-weight:500;color:#000;">${esc(p.name)}</div>
            <div style="font-size:12px;color:#999;margin-top:2px;">${esc(p.timeRange || '')}</div>
          </div>
        </div>`;
    }).join('');
    return `
      <div style="padding:20px 16px 16px;">
        <div style="font-size:13px;font-weight:600;color:#1a73e8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">📅 ${esc(item.date)}</div>
        <div style="padding-left:4px;">${placesHtml}</div>
      </div>`;
  }

  function renderSharedLocationDetail(item) {
    const initial = (item.contactName || '?').charAt(0).toUpperCase();
    return `
      <div style="padding:20px 16px 16px;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
          <div style="width:52px;height:52px;border-radius:50%;background:${esc(item.avatarColor || '#1a73e8')};display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:700;flex-shrink:0;">${esc(initial)}</div>
          <div>
            <div style="font-size:17px;font-weight:600;color:#000;">${esc(item.contactName)}</div>
            <div style="font-size:13px;color:#34a853;margin-top:3px;">● Compartiendo ubicación</div>
          </div>
        </div>
        <div style="padding:12px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#444;margin-bottom:10px;">
          <div style="font-weight:600;color:#000;margin-bottom:4px;">Ubicación actual</div>
          <div>📍 ${esc(item.address || '')}</div>
        </div>
        <div style="padding:12px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#444;">
          <div style="font-weight:600;color:#000;margin-bottom:4px;">Compartiendo desde</div>
          <div>🕐 ${esc(item.since || '')}</div>
        </div>
      </div>`;
  }

  // ── Tab content builders ─────────────────────────────────────────────────────

  function buildGuardadosSection(items, buildMain) {
    const section = document.createElement('div');
    section.dataset.section = '0';

    const places = items.filter(i => i.subtype === 'saved_place');

    if (places.length === 0) {
      section.innerHTML = '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">No hay lugares guardados</div>';
      return section;
    }

    places.forEach(item => {
      const icon = item.icon || labelIcon(item.label);
      const visitHtml = item.visitCount
        ? `<div style="font-size:11px;color:#1a73e8;margin-top:2px;">Visitado ${esc(item.visitCount)} veces este mes</div>`
        : '';
      const row = document.createElement('div');
      row.className = 'gm-place-item gm-saved-place';
      row.innerHTML = `
        <div class="gm-place-icon" style="background:#1a73e8;">${esc(icon)}</div>
        <div class="gm-place-info">
          <div class="gm-place-name">${esc(item.name)}</div>
          <div class="gm-place-address">${esc(item.address || '')}</div>
          <div style="font-size:11px;color:#666;margin-top:1px;">${esc(item.label || '')}</div>
          ${visitHtml}
        </div>`;
      row.addEventListener('click', () => showDetail(item, buildMain));
      section.appendChild(row);
    });

    return section;
  }

  function buildRecientesSection(items, buildMain) {
    const section = document.createElement('div');
    section.dataset.section = '1';
    section.style.display = 'none';

    const searches = items.filter(i => i.subtype === 'recent_search');

    if (searches.length === 0) {
      section.innerHTML = '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Sin búsquedas recientes</div>';
      return section;
    }

    searches.forEach(item => {
      const row = document.createElement('div');
      row.className = 'gm-place-item';
      row.innerHTML = `
        <div class="gm-place-icon" style="background:#ea4335;">🕐</div>
        <div class="gm-place-info">
          <div class="gm-place-name">${esc(item.query)}</div>
        </div>
        <div class="gm-place-time">${esc(item.time || '')}</div>`;
      row.addEventListener('click', () => showDetail(item, buildMain));
      section.appendChild(row);
    });

    return section;
  }

  function buildTimelineSection(items, buildMain) {
    const section = document.createElement('div');
    section.dataset.section = '2';
    section.style.display = 'none';

    const entries = items.filter(i => i.subtype === 'timeline_entry');

    if (entries.length === 0) {
      section.innerHTML = '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Sin entradas de timeline</div>';
      return section;
    }

    entries.forEach(item => {
      // Date header
      const dateHdr = document.createElement('div');
      dateHdr.style.cssText = 'padding:10px 16px;background:#f8f9fa;border-bottom:1px solid #e0e0e0;font-size:13px;font-weight:600;color:#1a73e8;';
      dateHdr.textContent = item.date;
      section.appendChild(dateHdr);

      // Timeline places
      const timelineWrap = document.createElement('div');
      timelineWrap.className = 'gm-timeline';
      timelineWrap.style.cssText = 'padding:12px 16px;background:white;border-bottom:1px solid #f0f0f0;cursor:pointer;';

      const placesHtml = (item.places || []).map((p, idx, arr) => {
        const isLast = idx === arr.length - 1;
        return `<div style="display:flex;gap:10px;padding-bottom:${isLast ? '0' : '12px'};">
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
            <div style="width:10px;height:10px;border-radius:50%;background:#1a73e8;margin-top:4px;"></div>
            ${!isLast ? `<div style="width:2px;flex:1;background:#e0e0e0;margin:3px 0;min-height:20px;"></div>` : ''}
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;color:#000;">${esc(p.name)}</div>
            <div style="font-size:11px;color:#999;margin-top:1px;">${esc(p.timeRange || '')}</div>
          </div>
        </div>`;
      }).join('');

      timelineWrap.innerHTML = placesHtml;
      timelineWrap.addEventListener('click', () => showDetail(item, buildMain));
      section.appendChild(timelineWrap);
    });

    return section;
  }

  function buildCompartidoSection(items, buildMain) {
    const section = document.createElement('div');
    section.dataset.section = '3';
    section.style.display = 'none';

    const shared = items.filter(i => i.subtype === 'shared_location');

    if (shared.length === 0) {
      section.innerHTML = '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Nadie comparte su ubicación contigo</div>';
      return section;
    }

    shared.forEach(item => {
      const initial = (item.contactName || '?').charAt(0).toUpperCase();
      const row = document.createElement('div');
      row.className = 'gm-place-item';
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;background:white;border-bottom:1px solid #f0f0f0;cursor:pointer;';
      row.innerHTML = `
        <div style="width:44px;height:44px;border-radius:50%;background:${esc(item.avatarColor || '#1a73e8')};display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;flex-shrink:0;">${esc(initial)}</div>
        <div class="gm-place-info">
          <div class="gm-place-name">${esc(item.contactName)}</div>
          <div class="gm-place-address">${esc(item.address || '')}</div>
          <div style="font-size:11px;color:#34a853;margin-top:2px;">● ${esc(item.since || '')}</div>
        </div>`;
      row.addEventListener('click', () => showDetail(item, buildMain));
      section.appendChild(row);
    });

    return section;
  }

  // ── Build main view ──────────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'app-header';
    hdr.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;';
    hdr.innerHTML = `<span style="font-size:20px;">🗺️</span><span>Maps</span>`;
    container.appendChild(hdr);

    // Search bar
    const searchBar = document.createElement('div');
    searchBar.className = 'gm-search-bar';
    searchBar.style.cssText = 'flex-shrink:0;padding:10px 12px;background:#fff;border-bottom:1px solid #e0e0e0;';
    searchBar.innerHTML = `<div class="gm-search-input" style="width:100%;padding:8px 12px;border:none;border-radius:20px;font-size:13px;background:#f1f3f4;color:#999;display:flex;align-items:center;gap:8px;box-sizing:border-box;"><span style="color:#1a73e8;">🔍</span> <span>Buscar en Maps</span></div>`;
    container.appendChild(searchBar);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;background:#fff;border-bottom:1px solid #e0e0e0;flex-shrink:0;';

    const tabLabels = ['Guardados', 'Recientes', 'Timeline', 'Compartido'];
    const tabEls = [];
    tabLabels.forEach((label, i) => {
      const tab = document.createElement('div');
      tab.style.cssText = 'flex:1;text-align:center;padding:9px 0;font-size:11px;font-weight:600;color:#999;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      tab.textContent = label;
      tab.dataset.tab = i;
      tabEls.push(tab);
      tabBar.appendChild(tab);
    });
    container.appendChild(tabBar);

    // Fake map background strip
    const mapBg = document.createElement('div');
    mapBg.style.cssText = 'flex-shrink:0;height:120px;background:linear-gradient(135deg,#c8e6c9 0%,#b2dfdb 40%,#80deea 70%,#b3e5fc 100%);position:relative;overflow:hidden;';
    mapBg.innerHTML = `
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0px,rgba(255,255,255,0.08) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.08) 0px,rgba(255,255,255,0.08) 1px,transparent 1px,transparent 40px);"></div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-60%);background:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">📍</div>
    `;
    container.appendChild(mapBg);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'app-content';
    contentArea.style.cssText = 'flex:1;overflow-y:auto;background:#fff;';
    container.appendChild(contentArea);

    const items = data.items || [];

    const guardadosSection = buildGuardadosSection(items, buildMain);
    const recientesSection = buildRecientesSection(items, buildMain);
    const timelineSection = buildTimelineSection(items, buildMain);
    const compartidoSection = buildCompartidoSection(items, buildMain);

    contentArea.appendChild(guardadosSection);
    contentArea.appendChild(recientesSection);
    contentArea.appendChild(timelineSection);
    contentArea.appendChild(compartidoSection);

    const sections = [guardadosSection, recientesSection, timelineSection, compartidoSection];

    function activateTab(idx) {
      tabEls.forEach((el, i) => {
        const active = i === idx;
        el.style.color = active ? '#1a73e8' : '#999';
        el.style.borderBottomColor = active ? '#1a73e8' : 'transparent';
      });
      sections.forEach((sec, i) => {
        sec.style.display = i === idx ? 'block' : 'none';
      });
    }

    tabEls.forEach((el, i) => {
      el.addEventListener('click', () => activateTab(i));
    });

    activateTab(0);
  }

  // Set up flex container
  container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

  buildMain();
}
