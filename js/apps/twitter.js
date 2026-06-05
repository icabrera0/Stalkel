export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(username) {
    return (username || '?').charAt(0).toUpperCase();
  }

  function avatar(username, color, size) {
    const dim = size === 'lg' ? 48 : 40;
    const fs = size === 'lg' ? 18 : 16;
    return `<div class="tw-avatar" style="width:${dim}px;height:${dim}px;font-size:${fs}px;background:${esc(color || '#1da1f2')};">${esc(initials(username))}</div>`;
  }

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.username || 'Twitter';
  }

  function triggerCapture(item, label, detailHtml) {
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, 'Twitter', detailHtml);
  }

  // ── Detail renderers ─────────────────────────────────────────────────────────

  function renderTweetDetail(item) {
    const rtLabel = item.isRetweet
      ? `<div style="font-size:12px;color:#71767b;margin-bottom:8px;">🔁 Retweeted</div>`
      : '';
    const oldLabel = item.isOld
      ? `<div style="font-size:11px;color:#71767b;font-style:italic;margin-top:4px;">Hace ${esc(item.time)} meses</div>`
      : '';
    const locHtml = item.location
      ? `<div style="font-size:12px;color:#1da1f2;margin-top:6px;">📍 ${esc(item.location)}</div>`
      : '';
    return `
      <div style="padding:16px;">
        ${rtLabel}
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
          ${avatar(item.username, item.avatarColor, 'lg')}
          <div>
            <div style="font-size:15px;font-weight:700;color:white;">${esc(item.username)}</div>
            <div style="font-size:13px;color:#71767b;">@${esc(item.username)}</div>
          </div>
        </div>
        <div style="font-size:17px;color:white;line-height:1.5;margin-bottom:12px;">${esc(item.text)}</div>
        ${locHtml}
        <div style="font-size:13px;color:#71767b;margin-top:8px;">${esc(item.time)}${oldLabel}</div>
        <div style="display:flex;gap:24px;margin-top:16px;padding-top:16px;border-top:1px solid #2f3336;color:#71767b;font-size:13px;">
          <span>❤️ <strong style="color:white;">${esc(String(item.likes || 0))}</strong></span>
          <span>🔁 <strong style="color:white;">${esc(String(item.retweets || 0))}</strong></span>
        </div>
      </div>`;
  }

  function renderLikeDetail(item) {
    const replyBubble = item.suspectReply
      ? `<div style="margin-top:12px;padding:10px 12px;background:#16181c;border:1px solid #2f3336;border-radius:12px;font-size:13px;color:white;">
           <div style="font-size:11px;color:#71767b;margin-bottom:4px;">Tu respuesta:</div>
           ${esc(item.suspectReply)}
         </div>`
      : '';
    return `
      <div style="padding:16px;">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
          ${avatar(item.username, item.avatarColor, 'lg')}
          <div>
            <div style="font-size:15px;font-weight:700;color:white;">${esc(item.username)}</div>
            <div style="font-size:13px;color:#71767b;">@${esc(item.username)}</div>
          </div>
        </div>
        <div style="font-size:15px;color:white;line-height:1.5;padding:12px;background:#16181c;border:1px solid #2f3336;border-radius:12px;margin-bottom:8px;">
          ${esc(item.tweetText)}
        </div>
        <div style="font-size:13px;color:#71767b;">❤️ Me gusta · ${esc(item.time)}</div>
        ${replyBubble}
      </div>`;
  }

  function renderFollowingDetail(item) {
    const privateBadge = item.isPrivate
      ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#16181c;border:1px solid #2f3336;padding:3px 8px;border-radius:12px;font-size:12px;color:#71767b;margin-right:6px;">🔒 Privada</span>`
      : '';
    const listBadge = item.inList
      ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#16181c;border:1px solid #1da1f2;padding:3px 8px;border-radius:12px;font-size:12px;color:#1da1f2;">📋 Lista: ${esc(item.inList)}</span>`
      : '';
    const mutualsHtml = item.mutuals && item.mutuals > 0
      ? `<div style="font-size:12px;color:#71767b;margin-top:8px;">👥 ${esc(String(item.mutuals))} amigos en común</div>`
      : '';
    return `
      <div style="display:flex;flex-direction:column;align-items:center;padding:32px 24px;gap:12px;text-align:center;">
        ${avatar(item.username, item.avatarColor, 'lg')}
        <div style="font-size:17px;font-weight:700;color:white;">${esc(item.username)}</div>
        <div style="font-size:13px;color:#71767b;">@${esc(item.username)}</div>
        <div style="font-size:13px;color:white;">${esc(item.bio || '')}</div>
        <div style="font-size:13px;color:#71767b;">${esc(String(item.followers || 0))} seguidores</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:4px;">${privateBadge}${listBadge}</div>
        ${mutualsHtml}
        <div style="margin-top:8px;padding:8px 20px;border:1px solid #536471;border-radius:20px;font-size:14px;font-weight:700;color:white;cursor:pointer;">Siguiendo ✓</div>
      </div>`;
  }

  function renderDmNotifDetail(item) {
    return `
      <div style="padding:16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          ${avatar(item.username, item.avatarColor, 'lg')}
          <div>
            <div style="font-size:15px;font-weight:700;color:white;">${esc(item.username)}</div>
            <div style="font-size:13px;color:#71767b;">@${esc(item.username)}</div>
          </div>
        </div>
        <div style="background:#16181c;border:1px solid #2f3336;border-radius:12px;padding:14px;">
          <div style="font-size:12px;color:#1da1f2;margin-bottom:6px;">💬 Mensaje directo</div>
          <div style="font-size:15px;color:white;">${esc(item.preview)}</div>
        </div>
        <div style="font-size:12px;color:#71767b;margin-top:8px;text-align:center;">Abre la app de Twitter para leer el mensaje completo</div>
      </div>`;
  }

  // ── Detail view (shared shell) ───────────────────────────────────────────────

  function showDetail(item, backFn) {
    container.innerHTML = '';
    const detail = document.createElement('div');
    detail.className = 'app-detail';
    detail.style.cssText = 'display:flex;flex-direction:column;height:100%;background:#000;overflow:hidden;';

    // Back header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;background:#000;border-bottom:1px solid #2f3336;flex-shrink:0;';
    hdr.innerHTML = `<span style="font-size:18px;color:white;cursor:pointer;user-select:none;">${t('phone.back')}</span><span style="font-size:15px;font-weight:700;color:white;">Tweet</span>`;
    hdr.querySelector('span').addEventListener('click', backFn);
    detail.appendChild(hdr);

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;background:#000;';

    if (item.subtype === 'tweet') {
      content.innerHTML = renderTweetDetail(item);
    } else if (item.subtype === 'like') {
      content.innerHTML = renderLikeDetail(item);
    } else if (item.subtype === 'following') {
      content.innerHTML = renderFollowingDetail(item);
    } else if (item.subtype === 'dm_notif') {
      content.innerHTML = renderDmNotifDetail(item);
    }

    detail.appendChild(content);

    // Capture button
    const capBtn = document.createElement('div');
    capBtn.style.cssText = 'flex-shrink:0;padding:12px 16px;background:#000;border-top:1px solid #2f3336;';
    capBtn.innerHTML = `<button class="tw-capture-btn" style="width:100%;padding:12px;background:#1da1f2;color:white;border:none;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;">${t('phone.screenshot')}</button>`;

    const btn = capBtn.querySelector('.tw-capture-btn');
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

  // ── Card renderers (for list view) ───────────────────────────────────────────

  function buildTweetCard(item) {
    const card = document.createElement('div');
    card.className = 'tw-tweet';

    const rtLabel = item.isRetweet
      ? `<div style="font-size:11px;color:#71767b;margin-bottom:6px;padding-left:52px;">🔁 Retweeted</div>`
      : '';
    const locHtml = item.location
      ? `<div style="font-size:12px;color:#1da1f2;margin-top:4px;">📍 ${esc(item.location)}</div>`
      : '';
    const oldLabel = item.isOld
      ? `<span style="font-size:11px;color:#71767b;font-style:italic;margin-left:4px;">(Hace ${esc(item.time)} meses)</span>`
      : '';

    card.innerHTML = `
      ${rtLabel}
      <div class="tw-tweet-header">
        ${avatar(item.username, item.avatarColor, 'md')}
        <div class="tw-tweet-meta">
          <div class="tw-tweet-author">
            <span class="tw-author-name">${esc(item.username)}</span>
            <span class="tw-author-handle">@${esc(item.username)}</span>
            <span class="tw-author-time">${esc(item.time)}${oldLabel}</span>
          </div>
          <div class="tw-tweet-text">${esc(item.text)}${locHtml}</div>
          <div class="tw-tweet-actions">
            <span class="tw-action-item"><span class="tw-action-icon">💬</span><span class="tw-action-count">0</span></span>
            <span class="tw-action-item"><span class="tw-action-icon">🔁</span><span class="tw-action-count">${esc(String(item.retweets || 0))}</span></span>
            <span class="tw-action-item"><span class="tw-action-icon">❤️</span><span class="tw-action-count">${esc(String(item.likes || 0))}</span></span>
          </div>
        </div>
      </div>`;

    card.addEventListener('click', () => showDetail(item, buildMain));
    return card;
  }

  function buildLikeCard(item) {
    const card = document.createElement('div');
    card.className = 'tw-tweet';

    const replyBubble = item.suspectReply
      ? `<div style="margin-top:8px;padding:8px 10px;background:#16181c;border:1px solid #2f3336;border-radius:8px;font-size:12px;color:white;">${esc(item.suspectReply)}</div>`
      : '';

    card.innerHTML = `
      <div class="tw-tweet-header">
        ${avatar(item.username, item.avatarColor, 'md')}
        <div class="tw-tweet-meta">
          <div class="tw-tweet-author">
            <span class="tw-author-name">${esc(item.username)}</span>
            <span class="tw-author-handle">@${esc(item.username)}</span>
            <span class="tw-author-time">${esc(item.time)}</span>
          </div>
          <div class="tw-tweet-text" style="font-style:italic;color:#e7e9ea;">${esc(item.tweetText)}</div>
          ${replyBubble}
          <div style="font-size:11px;color:#71767b;margin-top:8px;">❤️ Le has dado me gusta</div>
        </div>
      </div>`;

    card.addEventListener('click', () => showDetail(item, buildMain));
    return card;
  }

  function buildFollowingCard(item) {
    const card = document.createElement('div');
    card.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #2f3336;cursor:pointer;transition:background 0.15s;';

    const privateBadge = item.isPrivate
      ? `<span style="font-size:11px;color:#71767b;">🔒</span>`
      : '';
    const listBadge = item.inList
      ? `<span style="background:#16181c;border:1px solid #1da1f2;padding:2px 6px;border-radius:10px;font-size:11px;color:#1da1f2;">📋 Lista: ${esc(item.inList)}</span>`
      : '';
    const mutualsBadge = item.mutuals && item.mutuals > 0
      ? `<span style="font-size:11px;color:#71767b;">👥 ${esc(String(item.mutuals))} en común</span>`
      : '';

    card.innerHTML = `
      ${avatar(item.username, item.avatarColor, 'md')}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px;">
          <span style="font-size:14px;font-weight:700;color:white;">${esc(item.username)}</span>
          ${privateBadge}
          ${listBadge}
        </div>
        <div style="font-size:12px;color:#71767b;margin-bottom:2px;">@${esc(item.username)} · ${esc(String(item.followers || 0))} seguidores</div>
        <div style="font-size:12px;color:#e7e9ea;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(item.bio || '')}</div>
        ${mutualsBadge ? `<div style="margin-top:2px;">${mutualsBadge}</div>` : ''}
      </div>`;

    card.addEventListener('click', () => showDetail(item, buildMain));
    return card;
  }

  // ── Build main view ──────────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'app-header';
    hdr.innerHTML = `<span class="tw-header-icon">🐦</span><span style="font-size:16px;font-weight:700;">Twitter</span>`;
    container.appendChild(hdr);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;background:#000;border-bottom:1px solid #2f3336;flex-shrink:0;';

    const tabLabels = ['Para ti', 'Siguiendo', 'Likes', 'Cuentas'];
    const tabEls = [];
    tabLabels.forEach((label, i) => {
      const tab = document.createElement('div');
      tab.style.cssText = 'flex:1;text-align:center;padding:12px 4px;font-size:13px;font-weight:600;color:#71767b;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;';
      tab.textContent = label;
      tabEls.push(tab);
      tabBar.appendChild(tab);
    });
    container.appendChild(tabBar);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'app-content';
    contentArea.style.cssText = 'flex:1;overflow-y:auto;background:#000;';
    container.appendChild(contentArea);

    // Segment items
    const items = data.items || [];
    const tweetItems = items.filter(i => i.subtype === 'tweet');
    const followingItems = items.filter(i => i.subtype === 'tweet' && !i.isRetweet);
    const likeItems = items.filter(i => i.subtype === 'like');
    const accountItems = items.filter(i => i.subtype === 'following');
    const dmNotifItem = items.find(i => i.subtype === 'dm_notif');

    // ── Para ti tab ──────────────────────────────────────────────────────────
    const paraSection = document.createElement('div');
    paraSection.dataset.section = '0';

    // DM notification banner
    if (dmNotifItem) {
      const banner = document.createElement('div');
      banner.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;background:#1da1f2;cursor:pointer;';
      banner.innerHTML = `
        ${avatar(dmNotifItem.username, dmNotifItem.avatarColor, 'md')}
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:white;">💬 ${esc(dmNotifItem.username)}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.85);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(dmNotifItem.preview)}</div>
        </div>`;
      banner.addEventListener('click', () => showDetail(dmNotifItem, buildMain));
      paraSection.appendChild(banner);
    }

    tweetItems.forEach(item => {
      paraSection.appendChild(buildTweetCard(item));
    });

    if (tweetItems.length === 0 && !dmNotifItem) {
      paraSection.innerHTML = '<div style="padding:32px;text-align:center;color:#71767b;font-size:13px;">No hay tweets</div>';
    }

    // ── Siguiendo tab ─────────────────────────────────────────────────────────
    const siguSection = document.createElement('div');
    siguSection.dataset.section = '1';
    siguSection.style.display = 'none';

    followingItems.forEach(item => {
      siguSection.appendChild(buildTweetCard(item));
    });

    if (followingItems.length === 0) {
      siguSection.innerHTML = '<div style="padding:32px;text-align:center;color:#71767b;font-size:13px;">No hay tweets de cuentas que sigues</div>';
    }

    // ── Likes tab ─────────────────────────────────────────────────────────────
    const likesSection = document.createElement('div');
    likesSection.dataset.section = '2';
    likesSection.style.display = 'none';

    likeItems.forEach(item => {
      likesSection.appendChild(buildLikeCard(item));
    });

    if (likeItems.length === 0) {
      likesSection.innerHTML = '<div style="padding:32px;text-align:center;color:#71767b;font-size:13px;">Sin me gustas recientes</div>';
    }

    // ── Cuentas tab ───────────────────────────────────────────────────────────
    const cuentasSection = document.createElement('div');
    cuentasSection.dataset.section = '3';
    cuentasSection.style.display = 'none';

    accountItems.forEach(item => {
      cuentasSection.appendChild(buildFollowingCard(item));
    });

    if (accountItems.length === 0) {
      cuentasSection.innerHTML = '<div style="padding:32px;text-align:center;color:#71767b;font-size:13px;">Sin cuentas seguidas</div>';
    }

    contentArea.appendChild(paraSection);
    contentArea.appendChild(siguSection);
    contentArea.appendChild(likesSection);
    contentArea.appendChild(cuentasSection);

    // ── Tab switching ─────────────────────────────────────────────────────────
    const sections = [paraSection, siguSection, likesSection, cuentasSection];

    function activateTab(idx) {
      tabEls.forEach((el, i) => {
        const active = i === idx;
        el.style.color = active ? 'white' : '#71767b';
        el.style.borderBottomColor = active ? '#1da1f2' : 'transparent';
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
