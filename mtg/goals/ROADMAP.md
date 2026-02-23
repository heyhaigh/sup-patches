# MTG — What we're building next (detailed plan, task-level)

Below is a concrete, "do-this-next" list, organized by priority. It's written to be actionable even if we later reshuffle files/components (I'll reference likely targets like "Play tab UI code" rather than assuming exact filenames).

---

## P0 — Stabilization + regression-proofing (next up)

### 1) Lock in Play tab configuration logic (regression-proof)

**Goal:** Format / opponent / bot difficulty / deck selection always stay in sync with what the server request will use.

**Tasks:**

- **1.1 Centralize state reads**
  - Create a single function that reads current UI selections and returns a canonical config object:
    - `{ format, opponentType, botDifficulty, deckId }`
  - Normalize values:
    - format: `"standard"` | `"commander"`
    - opponentType: `"human"` | `"bot"` (or whatever the server expects)
    - botDifficulty: `"easy"` | `"medium"` | `"hard"` (default `"easy"`)
    - deckId: string or null

- **1.2 Make `updateOpponentUI()` the only place that toggles opponent-related UI**
  - Responsibilities:
    - Show/hide bot difficulty container (`#botOptions`) correctly
    - Enable/disable opponent selector for non-standard formats
    - Ensure bot difficulty value is set to something valid when shown (and not accidentally submitted when hidden)
  - Guardrails:
    - If `format !== "standard"`:
      - force opponent to `"human"` (or disable to a single option)
      - hide bot options
    - If `format === "standard"` and `opponent === "bot"`:
      - show bot options
    - Otherwise:
      - hide bot options

- **1.3 Ensure `updateOpponentUI()` is called in *all* required moments**
  - Immediately after DOM/UI render completes (initial boot)
  - Immediately after deck dropdowns are rendered/refreshed
  - On `playFormat` change
  - On `playOpponent` change
  - (Optional but useful) after loading persisted UI state

- **1.4 Add a "submission gate" before match creation**
  - When user clicks **Validate + Create**:
    - recompute config from UI
    - validate constraints with clear errors:
      - no deck selected
      - non-standard trying to use bot
      - bot difficulty missing while opponent=bot
    - only then call the server callback

**Acceptance criteria:**
- Standard -> Bot: difficulty always visible and included in create payload.
- Standard -> Human: difficulty always hidden and excluded/ignored.
- Commander: opponent selector disabled (or forced), bot options never appear.

**Regression test script:**
- Flip Standard<->Commander repeatedly; confirm no stale bot UI lingers.
- Set Standard+Bot+difficulty=Hard, then switch to Human, then back to Bot: difficulty still present + sane.

---

### 2) Fix/select hardening (native `<select>` robustness)

**Goal:** Deck dropdown reliably opens across embedded webviews/mobile.

**Tasks:**

- **2.1 CSS audit for "select killers"**
  - Inspect containers around the Play tab for:
    - `overflow: hidden` / `overflow: clip`
    - `transform` on parents (even `transform: translateZ(0)`)
    - `backdrop-filter`
    - positioned overlays (`position: absolute/fixed`) with higher z-index
  - For anything that must stay:
    - ensure it does not wrap the `<select>` (or relax the style only for the Play tab area)

- **2.2 Pointer-events audit**
  - Check if any overlay element is intercepting taps/clicks:
    - Add `pointer-events: none` to purely decorative layers
    - Ensure the select itself (and its label) remain `pointer-events: auto`

- **2.3 Z-index / stacking context sanity**
  - Reduce unnecessary stacking contexts near the Play tab controls.
  - Avoid wrapping the select in elements that create new stacking contexts unless needed.

- **2.4 If still flaky: replace the native `<select>` with a custom dropdown**
  - Build a simple custom menu:
    - button-like trigger displaying selected deck name
    - menu list that opens in a portal-like container (at end of DOM) to avoid clipping
    - keyboard support (optional but nice): Esc closes, arrows navigate
    - touch-friendly row height

**Acceptance criteria:**
- Deck selection is reliable on at least:
  - desktop browser
  - mobile browser
  - embedded preview/webview scenario (where the issue previously appeared)

---

### 3) Add a dev-only "Sanity checks" panel (fast debugging)

**Goal:** Make it impossible to regress silently — see the *actual* config used and key match state at a glance.

**Tasks:**

- **3.1 Add a dev toggle**
  - Options (pick one):
    - a small bug icon in header
    - a query param `?debug=1`
    - a local storage flag
  - Should be off by default.

- **3.2 Display Play tab computed config**
  - Show:
    - format
    - opponent type
    - bot difficulty
    - selected deckId + deck name
  - Include a "Copy JSON" button (copies config to clipboard)

- **3.3 Display server-side validation echo**
  - After "Validate + Create", show:
    - the payload we sent
    - the response (matchId, any warnings)
  - If validation fails, show error text and highlight the failing field.

- **3.4 (Optional) Show current match summary when in lobby/playing**
  - matchId, phase (lobby/mulligan/playing)
  - active player / turn number if tracked
  - each seat: ready status, deck attached, hand/library counts (viewer-safe)

**Acceptance criteria:**
- When a UI bug happens, we can capture a screenshot with the panel open and immediately know what the UI thinks is selected.

---

## P1 — Match flow improvements (UX + clarity)

> **P1 items 4-6 are partially or fully implemented as of the P1.5 Game Mat UI milestone below.**

---

## P1.5 — Game Mat UI (Arena-style) ✅

**Goal:** Replace the flat list game view with an immersive Arena/Gwent/Hearthstone-style game mat, and show actual card images during mulligan.

