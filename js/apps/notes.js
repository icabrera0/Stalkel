import { audio } from '../audio.js';

export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function nl2br(str) {
    return esc(str).replace(/\n/g, '<br>');
  }

  function triggerCapture(note, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(note.evidenceId, label, 'Notas', detailHtml);
  }

  // ── Locked note view ─────────────────────────────────────────────────────────

  function showLockedNote(note, bodyEl) {
    bodyEl.innerHTML = '';
    bodyEl.style.cssText = 'flex:1;overflow-y:auto;padding:32px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';

    const lockIcon = document.createElement('div');
    lockIcon.textContent = '🔒';
    lockIcon.style.cssText = 'font-size:48px;';
    bodyEl.appendChild(lockIcon);

    const msg = document.createElement('div');
    msg.style.cssText = 'font-size:15px;color:#3c3c43;text-align:center;line-height:1.5;';
    msg.textContent = 'Esta nota está bloqueada. Face ID requerido.';
    bodyEl.appendChild(msg);

    const unlockBtn = document.createElement('button');
    unlockBtn.textContent = 'Desbloquear con Face ID';
    unlockBtn.style.cssText = [
      'background:#FFCC00;color:#000;border:none;border-radius:10px;',
      'padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;',
      'margin-top:8px;',
    ].join('');

    let triedFaceId = false;

    unlockBtn.addEventListener('click', () => {
      if (triedFaceId) return;
      triedFaceId = true;

      // Show spinner briefly
      unlockBtn.textContent = '';
      const spinner = document.createElement('div');
      spinner.style.cssText = [
        'width:16px;height:16px;border:2px solid #000;border-top-color:transparent;',
        'border-radius:50%;animation:noteSpinner 0.6s linear infinite;display:inline-block;',
      ].join('');
      unlockBtn.appendChild(spinner);

      // Inject spinner keyframes once
      if (!document.getElementById('note-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'note-spinner-style';
        style.textContent = '@keyframes noteSpinner { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }

      setTimeout(() => {
        unlockBtn.innerHTML = '';
        unlockBtn.textContent = 'Face ID no reconocido';
        unlockBtn.style.background = '#ff3b30';
        unlockBtn.style.color = 'white';
        unlockBtn.disabled = true;
        unlockBtn.style.opacity = '0.9';
      }, 900);
    });

    bodyEl.appendChild(unlockBtn);
  }

  // ── Note detail view ─────────────────────────────────────────────────────────

  function showDetail(note) {
    container.innerHTML = '';
    const view = document.createElement('div');
    view.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:white;';

    // Header
    const hdr = document.createElement('div');
    hdr.style.cssText = [
      'display:flex;align-items:center;gap:12px;padding:12px 16px;',
      'background:white;border-bottom:1px solid #f0f0f0;flex-shrink:0;',
    ].join('');

    const backBtn = document.createElement('span');
    backBtn.textContent = '‹ Notas';
    backBtn.style.cssText = 'color:#007AFF;font-size:16px;cursor:pointer;user-select:none;flex-shrink:0;';
    backBtn.addEventListener('click', buildMain);

    const titleEl = document.createElement('span');
    titleEl.style.cssText = 'flex:1;font-size:15px;font-weight:600;color:#000;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    titleEl.textContent = note.title;

    const capBtn = document.createElement('button');
    capBtn.textContent = t('phone.screenshot');
    capBtn.style.cssText = 'background:#007AFF;color:white;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;';

    hdr.appendChild(backBtn);
    hdr.appendChild(titleEl);
    hdr.appendChild(capBtn);
    view.appendChild(hdr);

    // Body area
    const bodyEl = document.createElement('div');

    if (note.isLocked) {
      showLockedNote(note, bodyEl);
    } else {
      bodyEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px 20px;';
      bodyEl.innerHTML = `
        <div style="font-size:20px;font-weight:700;color:#000;margin-bottom:6px;">${esc(note.title)}</div>
        <div style="font-size:12px;color:#8e8e93;margin-bottom:16px;">${esc(note.date || '')}</div>
        <div style="font-size:15px;color:#1c1c1e;line-height:1.6;">${nl2br(note.body || '')}</div>
      `;
    }

    view.appendChild(bodyEl);

    capBtn.addEventListener('click', () => {
      triggerCapture(note, note.title, bodyEl.innerHTML);
      capBtn.textContent = t('phone.captured');
      capBtn.style.opacity = '0.7';
      setTimeout(() => {
        capBtn.textContent = t('phone.screenshot');
        capBtn.style.opacity = '1';
      }, 1500);
    });

    container.appendChild(view);
  }

  // ── Main list view ───────────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';
    container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';

    // Notes yellow header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'background:#FFCC00;padding:14px 16px 10px;flex-shrink:0;';

    const items = data.items || [];
    const totalCount = items.length;

    hdr.innerHTML = `
      <div style="font-size:22px;font-weight:700;color:#000;">Notas</div>
      <div style="font-size:13px;color:#3c3c43;margin-top:2px;">${totalCount} nota${totalCount !== 1 ? 's' : ''}</div>
    `;
    container.appendChild(hdr);

    // List
    const listEl = document.createElement('div');
    listEl.style.cssText = 'flex:1;overflow-y:auto;background:white;';

    const pinned = items.filter(n => n.isPinned);
    const unpinned = items.filter(n => !n.isPinned);

    function renderSection(sectionItems, label) {
      if (sectionItems.length === 0) return;

      if (label) {
        const secHdr = document.createElement('div');
        secHdr.style.cssText = 'padding:8px 16px 4px;font-size:12px;font-weight:600;color:#8e8e93;background:#f9f9f9;border-bottom:1px solid #f0f0f0;';
        secHdr.textContent = label;
        listEl.appendChild(secHdr);
      }

      for (const note of sectionItems) {
        const row = document.createElement('div');
        row.style.cssText = [
          'display:flex;align-items:center;gap:10px;',
          'padding:12px 16px;border-bottom:1px solid #f0f0f0;',
          'cursor:pointer;background:white;transition:background 0.12s;',
        ].join('');
        row.addEventListener('mousedown', () => { row.style.background = '#f9f9f9'; });
        row.addEventListener('mouseup', () => { row.style.background = 'white'; });
        row.addEventListener('mouseleave', () => { row.style.background = 'white'; });

        const textBlock = document.createElement('div');
        textBlock.style.cssText = 'flex:1;min-width:0;';
        textBlock.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="font-size:15px;font-weight:700;color:#000;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(note.title)}</span>
            ${note.isLocked ? '<span style="font-size:14px;">🔒</span>' : ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:13px;color:#8e8e93;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${esc(note.preview || '')}</span>
            <span style="font-size:13px;color:#8e8e93;flex-shrink:0;">${esc(note.date || '')}</span>
          </div>
        `;

        row.appendChild(textBlock);
        row.addEventListener('click', () => showDetail(note));
        listEl.appendChild(row);
      }
    }

    if (pinned.length > 0) {
      renderSection(pinned, '📌 Fijadas');
    }
    renderSection(unpinned, pinned.length > 0 ? 'Notas' : null);

    if (items.length === 0) {
      listEl.innerHTML = '<div style="padding:48px 16px;text-align:center;color:#8e8e93;font-size:14px;">Sin notas</div>';
    }

    container.appendChild(listEl);
  }

  buildMain();
}
