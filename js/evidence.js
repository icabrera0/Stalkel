import { audio } from './audio.js';

const APP_EMOJIS = {
  instagram: '📱', whatsapp: '💬', revolut: '💳',
  twitter: '🐦', maps: '📍', gallery: '📷', messages: '💬',
};

function extractPreviewInfo(html) {
  let bgColor = '#f0f0f0';
  const bgMatch = html && html.match(/background:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|linear-gradient\([^;}"]+\))/);
  if (bgMatch) bgColor = bgMatch[1];
  let emoji = null;
  const emojiMatch = html && html.match(/data-image-emoji="([^"]+)"/);
  if (emojiMatch) emoji = emojiMatch[1];
  return { bgColor, emoji };
}

function getAppEmoji(appName) {
  if (!appName) return '📱';
  return APP_EMOJIS[appName.toLowerCase()] || '📱';
}

function randomRot() {
  return (Math.random() * 3 - 1.5).toFixed(2);
}

export function createEvidenceBoard(phoneEl, scenario, t) {
  const collected = new Set();
  const allItems = [];

  let overlay = phoneEl.querySelector('.evidence-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'evidence-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h3 style="color:white;margin:0;font-size:15px;font-weight:700;letter-spacing:-0.3px;">📸 ${t('evidence.title')}</h3>
        <button class="evidence-close-btn" style="background:rgba(255,255,255,0.15);border:none;color:white;font-size:16px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>
      <div class="polaroid-grid"></div>
      <div class="evidence-empty" style="color:rgba(255,255,255,0.7);text-align:center;padding:40px 20px;display:none;font-size:13px;line-height:1.6;">
        📸 ${t('evidence.empty').replace('\n', '<br>')}
      </div>
      <button class="evidence-verdict-btn" style="display:none;margin:16px auto;padding:14px 24px;background:linear-gradient(135deg,#FF6B9D,#C77DFF);color:white;border:none;border-radius:25px;font-size:14px;font-weight:700;cursor:pointer;width:85%;box-shadow:0 4px 14px rgba(255,107,157,0.4);">
        ${t('evidence.verdict_btn')}
      </button>
    `;
    phoneEl.appendChild(overlay);
  }

  const grid = overlay.querySelector('.polaroid-grid');
  const emptyState = overlay.querySelector('.evidence-empty');
  const verdictBtn = overlay.querySelector('.evidence-verdict-btn');
  const closeBtn = overlay.querySelector('.evidence-close-btn');

  closeBtn.addEventListener('click', () => { audio.boardClose(); hide(); });

  let _onVerdict = null;
  verdictBtn.addEventListener('click', () => {
    audio.verdict();
    if (_onVerdict) _onVerdict();
  });

  function _updateEmptyState() {
    emptyState.style.display = allItems.length === 0 ? 'block' : 'none';
  }

  function _updateBadge() {
    const badge = document.querySelector('.evidence-badge');
    if (!badge) return;
    const count = allItems.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function add(evidenceId, label, appName, detailHtml) {
    if (evidenceId !== null && evidenceId !== undefined) {
      if (collected.has(evidenceId)) return;
      collected.add(evidenceId);
    }

    allItems.push({ evidenceId, label, appName, detailHtml });

    const { bgColor, emoji: extractedEmoji } = extractPreviewInfo(detailHtml || '');
    const displayEmoji = extractedEmoji || getAppEmoji(appName);
    const rot = randomRot();

    const polaroid = document.createElement('div');
    polaroid.className = 'polaroid';
    polaroid.style.setProperty('--rot', `${rot}deg`);
    polaroid.innerHTML = `
      <div class="polaroid-preview" style="background:${bgColor};display:flex;align-items:center;justify-content:center;font-size:30px;">
        ${displayEmoji}
      </div>
      <div class="polaroid-label">${label || ''}</div>
      <div style="font-size:8px;color:#999;text-align:center;margin-top:1px;">${appName || ''}</div>
    `;

    grid.appendChild(polaroid);
    _updateEmptyState();
    _updateBadge();

    // Show verdict button after first capture
    if (allItems.length === 1) {
      verdictBtn.style.display = 'block';
    }

    // Pulse the evidence button
    const btnEvidence = document.querySelector('.btn-evidence');
    if (btnEvidence) {
      btnEvidence.style.transition = 'transform 0.15s';
      btnEvidence.style.transform = 'scale(1.35)';
      setTimeout(() => { btnEvidence.style.transform = 'scale(1)'; }, 220);
    }
  }

  function show(onVerdict) {
    _onVerdict = onVerdict || null;
    overlay.style.display = 'block';
    _updateEmptyState();
  }

  function hide() {
    overlay.style.display = 'none';
  }

  function getCollected() {
    return Array.from(collected);
  }

  function getCount() {
    return allItems.length;
  }

  return { add, show, hide, getCollected, getCount };
}