**Implemented:**

- **Mulligan hand card display** — 7 card images (100×140) rendered in a centered flex container during mulligan phase. Cards are clickable (select) and double-clickable (inspect modal). Redraws on mulligan with updated hand.
- **Split-view game board** — Opponent at top, player at bottom, with turn bar in the center. Dark gradient background (`#1a1a2e` → `#16213e` → `#0f3460`).
- **Floating card inspector** — Replaces the old sidebar inspector. Shows card image, name, type, and action buttons (Play/GY/Inspect). Auto-hides when no card selected.
- **Turn bar** — Center strip showing turn number, active player (highlighted gold when your turn), phase label, Draw and End Turn buttons.
- **Hand tray** — Bottom tray with larger card images (90×126), horizontal scroll on overflow, double-click to play to battlefield.
- **Zone badges** — Compact badges (Lib/Hand/GY/Exile/Cmd) per player showing zone counts.
- **Mobile responsive** — Board stacks vertically, hand tray scrolls horizontally, inspector slides up from bottom.

**Files changed:** `mtg/mtg.js` (CSS + HTML + JS in `getClientHtml()` template literal)

---

### 4) Better mulligan UX

**Goal:** Mulligan phase is quick, clear, and hard to misclick.

**Tasks:**

- **4.1 Clear hand summary**
  - Show "Cards in hand: N"
  - Show mulligan count ("Mulligans taken: X")

- **4.2 One-tap actions**
  - Primary: **Keep**
  - Secondary: **Mulligan** (with confirmation if needed)
  - Disable buttons while server request is in flight.

- **4.3 Track mulligan count in match state**
  - Per seat:
    - `mulligansTaken`
    - `kept` boolean
  - Ensure it persists through refresh/reopen.

**Acceptance criteria:**
- Both players (or player+bot) resolve mulligans cleanly and proceed automatically to Playing.

---

### 5) Card inspection + zone clarity

**Goal:** Users always understand what zone they're looking at; inspection always works.

**Tasks:**

- **5.1 Strong zone headers**
  - Hand / Battlefield / Graveyard / Exile (even if Exile is empty for now)
  - Show counts next to each zone name.

- **5.2 Inspection behavior**
  - Click/tap card -> opens zoom/inspect modal
  - Modal shows:
    - name, mana cost (if available), type line
    - oracle text (if available)
    - full art image
  - Ensure modal is:
    - dismissible (X + clicking backdrop)
    - scrollable for long text
    - not clipped by parent containers

- **5.3 Consistent card-back / hidden zone representation**
  - Opponent hand/library remain hidden:
    - show only counts and card-backs (or placeholders), never real card data

**Acceptance criteria:**
- On mobile, inspection is usable with one hand (big close target, no tiny text).

---

### 6) Turn + phase scaffolding (lightweight)

**Goal:** Even without full rules, turns feel coherent.

**Tasks:**

- **6.1 Track turn state**
  - `turnNumber`
  - `activeSeatId`
  - `phase` (even if mostly cosmetic): e.g. `main`, `combat`, `end`

- **6.2 End turn button updates state predictably**
  - Advance phase/turn
  - Update active player
  - If bot is enabled, bot acts after turn change.

**Acceptance criteria:**
- The UI always shows "Turn X — Active: You/Opponent — Phase: Y".

---

## P2 — Bot + deck realism (later, but planned)

### 7) Bot behavior improvements (still not a rules engine)

**Goal:** Difficulty settings feel meaningfully different.

**Tasks:**

- **7.1 Define a minimal action vocabulary**
  - play a land (if tracked)
  - play a creature/permanent to battlefield (debug-style)
  - move to combat / "attack" placeholder
  - end turn

- **7.2 Difficulty heuristics**
  - Easy:
    - random playable card to battlefield
    - often ends turn early
  - Medium:
    - prefer playing "lands" first (if modeled) and lower-cost cards
    - try to maintain board presence
  - Hard:
    - basic evaluation: prefer higher impact permanents, avoid overextending into obvious removal (if modeled later)
    - smarter ordering (land before spell, etc.)

- **7.3 Add "bot thinking" UX**
  - status line: "Bot is thinking..."
  - small delay for readability (not too long)

**Acceptance criteria:**
- Users can *feel* the difference between easy/medium/hard in 2-3 turns.

---

### 8) Deck quality upgrades

**Goal:** Quick-start decks are more "real deck-like" without becoming a full deckbuilder.

**Tasks:**

- **8.1 Standard archetype lists**
  - tune card pools per color
  - enforce rough curve targets (e.g., 1-2 drops, 3-4 drops, etc.)
  - maintain legality constraints

- **8.2 Commander skeleton improvements**
  - simple ratio targets:
    - lands
    - ramp
    - draw
    - removal
  - small staple package keyed by color identity

**Acceptance criteria:**
- Generated decks play smoother (fewer nonfunctional hands) during testing.

---

## P3 — Commander match mode (optional / longer-term)

### 9) Commander "table" scaffolding (2-4 seats)

**Goal:** Multiplayer match container works even if rules remain lightweight.

**Tasks:**

- **9.1 Support 2-4 seats**
  - seat assignment UI
  - ready checks per seat
  - turn order list visible

- **9.2 Hidden zones remain private**
  - hands and libraries are always viewer-specific summaries

- **9.3 Multiplayer-friendly UI**
  - compact opponent panels
  - clear active-player highlight

**Acceptance criteria:**
- A 3-4 player lobby can start and reach a playable "table" state without leaking hidden info.
