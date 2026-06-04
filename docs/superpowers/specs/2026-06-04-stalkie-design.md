# Stalkie Game — Design Spec
**Date:** 2026-06-04  
**Stack:** Vanilla HTML/CSS/JS — static site, GitHub Pages deploy  
**Languages:** Spanish (default) + English (selectable from main menu)

---

## 1. Overview

A browser-based detective game. The player receives an Instagram DM from a distressed girl asking for help — she suspects her boyfriend is cheating and hands over access to his phone. The player investigates a fully simulated phone UI across multiple apps, collecting proofs onto an evidence board, then issues a verdict. Each playthrough is procedurally generated: different characters, different scenario, and a randomly determined outcome (guilty or innocent). The game is designed to look visually attractive and feel like a real phone.

---

## 2. Game Flow

```
Main Menu (language pick + play button)
  └─> Intro sequence: Instagram DM notification pops in
        └─> "Phone unlocked" — fake home screen appears
              └─> Free investigation: player taps apps, collects evidence
                    └─> Evidence Board: review gathered proofs at any time
                          └─> Verdict screen: Cheater / Innocent
                                └─> Reveal: truth + all missed evidence
                                      └─> Play Again (new seed)
```

### Intro Sequence
A simulated Instagram notification slides in. Opening it shows a DM thread from a girl (randomly generated name + avatar) who explains the situation in natural language. Two or three messages, ending with: "Here, I got into his phone while he was sleeping. Look around and tell me what you find. Please."

The player taps "Okay" and the phone home screen fades in.

---

## 3. Procedural Generation

At page load, `Date.now()` seeds a deterministic RNG. The seed produces a **scenario object** that fully defines the run. The same seed always produces the same game, but each new page load is different.

### Scenario object
```js
{
  seed: number,
  language: 'es' | 'en',
  outcome: 'guilty' | 'innocent',       // 50/50
  suspect: { name, age, job, city, avatarColor },
  girlfriend: { name, avatarColor },
  relationship: { durationMonths },
  realEvidence: EvidenceItem[],          // 5–7 items if guilty, 0 if innocent
  redHerrings: EvidenceItem[],           // 3–4 items always — look suspicious, have innocent explanation revealed at verdict
  appContent: { instagram, whatsapp, revolut, twitter, maps, gallery }
  // appContent also includes filler: normal conversations, boring transactions, everyday photos
  // that pad out each app and make the investigation non-trivial
}
```

### Evidence tiers
- **Real evidence** (`guilty` runs only): unambiguously incriminating once the player connects the dots. Distributed across apps so the player must explore several to build the full picture.
- **Red herrings** (all runs): look suspicious at first glance but have an innocent explanation revealed only at the verdict screen. In `innocent` runs these are the only collectible items, so the player always has something to chase.
- **Filler content** (all runs, not collectible): normal conversations, boring transactions, everyday photos that pad out apps and make the investigation non-trivial. Not tappable as evidence.

All names, dates, amounts, and locations inside app content are generated to be internally consistent (e.g. a Revolut transaction at "Restaurante La Mar" matches a Google Maps saved place called "La Mar" and a photo tagged at the same location).

---

## 4. The Fake Phone UI

A centred phone frame (CSS — looks like a modern smartphone bezel) containing:
- **Status bar**: time (live), battery icon, signal bars
- **Home screen**: app grid with icons and labels
- **App view**: tapping an icon slides in the app full-screen
- **Back button**: returns to home screen
- **Evidence button** (floating, bottom-right): opens the evidence board overlay

Apps on the home screen:
`Instagram · WhatsApp · Revolut · Twitter/X · Google Maps · Galería · Mensajes`

Each app is a self-contained rendered view that looks like the real app (layout, colours, fonts).

---

## 5. Apps & Evidence Pool

Each app has a pool of **12–16 possible evidence items**. Per run, 3–5 items are selected from the pool and populated with scenario-specific data (names, dates, amounts). This prevents repetition across playthroughs.

### Instagram
| ID | Type | Description |
|----|------|-------------|
| ig_dm_unknown | real | DM from unknown contact: flirty messages, pet names |
| ig_dm_surprise | red herring | DM from a girl — planning a surprise party for the girlfriend |
| ig_tagged_wrong_place | real | Tagged at a location that contradicts his stated alibi |
| ig_story_view | real | His story was viewed by a suspicious private account |
| ig_likes_cluster | real | Liked 30+ posts from the same girl's account in one night |
| ig_follow_private | real | Follows a private account with a flirty bio, not mutual |
| ig_old_convo | red herring | DM conversation from before they were together — harmless in context |
| ig_comment_flirty | real | Left a fire emoji + comment on someone's bikini photo |
| ig_search_history | real | Recent search: a girl's username, 12 times this week |
| ig_business_dm | red herring | DM from a "girl" — actually a brand collaboration offer |
| ig_reel_save | red herring | Saved romantic reels — turns out it's a playlist for their anniversary |
| ig_blocked_account | real | Blocked the girlfriend from seeing a specific story highlight |

