let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.15, delay = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.01);
  } catch (_) { /* AudioContext may be suspended on some browsers */ }
}

function noise(dur, vol = 0.08) {
  try {
    const c = getCtx();
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    src.connect(gain);
    gain.connect(c.destination);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.start();
    src.stop(c.currentTime + dur + 0.01);
  } catch (_) {}
}

export const audio = {
  tap() {
    tone(1100, 0.05, 'sine', 0.09);
  },

  appOpen() {
    tone(520, 0.09, 'sine', 0.10);
    tone(780, 0.07, 'sine', 0.07, 0.07);
  },

  back() {
    tone(680, 0.06, 'sine', 0.09);
    tone(480, 0.05, 'sine', 0.06, 0.05);
  },

  capture() {
    noise(0.018, 0.18);
    tone(1800, 0.04, 'square', 0.04, 0.01);
    tone(700, 0.09, 'sine', 0.05, 0.03);
  },

  boardOpen() {
    tone(380, 0.10, 'sine', 0.10);
    tone(560, 0.09, 'sine', 0.07, 0.07);
    tone(700, 0.10, 'sine', 0.06, 0.13);
  },

  boardClose() {
    tone(600, 0.07, 'sine', 0.08);
    tone(380, 0.07, 'sine', 0.05, 0.06);
  },

  verdict() {
    tone(440, 0.12, 'sine', 0.12);
    tone(554, 0.12, 'sine', 0.10, 0.06);
    tone(659, 0.18, 'sine', 0.14, 0.12);
  },

  correct() {
    tone(523, 0.10, 'sine', 0.13);
    tone(659, 0.10, 'sine', 0.13, 0.10);
    tone(784, 0.22, 'sine', 0.16, 0.20);
  },

  wrong() {
    tone(330, 0.14, 'sine', 0.13);
    tone(220, 0.22, 'sine', 0.10, 0.12);
  },
};
