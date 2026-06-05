import { audio } from '../audio.js';

export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.events) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function triggerCapture(event, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(event.evidenceId, label, 'Calendario', detailHtml);
  }

  // ── Calendar math ────────────────────────────────────────────────────────────

  const { monthName, monthIdx, year, events } = data;

  // Build a set of days that have events, keyed by day number
  const eventsByDay = {};
  for (const ev of events) {
    if (!eventsByDay[ev.day]) eventsByDay[ev.day] = [];
    eventsByDay[ev.day].push(ev);
  }

  // First day of month (0=Sun … 6=Sat), convert to Mon-based (0=Mon … 6=Sun)
  const firstDow = new Date(year, monthIdx, 1).getDay(); // 0=Sun
  const startOffset = (firstDow + 6) % 7; // shift so Mon=0

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  // Default selected = first day with events (or day 1)
  const daysWithEvents = Object.keys(eventsByDay).map(Number).sort((a, b) => a - b);
  let selectedDay = daysWithEvents.length > 0 ? daysWithEvents[0] : 1;

  // ── Detail view ──────────────────────────────────────────────────────────────

  function showEventDetail(event) {
    container.innerHTML = '';
    const view = document.createElement('div');
    view.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:white;';

    // Header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;background:white;border-bottom:1px solid #f0f0f0;flex-shrink:0;';

    const backBtn = document.createElement('span');
    backBtn.textContent = '‹ ' + t('phone.back');
    backBtn.style.cssText = 'color:#007AFF;font-size:16px;cursor:pointer;user-select:none;flex-shrink:0;';
    backBtn.addEventListener('click', buildMain);

    const titleEl = document.createElement('span');
    titleEl.style.cssText = 'flex:1;font-size:15px;font-weight:600;color:#000;';
    titleEl.textContent = event.title;

    const capBtn = document.createElement('button');
    capBtn.textContent = t('phone.screenshot');
    capBtn.style.cssText = 'background:#007AFF;color:white;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;';

    hdr.appendChild(backBtn);
    hdr.appendChild(titleEl);
    hdr.appendChild(capBtn);
    view.appendChild(hdr);

    // Detail body
    const body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow-y:auto;padding:20px 16px;';

    const colorBar = event.color || '#007AFF';

    body.innerHTML = `
      <div style="border-left:4px solid ${esc(colorBar)};padding-left:12px;margin-bottom:20px;">
        <div style="font-size:20px;font-weight:700;color:#000;margin-bottom:6px;">${esc(event.title)}</div>
        <div style="font-size:14px;color:#555;margin-bottom:4px;">🕐 ${esc(event.time || '')}</div>
        ${event.location ? `<div style="font-size:14px;color:#555;margin-bottom:4px;">📍 ${esc(event.location)}</div>` : ''}
        ${event.notes ? `<div style="margin-top:14px;font-size:14px;color:#333;line-height:1.6;border-top:1px solid #f0f0f0;padding-top:14px;">${esc(event.notes)}</div>` : ''}
      </div>
    `;

    view.appendChild(body);

    capBtn.addEventListener('click', () => {
      triggerCapture(event, event.title, body.innerHTML);
      capBtn.textContent = t('phone.captured');
      capBtn.style.opacity = '0.7';
      setTimeout(() => {
        capBtn.textContent = t('phone.screenshot');
        capBtn.style.opacity = '1';
      }, 1500);
    });

    container.appendChild(view);
  }

  // ── Calendar grid renderer ───────────────────────────────────────────────────

  function renderGrid(gridEl) {
    gridEl.innerHTML = '';

    // Day-of-week headers (Mon-Sun)
    const dow = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    for (const d of dow) {
      const cell = document.createElement('div');
      cell.style.cssText = 'text-align:center;font-size:11px;font-weight:600;color:#8e8e93;padding:4px 0;';
      cell.textContent = d;
      gridEl.appendChild(cell);
    }

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      gridEl.appendChild(document.createElement('div'));
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:2px 0;cursor:pointer;user-select:none;';

      const isSelected = day === selectedDay;
      const hasEvents = !!eventsByDay[day];

      const numEl = document.createElement('div');
      numEl.textContent = day;
      numEl.style.cssText = [
        'width:28px;height:28px;display:flex;align-items:center;justify-content:center;',
        'border-radius:50%;font-size:14px;',
        isSelected
          ? 'background:#007AFF;color:white;font-weight:700;'
          : 'color:#000;',
      ].join('');
      cell.appendChild(numEl);

      // Event dot row
      const dotRow = document.createElement('div');
      dotRow.style.cssText = 'display:flex;gap:2px;justify-content:center;height:8px;margin-top:1px;';
      if (hasEvents) {
        const evList = eventsByDay[day];
        // Show up to 3 dots
        const shown = evList.slice(0, 3);
        for (const ev of shown) {
          const dot = document.createElement('div');
          dot.style.cssText = `width:5px;height:5px;border-radius:50%;background:${ev.color || '#007AFF'};`;
          dotRow.appendChild(dot);
        }
      }
      cell.appendChild(dotRow);

      cell.addEventListener('click', () => {
        selectedDay = day;
        renderGrid(gridEl);
        renderEventList(eventListEl);
      });

      gridEl.appendChild(cell);
    }
  }

  // ── Event list renderer ──────────────────────────────────────────────────────

  let eventListEl;

  function renderEventList(listEl) {
    listEl.innerHTML = '';

    const dayEvents = eventsByDay[selectedDay] || [];

    if (dayEvents.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:24px 16px;text-align:center;color:#8e8e93;font-size:13px;';
      empty.textContent = 'Sin eventos';
      listEl.appendChild(empty);
      return;
    }

    for (const ev of dayEvents) {
      const item = document.createElement('div');
      item.style.cssText = [
        'display:flex;align-items:stretch;gap:0;margin:8px 16px;',
        'border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);',
        'cursor:pointer;background:white;',
      ].join('');

      const colorStripe = document.createElement('div');
      colorStripe.style.cssText = `width:5px;background:${ev.color || '#007AFF'};flex-shrink:0;`;

      const info = document.createElement('div');
      info.style.cssText = 'flex:1;padding:10px 12px;';
      info.innerHTML = `
        <div style="font-size:14px;font-weight:600;color:#000;margin-bottom:3px;">${esc(ev.title)}</div>
        <div style="font-size:12px;color:#555;">${esc(ev.time || '')}</div>
        ${ev.location ? `<div style="font-size:12px;color:#8e8e93;margin-top:2px;">📍 ${esc(ev.location)}</div>` : ''}
      `;

      item.appendChild(colorStripe);
      item.appendChild(info);
      item.addEventListener('click', () => showEventDetail(ev));
      listEl.appendChild(item);
    }
  }

  // ── Main view builder ────────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';
    container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:white;';

    // App header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'background:white;padding:14px 16px 8px;border-bottom:1px solid #f0f0f0;flex-shrink:0;';
    hdr.innerHTML = `
      <div style="font-size:22px;font-weight:700;color:#000;">${esc(monthName)}</div>
      <div style="font-size:14px;color:#8e8e93;margin-top:2px;">${esc(String(year))}</div>
    `;
    container.appendChild(hdr);

    // Calendar grid
    const gridWrapper = document.createElement('div');
    gridWrapper.style.cssText = 'padding:8px 12px;flex-shrink:0;border-bottom:1px solid #f0f0f0;';

    const gridEl = document.createElement('div');
    gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:0;';
    gridWrapper.appendChild(gridEl);
    container.appendChild(gridWrapper);

    renderGrid(gridEl);

    // Event list (scrollable area below)
    const listWrapper = document.createElement('div');
    listWrapper.style.cssText = 'flex:1;overflow-y:auto;padding:8px 0;';

    eventListEl = listWrapper;
    renderEventList(listWrapper);

    container.appendChild(listWrapper);
  }

  buildMain();
}
