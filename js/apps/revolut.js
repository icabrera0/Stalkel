import { audio } from '../audio.js';
export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isExpense(amount) {
    return String(amount).startsWith('−') || String(amount).startsWith('-');
  }

  function extractEmoji(category) {
    // Return the first character (emoji) from the category string
    const match = String(category).match(/^(\S+)/);
    return match ? match[1] : '💳';
  }

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.merchant || 'Revolut';
  }

  function triggerCapture(item, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, 'Revolut', detailHtml);
  }

  // ── Group transactions by date ───────────────────────────────────────────────

  function groupByDate(items) {
    const order = [];
    const map = {};
    items.forEach(item => {
      const d = item.date || '';
      if (!map[d]) {
        map[d] = [];
        order.push(d);
      }
      map[d].push(item);
    });
    return order.map(d => ({ date: d, items: map[d] }));
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
    hdr.style.cssText = 'background:#191c82;flex-shrink:0;';
    hdr.innerHTML = `<span class="detail-back" style="color:white;">${t('phone.back')}</span><span class="detail-title" style="color:white;">${esc(item.merchant)}</span>`;
    hdr.querySelector('.detail-back').addEventListener('click', backFn);
    detail.appendChild(hdr);

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;background:#f8f8f8;';

    const expense = isExpense(item.amount);
    const amountColor = expense ? '#ff4757' : '#2ed573';
    const emoji = extractEmoji(item.category || '💳');
    const iconBg = expense ? '#ffe0e6' : '#e0ffe6';
    const noteHtml = item.note
      ? `<div style="padding:12px 16px;background:white;margin-top:8px;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;">
           <div style="font-size:11px;color:#999;margin-bottom:4px;">NOTA</div>
           <div style="font-size:13px;color:#666;">${esc(item.note)}</div>
         </div>`
      : '';

    const detailHtml = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:32px 24px 24px;background:white;border-bottom:1px solid #f0f0f0;">
        <div style="width:64px;height:64px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px;">${emoji}</div>
        <div style="font-size:22px;font-weight:700;color:#000;margin-bottom:6px;">${esc(item.merchant)}</div>
        <div style="font-size:32px;font-weight:700;color:${amountColor};">${esc(item.amount)}</div>
      </div>
      <div style="background:white;margin-top:8px;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;">
        <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:13px;color:#999;">Fecha</span>
          <span style="font-size:13px;font-weight:500;color:#000;">${esc(item.date)}</span>
        </div>
        <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:13px;color:#999;">Categoría</span>
          <span style="font-size:13px;font-weight:500;color:#000;">${esc(item.category || '')}</span>
        </div>
      </div>
      ${noteHtml}
      <div style="margin:16px;padding:16px;background:white;border-radius:8px;border:1px solid #f0f0f0;display:flex;align-items:center;gap:8px;color:#666;font-size:13px;">
        <span style="font-size:20px;">📍</span>
        <span>Ubicación no disponible</span>
      </div>
    `;

    content.innerHTML = detailHtml;
    detail.appendChild(content);

    // Capture button
    const capBtn = document.createElement('div');
    capBtn.style.cssText = 'flex-shrink:0;padding:12px 16px;background:#fff;border-top:1px solid #f0f0f0;';
    capBtn.innerHTML = `<button class="rv-capture-btn" style="width:100%;padding:12px;background:#191c82;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${t('phone.screenshot')}</button>`;

    const btn = capBtn.querySelector('.rv-capture-btn');
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
    hdr.style.cssText = 'flex-shrink:0;background:#191c82;color:white;padding:16px;font-size:18px;font-weight:700;letter-spacing:0.5px;';
    hdr.textContent = 'Revolut';
    container.appendChild(hdr);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'app-content';
    contentArea.style.cssText = 'flex:1;overflow-y:auto;background:#f8f8f8;';

    // Balance card
    const card = document.createElement('div');
    card.className = 'rv-balance-card';
    card.innerHTML = `
      <div class="rv-balance-label">Saldo disponible</div>
      <div class="rv-balance-amount">${esc(data.balance || '—')}</div>
      <div style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;gap:6px;">
          <div style="width:28px;height:18px;background:rgba(255,255,255,0.3);border-radius:3px;"></div>
          <div style="width:28px;height:18px;background:rgba(255,255,255,0.15);border-radius:3px;"></div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:2px;">•••• 4821</div>
      </div>
    `;
    contentArea.appendChild(card);

    // Section label
    const sectionLabel = document.createElement('div');
    sectionLabel.style.cssText = 'padding:8px 16px 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.5px;';
    sectionLabel.textContent = 'Últimas transacciones';
    contentArea.appendChild(sectionLabel);

    // Transactions grouped by date
    const items = data.items || [];
    const groups = groupByDate(items);

    groups.forEach(group => {
      // Date header
      const dateHdr = document.createElement('div');
      dateHdr.style.cssText = 'padding:8px 16px;font-size:12px;font-weight:600;color:#666;background:#f0f0f0;border-top:1px solid #e8e8e8;border-bottom:1px solid #e8e8e8;text-transform:capitalize;';
      dateHdr.textContent = group.date;
      contentArea.appendChild(dateHdr);

      group.items.forEach(item => {
        const expense = isExpense(item.amount);
        const emoji = extractEmoji(item.category || '💳');

        const row = document.createElement('div');
        row.className = 'rv-transaction-item';

        const iconClass = expense ? 'expense' : 'income';
        const amountClass = expense ? 'rv-transaction-amount expense' : 'rv-transaction-amount income';

        row.innerHTML = `
          <div class="rv-transaction-icon ${iconClass}">${emoji}</div>
          <div class="rv-transaction-content">
            <div class="rv-transaction-name">${esc(item.merchant)}</div>
            <div class="rv-transaction-date">${esc(item.category || '')}</div>
          </div>
          <div class="${amountClass}">${esc(item.amount)}</div>
        `;

        row.addEventListener('click', () => showDetail(item, buildMain));
        contentArea.appendChild(row);
      });
    });

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:32px;text-align:center;color:#999;font-size:13px;';
      empty.textContent = 'Sin transacciones';
      contentArea.appendChild(empty);
    }

    container.appendChild(contentArea);
  }

  // Set up flex container
  container.classList.add('app-revolut');
  container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

  buildMain();
}
