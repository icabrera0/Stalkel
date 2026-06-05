import { generateScenario } from './generator.js';
import { createI18n } from './i18n.js';
import { createPhone } from './phone.js';
import { createEvidenceBoard } from './evidence.js';
import { showVerdict } from './verdict.js';
import * as Instagram from './apps/instagram.js';
import * as WhatsApp from './apps/whatsapp.js';
import * as Revolut from './apps/revolut.js';
import * as Twitter from './apps/twitter.js';
import * as Maps from './apps/maps.js';
import * as Gallery from './apps/gallery.js';
import * as Messages from './apps/messages.js';

const APPS = {
  instagram: Instagram,
  whatsapp: WhatsApp,
  revolut: Revolut,
  twitter: Twitter,
  maps: Maps,
  gallery: Gallery,
  messages: Messages,
};

const appEl = document.getElementById('app');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLang() {
  return localStorage.getItem('stalkie_lang') || 'es';
}

function setLang(lang) {
  localStorage.setItem('stalkie_lang', lang);
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function showMenu(appEl, lang) {
  const phoneWrap = appEl.querySelector('.phone-wrap');
  if (phoneWrap) phoneWrap.style.display = 'none';

  const menuScreen = appEl.querySelector('.menu-screen');
  menuScreen.style.display = '';

  const t = createI18n(lang);

  menuScreen.innerHTML = `
    <div class="menu-content">
      <div class="menu-title" style="
        font-size: 3rem;
        font-weight: 900;
        background: linear-gradient(135deg, #FF6B9D, #C77DFF, #FF6B6B);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -1px;
        margin-bottom: 8px;
      ">Stalkie</div>
      <div class="menu-subtitle" style="
        color: rgba(255,255,255,0.75);
        font-size: 1rem;
        margin-bottom: 32px;
        font-style: italic;
      ">${t('menu.subtitle')}</div>
      <div class="lang-btns" style="
        display: flex;
        gap: 12px;
        margin-bottom: 36px;
        justify-content: center;
      ">
        <button class="btn-lang${lang === 'es' ? ' active' : ''}" data-lang="es" style="
          padding: 8px 20px;
          border-radius: 20px;
          border: 2px solid ${lang === 'es' ? '#FF6B9D' : 'rgba(255,255,255,0.3)'};
          background: ${lang === 'es' ? 'linear-gradient(135deg,#FF6B9D,#C77DFF)' : 'transparent'};
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        ">Español</button>
        <button class="btn-lang${lang === 'en' ? ' active' : ''}" data-lang="en" style="
          padding: 8px 20px;
          border-radius: 20px;
          border: 2px solid ${lang === 'en' ? '#FF6B9D' : 'rgba(255,255,255,0.3)'};
          background: ${lang === 'en' ? 'linear-gradient(135deg,#FF6B9D,#C77DFF)' : 'transparent'};
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        ">English</button>
      </div>
      <button class="btn-play" style="
        padding: 16px 48px;
        border-radius: 50px;
        border: none;
        background: linear-gradient(135deg, #FF6B9D, #C77DFF);
        color: white;
        font-size: 1.2rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(255,107,157,0.4);
        letter-spacing: 0.5px;
        transition: transform 0.15s, box-shadow 0.15s;
      ">${t('menu.play')}</button>
    </div>
  `;

  // Language buttons
  menuScreen.querySelectorAll('.btn-lang').forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      setLang(newLang);
      showMenu(appEl, newLang);
    });
  });

  // Play button hover + click
  const playBtn = menuScreen.querySelector('.btn-play');
  playBtn.addEventListener('mouseenter', () => {
    playBtn.style.transform = 'scale(1.05)';
    playBtn.style.boxShadow = '0 12px 32px rgba(255,107,157,0.6)';
  });
  playBtn.addEventListener('mouseleave', () => {
    playBtn.style.transform = 'scale(1)';
    playBtn.style.boxShadow = '0 8px 24px rgba(255,107,157,0.4)';
  });
  playBtn.addEventListener('click', () => startIntro(lang, appEl));
}

// ── Intro ─────────────────────────────────────────────────────────────────────

