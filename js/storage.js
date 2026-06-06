const KEY = 'stalkie_progress';

export function saveProgress(seed, lang, capturedIds) {
  localStorage.setItem(KEY, JSON.stringify({ seed, lang, capturedIds }));
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.seed || !data.lang) return null;
    return data; // { seed, lang, capturedIds: string[] }
  } catch {
    return null;
  }
}

export function clearProgress() {
  localStorage.removeItem(KEY);
}
