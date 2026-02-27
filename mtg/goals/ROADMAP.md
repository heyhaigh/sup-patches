# MTG — What we're building next (detailed plan, task-level)

Below is a concrete, "do-this-next" list, organized by priority. It's written to be actionable even if we later reshuffle files/components (I'll reference likely targets like "Play tab UI code" rather than assuming exact filenames).

---

## P0 — Stabilization + regression-proofing ✅

### 1) Lock in Play tab configuration logic ✅

**Implemented:**

- **`getPlayConfig()`** (line 778) — single canonical config reader returning `{ format, opponentType, botDifficulty, deckId, deckName }` with normalized values
- **`updateOpponentUI()`** (line 761) — sole toggle point for bot UI; forces human + disables selector on non-standard formats; defaults difficulty to `"easy"` when bot shown
- **Called on all required moments** — `playFormat` change, `playOpponent` change (lines 1451-1452), deck render, initial boot
- **`validateAndCreateMatch()`** (line 1049) — full submission gate: checks no deck, non-standard bot, missing difficulty before server call

### 2) Select hardening ✅

- Native `<select>` elements with clean CSS — no clipping, overflow, or stacking context issues around Play tab controls

### 3) Dev-only "Sanity checks" panel ✅

**Implemented:**

- **Triple-click toggle** on header (line 797), persisted via `sessionStorage`
- **Computed config display** — live JSON of `getPlayConfig()` output (line 810)
- **Last Create Payload + Response** — logged via `devLog()` hooks in validate/create flow
- **Copy Config JSON + Copy All** buttons (lines 279-280)
- Hidden during match mode via `.appRoot.matchActive #devPanel { display:none !important; }`

---

## P1 — Match flow improvements ✅

### P1.5 — Game Mat UI (Arena-style) ✅

**Implemented:**

- **Mulligan hand card display** — 7 card images (100×140) in centered flex container. Clickable (select) and double-clickable (inspect modal). Redraws on mulligan with updated hand.
- **Split-view game board** — Opponent top, player bottom, turn bar center. Dark gradient background (`#1a1a2e` → `#16213e` → `#0f3460`).
- **Floating card inspector** — Replaces old sidebar. Shows card image, name, type, action buttons (Play/GY/Inspect). Auto-hides when no card selected.
- **Turn bar** — Turn number, active player (gold highlight), phase label, Draw and End Turn buttons.
- **Hand tray** — Bottom tray with card images (90×126), horizontal scroll, double-click to play.
- **Zone badges** — Compact badges (Lib/Hand/GY/Exile/Cmd) per player showing zone counts.
- **Mobile responsive** — Board stacks vertically, hand tray scrolls, inspector slides up from bottom.

### 4) Better mulligan UX ✅

- Hand summary pills: "Cards in hand: N", "Mulligans taken: X"
- One-tap Keep / Mulligan buttons with in-flight disable
- `mulligansTaken` + `kept` tracked per seat in match state

### 5) Card inspection + zone clarity ✅

- Zone badges with counts per player (Lib/Hand/GY/Exile/Cmd)
- Click card → floating inspector; double-click → full inspect modal (name, mana cost, type, oracle text, full art)
- Modal dismissible via X + backdrop click, scrollable, not clipped
- Opponent hand/library hidden — counts + card-backs only, no real card data

### 6) Turn + phase scaffolding ✅

- `turn`, `activePlayerSeat`, `step` tracked in `match.game`
- Turn bar shows "Turn X — Your turn / Opponent's turn — Phase"
- End turn advances turn/active player, triggers bot action if enabled

---

## P2 — Bot + deck realism ✅

### 7) Bot behavior improvements ✅

**Implemented:**

- **Card type awareness** — `engineBotCardMeta()` and `engineBotIsLand()` helpers read `match.decks[seat].cardMeta` (typeLine, cmc) to distinguish lands from non-lands and sort by mana cost
- **`cardMeta` (with cmc) stored in match deck data** — added to `createInitialMatchState`, `ASSIGN_DECK`, and both quickstart deck builders
- **Difficulty heuristics:**
  - **Easy:** 40% chance to pass entirely; otherwise plays 1 random card (no type preference)
  - **Medium:** plays a land first if available, then 1 low-CMC non-land (sorted ascending)
  - **Hard:** plays a land first, then 1-2 non-lands sorted by CMC; caps board at 6 permanents to avoid overextending
- **"Bot is thinking..." UX** — client-side 1.2-2s delay with animated spinner in turn bar after ending turn vs bot. Toast summary: "Bot played N cards" or "Bot passed"

### 8) Deck quality upgrades ✅

**Implemented:**

