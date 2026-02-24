---

## MTG Game Mechanics & Player Interaction Audit

### Overview
The MTG implementation is a **minimal rules engine** focused on deck building and basic gameplay scaffolding. It supports both Standard (2 players) and Commander (2-5 players) formats with mulligan support and turn structure, but lacks most real card game mechanics.

---

## 1. PLAYER ACTIONS AVAILABLE IN GAMEPLAY

### Implemented Actions (via `engineApplyAction`)

**Pre-Game Phase (Lobby):**
1. `ASSIGN_DECK` - Player selects a deck for their seat
2. `SET_READY` - Mark yourself ready to start
3. `START_GAME` (host only) - Begin the game

**Mulligan Phase:**
4. `MULLIGAN` - Take a mulligan (redraw hand with -1 cards)
5. `KEEP_HAND` - Keep current hand and advance to playing phase

**Playing Phase:**
6. `PLAY_FROM_HAND` - Move a card from hand to battlefield
7. `MOVE_BATTLEFIELD_TO_GRAVEYARD` - Sacrifice/destroy a card from battlefield to graveyard
8. `END_TURN` - Advance to next player's turn
9. `DRAW` - Draw a card from library (debug action, not in normal play)

### Client-Side Action Functions

**Card Selection & Display:**
- `setSelected()` - Click a card to select it (populates inspect panel)
- `renderCardImg()` - Display card with click to select, double-click to inspect modal

**Player Actions:**
- `playSelectedToBattlefield()` - Sends `PLAY_FROM_HAND` action
- `moveSelectedToGraveyard()` - Sends `MOVE_BATTLEFIELD_TO_GRAVEYARD` action
- `endTurn()` - Sends `END_TURN` action
- `drawDebug()` - Sends `DRAW` action (for testing)

**Card Inspection:**
- `openCardModal()` - Double-click card or click "Inspect" button to view full details (name, mana cost, type, oracle text)
- `closeCardModal()` - Close inspection modal (Escape key or click background)

**Deck/Match Management:**
- `mulligan()` - Mulligan during mulligan phase
- `keepHand()` - Keep hand during mulligan phase
- `assignDeckToSeat()` - Choose deck for match
- `toggleReady()` - Set ready status
- `startGame()` - Start the match (host only)
- `refreshMatch()` - Fetch current match state from server

---

## 2. CRITICAL MISSING FEATURES FROM REAL MTG

### Mana & Resource System
**Status: NOT IMPLEMENTED**
- No mana system at all
- Cards have `manaCost` metadata displayed (fetched from Scryfall) but it's purely cosmetic
- No mana tapping, no "lands produce mana" mechanics
- No resource costs for casting spells
- Any card can be played freely from hand with no restrictions

### Combat System
**Status: NOT IMPLEMENTED**
- No attack/block mechanics
- No declared attackers/blockers
- No combat damage
- Cards just sit on battlefield with no interaction
- Playing a card is just moving it to the battlefield zone

### Card Targeting & Interactions
**Status: NOT IMPLEMENTED**
- No card can target another card
- No enchantments attaching to creatures
- No "destroy target creature" or "damage target player" actions
- No card-to-card or player-to-player targeting interface
- Oracle text is displayed but completely non-functional
- Cards with abilities requiring targets (removal, damage, etc.) cannot execute those abilities

### Card Abilities & Effects
**Status: NOT IMPLEMENTED**
- Card abilities are purely visual (displayed from Scryfall oracle text)
- No ability resolution engine
- No state-based effects
- No triggered abilities (e.g., "when this creature enters the battlefield")
- No activated abilities (e.g., "tap: draw a card")
- Cards with "add {mana} mana" effects don't produce mana
- Cards with "draw a card" effects don't draw
- Removal spells can't actually remove anything

### Stack & Priority System
**Status: PARTIAL - Exists but unused**
- A `stack: []` array is initialized in game state
- No player interactions with the stack
- No instant-speed responses
- No ability to cast spells in response to other spells
- No priority system
- The stack is never populated or processed

