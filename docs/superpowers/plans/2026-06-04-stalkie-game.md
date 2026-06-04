# Stalkie Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based procedurally generated detective game where the player investigates a fake phone to discover if a boyfriend is cheating.

**Architecture:** Pure static HTML/CSS/JS (ES modules). Seeded RNG drives a scenario generator populating 7 fake apps with cross-referenced evidence. Phone is a CSS smartphone frame. Evidence captured via tap→detail→screenshot mechanic onto a corkboard board. Spanish default + English switchable.

**Tech Stack:** Vanilla JS ES modules, CSS custom properties, Bun (tests only — `bun test`), GitHub Actions → GitHub Pages.

**Push to GitHub after every commit:** `git push` at end of every task.

---

## File Structure

```
index.html                   # Shell: menu, phone frame, overlays
css/style.css                # Phone frame, global, menu, evidence board, verdict
css/apps.css                 # Per-app themes (IG gradient, WA green, etc.)
js/rng.js                    # createRNG(seed) — mulberry32
js/i18n.js                   # createI18n(lang), POOLS
js/generator.js              # generateScenario(seed, lang)
js/phone.js                  # createPhone(el, scenario, t, onCapture)
js/apps/instagram.js         # render(container, data, scenario, t, onCapture)
js/apps/whatsapp.js          # same interface
js/apps/revolut.js           # same interface
js/apps/twitter.js           # same interface
js/apps/maps.js              # same interface
js/apps/gallery.js           # same interface
js/apps/messages.js          # same interface
js/evidence.js               # createEvidenceBoard(scenario, t)
js/verdict.js                # showVerdict(container, scenario, t, collected, onPlayAgain)
js/main.js                   # Entry point — menu, intro, wires everything
tests/rng.test.js
tests/i18n.test.js
tests/generator.test.js
.github/workflows/deploy.yml
```

---

## Task 1: Scaffold

**Files:** `package.json`, `index.html`, all empty JS/CSS stubs, `.github/workflows/deploy.yml` stub

- [ ] Create `package.json`:
```json
{
  "name": "stalkie",
  "private": true,
  "type": "module",
  "scripts": { "test": "bun test" }
}
```

- [ ] Create `index.html` shell:
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Stalkie</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/apps.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] Create empty stubs for every file in the file structure above (each JS file exports at minimum an empty function with the correct name)
- [ ] `git add -A && git commit -m "feat: project scaffold" && git push`

---

## Task 2: RNG Module

**Files:** `js/rng.js`, `tests/rng.test.js`

- [ ] Write `tests/rng.test.js`:
```js
import { test, expect } from 'bun:test';
import { createRNG } from '../js/rng.js';

test('same seed same sequence', () => {
  const a = createRNG(42), b = createRNG(42);
  expect(a.next()).toBe(b.next());
  expect(a.next()).toBe(b.next());
});
test('different seeds different values', () => {
  expect(createRNG(1).next()).not.toBe(createRNG(2).next());
});
test('nextInt in range', () => {
  const rng = createRNG(99);
  for (let i = 0; i < 100; i++) {
    const v = rng.nextInt(1, 6);
    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThanOrEqual(6);
  }
});
test('pick returns element from array', () => {
  const arr = ['a','b','c'];
  const v = createRNG(7).pick(arr);
  expect(arr).toContain(v);
});
test('shuffle returns same elements', () => {
  const arr = [1,2,3,4,5];
  const shuffled = createRNG(3).shuffle(arr);
  expect(shuffled.sort()).toEqual([1,2,3,4,5]);
});
```

- [ ] Run `bun test tests/rng.test.js` — expect FAIL (not implemented)

- [ ] Implement `js/rng.js`:
```js
export function createRNG(seed) {
  let s = seed >>> 0;
  function next() {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    nextInt: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    bool: (p = 0.5) => next() < p
  };
}
```

- [ ] Run `bun test tests/rng.test.js` — expect all PASS
- [ ] `git add js/rng.js tests/rng.test.js && git commit -m "feat: seeded RNG (mulberry32)" && git push`

---

## Task 3: i18n Module

**Files:** `js/i18n.js`, `tests/i18n.test.js`

- [ ] Write `tests/i18n.test.js`:
```js
import { test, expect } from 'bun:test';
import { createI18n, STRINGS } from '../js/i18n.js';

test('all ES keys resolve', () => {
  const t = createI18n('es');
  for (const key of Object.keys(STRINGS.es)) {
    expect(t(key)).not.toMatch(/^\[missing:/);
  }
});
test('all EN keys resolve', () => {
  const t = createI18n('en');
  for (const key of Object.keys(STRINGS.en)) {
    expect(t(key)).not.toMatch(/^\[missing:/);
  }
});
test('ES and EN have same keys', () => {
  const esKeys = Object.keys(STRINGS.es).sort();
  const enKeys = Object.keys(STRINGS.en).sort();
  expect(esKeys).toEqual(enKeys);
});
test('template substitution works', () => {
  const t = createI18n('es');
  const result = t('intro.msg2', { name: 'Carlos' });
  expect(result).toContain('Carlos');
});
```

- [ ] Run — expect FAIL

- [ ] Implement `js/i18n.js` with `createI18n(lang)` returning `t(key, vars={})` that replaces `{varName}` placeholders, and export `STRINGS` with the full bilingual string table below, and export `POOLS` with language-specific name/content pools.