- **Standard curve awareness** — `buildQuickstartStandardDeck()` fetches 3 pages, buckets cards by CMC (low 1-2, mid 3-4, high 5+), picks 4/3/2 cards per bucket (4x each = 36 spells + 24 lands)
- **Commander ratio targets** — `buildQuickstartCommanderDeck()` fetches 4 pages, categorizes pool via `cmdDeckCategorize()` using type_line/oracle_text heuristics into ramp/draw/removal/other. Targets: ~10 ramp, ~10 draw, ~5 removal, ~37 other (+ commander + ~37 lands = 100)

---

## P3 — Commander match mode ✅

### 9) Commander "table" scaffolding (2-4 seats) ✅

**Implemented:**

- **Seat assignment** — auto-assigned on join (`seat = players.length + 1`), up to 5 players for Commander
- **Ready checks per seat** — each player must assign deck + set ready before host can start
- **Turn order display** — lobby shows turn order chip row for 3+ players (seat number + player name, viewer highlighted). Game turn bar shows numbered seat dots with gold highlight on active seat.
- **Hidden zones remain private** — `getMatchViewForUser()` replaces non-viewer hand/library with `{ count: N }`, no card data leaked
- **Compact multiplayer opponent panels** — `.oppSide.multi` renders opponents side-by-side with smaller cards (52×72) when 3+ opponents. Stacks vertically on mobile.
- **Active-player highlight** — `.seatPanel.active` gold border + subtle background on the active player's board panel, transitions smoothly on turn change

---

## P4 — Gameplay: Mana + Combat + Win/Loss 🔜

> Full plan: [`GAMEPLAY_PLAN.md`](./GAMEPLAY_PLAN.md)

### Phase 1: The Game Exists

Turn the card viewer into an actual game. Three pillars:

- **Mana system** ✅ — Hearthstone-style auto-increment (no lands, CMC-based, cap at 10). Standard deck size → 30 cards, Commander → 60. Purple gem mana bar in turn bar, unplayable cards dimmed, CMC shown in inspector, bot is mana-aware.
- **Combat system** ✅ — Declare attackers → declare blockers → damage resolution. Creatures tap on attack, have summoning sickness, die when damage >= toughness. Phase-aware turn bar (M1/CMB/M2 pills). Bot attack/block AI with difficulty scaling. Human blocker declaration with click-to-assign UX.
- **Life totals + win/loss** ✅ — Standard 20 / Commander 40. Unblocked attackers deal damage. Life reaches 0 = loss. Concede option. Deck-out loss. Game over overlay with stats (turns, life, kills, damage). Play Again / Main Menu buttons. Life badge pulses red at low HP, flashes on damage taken.
- **Card type differentiation** ✅ — Creatures have P/T + combat. Instants/sorceries resolve and go to GY (spell cast overlay animation). Enchantments/artifacts persist on battlefield.
- **Turn phases** ✅ — Main 1 → Combat (Attackers → Blockers) → Main 2 → End. Phase pill indicator in turn bar. Cards only playable in main phases.
- **Bot combat AI** ✅ — Easy (attack all, block random), Medium (attack with advantage, block to trade up), Hard (scoring-based attack/block decisions).

### Phase 2: The Game Is Strategic

- 13 keyword abilities ✅ (Flying, First Strike, Trample, Deathtouch, Lifelink, Haste, Vigilance, Reach, Double Strike, Menace, Defender, Indestructible, Hexproof)
- Aura attachment ✅ (enchantments that attach to creatures with +N/+N, aura badge, green buffed P/T, cleanup on creature death)
- Basic targeting system ✅ (target creature UI for auras, purple glow, confirm/cancel, Hexproof enforcement)
- ~~Combat AI improvements (keyword awareness)~~ ✅ (integrated with keyword abilities)
- Visual polish (damage numbers, death animations, spell overlays)

### Phase 3: The Game Is Polished ✅

- ~~Multiple blockers, commander damage tracking~~ ✅
- ~~Simple parseable oracle text effects (damage, destroy, draw, life gain, exile, bounce, tokens)~~ ✅
- ~~Mobile UX polish, undo, context menus, event log~~ ✅
- ~~Game over experience with stats~~ ✅

### Phase 5: Card Mechanics Expansion ✅

> Full plan: [`GAMEPLAY_PLAN.md`](./GAMEPLAY_PLAN.md) — Phase 5 section

Fixes broken cards and expands supported mechanics:

- **5A: Modal Spells + Board Sweeps + Expanded Targeting** ✅ — "Choose one/two" spells (Austere Command), "destroy all artifacts/creatures", target artifacts/enchantments not just creatures (Untimely Malfunction). Mode selection UI overlay.
- **5B: Equipment Artifacts** ✅ — Play to battlefield, equip to creature via activated ability, +N/+N mods, stacked visual (peek strip above creature), equipment stays on battlefield when creature dies.
- **5C: Instant-Speed Casting** ✅ — Lightweight response windows (not full stack/priority). Human can play instants during bot's turn. Purple flash banner + glow on playable instants.
- **5D: Scry / Top-Card-View** ✅ — "Scry N" and "look at top N" abilities. Click-to-reorder UI overlay. Sensei's Divining Top support. Bot auto-resolve.