### Opponent Interaction on Their Turn
**Status: NOT IMPLEMENTED**
- Players cannot take actions on opponent's turn
- No instant-speed actions possible
- No "hold priority" or response windows
- No counter spells or reactive effects possible

---

## 3. CURRENT CARD INTERACTION FLOW

### Selection Flow
```
User clicks card image
  ↓
renderCardImg() onclick fires
  ↓
setSelected({ id, zone, seat })
  ↓
Inspect panel populates:
  - Card image (normal size)
  - Card name
  - Type line + zone
  - Action buttons enable/disable based on zone
  ↓
User presses double-click OR clicks "Inspect" button
  ↓
openCardModal() displays modal with:
  - Full card image
  - Name
  - Mana cost (if has one)
  - Type line
  - Oracle text
```

### Playing a Card (Hand → Battlefield)
```
1. User clicks card in hand → setSelected()
2. Inspect panel shows card with enabled "Play to battlefield" button
3. User clicks "Play to battlefield" button
4. Calls playSelectedToBattlefield()
5. Validation: 
   - Must be in "hand" zone
   - Must be your own card
   - Match must be in "playing" phase
6. Sends action: { type: 'PLAY_FROM_HAND', cardId }
7. Server: engineMoveCard(match, seat, 'hand', 'battlefield', cardId)
   - Removes card from hand array
   - Adds to battlefield array
8. If step was "begin", advance to "main" step
9. Match refreshes, UI re-renders
```

### Sacrificing a Card (Battlefield → Graveyard)
```
1. User clicks card on battlefield → setSelected()
2. Inspect panel shows card with enabled "To graveyard" button
3. User clicks "To graveyard"
4. Calls moveSelectedToGraveyard()
5. Validation:
   - Must be on "battlefield" zone
   - Must be your own card
6. Sends action: { type: 'MOVE_BATTLEFIELD_TO_GRAVEYARD', cardId }
7. Server: engineMoveCard(match, seat, 'battlefield', 'graveyard', cardId)
8. If step was "begin", advance to "main" step
9. Match refreshes, UI re-renders
```

### Card Inspection (Double-Click or Inspect Button)
```
1. User double-clicks card OR selects and clicks "Inspect"
2. openCardModal(cardId, zone) called
3. Fetches cardMeta from state.cardIndex (indexed from Scryfall)
4. Modal displays:
   - Card image (normal quality from Scryfall)
   - Card name
   - Mana cost symbol string
   - Type line (e.g., "Legendary Creature — Dragon")
   - Full oracle text
   - Zone indicator
5. User presses Escape, clicks "Close", or clicks modal background to close
```

### UI Feedback & Animations
- **Selection highlight**: Selected card gets `.selected` CSS class (visual outline)
- **Button state**: Buttons enable/disable based on zone and turn state
- **Toast notifications**: Error/success messages on actions
- **Refresh**: Full board state re-renders after every action
- **No animations**: No card movement animations, transitions, or visual feedback of actions occurring

---

## 4. PHASE/STEP SYSTEM

### Phases Implemented

| Phase | State Name | When | Purpose | Enforced? |
|-------|-----------|------|---------|-----------|
| **Lobby** | `match.phase = "lobby"` | Before game starts | Deck assignment, ready up | Yes - blocks other actions |
| **Mulligan** | `match.phase = "mulligan"` | After all decks assigned | Players mulligan/keep hands | Yes - blocks play actions |
| **Playing** | `match.phase = "playing"` | After all players keep hands | Actual gameplay | Yes - gates play, move, end turn |

### Steps Within Playing Phase

| Step | Step Name | How Entered | Auto-Advance? |
|------|-----------|-------------|---------------|
| **Begin** | `match.game.step = "begin"` | Game start, turn start | Manual (by playing card) |
| **Main** | `match.game.step = "main"` | After first card play in a turn | Manual (player ends turn) |

**Note**: Real MTG has 5 steps per turn (untap, upkeep, draw, main 1, combat, main 2, end, cleanup). This implementation only has "begin" and "main" as labels, with no automatic step progression.

