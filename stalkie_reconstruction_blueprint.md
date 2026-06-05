# Stalkie · Mobile Detective — Full Reconstruction Blueprint

> **⚠️ Source Transparency Notice**
> The linked YouTube video (`MWB7kDnjeCE`) was inaccessible via server-side fetch (YouTube returns 429 to non-browser clients). This document is derived from: App Store / Google Play listings, APK metadata (AppBrain, APKPure, Softonic), third-party review aggregators (MWM.ai), user review text, and public walkthrough descriptions. Confidence levels are tagged per section. This blueprint is **not** based on direct video observation — budget a 1-day session of someone actually playing through the app to validate UI specifics before committing to build.

---

## 1. CORE CONCEPT & GENRE

### Classification
- **Genre:** Narrative investigation / interactive fiction / "phone simulation" mystery
- **Sub-genre:** Cozy crime / true-crime-adjacent casual puzzle
- **Platform:** iOS (App Store, id6745106241) + Android (com.gc.stalki), both live
- **Developer/Publisher:** Gregoire Collin / ISDLF (same individual-scale operation)
- **App Size:** ~50–75 MB (APK ~43–50 MB, iOS 75.1 MB listed)
- **Min Android version:** 7.0+
- **Released:** iOS Jan 13 2026 / Android ~Feb 2026
- **Current version:** 1.3.5 (Android) / 1.0.8 (iOS listing — likely lagging)

### Core Loop [Likely]
Each session follows a tight, linear loop:

```
Case Select → Case Intro / Context Screen
→ Simulated Phone Home Screen (fake OS)
→ Free exploration of fake apps (messages, gallery, notes, social, calendar, etc.)
→ Question/Deduction prompt appears
→ Player types free-text answer
→ AI or keyword matcher evaluates answer
→ Correct → next clue/question unlocks → repeat
→ All questions answered → Case resolved / outcome screen
→ Return to case select or paywall
```

### Target Audience
- [Likely] Women 18–35, true-crime podcast listeners, casual mobile gamers
- Secondary: anyone drawn to "phone snooping" / relationship drama narrative hooks
- Not a hardcore gamer demographic — no reflexes, no time pressure for core play (despite "before time runs out" copy, likely soft or cosmetic only)

---

## 2. UI/UX AUDIT

### Color Palette [Certain from screenshots]
- **Primary:** Warm pink / rose (`~#F472B6` range or deeper magenta-adjacent)
- **Background:** Soft cream/white alternating with the pink
- **Accent:** White, with occasional black text
- **Illustration style:** Flat, minimal — female detective character with magnifying glass in onboarding/splash
- **Tone:** Feminine-coded, soft aesthetic — intentional audience targeting

### Screen Inventory [Likely — inferred from store screenshots + review text]

| # | Screen Name | Description |
|---|-------------|-------------|
| 1 | **Splash / Onboarding** | Pink screen, "Stalk in detective mode" headline, female detective illustration |
| 2 | **Case Select / Home** | Grid or list of available cases; locked cases visible (paywall state) |
| 3 | **Case Intro** | Character profile card + mystery setup text — "who is this person, what's the situation" |
| 4 | **Fake Phone Home Screen** | Simulated smartphone OS homescreen with app grid icons |
| 5 | **Messages App** | Chat-style UI with conversations, possibly deleted/recovered thread view |
| 6 | **Social App** | Fake Instagram/social feed — posts, comments, profile view |
| 7 | **Gallery / Photos** | Photo grid; some images "deleted" with recover mechanic |
| 8 | **Notes App** | List of text notes with titles |
| 9 | **Calendar App** | Month/week view with events as clues |
| 10 | **Contacts App** | Contact list with profile details |
| 11 | **Locked/Hidden Content** | Blur or password-gate over certain content — discoverable with investigation |
| 12 | **Question / Deduction Screen** | Full-screen prompt: "What did he take pictures of?" + free-text input field |
| 13 | **Answer Feedback Screen** | Correct/incorrect response with optional hint |
| 14 | **Case Resolution Screen** | Narrative wrap-up, "case solved" + summary |
| 15 | **Paywall / IAP Screen** | "Unlock full experience" — appears after free questions quota met |
| 16 | **Settings / Profile** | Minimal — likely just account management or sound toggles |

### Navigation Structure [Likely]

```
App Launch
    └── Splash / Onboarding (first launch only)
            └── Case Select Screen
                    ├── [Free case] → Case Intro → Fake Phone → Q&A Loop → Resolution
                    └── [Locked case] → Paywall → [Unlock] → Case Intro → ...

Fake Phone (internal navigation):
    Home Screen (app grid)
        ├── Messages → Thread List → Individual Thread
        ├── Gallery → Photo Grid → Full-screen photo
        ├── Notes → Note List → Note Detail
        ├── Calendar → Calendar View → Event Detail
        ├── Social App → Feed / Profile View
        ├── Contacts → Contact List → Contact Detail
        └── [Locked Content] → Blur/gate → Discoverable

Persistent floating element:
    "Question" button or panel accessible from any fake-phone screen → Question/Answer modal
```