### Phase 6: Gameplay Polish (Post-Playtest Fixes) ✅

Fixes from playtesting Commander matches (2026-02-26):

- **Equipment Equip button** ✅ — Added Equip button to floating inspector (was only in right-click context menu). Shows cost, disables when insufficient mana.
- **Bot attack target display** ✅ — Bot attack overlay now shows WHO the bot is attacking (e.g. "Bot 1 attacks Player with 3 creatures!"). `targetSeat` added to ATTACKERS_DECLARED log.
- **Dead player visual** ✅ — Eliminated players get `.eliminated` class (opacity 0.4, grayscale, pointer-events none) + skull (☠) overlay on battlefield.
- **Multi-select attackers (Commander)** ✅ — Click multiple creatures to stage them (pulsing gold dashed border), then click an opponent to assign all staged creatures at once. Replaces tedious one-at-a-time assignment.
- **Hand size discard** ✅ — End of turn enforces 7-card hand limit (MTG rule). Discard overlay with card grid, click-to-select, confirm. Bot auto-discards highest CMC first. Respects "no maximum hand size" cards.
- **Artifact targeting fix** ✅ — `renderCardImg` now wraps ALL battlefield permanents in `.cardWrap` divs (was only creatures), fixing targeting for artifacts/enchantments.
- **Per-bot turn display** ✅ — Individual "Bot N's Turn" overlays instead of grouped "Bots are thinking". Quick mode with per-bot summary toasts.

---

## P5 — Code Cleanup 🔜

### Full-file audit (2026-02-26)

7,800-line codebase audited across 4 parallel agents. Findings categorized by confidence.

#### HIGH Confidence — Dead Code to Remove

| # | Area | Finding | Lines |
|---|------|---------|-------|
| 1 | CSS | Dead `.muted` class (duplicate of `.small`) | ~100 |
| 2 | CSS | Dead `.noteBox ul` (no `<ul>` in noteBox) | ~70 |
| 3 | CSS | Dead `.tokenBadge` (never assigned) | ~395 |
| 4 | CSS | Dead `.turnDot.done` (never added by JS) | ~375 |
| 5 | CSS | Dead `.mulliganHand` rules (old mulligan, replaced by overlay) | ~127-129 |
| 6 | HTML | Dead `#mulliganPanel` block (permanently hidden, replaced by dynamic overlay) | ~618-630 |
| 7 | Client | Dead onclick bindings for hidden mulligan buttons | ~4610-4611 |
| 8 | State | Dead `oppHandHighlight: {}` (never read/written) | ~812 |
| 9 | State | 6 unused `GC` constants (only `LIFE_CRIT_STD`/`CMD` used) | ~800 |
| 10 | Client | Dead `getHandCountForMySeat` function | ~1494-1500 |
| 11 | Server | Dead `api_getCard` endpoint (never called) | ~4737-4741 |
| 12 | Server | Dead `api_validateDeck` endpoint (never called from client) | ~4753-4759 |
| 13 | Client | Dead `_devState.lastValidate` + setter branch | ~1165, 1195 |
| 14 | Server | Dead `SUPPORTED_KEYWORDS` array (client has its own) | ~5980 |
| 15 | Server | Dead `LIFE_CRITICAL_*` constants in GAME_CONST | ~5182-5183 |
| 16 | Server | Dead `basicLandNameForColor` + `getBasicLandIdByName` + cache key | ~4900-4918, 12 |
| 17 | Server | Duplicate `oracleText` key in `simplifyCard` | ~7820 |
| 18 | Server | No-op `totalDmgToBlockers += 0` | ~6226 |

#### HIGH Confidence — Bugs Found

| # | Finding | Lines |
|---|---------|-------|
| A | `imageUrl` should be `imageSmall`/`imageNormal` — equipment peek images always empty | ~2447 |
| B | Mana display destroyed when hand is empty (innerHTML wipes it) | ~3060-3062 |
| C | Duplicate `.deathOverlay` CSS — skull fades out after 0.8s due to `deathFade` animation conflict | ~330 vs 419 |

#### MEDIUM Confidence — Consolidation Opportunities (Future)

| # | Finding |
|---|---------|
| D | `confirmBlockers`/`noBlocks` share 11 identical cleanup lines → extract helper |
| E | Post-combat resolve duplicated in DECLARE_BLOCKERS vs NO_BLOCKS → extract helper |
| F | Deck-out handling duplicated 3× → extract `engineHandleDeckOut` helper |
| G | Bot-thinking spinner pattern repeated 5× → extract helper |
| H | `engineBotIsLand` duplicates `engineCardType` check → remove, use `engineCardType` |
| I | `getTargetableCreatures` trivial single-use wrapper → inline |
