export function createQuestions(phoneEl, scenario, t) {
  const answered = new Set();
  const notified = new Set();

  function checkUnlock(capturedEvidenceId) {
    if (!scenario.questions) return;
    scenario.questions.forEach(q => {
      if (notified.has(q.id)) return;
      const shouldUnlock =
        q.unlockAfter === null || q.unlockAfter === capturedEvidenceId;
      if (shouldUnlock) {
        notified.add(q.id);
        setTimeout(() => showQuestion(q), 400);
      }
    });
  }

  function showQuestion(q) {
    if (answered.has(q.id)) return;

    const overlay = document.createElement('div');
    overlay.className = 'question-overlay';
    overlay.innerHTML = `
      <div class="question-card">
        <div class="question-title">${t('questions.title')}</div>
        <div class="question-text">${q.question}</div>
        <textarea class="question-input" placeholder="${scenario.lang === 'es' ? 'Tu respuesta…' : 'Your answer…'}" rows="3"></textarea>
        <div class="question-actions">
          <button class="btn-q-skip">${t('questions.skip')}</button>
          <button class="btn-q-submit">${t('questions.submit')}</button>
        </div>
        <div class="question-feedback" style="display:none"></div>
      </div>
    `;
    phoneEl.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const inputEl = overlay.querySelector('.question-input');
    const feedbackEl = overlay.querySelector('.question-feedback');

    function dismiss() {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    }

    overlay.querySelector('.btn-q-skip').addEventListener('click', () => {
      answered.add(q.id);
      dismiss();
    });

    overlay.querySelector('.btn-q-submit').addEventListener('click', () => {
      const answer = inputEl.value.trim().toLowerCase();
      if (!answer) return;
      const correct = q.keywords.some(kw => answer.includes(kw.toLowerCase()));
      feedbackEl.textContent = correct ? t('questions.correct') : t('questions.wrong');
      feedbackEl.style.color = correct ? '#69DB7C' : '#FF6B9D';
      feedbackEl.style.display = 'block';
      answered.add(q.id);
      setTimeout(dismiss, 1400);
    });
  }

  // Unlock Q1 immediately (unlockAfter === null)
  checkUnlock(null);

  return { checkUnlock };
}