**STRINGS must include (both ES and EN):**
- `menu.title` → "Stalkie"
- `menu.subtitle` → "¿Está siendo infiel?" / "Is he cheating?"
- `menu.play` → "Jugar" / "Play"
- `menu.lang_es` → "Español" / "Español"
- `menu.lang_en` → "English" / "English"
- `intro.dm_preview` → "Nueva solicitud de mensaje" / "New message request"
- `intro.msg1` → "Hola... no sé a quién más preguntarle 😔" / "Hi... I don't know who else to ask 😔"
- `intro.msg2` → "Creo que {name} me está engañando pero no estoy segura" / "I think {name} might be cheating on me but I'm not sure"
- `intro.msg3` → "Se ha quedado dormido y he desbloqueado su teléfono. ¿Me ayudas a buscar pruebas? Por favor 🙏" / "He fell asleep and I unlocked his phone. Can you help me look for proof? Please 🙏"
- `intro.accept` → "Claro, te ayudo" / "Of course, I'll help"
- `phone.back` → "← Atrás" / "← Back"
- `phone.evidence_btn` → "🗂️" (same both)
- `phone.screenshot` → "📸 Capturar" / "📸 Capture"
- `phone.captured` → "¡Capturado!" / "Captured!"
- `phone.time_format` → "HH:MM" (same)
- `app.instagram` → "Instagram"
- `app.whatsapp` → "WhatsApp"
- `app.revolut` → "Revolut"
- `app.twitter` → "Twitter"
- `app.maps` → "Maps"
- `app.gallery` → "Galería" / "Gallery"
- `app.messages` → "Mensajes" / "Messages"
- `evidence.title` → "Pruebas" / "Evidence"
- `evidence.empty` → "Aún no has capturado nada.\nExplora las apps." / "Nothing captured yet.\nExplore the apps."
- `evidence.verdict_btn` → "Dar veredicto" / "Make verdict"
- `evidence.count` → "{n} prueba(s)" / "{n} piece(s)"
- `verdict.title` → "¿Cuál es tu veredicto?" / "What's your verdict?"
- `verdict.guilty` → "💔 Es infiel" / "💔 He's cheating"
- `verdict.innocent` → "✅ Es inocente" / "✅ He's innocent"
- `reveal.correct_guilty` → "¡Lo pillaste! 🎉" / "You got him! 🎉"
- `reveal.correct_innocent` → "¡Bien hecho! Era inocente 💚" / "Well done! He was innocent 💚"
- `reveal.wrong_guilty` → "Te equivocaste... era inocente 😬" / "Wrong... he was innocent 😬"
- `reveal.wrong_innocent` → "Te engañaron... sí era infiel 💔" / "You were fooled... he was cheating 💔"
- `reveal.guilty_story` → "{suspect} llevaba {months} mes(es) viéndose con {other}." / "{suspect} had been seeing {other} for {months} month(s)."
- `reveal.innocent_story` → "{suspect} era inocente. Las pistas tenían otra explicación." / "{suspect} was innocent. The clues had other explanations."
- `reveal.missed` → "Pruebas que no encontraste:" / "Evidence you missed:"
- `reveal.found` → "Lo que encontraste:" / "What you found:"
- `reveal.play_again` → "🔄 Jugar de nuevo" / "🔄 Play again"
- Red herring explanations — one key per herring ID, prefix `rh.`:
  - `rh.ig_dm_surprise` → "Era {name} planeando una sorpresa para su novia." / "That was {name} planning a surprise for his girlfriend."
  - `rh.ig_old_convo` → "Esta conversación es de antes de que estuvieran juntos." / "This conversation is from before they were together."
  - `rh.ig_business_dm` → "Era una oferta de colaboración de una marca." / "It was a brand collaboration offer."
  - `rh.ig_reel_save` → "Era una playlist para su aniversario." / "It was a playlist for their anniversary."
  - `rh.wa_sister` → "Era su hermana organizando una cena familiar." / "It was his sister organising a family dinner."
  - `rh.wa_work_group` → "El chat de trabajo confirma que sí se quedó tarde." / "The work group chat confirms he really did stay late."
  - `rh.wa_old_ex` → "Son solo amigos, el contexto lo deja claro." / "They're just friends — the context makes it clear."
  - `rh.rv_birthday_flowers` → "El cumpleaños de ella es la semana que viene." / "Her birthday is next week."
  - `rh.rv_biz_trip` → "Coincide con un viaje de trabajo conocido." / "It matches a known business trip."
  - `rh.rv_couple_restaurant` → "Fue allí con ella; ella simplemente no lo recordaba." / "He went there with her — she just forgot."
  - `rh.rv_parents_gift` → "Era un regalo para el cumpleaños de su madre." / "It was a gift for his mother's birthday."
  - `rh.tw_retweet_relatable` → "Eran memes de pareja sobre su propia relación." / "They were couple memes about their own relationship."
  - `rh.tw_mutual_follows` → "Son contactos profesionales / red de trabajo." / "They're professional contacts / work network."
  - `rh.tw_old_tweet` → "Este tweet es de antes de que empezaran a salir." / "This tweet is from before they started dating."
  - `rh.gm_parents_home` → "Esa dirección es la casa de sus padres." / "That address is his parents' house."
  - `rh.gm_work_route` → "Esa ubicación es su nueva oficina." / "That location is his new office."
  - `rh.gm_gym` → "Va al gimnasio en secreto como sorpresa para ella." / "He's been going to the gym secretly as a surprise for her."
  - `rh.gal_sister_photo` → "Es su hermana — el parecido es evidente." / "It's his sister — the resemblance is clear."
  - `rh.gal_surprise_photo` → "Son decoraciones para una sorpresa para su novia." / "It's decorations for a surprise for his girlfriend."
  - `rh.gal_old_photo` → "Es antigua — pertenece a un álbum de hace años." / "It's old — from a holiday album years ago."
  - `rh.gal_work_event` → "Es un evento de trabajo — se ven las acreditaciones." / "It's a work event — you can see the lanyards."

