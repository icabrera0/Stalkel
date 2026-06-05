export function photoUrl(seedStr, size = 390) {
  return `https://picsum.photos/seed/${encodeURIComponent(String(seedStr))}/${size}/${size}`;
}

// Styled photo cards for evidence items where content must be unambiguous.
// Returns a <div> element, or null if the evidenceId has no special treatment.
const EVIDENCE_CONFIGS = {
  gal_hotel_room: {
    bg: 'linear-gradient(160deg,#3d2b1f 0%,#8b6914 100%)',
    emoji: '🛏️', labelKey: 'caption',
  },
  gal_photo_unknown_girl: {
    bg: 'linear-gradient(160deg,#c2185b 0%,#8e24aa 100%)',
    emoji: '🤳', labelKey: 'caption',
  },
  gal_gift_unwrapped: {
    bg: 'linear-gradient(160deg,#1a0533 0%,#6a1b9a 100%)',
    emoji: '💍', labelKey: 'caption',
  },
  gal_screenshot_convo: {
    bg: 'linear-gradient(160deg,#1b5e20 0%,#2e7d32 100%)',
    emoji: '💬', labelKey: 'caption',
  },
  gal_deleted_bin: {
    bg: 'linear-gradient(160deg,#212121 0%,#424242 100%)',
    emoji: '🗑️', label: 'Eliminada',
  },
  ig_comment_flirty: {
    bg: 'linear-gradient(180deg,#0288d1 0%,#26c6da 60%,#80deea 100%)',
    emoji: '☀️', subEmoji: '👙🌊', label: null,
  },
  ig_tagged_wrong_place: {
    bg: 'linear-gradient(160deg,#6d1a00 0%,#b71c1c 100%)',
    emoji: '🍷', subEmoji: '🕯️', label: null,
  },
};

export function evidencePhotoEl(evidenceId, caption) {
  const cfg = EVIDENCE_CONFIGS[evidenceId];
  if (!cfg) return null;

  const label = cfg.label !== undefined ? cfg.label : (cfg.labelKey === 'caption' ? caption : null);

  const el = document.createElement('div');
  el.style.cssText = [
    'width:100%;height:100%;',
    `background:${cfg.bg};`,
    'display:flex;flex-direction:column;',
    'align-items:center;justify-content:center;',
    'position:relative;overflow:hidden;',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif;',
  ].join('');

  const mainEmoji = document.createElement('div');
  mainEmoji.style.cssText = 'font-size:54px;line-height:1.1;text-align:center;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.4));z-index:1;';
  mainEmoji.textContent = cfg.emoji;
  el.appendChild(mainEmoji);

  if (cfg.subEmoji) {
    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:28px;margin-top:4px;z-index:1;';
    sub.textContent = cfg.subEmoji;
    el.appendChild(sub);
  }

  if (label) {
    const lbl = document.createElement('div');
    lbl.style.cssText = [
      'z-index:1;color:rgba(255,255,255,0.93);',
      'font-size:12px;font-weight:600;',
      'margin-top:12px;text-align:center;',
      'padding:4px 12px;',
      'background:rgba(0,0,0,0.38);border-radius:12px;',
      'max-width:80%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    ].join('');
    lbl.textContent = label;
    el.appendChild(lbl);
  }

  return el;
}