### Phase/Step Enforcement
- ✅ **Playing action validation**: Checks `match.phase === "playing"` before PLAY_FROM_HAND
- ✅ **Turn validation**: Checks `match.game.activePlayerSeat === player.seat` before allowing play/move/end turn
- ✅ **Mulligan phase locking**: Can't play cards during mulligan phase
- ❌ **Step-based actions**: No action is blocked or allowed based on step (both "begin" and "main" allow same actions)
- ❌ **Automatic progression**: Turns don't auto-advance, steps don't auto-advance

### Turn Structure
```
Game Start
  ↓
Mulligan Phase (all players)
  ↓
Game advances to "playing" phase when all players keep
  ↓
Turn N (Player 1)
  - Step: "begin" initially
  - Player can play cards (step becomes "main" on first play)
  - Player clicks "End turn" → engineAdvanceTurn()
  ↓
Turn N (Player 2)
  - Repeat
  ↓
When new player is chosen and we've cycled all players, turn increments
```

---

## 5. CARD TYPE DIFFERENTIATION

### Tracked Metadata Per Card
Cards have metadata stored in `deck.cardMeta[cardId]`:
```javascript
{
  name: "Lightning Bolt",
  typeLine: "Instant",
  cmc: 1  // Converted Mana Cost
}
```

### Card Type Recognition

**For Bot Play Decisions:**
- **Lands**: Detected via `typeLine.includes("land")` (case-insensitive)
  - Bot plays lands first (strategic ordering)
- **Non-lands**: Everything else (creatures, spells, enchantments)
  - Bot plays by CMC (sorted ascending, cheap first)

**For Deck Building:**
- **Basic Lands**: Categorized by checking if type includes "Land" and "Basic"
  - Sorted infinity value for special handling in deck building
- **Cards by CMC**: Grouped into low (≤2), mid (≤4), high (>4)

### NO Differentiation For:
- ❌ Creatures vs. Instants vs. Sorceries vs. Enchantments vs. Artifacts
  - All treated identically in gameplay (move to battlefield, then can move to graveyard)
- ❌ Permanents vs. non-permanents
  - Can't create distinction between cards that stay on field vs. ones that go to graveyard after resolving
- ❌ Creature abilities (flying, first strike, etc.)
  - No ability tracking in game engine
- ❌ Spell types (instant vs. sorcery)
  - Oracle text displayed but mechanical difference not implemented

### Example: Why Card Type Doesn't Matter
A **Lightning Bolt** (Instant) and a **Grizzly Bear** (Creature) both work the same way:
1. Click card in hand
2. Click "Play to battlefield"
3. Card appears on battlefield
4. You can click "To graveyard" to remove it anytime

Neither the damage effect of Bolt nor the combat ability of Bear are implemented. Both are just objects on the battlefield with the same interaction model.

---

## 6. UI PAIN POINTS & CLUNKY INTERACTIONS

### Major Usability Issues

| Issue | Severity | Impact | Description |
|-------|----------|--------|-------------|
| **No visual card movement** | High | Confusing | Cards teleport between zones; no animation showing where they went |
| **No mana cost enforcement** | High | Game-breaking | Players can play 10-mana spells for free without any lands |
| **No combat system** | Critical | Non-functional | Cards sit on battlefield doing nothing; no way to attack/block |
| **Dead card abilities** | High | Misleading | Oracle text talks about effects that don't exist (e.g., "destroy target" spells do nothing) |
| **No turn progression** | Medium | Awkward | Game doesn't auto-advance through phases; manual "End turn" only option |
| **Opponent hand hidden but confusing** | Medium | UX | Shows "Hand: 7" count but not actual cards; unintuitive for multiplayer |
| **Full board refresh every action** | Medium | Performance | Entire game state re-renders after each click; no incremental updates |
| **No discard/graveyard management** | Medium | Limited | Can only move things to graveyard manually; no cards that mill or discard |
| **Library not interactable** | Medium | Limitation | Players can't search library, tutor, or interact with library order |
| **No deck shuffling during game** | Low | Inconsistency | Library stays in same order; if you manually draw library empties, shuffles are unshuffled |