**Evidence labels (shown on polaroid cards):**
- `ev.ig_dm_unknown` → "DM de número desconocido" / "DM from unknown contact"
- `ev.ig_tagged_wrong_place` → "Etiquetado en lugar equivocado" / "Tagged in wrong location"
- `ev.ig_story_view` → "Historia vista por cuenta privada" / "Story viewed by private account"
- `ev.ig_likes_cluster` → "30+ likes en fotos de la misma chica" / "30+ likes on same girl's photos"
- `ev.ig_follow_private` → "Sigue cuenta privada sospechosa" / "Follows suspicious private account"
- `ev.ig_comment_flirty` → "Comentario con 🔥 en foto de bikini" / "Fire emoji comment on bikini photo"
- `ev.ig_search_history` → "Búsqueda repetida del mismo usuario" / "Repeated search for same username"
- `ev.ig_blocked_account` → "Bloqueó a su novia de un highlight" / "Blocked girlfriend from a highlight"
- `ev.ig_dm_surprise` → "DM de chica desconocida" / "DM from unknown girl"
- `ev.ig_old_convo` → "Conversación con una chica" / "Conversation with a girl"
- `ev.ig_business_dm` → "DM de marca/chica" / "DM from brand/girl"
- `ev.ig_reel_save` → "Reels románticos guardados" / "Saved romantic reels"
- `ev.wa_contact_alias` → "Contacto con nombre sospechoso" / "Contact with suspicious name"
- `ev.wa_deleted_msgs` → "Mensajes eliminados" / "Deleted messages"
- `ev.wa_miss_you` → "«Te echo de menos» de número desconocido" / "«Miss you» from unknown number"
- `ev.wa_location_shared` → "Ubicación compartida a las 2am" / "Location shared at 2am"
- `ev.wa_emoji_heavy` → "Hilo con corazones y fuegos" / "Thread with hearts and fire emojis"
- `ev.wa_voice_note_unknown` → "Nota de voz sin abrir de desconocido/a" / "Unopened voice note from unknown"
- `ev.wa_confession` → "Captura de conversación visible en notif." / "Screenshot of convo visible in notif."
- `ev.wa_sister` → "Mensajes cariñosos" / "Affectionate messages"
- `ev.wa_work_group` → "Menciona quedarse tarde" / "Mentions staying late"
- `ev.wa_old_ex` → "Conversación con ex" / "Conversation with ex"
- `ev.rv_dinner_2` → "Cena romántica (importe para 2)" / "Romantic dinner (amount for 2)"
- `ev.rv_hotel` → "Reserva de hotel en su ciudad" / "Hotel booking in their city"
- `ev.rv_flowers` → "Floristería — no era su cumpleaños" / "Florist — not her birthday"
- `ev.rv_gift` → "Joyería — ella no recibió nada" / "Jewellery store — she got nothing"
- `ev.rv_airbnb` → "Airbnb el fin de semana que «visitó a sus padres»" / "Airbnb the weekend he «visited his parents»"
- `ev.rv_lingerie` → "Lencería — talla incorrecta" / "Lingerie — wrong size"
- `ev.rv_cash_withdrawals` → "Retiradas de efectivo repetidas" / "Repeated cash withdrawals"
- `ev.rv_uber_unknown` → "Varios Uber a la misma dirección desconocida" / "Multiple Ubers to same unknown address"
- `ev.rv_birthday_flowers` → "Floristería" / "Florist charge"
- `ev.rv_biz_trip` → "Hotel" / "Hotel charge"
- `ev.rv_couple_restaurant` → "Restaurante romántico" / "Romantic restaurant"
- `ev.rv_parents_gift` → "Joyería" / "Jewellery store"
- `ev.tw_liked_flirty` → "Likes en posts íntimos de la misma cuenta" / "Liked intimate posts from same account"
- `ev.tw_follow_private` → "Sigue cuenta privada sin mutuos" / "Follows private account, no mutuals"
- `ev.tw_reply_heart` → "Respondió 😍 a una foto provocadora" / "Replied 😍 to a thirst trap"
- `ev.tw_alibi_break` → "Tweet desde ubicación diferente a su coartada" / "Tweet from location different to alibi"
- `ev.tw_dm_notif` → "Notificación de DM de desconocido/a" / "DM notification from unknown"
- `ev.tw_list` → "Añadido a lista privada «cercanos»" / "Added to private «close» list"
- `ev.tw_retweet_relatable` → "Retweets de memes de pareja" / "Retweeted couple memes"
- `ev.tw_mutual_follows` → "Sigue a muchas chicas" / "Follows many girls"
- `ev.tw_old_tweet` → "Tweet antiguo con tono coqueto" / "Old flirty-sounding tweet"
- `ev.gm_wrong_home` → "«Casa» en dirección que no es la de su novia" / "«Home» at address that's not girlfriend's"
- `ev.gm_restaurant_saved` → "Restaurante romántico guardado (dice que nunca fue)" / "Saved romantic restaurant (claims never went)"
- `ev.gm_hotel_search` → "Búsqueda reciente: hotel + habitación doble" / "Recent search: hotel + double room"
- `ev.gm_frequent_unknown` → "Ubicación visitada 8 veces este mes" / "Location visited 8 times this month"
- `ev.gm_alibi_route` → "Timeline lo sitúa lejos de donde decía estar" / "Timeline places him far from stated alibi"
- `ev.gm_shared_location` → "Compartiendo ubicación en vivo con desconocido/a" / "Sharing live location with unknown contact"
- `ev.gm_parents_home` → "Dirección guardada" / "Saved address"
- `ev.gm_work_route` → "Ubicación frecuente desconocida" / "Frequent unknown location"
- `ev.gm_gym` → "Ubicación frecuente desconocida" / "Frequent unknown location"
- `ev.gal_photo_unknown_girl` → "Selfie con chica desconocida" / "Selfie with unknown girl"
- `ev.gal_hotel_room` → "Foto de habitación de hotel sin viaje conocido" / "Hotel room photo — no known trip"
- `ev.gal_gift_unwrapped` → "Foto de regalo — ella no recibió nada" / "Photo of gift — she got nothing"
- `ev.gal_screenshot_convo` → "Captura de conversación con chica" / "Screenshot of convo with girl"
- `ev.gal_deleted_bin` → "12 fotos eliminadas hoy" / "12 photos deleted today"
- `ev.gal_sister_photo` → "Foto con chica" / "Photo with girl"
- `ev.gal_surprise_photo` → "Foto de decoraciones/regalo" / "Photo of decorations/gift"
- `ev.gal_old_photo` → "Foto con chica (álbum antiguo)" / "Photo with girl (old album)"
- `ev.gal_work_event` → "Foto con varias mujeres" / "Photo with several women"