### Component Breakdown [Guessing — extrapolated from genre conventions + screenshots]

**Case Select Screen:**
- Case card (thumbnail, case title, status badge: "Free" / "Locked" / "Completed")
- Horizontal or vertical scroll list
- Lock icon overlay on premium cases

**Fake Phone Home Screen:**
- App grid (2×4 or 3×3 icon layout)
- Fake status bar (time, battery, signal — cosmetic)
- Each app icon = tappable, animates into that app's UI

**Messages App:**
- Conversation list (contact avatar, name, last message preview, timestamp)
- Thread view with chat bubbles (sent/received styling)
- "Deleted message" shown with strikethrough or greyed state; tap to "recover"

**Question Screen:**
- Case character profile (small avatar + name at top)
- Question text (bold, prominent)
- Multi-line free-text input
- "Submit" CTA button
- Optional "Hint" button (possibly costs premium currency or is IAP-gated)

**Paywall Screen:**
- Emotional/narrative hook headline
- Single price point or subscription offer
- "Continue investigation" CTA

### Typography [Guessing]
- Display/headline: rounded or soft sans-serif — likely something like Nunito, Poppins, or a similar "friendly" mobile-first font
- Body: clean readable sans-serif
- No serifs visible in screenshots

### Animations [Guessing — inferred from genre + review mentions of "immersive"]
- App icon tap → scale-up + screen slide transition into app
- Fake phone appear on case start → slide up from bottom (phone frame entering frame)
- Deleted photo recovery → fade-in reveal animation
- Correct answer → green flash / confetti-style micro-animation
- Wrong answer → red shake on input field

---

## 3. FEATURE LIST

### Core Features

| Feature | User Behavior | Technical Approach | Priority |
|---------|--------------|-------------------|----------|
| **Fake phone OS shell** | Navigate a simulated smartphone with app grid | React Native / Flutter custom component, not a real OS emulator — static layout with app routing | CORE |
| **Case content delivery** | Read messages, view photos, check notes per case | JSON content files per case, loaded on case start; media assets (images) bundled or CDN-delivered | CORE |
| **Free-text answer input** | Type answers to deduction questions | TextInput → submit to AI evaluation endpoint OR local keyword-matching engine | CORE |
| **Answer evaluation** | System judges whether answer is correct | [See §4 — critical ambiguity: AI API call vs. local keyword list] | CORE |
| **Case select / lobby** | Browse and start cases | Static list with locked/unlocked state persisted locally | CORE |
| **Paywall / IAP** | Unlock premium cases | StoreKit (iOS) / Google Play Billing (Android); single purchase or subscription | CORE |
| **Deleted content recovery** | "Find" hidden messages or photos | Flag in content JSON marks items as initially hidden; tap-to-reveal mechanic | CORE |
| **Locked app/content gating** | Some fake apps start locked, discoverable via clues | Content JSON includes unlock condition (e.g., "find password in notes") | SECONDARY |
| **Calendar clues** | Tap calendar events that carry narrative weight | Static calendar component with event data from case JSON | SECONDARY |
| **Social app feed simulation** | Scroll a fake social feed | Rendered list of fake posts from case content | SECONDARY |
| **GPS / location data clues** | Connect location info to deductions | Static map screenshot or simplified map component with pinned location | NICE-TO-HAVE |
| **Hint system** | Get a nudge when stuck | Either IAP-gated or ad-rewarded; returns a pre-written hint string per question | SECONDARY |
| **Case progress persistence** | Resume a case mid-way | AsyncStorage / local DB storing current question index + unlocked content flags | CORE |
| **Onboarding flow** | First-run tutorial case | Scripted first case with UI callouts | SECONDARY |

---

## 4. TECHNICAL STACK INFERENCE

### Frontend Framework [Likely]
**React Native** — most probable for a solo/micro-team shipping cross-platform simultaneously at this scale and speed (Jan→Feb 2026 iOS→Android gap is consistent with RN or Flutter). Flutter is plausible second choice.

Evidence for RN over Flutter:
- Faster content iteration (JS-driven content JSON)
- Expo ecosystem suits a solo dev (Gregoire Collin appears to be a single developer)
- 75 MB iOS binary is consistent with a RN app with bundled assets

### Backend Architecture [Likely]
The critical unknown is **answer evaluation**:

**Option A — AI API evaluation (likely, given review complaints about AI-generated content and "incorrect answers being rejected"):**
- Each question submission hits an Anthropic/OpenAI API endpoint
- Prompt: `"The correct answer to [question] about [case] is [stored answer]. The user said: [input]. Is this correct? Reply YES or NO."`
- This explains why correct answers get rejected — LLM inconsistency / prompt fragility
- Backend: lightweight serverless (Vercel / Supabase edge function) to proxy the AI call and hide the API key

**Option B — Keyword/synonym matching (less likely given review complaints):**
- Local JSON: `{ "question_id": "q3", "accepted_answers": ["hotel", "motel", "accommodation"] }`
- Pure client-side evaluation
- Cheaper to operate, but brittle — consistent with the "wrong answer" frustrations

**Recommendation for clone:** Use Option A for the real experience, Option B as fallback. The AI call is the secret sauce that makes free-text feel viable.

**Other backend needs:**
- IAP receipt validation (StoreKit/Play Billing server-side or RevenueCat)
- Case content CDN (new cases fetched OTA, not always bundled — consistent with ~50 MB base size)
- Minimal user accounts — likely no server-side account at all; progress is local only

### Likely Third-Party Services [Guessing]
| Service | Purpose |
|---------|---------|
| **RevenueCat** | IAP abstraction across iOS + Android (standard for solo devs) |
| **OpenAI or Anthropic API** | Answer evaluation (Claude Haiku / GPT-4o-mini for cost) |
| **Firebase or Supabase** | Remote config for case content delivery (or just CDN + JSON files) |
| **Expo** | Build tooling if React Native |
| **Sentry** | Error tracking (consistent with "occasional technical glitches" user reports) |

### Authentication [Certain — none observed]
No login/account system mentioned anywhere. Progress stored locally. This is intentional for friction-free casual onboarding.

### Data Persistence [Likely]
- **Local only:** AsyncStorage (RN) or SharedPreferences (Android native)
- State: `{ cases: { [caseId]: { unlocked: bool, currentQuestion: int, unlockedContent: string[] } } }`
- No cloud sync — losing your phone loses progress

---

## 5. GAME/INTERACTION MECHANICS

### Rules
- No fail state — you cannot "lose" a case permanently
- Wrong answers → feedback + retry (no lives/energy system observed in reviews)
- Progress gates: answering question N may unlock content in the fake phone needed to answer question N+1
- Exploration is non-linear (you can open any fake app), but questions are linear and sequential

### Answer Evaluation [Likely AI-assisted]
This is the most technically interesting mechanic. User types a natural language answer; system evaluates semantic correctness. The review complaints ("I know I'm right but it says wrong") are the hallmark of LLM-as-judge inconsistency, not keyword matching brittleness.

### Scoring / Progression [Likely]
- No visible score or XP system
- Progression = case completion
- Paywall separates free cases from premium — standard freemium narrative gate
- No timer actually penalizes gameplay despite "before time runs out" marketing copy (no evidence of time-based mechanics in any review)

### Multiplayer / Social
- None. Single-player, fully offline-capable once case assets downloaded.

### Content Structure [Likely]
Each case = a self-contained content bundle:
```
case_001/
  ├── metadata.json         # title, description, character profiles
  ├── messages.json         # fake SMS/chat threads
  ├── gallery.json          # image references + deletion flags
  ├── notes.json            # note entries
  ├── calendar.json         # events
  ├── social.json           # fake social posts
  ├── questions.json        # ordered list of questions + evaluation hints
  └── assets/               # images, avatars
```

---

## 6. RECONSTRUCTION ROADMAP

### Phase 1 — MVP (4–6 weeks, 1–2 devs)
Minimum viable loop: one playable case, core fake-phone shell, IAP hook.

**Screens:**
- [ ] Splash / Onboarding screen
- [ ] Case select (1 free, 1 locked)
- [ ] Fake phone shell (home screen + app routing)
- [ ] Messages app (conversation list + thread view)
- [ ] Gallery app (photo grid + full-screen)
- [ ] Notes app (list + detail)
- [ ] Question / Answer screen with free-text input
- [ ] Answer evaluation (start with keyword matching; upgrade to AI later)
- [ ] Answer feedback (correct/incorrect)
- [ ] Case resolution screen
- [ ] Basic paywall screen (no functional IAP yet)

**Content:**
- [ ] 1 complete case hand-authored in JSON schema
- [ ] Asset pipeline for fake-phone images

**Tech decisions to make before day 1:**
- React Native (Expo) vs Flutter
- Content schema design (JSON structure above is a starting point)
- Answer evaluation method (keyword vs. AI proxy endpoint)

---

### Phase 2 — Feature Parity (4–6 additional weeks)
**Features:**
- [ ] Calendar app with event detail view
- [ ] Contacts app
- [ ] Fake social app (feed + profile)
- [ ] Locked content mechanic (password/clue gates)
- [ ] Deleted content recovery animation
- [ ] Hint system
- [ ] Functional IAP (RevenueCat integration)
- [ ] Progress persistence (resume mid-case)
- [ ] AI answer evaluation via proxy endpoint
- [ ] OTA case content delivery (remote JSON fetch)
- [ ] 3–5 additional cases