### WhatsApp / Mensajes
| ID | Type | Description |
|----|------|-------------|
| wa_contact_alias | real | Contact saved as "Carlos del gym" — actually a woman's voice note |
| wa_deleted_msgs | real | "Messages deleted" notice in a thread, recent timestamp |
| wa_miss_you | real | "Te echo de menos" / "I miss you" from unknown number, late night |
| wa_location_shared | real | Location shared to someone at 2am |
| wa_sister | red herring | Affectionate messages — it's his sister planning a family dinner |
| wa_work_group | red herring | Mentions staying late — verifiable with a work group chat shown |
| wa_old_ex | red herring | Conversation with ex — they're just friends, context is clear |
| wa_emoji_heavy | real | Thread with heart/fire emojis, other person's name not in contacts |
| wa_voice_note_unknown | real | Unopened voice note from unknown number, sent at midnight |
| wa_confession | real | (rare, guilty only) Partial screenshot of a conversation visible in notifications |

### Revolut
| ID | Type | Description |
|----|------|-------------|
| rv_dinner_2 | real | Charge at a romantic restaurant, amount for 2, date he said he was working |
| rv_hotel | real | Hotel booking, one night, city they live in |
| rv_flowers | real | Florist charge — girlfriend's birthday was 3 months ago |
| rv_gift | real | Jewellery store — girlfriend has no record of receiving anything |
| rv_airbnb | real | Airbnb booking for a weekend he said he was visiting his parents |
| rv_birthday_flowers | red herring | Florist charge — girlfriend's birthday is next week |
| rv_lingerie | real | Online lingerie store charge in the wrong size |
| rv_biz_trip | red herring | Hotel charge — matches a known business trip date |
| rv_cash_withdrawals | real | Repeated large cash withdrawals (cash is untraceable) |
| rv_couple_restaurant | red herring | Romantic restaurant charge — he was there with her, she just forgot |
| rv_parents_gift | red herring | Jewellery charge — it's a gift for his mother's birthday |
| rv_uber_unknown | real | Multiple Uber trips to the same unknown address, different days |

### Twitter / X
| ID | Type | Description |
|----|------|-------------|
| tw_liked_flirty | real | Liked several flirty/intimate posts from the same account |
| tw_follow_private | real | Follows a private account with no mutual followers |
| tw_reply_heart | real | Replied with "😍" to someone's thirst trap |
| tw_alibi_break | real | Posted a tweet from a location different from stated alibi, same timestamp |
| tw_dm_notif | real | DM notification preview visible — sender not in contacts |
| tw_retweet_relatable | red herring | Retweeted couple memes — clearly about their own relationship |
| tw_list | real | Added to a private Twitter list called "close" by unknown account |
| tw_mutual_follows | red herring | Follows many girls — they're all professional contacts / work network |
| tw_old_tweet | red herring | Old tweet that looks flirty — from before the relationship |

### Google Maps
| ID | Type | Description |
|----|------|-------------|
| gm_wrong_home | real | "Casa" / "Home" saved to an address that's not the girlfriend's |
| gm_restaurant_saved | real | Romantic restaurant saved — he denied ever going there |
| gm_hotel_search | real | Recent search: a hotel + "habitación doble" / "double room" |
| gm_frequent_unknown | real | Location visited 8 times this month, no explanation |
| gm_alibi_route | real | Timeline shows he was nowhere near where he claimed |
| gm_parents_home | red herring | Saved address is his parents' house |
| gm_work_route | red herring | Frequent unknown location is his office (new address) |
| gm_gym | red herring | Frequent location is a gym — he's been working out secretly as a surprise |
| gm_shared_location | real | Currently sharing live location with an unknown contact |

### Galería / Gallery
| ID | Type | Description |
|----|------|-------------|
| gal_photo_unknown_girl | real | Selfie with an unrecognised girl, indoors, recent |
| gal_hotel_room | real | Photo of a hotel room — no trip was ever mentioned |
| gal_gift_unwrapped | real | Photo of unwrapped jewellery/gift — girlfriend never received it |
| gal_screenshot_convo | real | Screenshot of a WhatsApp conversation with a girl |
| gal_deleted_bin | real | Bin/trash folder has 12 photos deleted today |
| gal_sister_photo | red herring | Photo with girl — it's his sister, resemblance visible |
| gal_surprise_photo | red herring | Photo of decorations / a gift — it's for a surprise for the girlfriend |
| gal_old_photo | red herring | Photo with ex — it's old, same timestamp as old holiday album |
| gal_work_event | red herring | Photo with multiple women — clearly a work event, lanyards visible |