**POOLS export** must include for each language: `maleNames`, `femaleNames`, `usernameSuffixes`, `cities`, `jobs`, `romanticRestaurants`, `hotels`, `addresses`, `streetNames`, `gymNames`, `currency` (symbol + code).

ES pools sample: maleNames: ['Alejandro','Carlos','David','Diego','Eduardo','Fernando','Gabriel','Hugo','Iván','Javier','Luis','Marcos','Miguel','Pablo','Rodrigo','Sergio','Tomás','Víctor'], femaleNames: ['Valentina','Sofía','Isabella','Camila','Lucía','María','Paula','Ana','Laura','Elena','Natalia','Carla','Sara','Andrea','Marta','Claudia','Patricia','Alba'], cities: ['Madrid','Barcelona','Valencia','Sevilla','Bilbao','Málaga','Zaragoza','Murcia'], jobs: ['diseñador','enfermero','programador','comercial','cocinero','arquitecto','periodista','fotógrafo'], romanticRestaurants: ['Restaurante Alborada','La Tasquita de Enfrente','Arzak','DiverXO','El Celler de Can Roca'], hotels: ['Hotel Puerta América','Hotel Arts','NH Collection','Barceló Bruja'], addresses: ['Calle Serrano 42','Calle Velázquez 18','Paseo de Gracia 55','Calle Mayor 7'], gymNames: ['Holmes Place','Metropolitan','McFIT','Anytime Fitness'], currency: { symbol: '€', code: 'EUR' }.

EN pools sample: maleNames: ['Alex','James','Ryan','Chris','Jake','Luke','Matt','Nick','Oliver','Sam','Tom','Will','Ben','Ethan','Jack','Leo'], femaleNames: ['Sophie','Emma','Olivia','Ava','Isabella','Mia','Charlotte','Amelia','Harper','Emily','Lily','Grace','Chloe','Zoe','Hannah','Natalie'], cities: ['London','Manchester','Birmingham','Leeds','Bristol','Edinburgh','Liverpool'], jobs: ['designer','nurse','developer','sales rep','chef','architect','journalist','photographer'], romanticRestaurants: ['Sketch','The Ivy','Dishoom','Brasserie Blanc','Sexy Fish'], hotels: ['The Ned','Claridge\'s','The Hoxton','citizenM','The Curtain'], addresses: ['14 Kensington Road','7 Chelsea Gardens','32 Notting Hill Gate','5 Soho Square'], gymNames: ['PureGym','Virgin Active','David Lloyd','Gymbox'], currency: { symbol: '£', code: 'GBP' }.

- [ ] Run `bun test tests/i18n.test.js` — expect all PASS
- [ ] `git add js/i18n.js tests/i18n.test.js && git commit -m "feat: i18n system with full ES/EN strings" && git push`

---

## Task 4: Generator — Characters, Outcome, Secret Contact

**Files:** `js/generator.js` (part 1), `tests/generator.test.js` (part 1)

- [ ] Write `tests/generator.test.js`:
```js
import { test, expect, describe } from 'bun:test';
import { generateScenario } from '../js/generator.js';

describe('scenario shape', () => {
  test('same seed same result', () => {
    const a = generateScenario(12345, 'es');
    const b = generateScenario(12345, 'es');
    expect(a.suspect.name).toBe(b.suspect.name);
    expect(a.outcome).toBe(b.outcome);
  });
  test('has all required top-level fields', () => {
    const s = generateScenario(99, 'es');
    for (const k of ['seed','lang','outcome','suspect','girlfriend','secretContact','appContent','realEvidenceIds','redHerringIds']) {
      expect(s).toHaveProperty(k);
    }
  });
  test('outcome is guilty or innocent', () => {
    const outcomes = new Set(Array.from({length:20}, (_,i) => generateScenario(i*1000,'es').outcome));
    expect(outcomes.has('guilty')).toBe(true);
    expect(outcomes.has('innocent')).toBe(true);
  });
  test('suspect name differs from girlfriend name', () => {
    for (let i = 0; i < 20; i++) {
      const s = generateScenario(i * 777, 'es');
      expect(s.suspect.name).not.toBe(s.girlfriend.name);
    }
  });
  test('guilty run has 5-7 real evidence IDs', () => {
    const guilty = Array.from({length:50},(_,i)=>generateScenario(i*13,'es')).filter(s=>s.outcome==='guilty');
    for (const s of guilty) {
      expect(s.realEvidenceIds.length).toBeGreaterThanOrEqual(5);
      expect(s.realEvidenceIds.length).toBeLessThanOrEqual(7);
    }
  });
  test('innocent run has 0 real evidence IDs', () => {
    const innocent = Array.from({length:50},(_,i)=>generateScenario(i*17,'es')).filter(s=>s.outcome==='innocent');
    for (const s of innocent) {
      expect(s.realEvidenceIds.length).toBe(0);
    }
  });
  test('no duplicate evidence IDs', () => {
    for (let i = 0; i < 30; i++) {
      const s = generateScenario(i * 31, 'es');
      const all = [...s.realEvidenceIds, ...s.redHerringIds];
      expect(new Set(all).size).toBe(all.length);
    }
  });
  test('works in english', () => {
    const s = generateScenario(555, 'en');
    expect(s.lang).toBe('en');
    expect(s.suspect.name).toBeTruthy();
  });
});
```

