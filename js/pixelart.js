// Pixel art generator — draws 16x16 pixel art scaled to any canvas size.
// Each type has a small seeded RNG for color variation so every photo looks slightly different.

function seededRng(seed) {
  let s = (seed ^ 0x1234567) >>> 0;
  return function () {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

function px(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
}

function fill(ctx, x1, y1, x2, y2, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x1 * size, y1 * size, (x2 - x1 + 1) * size, (y2 - y1 + 1) * size);
}

// ── Skin tone palette (varies by seed) ──────────────────────────────────────
const SKIN = ['#FDBCB4', '#F0A080', '#D4956A', '#C27650', '#8D5524'];
const HAIR = ['#1a1a1a', '#3B2314', '#6B4226', '#A0522D', '#D4A017', '#F5DEB3'];
const SHIRT = ['#4472C4', '#E63946', '#2a9d8f', '#e9c46a', '#C77DFF', '#FF6B9D', '#264653'];

// ── Type renderers ────────────────────────────────────────────────────────────

function drawSelfie(ctx, G, rng) {
  // Background (warm gradient simulation)
  fill(ctx, 0, 0, 15, 15, G, '#FFE0D0');

  // Left face
  const skin1 = SKIN[Math.floor(rng() * SKIN.length)];
  const hair1 = HAIR[Math.floor(rng() * HAIR.length)];
  // Hair
  fill(ctx, 1, 1, 5, 3, G, hair1);
  // Face
  fill(ctx, 1, 3, 5, 7, G, skin1);
  // Eyes
  px(ctx, 2, 4, G, '#333'); px(ctx, 4, 4, G, '#333');
  // Smile
  px(ctx, 2, 6, G, '#c44'); px(ctx, 3, 6, G, '#c44'); px(ctx, 4, 6, G, '#c44');
  // Shirt
  const shirt1 = SHIRT[Math.floor(rng() * SHIRT.length)];
  fill(ctx, 0, 7, 5, 9, G, shirt1);

  // Right face
  const skin2 = SKIN[Math.floor(rng() * SKIN.length)];
  const hair2 = HAIR[Math.floor(rng() * HAIR.length)];
  fill(ctx, 9, 1, 13, 3, G, hair2);
  fill(ctx, 9, 3, 13, 7, G, skin2);
  px(ctx, 10, 4, G, '#333'); px(ctx, 12, 4, G, '#333');
  px(ctx, 10, 6, G, '#c44'); px(ctx, 11, 6, G, '#c44'); px(ctx, 12, 6, G, '#c44');
  const shirt2 = SHIRT[Math.floor(rng() * SHIRT.length)];
  fill(ctx, 9, 7, 15, 9, G, shirt2);

  // Heart between them
  px(ctx, 7, 4, G, '#FF6B9D'); px(ctx, 6, 3, G, '#FF6B9D'); px(ctx, 8, 3, G, '#FF6B9D');
  px(ctx, 6, 4, G, '#FF6B9D'); px(ctx, 8, 4, G, '#FF6B9D');
  px(ctx, 7, 5, G, '#FF6B9D');

  // Bottom strip (warm orange ground)
  fill(ctx, 0, 10, 15, 15, G, '#FFD0B0');
}

function drawFood(ctx, G, rng) {
  // White plate
  fill(ctx, 2, 2, 13, 13, G, '#f8f8f8');
  // Plate border
  ctx.fillStyle = '#e0e0e0';
  for (let i = 2; i <= 13; i++) { px(ctx, i, 2, G, '#ddd'); px(ctx, i, 13, G, '#ddd'); }
  for (let i = 3; i <= 12; i++) { px(ctx, 2, i, G, '#ddd'); px(ctx, 13, i, G, '#ddd'); }

  // Background (tablecloth)
  const tbColors = ['#fff5f5', '#f0f8ff', '#f5fff0'];
  fill(ctx, 0, 0, 15, 15, G, tbColors[Math.floor(rng() * tbColors.length)]);
  // Plate circle (approximate)
  fill(ctx, 3, 3, 12, 12, G, '#f8f8f8');
  // Shadow
  fill(ctx, 3, 13, 12, 14, G, '#e8e8e8');

  // Random food items
  const foods = [
    { x: 5, y: 5, w: 3, h: 2, c: '#e63946' },   // meat/tomato
    { x: 9, y: 5, w: 2, h: 2, c: '#f4a261' },   // pasta/potato
    { x: 5, y: 8, w: 2, h: 2, c: '#2a9d8f' },   // vegetable
    { x: 8, y: 8, w: 3, h: 2, c: '#e9c46a' },   // rice/corn
  ];
  for (const f of foods) fill(ctx, f.x, f.y, f.x + f.w - 1, f.y + f.h - 1, G, f.c);
  // Garnish dots
  px(ctx, 6, 7, G, '#52b788'); px(ctx, 9, 7, G, '#52b788'); px(ctx, 7, 9, G, '#52b788');
}

function drawLandscape(ctx, G, rng) {
  const skyPalettes = [
    ['#87CEEB', '#b0e0ff', '#d4f1ff'],
    ['#FF8C69', '#FFB347', '#FFD700'],  // sunset
    ['#1a1a2e', '#16213e', '#0f3460'],  // night
  ];
  const sky = skyPalettes[Math.floor(rng() * skyPalettes.length)];

  // Sky gradient (simulate with bands)
  for (let y = 0; y < 8; y++) {
    const t = y / 8;
    fill(ctx, 0, y, 15, y, G, y < 4 ? sky[0] : sky[1]);
  }
  // Sun / moon
  fill(ctx, 12, 1, 14, 3, G, sky[2] === '#FFD700' ? '#FFD700' : (rng() > 0.5 ? '#FFE87C' : '#fff'));
  // Distant hills
  fill(ctx, 0, 7, 15, 9, G, '#6aaa64');
  fill(ctx, 0, 6, 5, 7, G, '#5a9954');
  fill(ctx, 10, 6, 15, 7, G, '#5a9954');
  // Ground
  fill(ctx, 0, 9, 15, 15, G, '#4a7c59');
  // Grass detail
  for (let x = 0; x < 16; x += 3) px(ctx, x, 9, G, '#52b788');
  // Tree
  fill(ctx, 5, 4, 7, 6, G, '#2d6a4f');
  px(ctx, 6, 3, G, '#2d6a4f');
  px(ctx, 5, 7, G, '#8B6914');  // trunk
  px(ctx, 6, 7, G, '#8B6914');
}

function drawBeach(ctx, G, rng) {
  // Sky
  fill(ctx, 0, 0, 15, 6, G, '#87CEEB');
  // Sun
  fill(ctx, 12, 1, 14, 3, G, '#FFD700');
  // Sea (two shades)
  fill(ctx, 0, 7, 15, 10, G, '#0077b6');
  fill(ctx, 0, 9, 15, 10, G, '#0096c7');
  // Wave highlights
  for (let x = 0; x < 16; x += 4) px(ctx, x, 9, G, '#90e0ef');
  // Sand
  fill(ctx, 0, 11, 15, 15, G, '#F4E1B0');
  fill(ctx, 0, 10, 15, 11, G, '#e9c46a');
  // Umbrella pole
  px(ctx, 7, 7, G, '#c44'); px(ctx, 7, 8, G, '#c44'); px(ctx, 7, 9, G, '#c44'); px(ctx, 7, 10, G, '#c44');
  // Umbrella canopy
  fill(ctx, 5, 5, 9, 7, G, rng() > 0.5 ? '#e63946' : '#FF6B9D');
  // Beach towel
  fill(ctx, 3, 12, 11, 13, G, '#e9c46a');
}

function drawHotelRoom(ctx, G, rng) {
  // Wall
  fill(ctx, 0, 0, 15, 15, G, '#f5f0e8');
  // Floor
  fill(ctx, 0, 12, 15, 15, G, '#c4a882');
  // Bed frame
  fill(ctx, 1, 7, 14, 11, G, '#8B6914');
  // Mattress
  fill(ctx, 2, 6, 13, 9, G, '#fffef0');
  // Pillows
  fill(ctx, 2, 5, 5, 7, G, '#fff');
  fill(ctx, 9, 5, 12, 7, G, '#fff');
  // Bedcover
  const coverColors = ['#C77DFF', '#FF6B9D', '#74C0FC', '#69DB7C'];
  fill(ctx, 2, 8, 13, 10, G, coverColors[Math.floor(rng() * coverColors.length)]);
  // Nightstand
  fill(ctx, 13, 8, 14, 11, G, '#8B6914');
  px(ctx, 13, 7, G, '#FFD700');  // lamp
  // Window
  fill(ctx, 4, 1, 9, 4, G, '#87CEEB');
  px(ctx, 6, 1, G, '#ccc'); px(ctx, 6, 2, G, '#ccc'); px(ctx, 6, 3, G, '#ccc'); px(ctx, 6, 4, G, '#ccc');
  px(ctx, 4, 2, G, '#ccc'); px(ctx, 5, 2, G, '#ccc'); px(ctx, 7, 2, G, '#ccc'); px(ctx, 8, 2, G, '#ccc'); px(ctx, 9, 2, G, '#ccc');
}

function drawGift(ctx, G, rng) {
  // Background
  fill(ctx, 0, 0, 15, 15, G, '#fff8f0');
  // Box body
  const boxColors = ['#FF6B9D', '#C77DFF', '#FF4757', '#4472C4', '#e63946'];
  const boxColor = boxColors[Math.floor(rng() * boxColors.length)];
  fill(ctx, 3, 7, 12, 14, G, boxColor);
  // Lid
  fill(ctx, 2, 5, 13, 8, G, boxColor);
  // Darker lid edge
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(2 * G, 8 * G, 12 * G, G);
  // Ribbon vertical
  fill(ctx, 7, 5, 8, 14, G, '#FFD700');
  // Ribbon horizontal on lid
  fill(ctx, 2, 6, 13, 7, G, '#FFD700');
  // Bow
  px(ctx, 5, 4, G, '#FFD700'); px(ctx, 6, 3, G, '#FFD700');
  px(ctx, 7, 4, G, '#FFD700'); px(ctx, 8, 4, G, '#FFD700');
  px(ctx, 9, 3, G, '#FFD700'); px(ctx, 10, 4, G, '#FFD700');
  px(ctx, 7, 3, G, '#FFA500');  // bow center
  px(ctx, 8, 3, G, '#FFA500');
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(4 * G, 14 * G, 10 * G, G);
}

function drawPerson(ctx, G, rng) {
  // Outdoor background
  const bgPalettes = ['#87CEEB', '#FFE0D0', '#90EE90'];
  fill(ctx, 0, 0, 15, 15, G, bgPalettes[Math.floor(rng() * bgPalettes.length)]);

  // Single centered person
  const skin = SKIN[Math.floor(rng() * SKIN.length)];
  const hair = HAIR[Math.floor(rng() * HAIR.length)];
  const shirt = SHIRT[Math.floor(rng() * SHIRT.length)];
  // Hair
  fill(ctx, 5, 2, 10, 4, G, hair);
  // Face
  fill(ctx, 5, 4, 10, 8, G, skin);
  // Eyes
  px(ctx, 6, 5, G, '#333'); px(ctx, 9, 5, G, '#333');
  // Smile
  px(ctx, 7, 7, G, '#c44'); px(ctx, 8, 7, G, '#c44'); px(ctx, 9, 7, G, '#c44');
  // Neck
  fill(ctx, 7, 8, 8, 9, G, skin);
  // Shirt/body
  fill(ctx, 4, 9, 11, 13, G, shirt);
  // Arms
  fill(ctx, 2, 9, 4, 11, G, shirt);
  fill(ctx, 11, 9, 13, 11, G, shirt);
  // Hands
  px(ctx, 2, 11, G, skin); px(ctx, 13, 11, G, skin);
}

function drawNight(ctx, G, rng) {
  // Night sky
  fill(ctx, 0, 0, 15, 9, G, '#0f0c29');
  // Stars
  const starPositions = [[1,1],[4,2],[7,0],[11,1],[14,3],[2,4],[9,3],[13,5],[6,6],[3,7]];
  for (const [x, y] of starPositions) px(ctx, x, y, G, rng() > 0.3 ? '#fff' : '#FFD700');
  // Moon
  fill(ctx, 12, 1, 14, 3, G, '#FFE87C');
  px(ctx, 13, 1, G, '#0f0c29'); // crescent
  // Ground / city silhouette
  fill(ctx, 0, 9, 15, 15, G, '#1a1a2e');
  // Buildings
  const bldgs = [[1,6,3],[5,5,2],[8,7,2],[11,6,4]];
  for (const [x, h, w] of bldgs) fill(ctx, x, 9 - h, x + w - 1, 9, G, '#16213e');
  // Lit windows (yellow dots)
  for (let i = 0; i < 8; i++) {
    const wx = Math.floor(rng() * 14) + 1;
    const wy = Math.floor(rng() * 6) + 3;
    if (wx >= 1 && wx <= 14) px(ctx, wx, wy, G, rng() > 0.5 ? '#FFD700' : '#87CEEB');
  }
}

function drawGeneric(ctx, G, rng) {
  const colors = ['#FF6B9D', '#C77DFF', '#74C0FC', '#FFD43B', '#69DB7C', '#FF8C69'];
  // Abstract colorful pixel mosaic
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const c = colors[Math.floor(rng() * colors.length)];
      if (rng() > 0.4) px(ctx, x, y, G, c);
    }
  }
  // Ensure not too sparse — fill background
  ctx.globalAlpha = 0.6;
  fill(ctx, 0, 0, 15, 15, G, colors[Math.floor(rng() * colors.length)]);
  ctx.globalAlpha = 1;
}

// ── Public API ────────────────────────────────────────────────────────────────

const TYPES = {
  selfie: drawSelfie,
  food: drawFood,
  landscape: drawLandscape,
  beach: drawBeach,
  hotel: drawHotelRoom,
  gift: drawGift,
  person: drawPerson,
  night: drawNight,
  generic: drawGeneric,
};

export function createPixelArt(type, seed, size = 80) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const G = Math.floor(size / 16); // pixel grid size
  const rng = seededRng(seed || 42);

  // Background fill
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, size, size);

  const drawFn = TYPES[type] || TYPES.generic;
  drawFn(ctx, G, rng);

  return canvas;
}

export function pixelArtToDataUrl(type, seed, size = 80) {
  return createPixelArt(type, seed, size).toDataURL();
}
