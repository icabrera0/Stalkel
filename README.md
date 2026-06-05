# Stalkie

A browser-based procedural detective game. You receive a message from someone who suspects their partner is cheating — your job is to go through the suspect's phone, collect evidence, and deliver a verdict.

**[Play it live →](https://icabrera0.github.io/Stalkel/)**

---

## Gameplay

1. A contact reaches out with suspicions about their partner
2. You get access to the suspect's phone — seven apps to investigate
3. Tap items to open detail views; press **Capture** to add a piece of evidence to your board
4. When you're ready, open the **Evidence Board** and deliver your verdict
5. The reveal shows the true outcome, explains any red herrings, and lists evidence you missed

Every session is seeded, so outcomes are deterministic but the full scenario space is effectively infinite — names, relationships, timelines, message content, transaction history, locations, and social media activity are all procedurally generated.

---

## Features

- **Procedural generation** — scenario, characters, evidence, and red herrings are generated fresh each run from a seeded RNG
- **7 investigatable apps** — Instagram, WhatsApp, Revolut, Twitter, Maps, Gallery, Messages
- **Bilingual** — full Spanish and English support (all UI strings and generated content)
- **Two outcomes** — guilty or innocent, each with four narrative variants depending on what you found
- **Red herrings** — some suspicious-looking evidence is deliberately misleading; the reveal explains why
- **No dependencies** — pure vanilla JS (ES modules), no build step, no framework

---

## Tech Stack

| Concern | Approach |
|---|---|
| Language | Vanilla JavaScript (ES modules) |
| RNG | Custom seeded mulberry32 — deterministic, reproducible |
| i18n | Hand-rolled key/value system with full ES + EN content pools |
| Styling | Plain CSS — phone frame, per-app themes, corkboard evidence board |
| Testing | Bun test runner — generator, RNG, and i18n covered |
| Deployment | GitHub Actions → GitHub Pages (zero-config static hosting) |

---

## Running Locally

No install required. Serve the repo root over HTTP (ES modules need a server, not `file://`):

```bash
# with Bun
bunx serve . -l 3000

# with Node
npx serve . -l 3000

# with Python
python -m http.server 3000
```

Then open `http://localhost:3000`.

---

## Tests

```bash
bun test
```

Covers the RNG module, i18n key completeness, and the scenario generator (all 7 app content pools, evidence selection, red herring assignment).

---

## Project Structure

```
js/
  rng.js          # Seeded mulberry32 RNG
  i18n.js         # String tables + content pools (ES/EN)
  generator.js    # Scenario generation — characters, evidence, app content
  phone.js        # Phone shell controller
  main.js         # Entry point — menu, intro sequence, game wiring
  evidence.js     # Evidence board + polaroid mechanic
  verdict.js      # Verdict choice + reveal flow
  apps/           # One module per app (instagram, whatsapp, revolut, ...)
css/
  style.css       # Phone frame, screens, evidence board
  apps.css        # Per-app header and item styles
tests/            # Bun test suites
```

---

## License

MIT