- [ ] Run — expect FAIL

- [ ] Implement `js/generator.js`. The full implementation must:

1. Import `createRNG` from `./rng.js` and `POOLS` from `./i18n.js`
2. Define the full evidence pool as a constant `EVIDENCE_POOL` — an object keyed by app name, each containing arrays of `{ id, type: 'real'|'redHerring', app }`. Include ALL evidence IDs from the spec (see Task 3 for all IDs).
3. `generateScenario(seed, lang)`:
   - Create RNG from seed
   - Pick suspect (male name, age 22–35, job, city, avatar color from `['#FF6B9D','#C77DFF','#74C0FC','#69DB7C','#FFD43B','#FF8CC8','#845EF7']`)
   - Pick girlfriend (female name, different avatar color)
   - Pick secretContact (female name ≠ girlfriend name, own avatar color)
   - `outcome = rng.bool() ? 'guilty' : 'innocent'`
   - `monthsCheating = rng.nextInt(1, 3)`
   - `relationshipMonths = rng.nextInt(6, 36)`
   - Cross-app references: `secretRestaurant`, `hotelName`, `secretAddress`, `gymName` — picked from pools
   - Call `selectEvidence(rng, outcome)` → `{ realEvidenceIds, redHerringIds }`
   - Call `generateAppContent(rng, lang, pools, ctx)` → `appContent`
   - Return full scenario object

4. `selectEvidence(rng, outcome)`:
   - For each app's pool, shuffle and pick: if guilty, pick 1–2 real items per app (total 5–7 across all apps); always pick 3–4 red herrings across apps (at most 1 per app)
   - Return `{ realEvidenceIds: string[], redHerringIds: string[] }`

5. `generateAppContent(rng, lang, pools, ctx)`:
   - Returns `{ instagram, whatsapp, revolut, twitter, maps, gallery, messages }`
   - Each app section is an object with arrays of content items
   - Evidence items have `evidenceId` matching an ID in realEvidenceIds or redHerringIds; filler items have `evidenceId: null`
   - See each app task for the exact shape of content items

**Content item shape (shared across all apps):**
```js
{
  id: string,           // unique within run, e.g. 'ig_item_0'
  evidenceId: string|null,  // links to evidence pool; null = filler
  // app-specific fields below (defined per app in Tasks 10–16)
}
```

**generateUsername(rng, name, pools):** lowercase first name + rng.pick(['_','.','',...]) + rng.pick(pools.usernameSuffixes) where suffixes include numbers and words like ['oficial','real','dev','xo','99','_','2024','fit']

- [ ] Run `bun test tests/generator.test.js` — expect all PASS
- [ ] `git add js/generator.js tests/generator.test.js && git commit -m "feat: scenario generator (characters, outcome, evidence selection)" && git push`

---

## Task 5: Phone Frame + CSS

**Files:** `css/style.css`, `css/apps.css`

- [ ] Write `css/style.css` — complete styles for:
  - Body: `background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0;`
  - `#app`: full viewport
  - `.phone-wrap`: centers phone, `position: relative`
  - `.phone`: `width: 390px; height: 844px; background: #1a1a1a; border-radius: 55px; border: 10px solid #2a2a2a; box-shadow: 0 0 0 2px #444, 0 40px 80px rgba(0,0,0,.8), inset 0 0 0 2px #111; position: relative; overflow: hidden; display: flex; flex-direction: column;`
  - `.phone-notch`: `position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 30px; background: #1a1a1a; border-radius: 0 0 20px 20px; z-index: 100;`
  - `.status-bar`: `height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; color: white; font-size: 12px; font-weight: 600; flex-shrink: 0;`
  - `.screen`: `flex: 1; overflow: hidden; position: relative; background: white;`
  - `.app-view`: `position: absolute; inset: 0; overflow-y: auto; transform: translateX(100%); transition: transform .3s cubic-bezier(.4,0,.2,1);`
  - `.app-view.active`: `transform: translateX(0);`
  - `.home-screen`: `position: absolute; inset: 0; background: linear-gradient(160deg,#1a1a2e,#16213e,#0f3460); padding: 20px;`
  - `.app-grid`: `display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-top: 40px;`
  - `.app-icon`: `display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; -webkit-tap-highlight-color: transparent;`
  - `.app-icon .icon-img`: `width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 12px rgba(0,0,0,.3);`
  - `.app-icon span`: `color: white; font-size: 10px; text-align: center;`
  - `.phone-bottom-bar`: `height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; background: #1a1a1a;`
  - `.btn-back`: `color: white; font-size: 13px; font-weight: 600; cursor: pointer; padding: 8px; display: none;`
  - `.btn-back.visible`: `display: block;`
  - `.btn-evidence`: `width: 40px; height: 40px; background: linear-gradient(135deg,#FF6B9D,#C77DFF); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,107,157,.4);`
  - Menu screen: `.menu-screen`: full viewport, centered content, pink/purple gradient, `.menu-title` large bold font, `.menu-subtitle` softer, `.lang-btns` row of two pill buttons, `.btn-play` large gradient pink button
  - `.camera-flash`: `position: fixed; inset: 0; background: white; opacity: 0; pointer-events: none; z-index: 9999; transition: opacity .1s;`
  - `.camera-flash.flash`: `opacity: .8;`
  - Evidence board overlay: `.evidence-overlay`: `position: absolute; inset: 0; background: #8B6914; z-index: 50; overflow-y: auto; padding: 16px;` (corkboard brown)
  - `.polaroid-grid`: `display: grid; grid-template-columns: repeat(2,1fr); gap: 12px;`
  - `.polaroid`: `background: white; padding: 8px 8px 28px; box-shadow: 0 3px 10px rgba(0,0,0,.3); transform: rotate(var(--rot)); cursor: pointer;`
  - `.polaroid img, .polaroid .polaroid-preview`: `width: 100%; aspect-ratio: 1; object-fit: cover; background: #f0f0f0;`
  - `.polaroid-label`: `font-size: 10px; text-align: center; margin-top: 4px; color: #333; font-family: 'Courier New', monospace;`
  - `.verdict-screen`, `.reveal-screen`: full-screen overlays with gradient backgrounds, centered content, large verdict buttons (red for guilty, green for innocent), reveal card showing story + missed evidence grid