### Specific UI Clunkiness

1. **Card Selection Model is Awkward**
   - Must click card, then click button in float panel
   - Cannot double-click to play (double-click only opens inspect modal)
   - Double-click on hand card opens inspection instead of playing
   - Why not single-click to play hand cards, single-click to sacrifice battlefield cards?

2. **Inspect Float Panel Redundant**
   - Shows same info as modal but smaller
   - Panel takes up corner space
   - Forces use of 3 clicks: select → button → action (instead of 1-2 clicks)

3. **"To Graveyard" Button is Misleading**
   - Suggests discarding, but actually sacrifices
   - Real MTG distinguishes between sacrifice (rules) and discard (effect)
   - No other way to remove cards; makes this the only interaction

4. **No Drag-and-Drop**
   - Everything is click-select-click-button
   - Drag from hand to battlefield would be more intuitive
   - No visual feedback of valid drop zones

5. **Mulligan Hand Display**
   - Shows cards in a gallery preview
   - But clicking them doesn't actually interact (no redraw preview)
   - Can't inspect cards during mulligan to decide

6. **Opponent Board is Minimal**
   - Shows only "X permanents" with small thumbnails
   - Can't click opponent cards to inspect
   - Can't see what you're playing against

7. **Turn Bar Information Sparse**
   - Shows turn number, step, active player
   - But no indication of what actions are available
   - New players don't know they can only play during main step or can sacrifice anytime

8. **No Confirmation Dialogs**
   - Playing a card applies immediately
   - No "are you sure?" before sacrificing cards
   - Mistakes can't be undone

---

## 7. ACTION TYPE COMPLETENESS CHECKLIST

### What Players CAN Do
- ✅ Select cards by clicking
- ✅ Inspect cards (full modal view)
- ✅ Play cards from hand to battlefield
- ✅ Move cards from battlefield to graveyard (sacrifice)
- ✅ End turn
- ✅ Draw cards (debug action)
- ✅ Mulligan hands
- ✅ Keep hand to start game

### What Players CANNOT Do
- ❌ Tap lands for mana
- ❌ Activate abilities
- ❌ Cast spells with mana cost
- ❌ Attack/block in combat
- ❌ Target other cards or players
- ❌ Respond with instants
- ❌ Use activated abilities (e.g., "tap: draw a card")
- ❌ Use triggered abilities
- ❌ Play from other zones (library, graveyard, exile)
- ❌ Search library
- ❌ Discard intentionally
- ❌ Mill cards
- ❌ Sacrifice permanents (can move to GY but conceptually wrong)
- ❌ Counter spells
- ❌ Enchant other cards
- ❌ Equip creatures
- ❌ Copy spells
- ❌ Create tokens
- ❌ Undo actions
- ❌ Fast effects / instant-speed responses
- ❌ Modify turn phases (auto-advancement only)

---

## SUMMARY

The MTG engine is a **skeleton implementation** suitable for:
- Deck building and validation ✅
- Basic turn structure and mulligan ✅
- Visual card display from Scryfall ✅
- Game state scaffolding ✅

It is **NOT suitable for** any real gameplay because:
- **No resource system**: Mana costs are cosmetic only
- **No mechanics**: Combat, targeting, abilities don't exist
- **No interactions**: Cards can't affect each other
- **No strategy**: Every card plays identically (move to field, optionally move to graveyard)
- **No stack**: Spells don't resolve, no priority system
- **Cosmetic oracle text**: Ability descriptions displayed but meaningless

**To make this a functional MTG game**, the following would need to be added:
1. Mana system with tapping
2. Combat phase with attack/block declarations
3. Card ability resolution engine
4. Stack with priority system
5. Targeting system for spells/abilities
6. Proper card type handling (instants, sorceries, permanents)
7. State-based effect checks
8. Full turn/phase progression
9. Exile/Command/Library zone interactions
10. Undo/concede mechanics

In its current state, it's a "digital card display platform" rather than a playable MTG game.
