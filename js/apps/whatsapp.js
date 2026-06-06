import { audio } from '../audio.js';
export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function initials(name) {
    return (name || '?').charAt(0).toUpperCase();
  }

  function avatarHtml(item) {
    if (item.isGroup) {
      return `<div class="wa-avatar" style="background:${item.avatarColor || '#075E54'};">👥</div>`;
    }
    if (item.isUnknown) {
      return `<div class="wa-avatar" style="background:#9e9e9e;">❓</div>`;
    }
    return `<div class="wa-avatar" style="background:${item.avatarColor || '#075E54'};">${initials(esc(item.contactName))}</div>`;
  }

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.contactName || 'WhatsApp';
  }

  function triggerCapture(item, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, 'WhatsApp', detailHtml);
  }

  // ── Message bubble renderer ──────────────────────────────────────────────────

  function renderMessage(msg) {
    const isMe = msg.from === 'me';
    const wrapAlign = isMe ? 'align-items:flex-end;' : 'align-items:flex-start;';
    const bubbleClass = isMe ? 'wa-message wa-message-sent' : 'wa-message wa-message-received';

    let innerHtml;

    if (msg.deleted) {
      innerHtml = `<em style="color:#999;">🚫 Este mensaje fue eliminado</em>`;
    } else if (msg.type === 'voice') {
      innerHtml = `🎤 Nota de voz · 0:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`;
    } else if (msg.type === 'location') {
      const address = esc(msg.address || msg.text || 'Ubicación compartida');
      innerHtml = `📍 Ubicación compartida · ${address}`;
    } else {
      innerHtml = esc(msg.text || '');
    }

    return `<div style="display:flex;flex-direction:column;${wrapAlign}">
      <div class="${bubbleClass}">
        ${innerHtml}
        <div class="wa-message-time">${msg.time || ''}</div>
      </div>
    </div>`;
  }

  // ── Detail (chat) view ───────────────────────────────────────────────────────

  function showDetail(item) {
    container.innerHTML = '';

    const detail = document.createElement('div');
    detail.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

    // Header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'background:#075E54;color:white;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;';

    const backBtn = document.createElement('span');
    backBtn.textContent = t('phone.back');
    backBtn.style.cssText = 'cursor:pointer;font-size:14px;user-select:none;flex-shrink:0;';
    backBtn.addEventListener('click', buildMain);

    const avatarEl = document.createElement('div');
    avatarEl.innerHTML = avatarHtml(item);
    avatarEl.querySelector('.wa-avatar').style.cssText += 'width:36px;height:36px;font-size:16px;';

    const nameEl = document.createElement('span');
    nameEl.style.cssText = 'flex:1;font-size:15px;font-weight:600;';
    nameEl.textContent = item.contactName || '';

    // Chat background area (declare before button that references it)
    const chatArea = document.createElement('div');
    chatArea.style.cssText = 'flex:1;overflow-y:auto;padding:8px 0;background:#ECE5DD;display:flex;flex-direction:column;';

    // Screenshot button (top-right)
    const capBtn = document.createElement('button');
    capBtn.textContent = t('phone.screenshot');
    capBtn.style.cssText = 'background:#128C7E;color:white;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;';
    capBtn.addEventListener('click', () => {
      const label = captureLabel(item);
      triggerCapture(item, label, chatArea.innerHTML);
      capBtn.textContent = t('phone.captured');
      capBtn.style.opacity = '0.7';
      setTimeout(() => {
        capBtn.textContent = t('phone.screenshot');
        capBtn.style.opacity = '1';
      }, 1500);
    });

    hdr.appendChild(backBtn);
    hdr.appendChild(avatarEl);
    hdr.appendChild(nameEl);
    hdr.appendChild(capBtn);
    detail.appendChild(hdr);

    const messages = item.messages || [];
    if (messages.length === 0) {
      chatArea.innerHTML = '<div style="text-align:center;color:#999;font-size:13px;padding:24px;">Sin mensajes</div>';
    } else {
      chatArea.innerHTML = messages.map(renderMessage).join('');
    }

    detail.appendChild(chatArea);
    container.appendChild(detail);

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // ── Main thread list view ────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';
    container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

    // App header
    const hdr = document.createElement('div');
    hdr.className = 'app-header';
    hdr.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;';
    hdr.innerHTML = `<span>WhatsApp</span><span style="font-size:18px;">⋮</span>`;
    container.appendChild(hdr);

    // Thread list
    const list = document.createElement('div');
    list.className = 'app-content';
    list.style.cssText = 'flex:1;overflow-y:auto;';

    const items = data.items || [];

    items.forEach(item => {
      const isLocked = item.locked && !item._unlocked;

      const row = document.createElement('div');
      row.className = 'wa-chat-item wa-thread' + (isLocked ? ' wa-thread-locked' : '');
      row.dataset.id = item.id;

      // Unread badge
      const unreadBadge = (!isLocked && item.unread > 0)
        ? `<span style="background:#25D366;color:white;border-radius:50%;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;padding:0 3px;">${item.unread}</span>`
        : '';

      const previewText = isLocked ? t('locked.hint') : esc(item.lastMessage || '');

      row.innerHTML = `
        ${avatarHtml(item)}
        <div class="wa-chat-content">
          <div class="wa-chat-header">
            <span class="wa-chat-name">${esc(item.contactName || '')}</span>
            <span class="wa-chat-time">${esc(item.lastTime || '')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="wa-chat-preview wa-thread-preview">${previewText}</span>
            ${unreadBadge}
          </div>
        </div>`;

      row.addEventListener('click', () => {
        if (item.locked && !item._unlocked) return;
        showDetail(item);
      });
      list.appendChild(row);
    });

    // Unlock threads in real time when evidence is captured
    document.addEventListener('evidence:captured', e => {
      if (!data || !data.items) return;
      data.items.forEach(item => {
        if (item.locked && item.unlockedBy != null && item.unlockedBy === e.detail.evidenceId && !item._unlocked) {
          item._unlocked = true;
          const row = list.querySelector(`.wa-thread[data-id="${item.id}"]`);
          if (row) {
            row.classList.remove('wa-thread-locked');
            const previewEl = row.querySelector('.wa-thread-preview');
            if (previewEl) previewEl.textContent = item.lastMessage;
          }
        }
      });
    });

    if (items.length === 0) {
      list.innerHTML = '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Sin conversaciones</div>';
    }

    container.appendChild(list);
  }

  container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';
  buildMain();
}