function startIntro(lang, appEl) {
  const seed = Date.now();
  const scenario = generateScenario(seed, lang);
  const t = createI18n(lang);

  // Hide menu
  appEl.querySelector('.menu-screen').style.display = 'none';

  // Inject bounce keyframes once
  if (!document.getElementById('intro-keyframes')) {
    const style = document.createElement('style');
    style.id = 'intro-keyframes';
    style.textContent = `
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
      }
    `;
    document.head.appendChild(style);
  }

  // Create intro container
  const introEl = document.createElement('div');
  introEl.className = 'intro-screen';
  introEl.style.cssText = `
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, #0f0f1a 0%, #1a0a2e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    overflow: hidden;
  `;
  appEl.appendChild(introEl);

  // Phase 1: Instagram-like notification toast slides in from top
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 16px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(340px, 90vw);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    transition: top 0.5s cubic-bezier(0.34,1.56,0.64,1);
  `;
  toast.innerHTML = `
    <div style="
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #833AB4, #E1306C, #F77737);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    ">📷</div>
    <div>
      <div style="font-weight: 700; font-size: 13px; color: #111;">Instagram</div>
      <div style="font-size: 12px; color: #555; margin-top: 2px;">${t('intro.dm_preview')}</div>
    </div>
  `;
  introEl.appendChild(toast);

  // Slide toast in (double rAF to allow initial paint)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.top = '24px';
    });
  });

  // After 1 second slide the toast out and expand into DM chat
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
      showDMChat(introEl, scenario, t, () => {
        // Fade out intro then start game
        introEl.style.transition = 'opacity 0.5s';
        introEl.style.opacity = '0';
        setTimeout(() => {
          introEl.remove();
          startGame(scenario, t, appEl);
        }, 500);
      });
    }, 300);
  }, 1200);
}

function showDMChat(introEl, scenario, t, onAccept) {
  const girlfriendName = (scenario.girlfriend && scenario.girlfriend.name) || 'Valentina';
  const girlfriendUsername = girlfriendName.toLowerCase().replace(/\s+/g, '_') + '_xo';

  const chat = document.createElement('div');
  chat.style.cssText = `
    width: min(380px, 92vw);
    display: flex;
    flex-direction: column;
    height: min(580px, 88vh);
    background: #121212;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
  `;

  chat.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #1a0a2e, #2d1b4e);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    ">
      <div style="
        width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
        background: linear-gradient(135deg, #FF6B9D, #C77DFF);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; font-weight: bold; color: white;
      ">${girlfriendName.charAt(0)}</div>
      <div>
        <div style="color: white; font-weight: 700; font-size: 15px;">${girlfriendName}</div>
        <div style="color: rgba(255,255,255,0.5); font-size: 11px;">@${girlfriendUsername}</div>
      </div>
      <div style="margin-left:auto; width:8px; height:8px; border-radius:50%; background:#4CAF50;"></div>
    </div>
    <div class="chat-messages" style="
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    "></div>
    <div class="chat-accept-area" style="
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: none;
      justify-content: center;
    ">
      <button class="btn-accept" style="
        width: 100%;
        padding: 14px;
        border-radius: 25px;
        border: none;
        background: linear-gradient(135deg, #FF6B9D, #C77DFF);
        color: white;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(255,107,157,0.4);
        transition: transform 0.15s;
      ">${t('intro.accept')}</button>
    </div>
  `;

  introEl.appendChild(chat);

  const messagesEl = chat.querySelector('.chat-messages');
  const acceptArea = chat.querySelector('.chat-accept-area');
  const acceptBtn = chat.querySelector('.btn-accept');

  const messages = [
    t('intro.msg1'),
    t('intro.msg2', { name: scenario.suspect.name }),
    t('intro.msg3'),
  ];

  function addTypingIndicator() {
    const typing = document.createElement('div');
    typing.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.08);
      border-radius: 18px 18px 18px 4px;
      width: fit-content;
    `;
    typing.innerHTML = `
      <span style="width:7px;height:7px;border-radius:50%;background:#FF6B9D;animation:bounce 1s infinite 0s;display:inline-block;"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:#FF6B9D;animation:bounce 1s infinite 0.2s;display:inline-block;"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:#FF6B9D;animation:bounce 1s infinite 0.4s;display:inline-block;"></span>
    `;
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return typing;
  }

  function addMessage(text) {
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.92);
      border-radius: 18px 18px 18px 4px;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.5;
      max-width: 82%;
      word-break: break-word;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.3s, transform 0.3s;
    `;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
      });
    });
  }

  // Sequentially show typing → message for each line (700ms typing, 400ms gap)
  let delay = 300;
  messages.forEach((msg, i) => {
    setTimeout(() => {
      const typing = addTypingIndicator();
      setTimeout(() => {
        typing.remove();
        addMessage(msg);
        if (i === messages.length - 1) {
          // Show accept button after last message
          setTimeout(() => {
            acceptArea.style.display = 'flex';
          }, 400);
        }
      }, 700);
    }, delay);
    delay += 1100;
  });

  acceptBtn.addEventListener('mouseenter', () => { acceptBtn.style.transform = 'scale(1.03)'; });
  acceptBtn.addEventListener('mouseleave', () => { acceptBtn.style.transform = 'scale(1)'; });
  acceptBtn.addEventListener('click', onAccept);
}

// ── Game ──────────────────────────────────────────────────────────────────────

function startGame(scenario, t, appEl) {
  // Show phone, hide menu and any leftover intro
  appEl.querySelector('.menu-screen').style.display = 'none';
  const phoneWrap = appEl.querySelector('.phone-wrap');
  phoneWrap.style.display = '';

  // Status bar time — update every 30s
  const statusTime = appEl.querySelector('.status-time');
  function updateTime() {
    if (statusTime) statusTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  updateTime();
  setInterval(updateTime, 30000);

  const phoneEl = appEl.querySelector('.phone');

  // Evidence board (phoneEl = .phone)
  const board = createEvidenceBoard(phoneEl, scenario, t);

  // Evidence button → show board → verdict on callback
  const btnEvidence = appEl.querySelector('.btn-evidence');
  btnEvidence.addEventListener('click', () => {
    board.show(() => {
      board.hide();
      showVerdict(appEl, scenario, t, board.getCollected(), () => location.reload());
    });
  });

  // Phone controller (container = appEl, which has .screen / .btn-back / .home-screen)
  const onCapture = (id, label, appName, html) => board.add(id, label, appName, html);
  const phone = createPhone(appEl, scenario, t, onCapture);

  // App icon clicks
  appEl.querySelectorAll('.app-icon[data-app]').forEach(icon => {
    icon.addEventListener('click', () => {
      const dataApp = icon.dataset.app;
      if (APPS[dataApp]) {
        phone.openApp(dataApp, APPS[dataApp]);
      }
    });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

showMenu(appEl, getLang());