- [ ] Write `css/apps.css` — per-app themes:
  - `.app-instagram .app-header`: `background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); color: white; padding: 12px 16px; font-weight: 700; font-size: 20px; font-style: italic;`
  - `.app-whatsapp .app-header`: `background: #075E54; color: white; padding: 12px 16px; font-weight: 600;`
  - `.app-revolut .app-header`: `background: #191c82; color: white; padding: 16px;`
  - `.app-twitter .app-header`: `background: #000; color: white; padding: 12px 16px; border-bottom: 1px solid #2f3336;`
  - `.app-maps .app-header`: `background: #fff; color: #1a73e8; padding: 12px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.2);`
  - `.app-gallery .app-header`: `background: #fff; color: #000; padding: 12px 16px; font-weight: 600;`
  - `.app-messages .app-header`: `background: #fff; color: #007AFF; padding: 12px 16px; font-weight: 600;`
  - Per-app item styles: chat bubbles, feed posts, transaction rows, tweet cards, map pins, photo grids — full CSS for each making them look like the real app

- [ ] `git add css/ && git commit -m "feat: phone frame and app theme CSS" && git push`

---

## Task 6: Phone Controller

**Files:** `js/phone.js`, `index.html` (update structure)

- [ ] Implement `js/phone.js`:
```js
export function createPhone(container, scenario, t, onCapture) {
  let currentApp = null;

  const phoneEl = container.querySelector('.phone');
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

  backBtn.addEventListener('click', showHome);

  return { showHome, openApp };
}
```

- [ ] Update `index.html` to include the full phone HTML structure (status bar, notch, screen with home-screen grid, bottom bar with back button and evidence button, camera flash div)

Home screen grid must have 7 app icons with emoji representations:
  - Instagram: gradient `#E1306C → #F77737` background + 📷
  - WhatsApp: `#25D366` background + 💬
  - Revolut: `#191c82` background + 💳
  - Twitter/X: `#000` background + 🐦
  - Maps: `#4285F4` background + 🗺️
  - Galería/Gallery: `#FF9500` background + 🖼️
  - Mensajes/Messages: `#34C759` background + ✉️

- [ ] `git add js/phone.js index.html && git commit -m "feat: phone controller and home screen" && git push`

---

## Task 7: Instagram App

**Files:** `js/apps/instagram.js`

App content shape (from generator):
```js
// scenario.appContent.instagram
{
  items: [
    {
      id: string,
      evidenceId: string|null,
      subtype: 'feed_post'|'dm_thread'|'story_view'|'liked_posts'|'search_history'|'following',
      // feed_post: { username, avatarColor, caption, location?, likes, timeAgo, imageColor }
      // dm_thread: { username, avatarColor, preview, messages: [{from:'them'|'me', text, time}], time }
      // story_view: { username, avatarColor, isPrivate, time }
      // liked_posts: { username, avatarColor, postCount, timeAgo }
      // search_history: { username, searchCount, timeAgo }
      // following: { username, avatarColor, bio, isPrivate, mutuals }
    }
  ]
}
```

Generator must populate instagram items in `generateAppContent`. Add this to `generator.js` when implementing the app content section:
- Always include 8–10 items total (mix of feed posts, DM threads, story views)
- Evidence items placed at random positions among filler
- Filler: posts by the suspect's own account, posts by the girlfriend, normal friend posts, liked travel photos

`render(container, data, scenario, t, onCapture)` must:
- Render Instagram header with gradient + "Instagram" wordmark
- Show a feed/inbox tabbed view (Feed | DMs | Activity)
- Feed: scrollable list of post cards (avatar + username, image placeholder colored square, caption, likes/comments)
- DMs: list of conversation threads (avatar, name, preview text, time)
- Activity: liked posts list, story views, search history (all in separate scrollable sections accessible via sub-nav)
- Tapping any item → `showDetail(item)` which renders a full-screen detail view inside the app
- Detail view has `📸 Capturar` button at bottom; tapping it calls `onCapture(item.evidenceId, t('ev.' + item.evidenceId), 'Instagram', detailHtml)`; if `evidenceId` is null, button still exists but capturing a filler item is harmless (shows on board but not counted as evidence)
- Camera flash animation: add/remove `.flash` class on `.camera-flash` element

- [ ] Implement `js/apps/instagram.js` with full render function as described above
- [ ] Also add instagram content generation to `js/generator.js` inside `generateAppContent`
- [ ] `git add js/apps/instagram.js js/generator.js && git commit -m "feat: Instagram app + content generation" && git push`

---

## Task 8: WhatsApp App

**Files:** `js/apps/whatsapp.js`

App content shape:
```js
// scenario.appContent.whatsapp
{
  items: [{
    id, evidenceId,
    subtype: 'thread',
    contactName: string,
    avatarColor: string,
    isUnknown: boolean,    // number not in contacts
    messages: [{ from: 'them'|'me', text: string, time: string, deleted?: boolean, type?: 'voice'|'location'|'text' }],
    lastMessage: string,
    lastTime: string,
    unread: number
  }]
}
```

Generator populates 6–8 threads: 1–2 evidence threads + 4–6 filler (girlfriend, work group "Trabajo 💼", family "Familia ❤️", friends).

