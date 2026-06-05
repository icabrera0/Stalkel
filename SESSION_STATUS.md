# Session Status

**Last updated:** 2026-06-05  
**Phase:** Feature complete — Calendar + Notes apps added  
**Repo:** https://github.com/icabrera0/Stalkel (public)

## What's Done

- [x] All 18 original tasks complete
- [x] Repo made public with README.md
- [x] GitHub Pages live
- [x] **iPhone-style phone UI** — Dynamic Island, titanium frame, CSS status bar, side buttons
- [x] **Web Audio API sounds** — tap, appOpen, back, capture, boardOpen, boardClose, verdict, correct, wrong
- [x] **Real photos via picsum.photos** — seeded CDN URLs in Gallery + Instagram (replaced pixel art)
- [x] **Evidence badge** — counter on board button, pulses on each capture
- [x] **Varied WhatsApp content** — gfConvoPool (4 variants), familyConvoPool (3 variants), random friend thread
- [x] **Instagram depth** — suspectPostPool (6 variants), otherAccounts feed (4 accounts)
- [x] **Verifiable red herrings** — alibi clues planted in other apps (flowers → Mamá SMS, biz trip → RRHH SMS, couple restaurant → GF WhatsApp, parents gift → family WA group)
- [x] **Calendar app** — iOS calendar grid + event detail + screenshot capture; fake "Viaje de trabajo" evidence for guilty
- [x] **Notes app** — iOS Notes UI with pinned/locked notes; suspicious "To do" note + locked Face ID note for guilty
- [x] New evidence IDs: `cal_fake_alibi`, `notes_suspicious`, `notes_locked` (in pool + i18n labels)
- [x] Everything verified E2E in Playwright — 0 JS errors, all 9 apps render correctly

## Apps on Home Screen

1. Instagram, 2. WhatsApp, 3. Revolut, 4. Twitter, 5. Maps, 6. Galería, 7. Mensajes, 8. Calendario, 9. Notas

## What Could Still Be Improved (Optional)

- Twitter tweet content pools (limited variety)
- More Revolut filler transactions for variety
- Calendar icon month/day could be dynamic (currently hardcoded "JUN 5")
- Cross-referencing key date: tie Revolut transaction date and Maps timeline entry to the same day as cal_fake_alibi
- English translations for new app icon labels in HTML (currently hardcoded "Calendario"/"Notas")

## Next Steps (if continuing)

1. Fix Calendar/Notes icon labels to respect `lang` (Calendario ↔ Calendar, Notas ↔ Notes)
2. Cross-reference key date: same day used in `cal_fake_alibi`, `rv_hotel`/`rv_dinner_2`, and `gm_alibi_route`
3. Commit + push to GitHub
