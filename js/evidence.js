const APP_EMOJIS = {
  instagram: '📱',
  whatsapp: '💬',
  revolut: '💳',
  twitter: '🐦',
  maps: '📍',
  gallery: '📷',
  messages: '💬',
};

function extractPreviewInfo(detailHtml) {
  // Try to extract background color from a style attribute
  let bgColor = '#f0f0f0';
  const bgMatch = detailHtml && detailHtml.match(/background:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|linear-gradient\([^;}"]+\))/);
  if (bgMatch) {
    bgColor = bgMatch[1];
  }

  // Try to extract imageEmoji — look for data-image-emoji or imageEmoji pattern in HTML
  let emoji = null;
  const emojiMatch = detailHtml && detailHtml.match(/data-image-emoji="([^"]+)"/);
  if (emojiMatch) {
    emoji = emojiMatch[1];
  }

  return { bgColor, emoji };
}

function getAppEmoji(appName) {
  if (!appName) return '📱';
  const key = appName.toLowerCase();
  return APP_EMOJIS[key] || '📱';
}

function randomRot() {
  // Random rotation between -1.5 and 1.5 degrees
  return (Math.random() * 3 - 1.5).toFixed(2);
}

export function createEvidenceBoard(phoneEl, scenario, t) {
  const collected = new Set();   // evidenceIds (non-null)
  const allItems = [];           // all added items including null-id ones

  // --- Inject overlay HTML if not already present ---
  let overlay = phoneEl.querySelector('.evidence-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'evidence-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="color:white; margin:0; font-size:16px;">🗂️ ${t('evidence.title')}</h3>
        <button class="evidence-close-btn" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
      </div>
      <div class="polaroid-grid"></div>
      <div class="evidence-empty" style="color:white; text-align:center; padding:40px 20px; display:none;">
        📸 ${t('evidence.empty').replace('\n', '<br>')}
      </div>
      <button class="evidence-verdict-btn" style="display:none; margin: 16px auto; padding:12px 24px; background:linear-gradient(135deg,#FF6B9D,#C77DFF); color:white; border:none; border-radius:25px; font-size:14px; font-weight:700; cursor:pointer; width:80%;">
        ${t('evidence.verdict_btn')}
      </button>
    `;
    phoneEl.appendChild(overlay);
  }

  const grid = overlay.querySelector('.polaroid-grid');
  const emptyState = overlay.querySelector('.evidence-empty');
  const verdictBtn = overlay.querySelector('.evidence-verdict-btn');
  const closeBtn = overlay.querySelector('.evidence-close-btn');

  closeBtn.addEventListener('click', () => hide());

  // Track verdict callback
  let _onVerdict = null;
  verdictBtn.addEventListener('click', () => {
    if (_onVerdict) _onVerdict();
  });

  function _updateEmptyState() {
    if (allItems.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }
  }

  function add(evidenceId, label, appName, detailHtml) {
    // Deduplicate by evidenceId when not null
    if (evidenceId !== null && evidenceId !== undefined) {
      if (collected.has(evidenceId)) return;
      collected.add(evidenceId);
    }

    allItems.push({ evidenceId, label, appName, detailHtml });

    // Extract preview info from detailHtml
    const { bgColor, emoji: extractedEmoji } = extractPreviewInfo(detailHtml || '');
    const displayEmoji = extractedEmoji || getAppEmoji(appName);

    const rot = randomRot();

    const polaroid = document.createElement('div');
    polaroid.className = 'polaroid';
    polaroid.style.setProperty('--rot', `${rot}deg`);
    polaroid.innerHTML = `
      <div class="polaroid-preview" style="background:${bgColor}; display:flex; align-items:center; justify-content:center; font-size:32px;">
        ${displayEmoji}
      </div>
      <div class="polaroid-label">${label || ''}</div>
      <div style="font-size:9px; color:#888; text-align:center; margin-top:2px;">${appName || ''}</div>
    `;

    grid.appendChild(polaroid);
    _updateEmptyState();

    // Show verdict button once there's at least one item
    verdictBtn.style.display = 'block';

    // Flash the evidence button
    const btnEvidence = phoneEl.querySelector('.btn-evidence');
    if (btnEvidence) {
      btnEvidence.style.transition = 'transform 0.15s';
      btnEvidence.style.transform = 'scale(1.3)';
      setTimeout(() => {
        btnEvidence.style.transform = 'scale(1)';
      }, 200);
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
