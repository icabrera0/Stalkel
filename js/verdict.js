import { audio } from './audio.js';

export function showVerdict(container, scenario, t, collected, onPlayAgain) {
  // ── Phase 1: Verdict Choice ────────────────────────────────────────────────
  function showChoice() {
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'verdict-screen';
    // Override the CSS semi-transparent bg with a fully opaque dark gradient
    screen.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:200',
      'background:linear-gradient(135deg,#1a1a2e,#16213e)',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'padding:32px 24px',
    ].join(';');

    // Title
    const title = document.createElement('h1');
    title.textContent = t('verdict.title');
    title.style.cssText = [
      'color:white',
      'font-size:28px',
      'font-weight:800',
      'text-align:center',
      'margin:0 0 16px 0',
      'line-height:1.2',
    ].join(';');

    // Evidence count badge
    const badge = document.createElement('div');
    badge.textContent = t('evidence.count', { n: collected.length });
    badge.style.cssText = [
      'display:inline-block',
      'background:rgba(255,255,255,0.15)',
      'color:rgba(255,255,255,0.85)',
      'font-size:13px',
      'font-weight:600',
      'padding:6px 16px',
      'border-radius:20px',
      'margin-bottom:40px',
      'letter-spacing:0.5px',
    ].join(';');

    // Buttons container
    const btns = document.createElement('div');
    btns.className = 'verdict-buttons';
    btns.style.cssText = 'display:flex;gap:16px;justify-content:center;flex-wrap:wrap;';

    // Guilty button
    const guiltyBtn = document.createElement('button');
    guiltyBtn.className = 'btn-verdict btn-guilty';
    guiltyBtn.textContent = t('verdict.guilty');
    guiltyBtn.style.background = 'linear-gradient(135deg,#FF416C,#FF4B2B)';
    guiltyBtn.addEventListener('click', () => { audio.tap(); showReveal('guilty'); });

    // Innocent button
    const innocentBtn = document.createElement('button');
    innocentBtn.className = 'btn-verdict btn-innocent';
    innocentBtn.textContent = t('verdict.innocent');
    innocentBtn.style.background = 'linear-gradient(135deg,#56ab2f,#a8e063)';
    innocentBtn.addEventListener('click', () => { audio.tap(); showReveal('innocent'); });

    btns.appendChild(guiltyBtn);
    btns.appendChild(innocentBtn);

    screen.appendChild(title);
    screen.appendChild(badge);
    screen.appendChild(btns);
    container.appendChild(screen);
  }

  // ── Phase 2: Reveal ────────────────────────────────────────────────────────
  function showReveal(playerChoice) {
    container.innerHTML = '';

    const correct = (playerChoice === scenario.outcome);
    setTimeout(() => correct ? audio.correct() : audio.wrong(), 300);
    const outcome = scenario.outcome;

    // Determine header text
    let headerText;
    if (correct && outcome === 'guilty') {
      headerText = t('reveal.correct_guilty');
    } else if (correct && outcome === 'innocent') {
      headerText = t('reveal.correct_innocent');
    } else if (!correct && outcome === 'innocent') {
      headerText = t('reveal.wrong_guilty');
    } else {
      // !correct && outcome === 'guilty'
      headerText = t('reveal.wrong_innocent');
    }

    // Determine story text
    let storyText;
    if (outcome === 'guilty') {
      storyText = t('reveal.guilty_story', {
        suspect: scenario.suspect.name,
        other: scenario.secretContact.name,
        months: scenario.monthsCheating,
      });
    } else {
      storyText = t('reveal.innocent_story', {
        suspect: scenario.suspect.name,
      });
    }

    // ── Outer screen ──────────────────────────────────────────────────────────
    const screen = document.createElement('div');
    screen.className = 'reveal-screen';
    screen.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:201',
      'background:linear-gradient(135deg,#1a1a2e,#16213e)',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'overflow-y:auto',
      'padding:40px 24px 32px',
    ].join(';');

    // ── Content wrapper ───────────────────────────────────────────────────────
    const content = document.createElement('div');
    content.className = 'reveal-content';
    content.style.cssText = 'width:100%;max-width:480px;margin:0 auto;';

    // Header
    const header = document.createElement('div');
    header.className = 'reveal-verdict ' + outcome;
    header.textContent = headerText;
    header.style.cssText = [
      'font-size:28px',
      'font-weight:800',
      'text-align:center',
      'margin-bottom:16px',
      'line-height:1.3',
      `color:${outcome === 'guilty' ? '#FF6B9D' : '#69DB7C'}`,
    ].join(';');

    // Story paragraph
    const story = document.createElement('p');
    story.className = 'reveal-story';
    story.textContent = storyText;
    story.style.textAlign = 'center';

    content.appendChild(header);
    content.appendChild(story);

    // ── Red herrings (innocent scenario only) ────────────────────────────────
    if (outcome === 'innocent' && scenario.redHerringIds && scenario.redHerringIds.length > 0) {
      const rhTitle = document.createElement('div');
      rhTitle.className = 'reveal-section-title';
      rhTitle.textContent = '💡 ' + (t('verdict.title') === '¿Cuál es tu veredicto?' ? 'Las pistas tenían explicación:' : 'The clues had explanations:');
      rhTitle.style.cssText = [
        'font-size:11px',
        'font-weight:700',
        'text-transform:uppercase',
        'letter-spacing:1px',
        'margin:20px 0 10px',
        'color:rgba(255,255,255,0.65)',
        'text-align:center',
      ].join(';');
      content.appendChild(rhTitle);

      const rhList = document.createElement('div');
      rhList.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:20px;';
      for (const id of scenario.redHerringIds) {
        const rhKey = 'rh.' + id;
        const rhText = t(rhKey, { name: scenario.suspect.name });
        if (!rhText.startsWith('[missing:')) {
          const item = document.createElement('div');
          item.textContent = rhText;
          item.style.cssText = [
            'background:rgba(255,255,255,0.08)',
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:8px',
            'padding:10px 12px',
            'font-size:13px',
            'color:rgba(255,255,255,0.85)',
            'text-align:left',
            'line-height:1.5',
          ].join(';');
          rhList.appendChild(item);
        }
      }
      content.appendChild(rhList);
    }

    // ── "Pruebas que no encontraste" — missed evidence ────────────────────────
    const missedIds = (scenario.realEvidenceIds || []).filter(id => !collected.includes(id));
    if (missedIds.length > 0) {
      const missedTitle = document.createElement('div');
      missedTitle.className = 'reveal-section-title';
      missedTitle.textContent = t('reveal.missed');
      content.appendChild(missedTitle);

      const missedGrid = document.createElement('div');
      missedGrid.className = 'missed-evidence-grid';
      for (const id of missedIds) {
        const card = document.createElement('div');
        card.className = 'missed-evidence-item';
        // Mini-polaroid style: grey
        card.style.cssText = [
          'background:rgba(255,255,255,0.08)',
          'border:1px solid rgba(255,255,255,0.2)',
          'border-radius:8px',
          'padding:10px 8px',
          'font-size:11px',
          'color:rgba(255,255,255,0.7)',
          'text-align:center',
          'line-height:1.3',
        ].join(';');
        const evLabel = t('ev.' + id);
        card.textContent = evLabel.startsWith('[missing:') ? id : evLabel;
        missedGrid.appendChild(card);
      }
      content.appendChild(missedGrid);
    }

    // ── "Lo que encontraste" — found evidence ─────────────────────────────────
    if (collected.length > 0) {
      const foundTitle = document.createElement('div');
      foundTitle.className = 'reveal-section-title';
      foundTitle.textContent = t('reveal.found');
      content.appendChild(foundTitle);

      const foundGrid = document.createElement('div');
      foundGrid.className = 'missed-evidence-grid'; // same 2-col grid
      foundGrid.style.marginBottom = '4px';

      for (const id of collected) {
        const card = document.createElement('div');
        const isReal = (scenario.realEvidenceIds || []).includes(id);
        // Colored for real, slightly dimmer for stray captures
        card.style.cssText = [
          `background:${isReal ? 'rgba(105,219,124,0.15)' : 'rgba(255,107,157,0.12)'}`,
          `border:1px solid ${isReal ? 'rgba(105,219,124,0.35)' : 'rgba(255,107,157,0.3)'}`,
          'border-radius:8px',
          'padding:10px 8px',
          'font-size:11px',
          `color:${isReal ? 'rgba(105,219,124,0.95)' : 'rgba(255,107,157,0.85)'}`,
          'text-align:center',
          'line-height:1.3',
        ].join(';');

        const evKey = 'ev.' + id;
        const evLabel = t(evKey);
        card.textContent = evLabel.startsWith('[missing:') ? '📸 Captura' : evLabel;
        foundGrid.appendChild(card);
      }
      content.appendChild(foundGrid);
    }

    // ── Play again button ─────────────────────────────────────────────────────
    const playAgainBtn = document.createElement('button');
    playAgainBtn.className = 'btn-play-again';
    playAgainBtn.textContent = t('reveal.play_again');
    playAgainBtn.style.cssText = [
      'display:block',
      'margin:28px auto 0',
      'padding:14px 36px',
      'background:linear-gradient(135deg,#FF6B9D,#C77DFF)',
      'border:none',
      'border-radius:24px',
      'color:white',
      'font-weight:700',
      'font-size:15px',
      'cursor:pointer',
      'box-shadow:0 4px 16px rgba(255,107,157,0.4)',
    ].join(';');
    playAgainBtn.addEventListener('click', () => onPlayAgain());

    content.appendChild(playAgainBtn);
    screen.appendChild(content);
    container.appendChild(screen);
  }

  // ── Kick off Phase 1 ───────────────────────────────────────────────────────
  showChoice();
}
