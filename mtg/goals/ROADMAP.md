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
