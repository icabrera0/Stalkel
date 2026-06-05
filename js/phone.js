import { audio } from './audio.js';

export function createPhone(container, scenario, t, onCapture) {
  let currentApp = null;

  const screenEl = container.querySelector('.screen');
  const backBtn = container.querySelector('.btn-back');
  const homeScreen = container.querySelector('.home-screen');

  function showHome() {
    if (currentApp) {
      screenEl.querySelector('.app-view.active')?.classList.remove('active');
      currentApp = null;
    }
    homeScreen.style.display = 'grid';
    backBtn.classList.remove('visible');
  }

  function openApp(name, AppModule) {
    homeScreen.style.display = 'none';
    backBtn.classList.add('visible');
    currentApp = name;

    let appView = screenEl.querySelector(`.app-view[data-app="${name}"]`);
    if (!appView) {
      appView = document.createElement('div');
      appView.className = `app-view app-${name}`;
      appView.dataset.app = name;
      screenEl.appendChild(appView);
      AppModule.render(appView, scenario.appContent[name], scenario, t, onCapture);
    }
    // Slide in
    requestAnimationFrame(() => appView.classList.add('active'));
  }

  backBtn.addEventListener('click', () => { audio.back(); showHome(); });

  return { showHome, openApp };
}
