import { audio } from '../audio.js';
export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function initials(name) {
    const parts = (name || '?').split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return parts[0].charAt(0).toUpperCase();
  }

  function avatarHtml(item) {
    if (item.isUnknown) {
      return `<div class="msg-avatar" style="background:#999;">❓</div>`;
    }
    return `<div class="msg-avatar" style="background:linear-gradient(135deg, #007AFF, #0051D5);">${initials(esc(item.contactName))}</div>`;
  }

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.contactName || 'Mensajes';
  }

  function triggerCapture(item, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, 'Mensajes', detailHtml);
  }

  // ── Message bubble renderer ──────────────────────────────────────────────────

  function renderMessage(msg) {
    const isMe = msg.from === 'me';
    const wrapAlign = isMe ? 'align-items:flex-end;' : 'align-items:flex-start;';
    const bubbleClass = isMe ? 'sms-message sms-message-sent' : 'sms-message sms-message-received';

    const innerHtml = esc(msg.text || '');

    return `<div style="display:flex;flex-direction:column;${wrapAlign}">
      <div class="${bubbleClass}">
        ${innerHtml}
        <div class="sms-message-time">${msg.time || ''}</div>
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
    hdr.style.cssText = 'background:white;color:#007AFF;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;border-bottom:1px solid #f0f0f0;';

    const backBtn = document.createElement('span');
    backBtn.textContent = t('phone.back');
    backBtn.style.cssText = 'cursor:pointer;font-size:14px;user-select:none;flex-shrink:0;';
    backBtn.addEventListener('click', buildMain);

    const nameEl = document.createElement('span');
    nameEl.style.cssText = 'flex:1;font-size:15px;font-weight:600;color:#000;';
    nameEl.textContent = item.isUnknown ? (item.phoneNumber || item.contactName || '') : (item.contactName || '');

    // Chat background area (declare before button that references it)
    const chatArea = document.createElement('div');
    chatArea.style.cssText = 'flex:1;overflow-y:auto;padding:8px 0;background:white;display:flex;flex-direction:column;';

    // Screenshot button (top-right)
    const capBtn = document.createElement('button');
    capBtn.textContent = t('phone.screenshot');
    capBtn.style.cssText = 'background:#007AFF;color:white;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;';
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
    hdr.className = 'app-messages app-header';
    hdr.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;';
    hdr.innerHTML = `<span>Mensajes</span><span style="font-size:18px;">✏️</span>`;
    container.appendChild(hdr);

    // Thread list
    const list = document.createElement('div');
    list.className = 'app-content';
    list.style.cssText = 'flex:1;overflow-y:auto;';

    const items = data.items || [];

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'msg-conversation-item';

      const displayName = item.isUnknown ? (item.phoneNumber || item.contactName || '') : (item.contactName || '');

      row.innerHTML = `
        ${avatarHtml(item)}
        <div class="msg-conversation-content">
          <div class="msg-conversation-header">
            <span class="msg-conversation-name">${esc(displayName)}</span>
            <span class="msg-conversation-time">${esc(item.lastTime || '')}</span>
          </div>
          <div>
            <span class="msg-conversation-preview">${esc(item.lastMessage || '')}</span>
          </div>
        </div>`;

      row.addEventListener('click', () => showDetail(item));
      list.appendChild(row);
    });

    if (items.length === 0) {
      list.innerHTML = '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Sin conversaciones</div>';
    }

    container.appendChild(list);
  }

  container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';
  buildMain();
}
