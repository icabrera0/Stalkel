export function createHints(phoneEl, scenario, t, getCollected) {
  let remaining = 3;

  const hintMap = buildHintMap(scenario.lang);

  function buildHintMap(lang) {
    const es = lang === 'es';
    return {
      ig_dm_unknown:      es ? 'Instagram → revisa los mensajes directos' : 'Instagram → check the direct messages',
      ig_likes_cluster:   es ? 'Instagram → mira la actividad de likes' : 'Instagram → check the likes activity',
      ig_story_view:      es ? 'Instagram → busca en las historias vistas' : 'Instagram → look at story views',
      ig_follow_private:  es ? 'Instagram → hay una cuenta privada sospechosa' : 'Instagram → there is a suspicious private account',
      ig_comment_flirty:  es ? 'Instagram → revisa los comentarios recientes' : 'Instagram → check recent comments',
      ig_search_history:  es ? 'Instagram → revisa el historial de búsqueda' : 'Instagram → check the search history',
      ig_tagged_wrong_place: es ? 'Instagram → revisa las etiquetas de ubicación' : 'Instagram → check location tags',
      ig_blocked_account: es ? 'Instagram → hay contenido oculto' : 'Instagram → there is hidden content',
      wa_contact_alias:   es ? 'WhatsApp → examina todos los contactos de cerca' : 'WhatsApp → examine all contacts closely',
      wa_deleted_msgs:    es ? 'WhatsApp → hay mensajes eliminados' : 'WhatsApp → there are deleted messages',
      wa_miss_you:        es ? 'WhatsApp → busca mensajes de números desconocidos' : 'WhatsApp → look for messages from unknown numbers',
      wa_location_shared: es ? 'WhatsApp → revisa las ubicaciones compartidas' : 'WhatsApp → check shared locations',
      wa_emoji_heavy:     es ? 'WhatsApp → hay una conversación sospechosa' : 'WhatsApp → there is a suspicious conversation',
      wa_voice_note_unknown: es ? 'WhatsApp → hay una nota de voz sin abrir' : 'WhatsApp → there is an unopened voice note',
      wa_confession:      es ? 'WhatsApp → revisa las notificaciones visibles' : 'WhatsApp → check the visible notifications',
      rv_hotel:           es ? 'Revolut → hay un cargo de hotel sospechoso' : 'Revolut → there is a suspicious hotel charge',
      rv_dinner_2:        es ? 'Revolut → busca cenas en restaurantes' : 'Revolut → look for restaurant dinners',
      rv_flowers:         es ? 'Revolut → hay un cargo en una floristería' : 'Revolut → there is a florist charge',
      rv_gift:            es ? 'Revolut → hay un cargo en una joyería' : 'Revolut → there is a jewellery store charge',
      rv_airbnb:          es ? 'Revolut → hay una reserva de Airbnb sospechosa' : 'Revolut → there is a suspicious Airbnb booking',
      rv_lingerie:        es ? 'Revolut → hay una compra de lencería' : 'Revolut → there is a lingerie purchase',
      rv_cash_withdrawals: es ? 'Revolut → hay retiradas de efectivo repetidas' : 'Revolut → there are repeated cash withdrawals',
      rv_uber_unknown:    es ? 'Revolut → hay viajes en Uber a una dirección desconocida' : 'Revolut → Uber trips to an unknown address',
      gm_wrong_home:      es ? 'Mapas → comprueba la dirección de "Casa"' : 'Maps → check the "Home" saved address',
      gm_alibi_route:     es ? 'Mapas → revisa el historial de ubicaciones' : 'Maps → review location timeline',
      gm_restaurant_saved: es ? 'Mapas → hay un restaurante guardado sospechoso' : 'Maps → there is a suspicious saved restaurant',
      gm_hotel_search:    es ? 'Mapas → hay búsquedas de hotel recientes' : 'Maps → there are recent hotel searches',
      gm_frequent_unknown: es ? 'Mapas → hay una ubicación visitada frecuentemente' : 'Maps → there is a frequently visited location',
      gm_shared_location: es ? 'Mapas → hay una ubicación compartida en vivo' : 'Maps → there is a live shared location',
      gal_deleted_bin:    es ? 'Galería → hay fotos en la papelera — recupéralas' : 'Gallery → there are photos in the trash — recover them',
      gal_photo_unknown_girl: es ? 'Galería → busca fotos recientes sospechosas' : 'Gallery → look at recent suspicious photos',
      gal_hotel_room:     es ? 'Galería → hay una foto de habitación de hotel' : 'Gallery → there is a hotel room photo',
      gal_gift_unwrapped: es ? 'Galería → hay una foto de un regalo' : 'Gallery → there is a photo of a gift',
      gal_screenshot_convo: es ? 'Galería → hay capturas de conversaciones' : 'Gallery → there are conversation screenshots',
    };
  }

  function getNextHint() {
    const collected = getCollected();
    const uncollected = (scenario.realEvidenceIds || []).filter(id => !collected.includes(id));
    if (uncollected.length === 0) {
      return scenario.lang === 'es'
        ? '¡Ya tienes toda la evidencia! Es hora del veredicto.'
        : 'You have all the evidence! Time for the verdict.';
    }
    const nextId = uncollected[0];
    return hintMap[nextId] ?? (scenario.lang === 'es'
      ? 'Sigue explorando las apps con atención.'
      : 'Keep exploring the apps carefully.');
  }

  function showHint() {
    if (remaining <= 0) {
      showHintOverlay(t('hints.empty'), true);
      return;
    }
    remaining--;
    updateBtn();
    showHintOverlay(getNextHint(), false);
  }

  function showHintOverlay(text, isEmpty) {
    const existing = phoneEl.querySelector('.hint-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'hint-overlay';
    overlay.innerHTML = `
      <div class="hint-card">
        <div class="hint-title">${t('hints.title')}</div>
        <div class="hint-text">${text}</div>
        <button class="btn-hint-close">${t('hints.close')}</button>
      </div>
    `;
    phoneEl.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.querySelector('.btn-hint-close').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 250);
    });
  }

  function updateBtn() {
    const btn = document.getElementById('btn-hints');
    if (!btn) return;
    btn.textContent = remaining > 0 ? `\u{1F4A1} ${remaining}` : '\u{1F4A1}';
    btn.disabled = remaining <= 0;
  }

  return { showHint, updateBtn };
}
