import { audio } from '../audio.js';
import { photoUrl, evidencePhotoEl } from '../photos.js';

export function render(container, data, scenario, t, onCapture) {
  if (!data || !data.items) return;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function initials(username) {
    return (username || '?').charAt(0).toUpperCase();
  }

  function avatar(username, color, size = 'sm') {
    const dim = size === 'lg' ? 48 : 32;
    const fs = size === 'lg' ? 18 : 14;
    return `<div class="ig-avatar" style="width:${dim}px;height:${dim}px;font-size:${fs}px;background:${color || '#C77DFF'};">${initials(username)}</div>`;
  }

  function captureLabel(item) {
    if (item.evidenceId) return t('ev.' + item.evidenceId);
    return item.username || 'Instagram';
  }

  function triggerCapture(item, label, detailHtml) {
    audio.capture();
    const flash = document.querySelector('.camera-flash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }
    onCapture(item.evidenceId, label, 'Instagram', detailHtml);
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
    hdr.style.cssText = 'background:white;flex-shrink:0;';
    hdr.innerHTML = `<span class="detail-back">${t('phone.back')}</span><span class="detail-title">${item.username || ''}</span>`;
    hdr.querySelector('.detail-back').addEventListener('click', backFn);
    detail.appendChild(hdr);

    // Content
    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;background:#fff;';

    let bodyHtml = '';

    if (item.subtype === 'dm_thread') {
      bodyHtml = renderDMDetail(item);
    } else if (item.subtype === 'feed_post') {
      bodyHtml = renderFeedDetail(item);
    } else if (item.subtype === 'story_view') {
      bodyHtml = renderStoryDetail(item);
    } else if (item.subtype === 'liked_posts') {
      bodyHtml = renderLikedDetail(item);
    } else if (item.subtype === 'search_history') {
      bodyHtml = renderSearchDetail(item);
    } else if (item.subtype === 'following') {
      bodyHtml = renderFollowingDetail(item);
    }

    content.innerHTML = bodyHtml;
    // Replace feed image placeholders with evidence card or real photos
    content.querySelectorAll('.ig-feed-image').forEach(el => {
      const evCard = evidencePhotoEl(el.dataset.evidenceid || '', null);
      if (evCard) {
        el.appendChild(evCard);
      } else {
        const img = document.createElement('img');
        img.src = photoUrl(el.dataset.seed || 'ig_fallback');
        img.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;display:block;';
        img.loading = 'lazy';
        el.appendChild(img);
      }
    });
    detail.appendChild(content);

    // Capture button
    const capBtn = document.createElement('div');
    capBtn.style.cssText = 'flex-shrink:0;padding:12px 16px;background:#fff;border-top:1px solid #efefef;';
    capBtn.innerHTML = `<button class="ig-capture-btn" style="width:100%;padding:12px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">${t('phone.screenshot')}</button>`;

    const btn = capBtn.querySelector('.ig-capture-btn');
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

  // ── Sub-renderers for detail views ───────────────────────────────────────────

  function renderDMDetail(item) {
    const isOldBadge = item.isOld ? `<div style="text-align:center;padding:8px 16px;font-size:11px;color:#999;font-style:italic;">— conversación antigua —</div>` : '';
    const blockedBadge = item.blocked ? `<div style="text-align:center;padding:12px 16px;font-size:12px;color:#ff4757;background:#fff0f0;margin:8px 16px;border-radius:8px;">🔒 Esta cuenta te ha bloqueado</div>` : '';
    const msgs = (item.messages || []).map(msg => {
      const isMe = msg.from === 'me';
      const bubbleStyle = isMe
        ? 'background:linear-gradient(135deg,#f09433,#bc1888);color:white;align-self:flex-end;margin-left:auto;'
        : 'background:#f0f0f0;color:#000;';
      return `<div style="display:flex;flex-direction:column;margin:4px 16px;">
        <div style="${bubbleStyle}padding:10px 12px;border-radius:${isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};font-size:13px;line-height:1.4;max-width:80%;">
          ${msg.text}
          <div style="font-size:10px;color:${isMe ? 'rgba(255,255,255,0.7)' : '#999'};text-align:right;margin-top:4px;">${msg.time}</div>
        </div>
      </div>`;
    }).join('');
    return `${isOldBadge}${blockedBadge}<div style="padding:8px 0;display:flex;flex-direction:column;gap:4px;">${msgs}</div>`;
  }

  function renderFeedDetail(item) {
    const locHtml = item.location ? `<div style="font-size:11px;color:#666;margin-top:2px;">📍 ${item.location}</div>` : '';
    const commentHtml = item.suspectComment ? `<div style="padding:4px 16px 8px;font-size:13px;"><span style="font-weight:600;">${item.username}</span> ${item.suspectComment}</div>` : '';
    return `
      <div class="ig-item-header">
        ${avatar(item.username, item.avatarColor, 'sm')}
        <div class="ig-item-info">
          <div class="ig-item-username">${item.username}</div>
          ${locHtml}
        </div>
        <span style="font-size:18px;color:#000;">⋯</span>
      </div>
      <div class="ig-feed-image" data-seed="${item.id || 'ig'}" data-evidenceid="${item.evidenceId || ''}" style="width:100%;aspect-ratio:1;overflow:hidden;"></div>
      <div class="ig-item-actions">
        <span class="ig-item-action">🤍</span>
        <span class="ig-item-action">💬</span>
        <span class="ig-item-action">✈️</span>
      </div>
      <div class="ig-item-likes">${item.likes || 0} likes</div>
      <div class="ig-item-caption"><span class="ig-item-caption-username">${item.username}</span> ${item.caption || ''}</div>
      ${commentHtml}
      <div class="ig-item-timestamp">${item.timeAgo || ''}</div>
    `;
  }

  function renderStoryDetail(item) {
    if (item.blocked) {
      return `
        <div style="display:flex;flex-direction:column;align-items:center;padding:40px 24px;gap:16px;text-align:center;">
          ${avatar(item.username, item.avatarColor, 'lg')}
          <div style="font-weight:600;font-size:15px;">@${item.username}</div>
          <div style="font-size:36px;">🔒</div>
          <div style="font-size:13px;color:#666;">bloqueado del highlight</div>
          <div style="font-size:12px;color:#999;">Este usuario te ha eliminado de sus highlights</div>
        </div>`;
    }
    const privateBadge = item.isPrivate ? `<div style="font-size:12px;color:#666;margin-top:4px;">🔒 Cuenta privada</div>` : '';
    return `
      <div style="display:flex;flex-direction:column;align-items:center;padding:40px 24px;gap:16px;text-align:center;">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#f09433,#bc1888);padding:3px;display:flex;align-items:center;justify-content:center;">
          ${avatar(item.username, item.avatarColor, 'lg')}
        </div>
        <div style="font-weight:600;font-size:15px;">@${item.username}</div>
        ${privateBadge}
        <div style="font-size:13px;color:#666;">Ha visto tu historia hace ${item.time}</div>
      </div>`;
  }

  function renderLikedDetail(item) {
    const savedBadge = item.isSaved ? `<span style="margin-left:8px;font-size:12px;color:#666;">🔖 Guardado</span>` : '';
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid #efefef;">
        ${avatar(item.username, item.avatarColor, 'lg')}
        <div>
          <div style="font-weight:600;font-size:14px;">@${item.username} ${savedBadge}</div>
          <div style="font-size:13px;color:#666;margin-top:4px;">Le ha dado me gusta a <strong>${item.postCount}</strong> fotos</div>
          <div style="font-size:12px;color:#999;margin-top:2px;">Hace ${item.timeAgo}</div>
        </div>
      </div>
      <div style="padding:16px;font-size:13px;color:#444;line-height:1.6;">
        La actividad muestra ${item.postCount} interacciones en el perfil de @${item.username} en los últimos días.
      </div>`;
  }

  function renderSearchDetail(item) {
    const rows = Array.from({ length: Math.min(item.searchCount || 5, 8) }, (_, i) => {
      const daysAgo = Math.max(1, (item.searchCount || 5) - i);
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #f5f5f5;">
        <span style="font-size:16px;">🔍</span>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:500;">@${item.username}</div>
          <div style="font-size:11px;color:#999;">Hace ${daysAgo}d</div>
        </div>
        <span style="font-size:12px;color:#bbb;">↗</span>
      </div>`;
    }).join('');
    return `
      <div style="padding:12px 16px;font-size:13px;font-weight:600;color:#000;border-bottom:1px solid #efefef;">Historial de búsqueda</div>
      ${rows}`;
  }

  function renderFollowingDetail(item) {
    const privateBadge = item.isPrivate ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#f0f0f0;padding:3px 8px;border-radius:12px;font-size:12px;color:#444;margin-top:6px;">🔒 Cuenta privada</div>` : '';
    const listBadge = item.inList ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#e8f4f8;padding:3px 8px;border-radius:12px;font-size:12px;color:#1da1f2;margin-top:6px;margin-left:6px;">📋 Lista: ${item.inList}</div>` : '';
    const mutualsHtml = item.mutuals !== undefined && item.mutuals > 0 ? `<div style="font-size:12px;color:#999;margin-top:6px;">👥 ${item.mutuals} amigos en común</div>` : '';
    return `
      <div style="display:flex;flex-direction:column;align-items:center;padding:32px 24px;gap:12px;text-align:center;">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#f09433,#bc1888);padding:3px;display:flex;align-items:center;justify-content:center;">
          ${avatar(item.username, item.avatarColor, 'lg')}
        </div>
        <div style="font-weight:700;font-size:16px;">@${item.username}</div>
        <div style="font-size:13px;color:#666;">${item.bio || ''}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">${privateBadge}${listBadge}</div>
        ${mutualsHtml}
        <div style="margin-top:8px;padding:8px 20px;border:1px solid #dbdbdb;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Siguiendo ✓</div>
      </div>`;
  }

  // ── Build main view ──────────────────────────────────────────────────────────

  function buildMain() {
    container.innerHTML = '';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'app-header';
    hdr.style.cssText = 'font-style:italic;flex-shrink:0;';
    hdr.textContent = 'Instagram';
    container.appendChild(hdr);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;background:#fff;border-bottom:1px solid #dbdbdb;flex-shrink:0;';

    const tabs = ['Feed', 'DMs', 'Actividad'];
    const tabEls = [];
    tabs.forEach((label, i) => {
      const tab = document.createElement('div');
      tab.style.cssText = 'flex:1;text-align:center;padding:10px 0;font-size:13px;font-weight:600;color:#999;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;';
      tab.textContent = label;
      tab.dataset.tab = i;
      tabEls.push(tab);
      tabBar.appendChild(tab);
    });
    container.appendChild(tabBar);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'app-content';
    contentArea.style.cssText = 'flex:1;overflow-y:auto;';
    container.appendChild(contentArea);

    // Segment items
    const items = data.items || [];
    const feedItems = items.filter(i => i.subtype === 'feed_post');
    const dmItems = items.filter(i => i.subtype === 'dm_thread');
    const activityItems = items.filter(i => ['story_view', 'liked_posts', 'search_history', 'following'].includes(i.subtype));

    // ── Feed tab ─────────────────────────────────────────────────────────────
    const feedSection = document.createElement('div');
    feedSection.dataset.section = '0';

    // Story row (from feed_post avatars)
    const storyBar = document.createElement('div');
    storyBar.className = 'ig-story-list';
    feedItems.slice(0, 5).forEach(fi => {
      const si = document.createElement('div');
      si.className = 'ig-story-item';
      si.innerHTML = `
        <div class="ig-story-avatar" style="background:${fi.avatarColor || '#C77DFF'};">${initials(fi.username)}</div>
        <div class="ig-story-name">${fi.username}</div>`;
      storyBar.appendChild(si);
    });
    feedSection.appendChild(storyBar);

    feedItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'ig-feed-item';
      const locHtml = item.location ? `<div class="ig-item-location">📍 ${item.location}</div>` : '';
      const commentHtml = item.suspectComment ? `<div class="ig-item-comments"><span style="font-weight:600;">${item.username}</span> ${item.suspectComment}</div>` : '';
      card.innerHTML = `
        <div class="ig-item-header">
          ${avatar(item.username, item.avatarColor, 'sm')}
          <div class="ig-item-info">
            <div class="ig-item-username">${item.username}</div>
            ${locHtml}
          </div>
          <span style="font-size:18px;color:#000;cursor:pointer;">⋯</span>
        </div>
        <div class="ig-item-image" data-id="${item.id}" style="width:100%;aspect-ratio:1;overflow:hidden;background:#f0f0f0;"></div>
        <div class="ig-item-actions">
          <span class="ig-item-action">🤍</span>
          <span class="ig-item-action">💬</span>
          <span class="ig-item-action">✈️</span>
        </div>
        <div class="ig-item-likes">${item.likes || 0} Me gusta</div>
        <div class="ig-item-caption"><span class="ig-item-caption-username">${item.username}</span> ${item.caption || ''}</div>
        ${commentHtml}
        <div class="ig-item-timestamp">${item.timeAgo || ''}</div>`;
      card.style.cursor = 'pointer';
      // Replace image placeholder with evidence card or real photo
      const imgDiv = card.querySelector('.ig-item-image');
      if (imgDiv) {
        const evCard = evidencePhotoEl(item.evidenceId, item.caption);
        if (evCard) {
          imgDiv.appendChild(evCard);
        } else {
          const img = document.createElement('img');
          img.src = photoUrl(item.id || 'ig_filler');
          img.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;display:block;';
          img.loading = 'lazy';
          imgDiv.appendChild(img);
        }
      }
      card.addEventListener('click', () => showDetail(item, buildMain));
      feedSection.appendChild(card);
    });

    if (feedItems.length === 0) {
      feedSection.innerHTML += '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">No hay publicaciones</div>';
    }

    // ── DMs tab ──────────────────────────────────────────────────────────────
    const dmSection = document.createElement('div');
    dmSection.dataset.section = '1';
    dmSection.style.display = 'none';

    // DM header bar
    const dmHeader = document.createElement('div');
    dmHeader.style.cssText = 'padding:12px 16px;border-bottom:1px solid #efefef;display:flex;justify-content:space-between;align-items:center;';
    dmHeader.innerHTML = `<span style="font-size:15px;font-weight:700;">Mensajes directos</span><span style="font-size:20px;cursor:pointer;">✏️</span>`;
    dmSection.appendChild(dmHeader);

    dmItems.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f5f5f5;cursor:pointer;transition:background 0.15s;';
      const isOldHint = item.isOld ? `<span style="font-size:10px;color:#aaa;margin-left:4px;">(antigua)</span>` : '';
      const blockedHint = item.blocked ? `<span style="font-size:10px;color:#ff4757;margin-left:4px;">bloqueada</span>` : '';
      row.innerHTML = `
        ${avatar(item.username, item.avatarColor, 'lg')}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:13px;font-weight:600;">@${item.username}${isOldHint}${blockedHint}</span>
            <span style="font-size:11px;color:#999;">${item.time || ''}</span>
          </div>
          <div style="font-size:12px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.preview || ''}</div>
        </div>`;
      row.addEventListener('click', () => showDetail(item, buildMain));
      dmSection.appendChild(row);
    });

    if (dmItems.length === 0) {
      dmSection.innerHTML += '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Sin mensajes directos</div>';
    }

    // ── Activity tab ─────────────────────────────────────────────────────────
    const actSection = document.createElement('div');
    actSection.dataset.section = '2';
    actSection.style.display = 'none';

    const actHeader = document.createElement('div');
    actHeader.style.cssText = 'padding:12px 16px;border-bottom:1px solid #efefef;';
    actHeader.innerHTML = `<span style="font-size:15px;font-weight:700;">Actividad reciente</span>`;
    actSection.appendChild(actHeader);

    activityItems.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f5f5f5;cursor:pointer;';

      let icon = '👁️';
      let mainText = '';
      let subText = '';

      if (item.subtype === 'story_view') {
        icon = item.blocked ? '🔒' : '👁️';
        mainText = `@${item.username}`;
        subText = item.blocked ? 'bloqueado del highlight' : `vio tu historia hace ${item.time}`;
        if (item.isPrivate) subText += ' · cuenta privada';
      } else if (item.subtype === 'liked_posts') {
        icon = item.isSaved ? '🔖' : '❤️';
        mainText = `@${item.username}`;
        subText = `Le ha dado me gusta a ${item.postCount} fotos · hace ${item.timeAgo}`;
      } else if (item.subtype === 'search_history') {
        icon = '🔍';
        mainText = `@${item.username}`;
        subText = `Buscado ${item.searchCount} veces · hace ${item.timeAgo}`;
      } else if (item.subtype === 'following') {
        icon = '👤';
        mainText = `@${item.username}`;
        const listText = item.inList ? ` · Lista: ${item.inList}` : '';
        subText = (item.isPrivate ? '🔒 Privada' : 'Pública') + (item.mutuals !== undefined && item.mutuals > 0 ? ` · ${item.mutuals} en común` : '') + listText;
      }

      row.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;">${mainText}</div>
          <div style="font-size:12px;color:#666;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${subText}</div>
        </div>
        ${avatar(item.username, item.avatarColor, 'sm')}`;

      row.addEventListener('click', () => showDetail(item, buildMain));
      actSection.appendChild(row);
    });

    if (activityItems.length === 0) {
      actSection.innerHTML += '<div style="padding:32px;text-align:center;color:#999;font-size:13px;">Sin actividad reciente</div>';
    }

    contentArea.appendChild(feedSection);
    contentArea.appendChild(dmSection);
    contentArea.appendChild(actSection);

    // ── Tab switching ─────────────────────────────────────────────────────────
    const sections = [feedSection, dmSection, actSection];
    function activateTab(idx) {
      tabEls.forEach((el, i) => {
        const active = i === idx;
        el.style.color = active ? '#000' : '#999';
        el.style.borderBottomColor = active ? '#000' : 'transparent';
        el.style.borderBottomWidth = '2px';
        el.style.borderBottomStyle = 'solid';
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