---

### Phase 3 — Polish (2–4 additional weeks)
**Animations & UX:**
- [ ] Fake phone entrance animation (slide up from bottom)
- [ ] App icon tap → scale + transition
- [ ] Correct answer celebration micro-animation
- [ ] Wrong answer shake on input
- [ ] Photo "deleted" recovery fade-in
- [ ] Smooth case-to-case transitions

**Quality:**
- [ ] Edge case: AI evaluator returns ambiguous/error → graceful fallback
- [ ] Accessibility pass (text sizes, contrast)
- [ ] Performance: image lazy loading, case bundle caching
- [ ] Error tracking (Sentry)
- [ ] App Store / Play Store screenshots and ASO

---

## 7. OPEN QUESTIONS & REQUIRED DESIGN DECISIONS

These cannot be resolved from public information. Each needs an answer before development begins.

| # | Question | Impact | Default Recommendation |
|---|----------|--------|------------------------|
| Q1 | **Is answer evaluation AI (LLM) or keyword matching?** | Entire backend architecture, ongoing API cost, answer quality | Use LLM (GPT-4o-mini or Claude Haiku) via a proxy. Budget ~$0.002/answer evaluation |
| Q2 | **Is there a hint system, and is it monetized?** | IAP model complexity | Offer 3 free hints/case, then ad-rewarded or IAP |
| Q3 | **Does the timer in marketing copy actually function?** | If yes, adds a lives/energy system; if no, ignore | Evidence strongly suggests cosmetic only — ignore |
| Q4 | **Is progress server-side or local only?** | Backend infrastructure needs | Local only for v1; add cloud sync in v2 if retention warrants it |
| Q5 | **How many questions per case?** | Content production effort per case | Screenshots suggest ~5–10 questions per case |
| Q6 | **Does the fake phone show a real clock/date synced to case timeline?** | Immersion; requires date-locking content to a fictional date | Set a static fictional "case date" in metadata, display it as phone system time |
| Q7 | **What is the exact IAP pricing?** | Conversion rate benchmarking | Not public; recommend $2.99–$4.99 per case or $7.99–$9.99 full unlock |
| Q8 | **Are case images AI-generated?** | Legal/PR risk; review complaints mention this | User reviews confirm AI-gen images; use human-designed or licensed assets for clone to differentiate |
| Q9 | **Is there a GPS/maps component?** | One additional fake app to build | Marketing copy mentions "GPS data" — possibly just a static screenshot of a map |
| Q10 | **What fake social app is simulated?** | Design effort for fake UI | Screenshots show a generic feed — not a real app skin. Build your own fake social UI |
| Q11 | **Are cases downloadable post-install (OTA) or all bundled?** | Determines whether you need a CMS/CDN | Given base app size of ~50 MB and "120K downloads last 30 days" growth rate, new cases are likely OTA |
| Q12 | **Is there any onboarding tutorial?** | First-run experience design | Screenshots show an illustrative splash — likely a single guided case, not UI tooltips |

---

## 8. CRITICAL BUILD RISKS

These are the things most likely to sink the project or create costly rework:

1. **Answer evaluation quality** — If you use keyword matching, you'll get the same user complaints Stalkie has ("my right answer was rejected"). LLM-as-judge is the right call but adds latency (~500–1000ms per evaluation) and ongoing cost. Design for async evaluation with a loading state.

2. **Content production is the bottleneck, not engineering** — The fake phone shell is 2–3 weeks of work. Writing compelling, internally consistent case content (messages, photos, social posts, notes, calendar events) that all cohere around a mystery is the hard, slow, expensive part. Budget 2–3 weeks of content work per case.

3. **AI-generated image backlash** — User reviews explicitly call out AI imagery as a negative. If your clone uses AI-generated case photos (avatars, "real" photos in the gallery), expect the same complaints. This is a product differentiator opportunity: hand-crafted or licensed photography for all case assets will be a real competitive advantage.

4. **Paywall placement** — Stalkie's primary complaint is "paywall too early." If you mirror the mechanic without adjusting the gate, you'll inherit the conversion/retention problem. Recommend offering a complete first case free (not just partial) to build habit before monetizing.

5. **Fake-phone immersion breaks** — Any rendering inconsistency (fonts that look wrong for a fake OS, native keyboard appearing over the fake phone UI) destroys the core fantasy. Invest in the fake-phone frame visual fidelity early.

---

*Document generated: June 2026. Based on public data; video content from official YouTube channel was unavailable for server-side analysis. Validate all [Guessing]-tagged items against direct app observation before committing to architecture decisions.*