---

## 6. Evidence Gathering Mechanic

**Two-step: inspect → screenshot.** Every tappable item in an app opens a **detail view** — a close-up of that content (full DM thread, transaction detail, photo, location entry, etc.). Inside the detail view a **📸 Capturar / Screenshot** button triggers a camera-flash animation and adds the item to the evidence board as a polaroid card.

**No visual cues.** Nothing glows, highlights, or indicates that an item is tappable. The player must poke around every element themselves. Filler content (normal messages, boring transactions) is also tappable and opens a detail view — it just has nothing worth screenshotting. This makes the investigation genuinely challenging: the player cannot distinguish real evidence from red herrings or filler by looking at the app; only context and judgment guide them.

**Everything is tappable.** Posts, messages, transactions, photos, map pins, contacts — all open a detail view. The player decides what matters.

## 7. Evidence Board

Floating button on the phone frame. Opens a full-screen overlay styled as a corkboard with polaroid-style cards pinned to it. Each collected item shows:
- App icon (source)
- Short label ("Restaurante romántico — él dijo que trabajaba")
- Tap to expand: full detail view

The player can collect between 0 and all available evidence before making a verdict. Making a verdict with 0 evidence is allowed but the reveal will mock it gently.

---

## 8. Verdict & Reveal Screen

Player taps "Dar veredicto" / "Make verdict" from the evidence board or home screen. Two big buttons:
- **Infiel / Cheater** (red)
- **Inocente / Innocent** (green)

**Reveal screen:**
- Correct verdict → celebratory animation + "¡Lo pillaste!" / "You got him!"
- Wrong verdict → gentle "Hmm… mira esto" / "Hmm… look at this"
- Shows a narrative summary: who the other person was, what happened, how the evidence connected
- If innocent: explains each red herring's true meaning
- Shows all evidence the player missed (greyed out cards they didn't find)
- "Jugar de nuevo" / "Play again" button → reloads with new seed

---

## 9. Language System

A `LANG` constant (`'es'` | `'en'`) is set at game start from the main menu choice and passed into all content generators. Every string in the game — UI labels, generated messages, app content, names, transaction descriptions — comes from a `t(key)` translation function. Spanish uses Spanish names, Spanish cities, euros (€). English uses English names, UK/US cities, pounds/dollars.

Main menu: two buttons, `Español` and `English`. Choice stored in `localStorage` so it persists on reload.

---

## 10. File Structure

```
index.html          — main entry, menu + game shell
css/
  style.css         — phone frame, global styles
  apps.css          — per-app visual styles (WhatsApp green, Instagram gradient, etc.)
js/
  rng.js            — seeded RNG (mulberry32)
  generator.js      — scenario builder: picks outcome, selects evidence, builds app content
  phone.js          — phone UI controller (navigation, app switching)
  apps/
    instagram.js
    whatsapp.js
    revolut.js
    twitter.js
    maps.js
    gallery.js
    messages.js
  evidence.js       — evidence board logic
  verdict.js        — verdict + reveal screen
  i18n.js           — translation system + all strings (ES + EN)
assets/
  avatars/          — CSS-generated avatars (no external images needed)
docs/
  superpowers/specs/
    2026-06-04-stalkie-design.md
```

No build step. Open `index.html` in any browser. Deploy to GitHub Pages by pushing to `main`.

---

## 11. Auto-Deploy to GitHub Pages

A `.github/workflows/deploy.yml` deploys the `main` branch to GitHub Pages on every push. No build step needed — source files are the deployed files.

---

## 12. Testing Plan

- **Generation test**: run the generator 100 times with different seeds, assert all outputs are valid scenario objects with the right shape
- **Evidence selection test**: assert no run has duplicate evidence IDs, assert guilty runs have ≥5 real evidence items, innocent runs have 0
- **Consistency test**: assert cross-app references (restaurant name in Revolut matches Maps) are consistent per run
- **Language test**: assert every `t(key)` call resolves in both ES and EN, no missing keys
- **UI smoke test**: manual walkthrough of one guilty run + one innocent run end-to-end
- **Verdict test**: all four combinations (guilty+correct, guilty+wrong, innocent+correct, innocent+wrong) produce the correct reveal screen