`render(container, data, scenario, t, onCapture)`:
- WhatsApp dark green header
- Scrollable list of threads: avatar circle (initials + color), contact name, last message preview, time, unread badge
- Tapping thread → detail: full chat view with green (them) + white (me) bubbles, deleted message placeholders in grey italic, voice note shown as waveform bar with duration
- Screenshot button at top-right of thread detail view
- Tapping screenshot → `onCapture(item.evidenceId, t('ev.'+item.evidenceId), 'WhatsApp', detailHtml)`

- [ ] Implement `js/apps/whatsapp.js` + generator content
- [ ] `git add js/apps/whatsapp.js js/generator.js && git commit -m "feat: WhatsApp app + content generation" && git push`

---

## Task 9: Revolut App

**Files:** `js/apps/revolut.js`

App content shape:
```js
// scenario.appContent.revolut
{
  balance: string,   // e.g. "1.247,83 €"
  items: [{
    id, evidenceId,
    subtype: 'transaction',
    merchant: string,
    amount: string,       // e.g. "−89,00 €"
    date: string,         // "14 feb" / "14 Feb"
    category: string,     // emoji + label e.g. "🍽️ Restaurantes"
    note?: string
  }]
}
```

Generator populates 12–16 transactions, newest first. Evidence transactions placed among normal filler (supermarket, petrol, streaming subscriptions, gym, coffee).

`render(container, data, scenario, t, onCapture)`:
- Dark navy header with balance and card graphic
- Scrollable transaction list grouped by date
- Each row: category icon circle, merchant name, date, amount (red for outgoing)
- Tapping row → detail: merchant name large, amount, date, category, map pin placeholder, note if present
- Screenshot button in detail

- [ ] Implement `js/apps/revolut.js` + generator content
- [ ] `git add js/apps/revolut.js js/generator.js && git commit -m "feat: Revolut app + content generation" && git push`

---

## Task 10: Twitter/X App

**Files:** `js/apps/twitter.js`

App content shape:
```js
// scenario.appContent.twitter
{
  items: [{
    id, evidenceId,
    subtype: 'tweet'|'like'|'following'|'dm_notif',
    // tweet: { username, avatarColor, text, time, location?, likes, retweets }
    // like: { username, avatarColor, tweetText, time }
    // following: { username, avatarColor, bio, isPrivate, followers }
    // dm_notif: { username, avatarColor, preview }
  }]
}
```

`render(container, data, scenario, t, onCapture)`:
- Black header, tabs: Para ti (For You) | Siguiendo (Following) | Likes | Siguiendo (Accounts)
- Tweet cards: avatar, username, @handle, tweet text, time, like/RT counts
- For likes tab: show liked tweets from others
- For following tab: account cards with bio and lock icon if private
- DM notification banner at top if `dm_notif` item present
- Detail view + screenshot button on each item

- [ ] Implement `js/apps/twitter.js` + generator content
- [ ] `git add js/apps/twitter.js js/generator.js && git commit -m "feat: Twitter app + content generation" && git push`

---

## Task 11: Google Maps App

**Files:** `js/apps/maps.js`

App content shape:
```js
// scenario.appContent.maps
{
  items: [{
    id, evidenceId,
    subtype: 'saved_place'|'recent_search'|'timeline_entry'|'shared_location',
    // saved_place: { name, address, label: 'Casa'|'Trabajo'|'Favorito', icon }
    // recent_search: { query, time }
    // timeline_entry: { date, places: [{name, timeRange}] }
    // shared_location: { contactName, avatarColor, address, since }
  }]
}
```

`render(container, data, scenario, t, onCapture)`:
- White header with Google Maps blue search bar
- Tabs: Guardados (Saved) | Recientes (Recent) | Timeline | Compartido (Shared)
- Saved: list of labeled places with colored icons
- Recent: list of searches with clock icons
- Timeline: day-by-day movement log
- Shared: list of contacts with live location pins
- Fake map background: CSS gradient green/blue grid (no real map needed)
- Detail view + screenshot on each item

- [ ] Implement `js/apps/maps.js` + generator content
- [ ] `git add js/apps/maps.js js/generator.js && git commit -m "feat: Maps app + content generation" && git push`

---

## Task 12: Gallery App

**Files:** `js/apps/gallery.js`

App content shape:
```js
// scenario.appContent.gallery
{
  items: [{
    id, evidenceId,
    subtype: 'photo'|'deleted',
    imageColor: string,   // CSS color for placeholder square
    imageEmoji: string,   // emoji overlaid on placeholder
    caption: string,      // date + location or description
    date: string,
    album: string,        // 'Recientes'|'Capturas'|'Papelera' / 'Recents'|'Screenshots'|'Trash'
  }]
}
```

`render(container, data, scenario, t, onCapture)`:
- White header, album tabs: Recientes | Capturas de pantalla | Papelera
- Grid of 3 columns: colored square placeholder + emoji (since no real images)
- Tapping photo → full-screen detail: large placeholder, date/location caption
- Screenshot button overlay

- [ ] Implement `js/apps/gallery.js` + generator content
- [ ] `git add js/apps/gallery.js js/generator.js && git commit -m "feat: Gallery app + content generation" && git push`

---

## Task 13: Messages App

**Files:** `js/apps/messages.js`

App content shape:
```js
// scenario.appContent.messages
{
  items: [{
    id, evidenceId,
    subtype: 'sms_thread',
    contactName: string,
    isUnknown: boolean,
    phoneNumber?: string,  // shown if isUnknown
    messages: [{ from: 'them'|'me', text: string, time: string }],
    lastMessage: string,
    lastTime: string
  }]
}
```

`render(container, data, scenario, t, onCapture)`:
- iMessage-style white/blue bubbles
- Thread list with contact names
- Detail: blue bubbles (me), grey bubbles (them)
- Screenshot button

- [ ] Implement `js/apps/messages.js` + generator content
- [ ] `git add js/apps/messages.js js/generator.js && git commit -m "feat: Messages app + content generation" && git push`

