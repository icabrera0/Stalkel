export function render(container, data, scenario, t, onCapture) {
  container.innerHTML = `
    <div class="app-header app-contacts-header">
      <span>${t('app.contacts')}</span>
      <span class="contacts-count">${data.items.length}</span>
    </div>
    <div class="contacts-search">
      <input type="text" placeholder="${t('contacts.search_placeholder')}" class="contacts-search-input" readonly>
    </div>
    <div class="contacts-list" id="contacts-list-${Date.now()}"></div>
    <div class="contacts-detail" id="contacts-detail-${Date.now()}" style="display:none"></div>
  `;

  const listEl = container.querySelector('.contacts-list');
  const detailEl = container.querySelector('.contacts-detail');

  function renderList() {
    listEl.innerHTML = data.items.map(item => `
      <div class="contact-row" data-id="${item.id}">
        <div class="contact-avatar" style="background:${item.avatarColor}">
          ${item.name.charAt(0).toUpperCase()}
        </div>
        <div class="contact-info">
          <div class="contact-name">${item.name}</div>
          ${item.relation ? `<div class="contact-relation">${item.relation}</div>` : ''}
        </div>
        ${item.isSuspicious ? '<span class="contact-suspicious-dot"></span>' : ''}
      </div>
    `).join('');

    listEl.querySelectorAll('.contact-row').forEach(row => {
      row.addEventListener('click', () => {
        const item = data.items.find(c => c.id === row.dataset.id);
        showDetail(item);
      });
    });
  }

  function showDetail(item) {
    const detailHtml = `
      <div class="contact-detail-avatar" style="background:${item.avatarColor}">
        ${item.name.charAt(0).toUpperCase()}
      </div>
      <div class="contact-detail-name">${item.name}</div>
      ${item.relation ? `<div class="contact-detail-relation">${item.relation}</div>` : ''}
      <div class="contact-detail-phone">${item.phone}</div>
      ${item.isSuspicious ? `<div class="contact-detail-note">⚠️ ${t('locked.hint').replace('🔒 Bloqueado — ', '').replace('🔒 Locked — ', '')}</div>` : ''}
    `;

    detailEl.innerHTML = `
      <div class="contact-detail-header">
        <button class="contacts-back">← ${t('phone.back')}</button>
      </div>
      ${detailHtml}
      <button class="btn-capture-contact">📸 ${t('phone.screenshot')}</button>
    `;
    detailEl.style.display = 'block';
    listEl.style.display = 'none';

    detailEl.querySelector('.contacts-back').addEventListener('click', () => {
      detailEl.style.display = 'none';
      listEl.style.display = 'block';
    });

    detailEl.querySelector('.btn-capture-contact').addEventListener('click', () => {
      const evId = item.evidenceId || null;
      const label = evId ? t('ev.' + evId) : item.name;
      onCapture(evId, label, t('app.contacts'), detailHtml);
    });
  }

  renderList();
}
