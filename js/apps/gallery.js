import { createPixelArt } from '../pixelart.js';
import { audio } from '../audio.js';

// Map generator photo types to pixel art types
const PHOTO_TYPE_MAP = {
  '🌅': 'landscape', '⚽': 'person', '🌳': 'landscape', '🍕': 'food',
  '🤳': 'selfie', '🛏️': 'hotel', '💍': 'gift', '💬': 'generic',
  '📸': 'person', '🏖️': 'beach', '🏢': 'generic', '🎁': 'gift',
  '👫': 'selfie', '💐': 'gift',
};

function getPixelType(emoji, caption) {
  if (PHOTO_TYPE_MAP[emoji]) return PHOTO_TYPE_MAP[emoji];
  const c = (caption || '').toLowerCase();
  if (c.includes('hotel') || c.includes('cama')) return 'hotel';
  if (c.includes('regalo') || c.includes('gift')) return 'gift';
  if (c.includes('comida') || c.includes('cena') || c.includes('food')) return 'food';
  if (c.includes('playa') || c.includes('beach')) return 'beach';
  if (c.includes('noche') || c.includes('night')) return 'night';
  return 'landscape';
}

let _photoSeedCounter = 1000;

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

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.caption || t('app.gallery');
  }

  function triggerCapture(item, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, t('app.gallery'), detailHtml);
  }

  // ── Detail view ──────────────────────────────────────────────────────────────

  function showDetail(item, backFn) {
    container.innerHTML = '';
    const detail = document.createElement('div');
    detail.className = 'app-detail';
    detail.style.cssText = 'display:flex;flex-direction:column;height:100%;';

    // Back header
    const hdr = document.createElement('div');
    hdr.className = 'detail-header';
    hdr.style.cssText = 'background:white;flex-shrink:0;border-bottom:1px solid #f0f0f0;';
    hdr.innerHTML = `<span class="detail-back">${t('phone.back')}</span><span class="detail-title">${t('app.gallery')}</span>`;
    hdr.querySelector('.detail-back').addEventListener('click', backFn);
    detail.appendChild(hdr);

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;background:#fff;display:flex;flex-direction:column;align-items:center;padding:20px 16px;';

    // Pixel art photo
    const photoPlaceholder = document.createElement('div');
    photoPlaceholder.style.cssText = 'width:100%;aspect-ratio:1;border-radius:8px;overflow:hidden;margin-bottom:16px;image-rendering:pixelated;';
    const ptype = getPixelType(item.imageEmoji, item.caption);
    const pseed = _photoSeedCounter++ + (item.id ? item.id.charCodeAt(0) * 31 : 0);
    const canvas = createPixelArt(ptype, pseed, 256);
    canvas.style.cssText = 'width:100%;height:100%;image-rendering:pixelated;display:block;';
    photoPlaceholder.appendChild(canvas);
    content.appendChild(photoPlaceholder);

    // Date caption
    const captionEl = document.createElement('div');
    captionEl.style.cssText = 'font-size:13px;color:#666;text-align:center;';
    captionEl.textContent = item.date ? esc(item.date) : '';
    content.appendChild(captionEl);

    detail.appendChild(content);

    // Capture button
    const capBtn = document.createElement('div');
    capBtn.style.cssText = 'flex-shrink:0;padding:12px 16px;background:#fff;border-top:1px solid #f0f0f0;';
    capBtn.innerHTML = `<button class="gal-capture-btn" style="width:100%;padding:12px;background:#000;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${t('phone.screenshot')}</button>`;

    const btn = capBtn.querySelector('.gal-capture-btn');
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

  // ── Build main view ──────────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'app-header';
    hdr.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;';
    hdr.innerHTML = `<span style="font-size:20px;">📷</span><span>${t('app.gallery')}</span>`;
    container.appendChild(hdr);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;background:#fff;border-bottom:1px solid #f0f0f0;flex-shrink:0;';

    // Determine language and album names
    const isSpanish = t('app.gallery') === 'Galería';
    const albumNames = [
      isSpanish ? 'Recientes' : 'Recents',
      isSpanish ? 'Capturas' : 'Screenshots',
      isSpanish ? 'Papelera' : 'Trash'
    ];

    // Tab labels
    const tabLabels = albumNames;
    const tabEls = [];
    tabLabels.forEach((label, i) => {
      const tab = document.createElement('div');
      tab.style.cssText = 'flex:1;text-align:center;padding:10px 8px;font-size:11px;font-weight:600;color:#999;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      tab.textContent = label;
      tab.dataset.tab = i;
      tabEls.push(tab);
      tabBar.appendChild(tab);
    });
    container.appendChild(tabBar);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'app-content';
    contentArea.style.cssText = 'flex:1;overflow-y:auto;background:#fff;';
    container.appendChild(contentArea);

    const items = data.items || [];

    // Build sections for each album
    const sections = albumNames.map((albumName, idx) => {
      const section = document.createElement('div');
      section.dataset.section = idx;
      section.style.display = idx === 0 ? 'block' : 'none';

      const albumItems = items.filter(i => i.album === albumName);

      if (albumItems.length === 0) {
        section.innerHTML = `<div style="padding:32px;text-align:center;color:#999;font-size:13px;">${isSpanish ? 'Sin fotos' : 'No photos'}</div>`;
      } else {
        // 3-column grid
        const grid = document.createElement('div');
        grid.className = 'gal-photo-grid';

        albumItems.forEach(item => {
          const cell = document.createElement('div');
          cell.className = 'gal-photo-item';
          cell.style.cssText = 'overflow:hidden;position:relative;cursor:pointer;';
          const ptype = getPixelType(item.imageEmoji, item.caption);
          const pseed = _photoSeedCounter++ + (item.id ? item.id.charCodeAt(0) * 31 : 0);
          const thumbCanvas = createPixelArt(ptype, pseed, 96);
          thumbCanvas.style.cssText = 'width:100%;height:100%;image-rendering:pixelated;display:block;';
          cell.appendChild(thumbCanvas);
          cell.addEventListener('click', () => showDetail(item, buildMain));
          grid.appendChild(cell);
        });

        section.appendChild(grid);
      }

      return section;
    });

    sections.forEach(sec => contentArea.appendChild(sec));

    // Tab switching
    function activateTab(idx) {
      tabEls.forEach((el, i) => {
        const active = i === idx;
        el.style.color = active ? '#000' : '#999';
        el.style.borderBottomColor = active ? '#000' : 'transparent';
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