---

## Task 14: Evidence Board

**Files:** `js/evidence.js`

Interface:
```js
export function createEvidenceBoard(phoneEl, scenario, t) {
  // returns:
  // { add(evidenceId, label, appName, detailHtml), show(), hide(), getCollected(), getCount() }
}
```

- [ ] Implement `js/evidence.js`:
  - `add(evidenceId, label, appName, detailHtml)`: push to internal array if not already added (dedup by evidenceId — null evidenceId items always add), create polaroid card HTML with random slight rotation (`--rot: ${rng}deg`), append to `.polaroid-grid`, flash board button
  - `show()`: make overlay visible, animate in
  - `hide()`: hide overlay
  - `getCollected()`: return array of evidenceIds captured (null entries filtered out)
  - `getCount()`: return collected.length
  - Render board: corkboard brown background, polaroid grid, "Dar veredicto" button at bottom (calls `onVerdict` callback passed to `show()`)
  - Polaroid card: white card, preview (detail HTML clipped to small square or emoji+label if too complex), label text at bottom in typewriter font, app source icon

- [ ] `git add js/evidence.js && git commit -m "feat: evidence board (corkboard + polaroids)" && git push`

---

## Task 15: Verdict + Reveal

**Files:** `js/verdict.js`

- [ ] Implement `js/verdict.js`:

```js
export function showVerdict(container, scenario, t, collected, onPlayAgain) {
  // collected: string[] of evidenceIds (with nulls filtered)
  // Phase 1: verdict choice screen
  // Phase 2: reveal screen
}
```

Verdict screen:
- Full-screen overlay with dark gradient
- Large title `t('verdict.title')`
- Count badge `t('evidence.count', { n: collected.length })`
- Two big buttons: guilty (red gradient `#FF416C → #FF4B2B`) + innocent (green gradient `#56ab2f → #a8e063`)
- Tapping either → reveal

Reveal screen:
- `correct` = (player chose 'guilty' && scenario.outcome==='guilty') || (player chose 'innocent' && scenario.outcome==='innocent')
- Header: big emoji (🎉 or 💔), result string from t()
- Story paragraph: `t('reveal.guilty_story', { suspect, other, months })` or `t('reveal.innocent_story', ...)`
- If innocent: list all red herrings with explanations from `t('rh.' + id, { name: ... })`
- "Pruebas que no encontraste" section: grey polaroid grid of all evidence IDs in `scenario.realEvidenceIds` that are NOT in `collected`, each showing label
- "Lo que encontraste" section: colored polaroid grid of collected items
- Play again button: `location.reload()`

- [ ] `git add js/verdict.js && git commit -m "feat: verdict and reveal screen" && git push`

---

## Task 16: Main Menu, Intro + Wire-Up

**Files:** `js/main.js`

- [ ] Implement `js/main.js`:

```js
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

const APPS = { instagram: Instagram, whatsapp: WhatsApp, revolut: Revolut, twitter: Twitter, maps: Maps, gallery: Gallery, messages: Messages };

function showMenu(appEl) {
  // Render menu screen with language buttons + play button
  // On language pick: save to localStorage('stalkie_lang'), update UI
  // On play: startIntro(lang)
}

function startIntro(lang, appEl) {
  const t = createI18n(lang);
  const seed = Date.now();
  const scenario = generateScenario(seed, lang);
  // Show intro: fake Instagram notification slides in from top
  // DM thread with girlfriend's name + 3 messages appear with typing delays (500ms each)
  // "Accept" button appears after last message
  // On accept: startGame(scenario, t, appEl)
}

function startGame(scenario, t, appEl) {
  // Render phone shell (if not already rendered)
  // Update status bar time every 30s
  // Create evidence board
  // Create phone controller
  // Wire app icon clicks to phone.openApp(name, APPS[name])
  // Wire evidence button to evidenceBoard.show()
  // Wire verdict button in evidence board to showVerdict(...)
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('stalkie_lang') || 'es';
  showMenu(document.getElementById('app'));
});
```

Intro animation: Instagram notification toast slides in from top (white card, IG gradient icon, "Nueva solicitud" text), auto-expands into a full DM thread view after 1s, messages appear one by one with a typing indicator (3 dots bouncing), "Acepta" button fades in, clicking it fades out intro and fades in phone.

Status bar: `new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})` every 30 seconds.

- [ ] `git add js/main.js && git commit -m "feat: main entry, menu, intro sequence, full game wire-up" && git push`

---

## Task 17: GitHub Actions Deploy

**Files:** `.github/workflows/deploy.yml`

- [ ] Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] In GitHub repo settings → Pages → Source: set to "GitHub Actions"
- [ ] `git add .github/ && git commit -m "feat: GitHub Actions deploy to GitHub Pages" && git push`

---

## Task 18: End-to-End Test

- [ ] Run `bun test` — all tests must pass
- [ ] Open `index.html` locally (use `npx serve .` or `bunx serve .` if needed for ES modules)
- [ ] **Guilty run test:**
  - Pick Spanish, hit play
  - Complete intro
  - Open each app, tap at least 3 items per app, screenshot 2+ items per app
  - Open evidence board, confirm polaroids appear
  - Hit verdict → Cheater
  - Confirm reveal shows correct/incorrect message + story + missed evidence
- [ ] **Innocent run test:**
  - Reload until innocent run (or force seed — open console, run `generateScenario(X,'es')` until outcome==='innocent')
  - Play through, screenshot red herrings
  - Issue verdict → Innocent
  - Confirm reveal correctly explains red herrings
- [ ] **English run test:**
  - Pick English from menu, confirm all UI strings are in English
- [ ] Fix any issues found, commit fixes with descriptive messages, push each fix
- [ ] Final commit: `git commit -m "test: e2e verified — guilty, innocent, bilingual" && git push`
