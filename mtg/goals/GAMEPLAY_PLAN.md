# MTG Gameplay Plan — From Card Viewer to Card Game

> Synthesized from: code audit, digital TCG UX research (Arena/Hearthstone/LoR/Snap/Pokemon TCG), game design analysis, and scoped implementation roadmap.

---

## Design Philosophy

**"MTG Lite" — simplified but strategically meaningful, using real Magic cards.**

The worst outcome is a game that *tries* to be full MTG and fails. The second worst is stripping so much that it becomes "put cards on table, biggest number wins." The target: somewhere between Hearthstone and MTG Arena in complexity.

**Principles:**

1. **Every card you play should feel like a decision.** The mana system must exist.
2. **Combat is the primary interaction.** MTG without combat is a card-viewing application.
3. **Abilities are opt-in, not opt-out.** Support a curated set of keywords; everything else is a vanilla body.
4. **Be honest about limitations.** Players forgive missing features. They won't forgive broken features that look like they should work.
5. **Prioritize feel over fidelity.** A smooth animation on a simplified combat system > a laggy frame-accurate rules engine.

**Litmus test: "Would a new player understand what just happened?"**

---

## Key Design Decisions

### Mana: Hearthstone-Style Auto-Mana

- Each turn, max mana increases by 1 (starting at 0, capping at 10)
- At turn start, mana refills to max
- Playing a card costs mana equal to its CMC (converted mana cost). Color pips are ignored.
- **Lands are removed from the game entirely** — auto-filtered from decks

**Why:** Full tap-lands requires land cards in hand, play-land action, tapping/untapping, color-specific pools, mana floating. That's enormous UI/logic for a system that mostly results in "play a land and pass." Auto-mana keeps the interesting decision ("which spell do I cast?") and removes the boring part. Also eliminates land screw/flood.

**Deck size adjustment:** Without ~24 lands, standard deck goes from 60 → **30 cards** (faster games). Commander goes from 100 → **~60 cards**.

### Combat: Arena-Style Declare/Block/Resolve

Full combat system with declare attackers → declare blockers → damage resolution. Creatures tap on attack, have summoning sickness, and die when damage >= toughness. This is the heart of the game.

### Abilities: 13 Supported Keywords via Scryfall `keywords` Array

No oracle text parsing needed. All detectable from structured Scryfall data. Everything else is a vanilla body with its oracle text displayed for flavor.

### Stack/Priority: Skipped Entirely

No counterspells, no instant-speed tricks, no response windows. Instants/sorceries are main-phase-only. This eliminates the need for a priority system (which would require WebSockets or constant polling pauses). Major simplification but keeps the game flowing.

### Planeswalkers: Skipped Entirely

Loyalty counters, multiple activated abilities, attackable permanents — each is a subsystem. Excluded from deck building.

---

## Phase 1: The Game Exists (Mana + Combat + Win/Loss)

**Goal:** A playable game where mana creates resource tension, creatures fight in combat, and someone wins.

**This is the MVP. Ship it completely before starting Phase 2.**

### 1A. Mana System

**Engine changes:**
- New match game state fields: `manaMax`, `manaCurrent` per seat
- At turn start: increment `manaMax` (cap 10), set `manaCurrent = manaMax`
- `PLAY_CARD` action: validate `card.cmc <= manaCurrent`, deduct cost on success
- Filter lands from deck building (type_line containing "Land" with no other card type)
- Adjust deck size targets: Standard 30, Commander 60

**Client changes:**
- **Mana crystal bar** in turn bar area — current/max as gem icons (MTG purple/colorless aesthetic)
- Cards in hand that cost more than current mana are **dimmed** (opacity 0.5, desaturated)
- Insufficient mana → flash bar red, brief "Not enough mana" toast near the card
- When card is played, animate gems depleting left-to-right

**Bot update:**
- Bot respects mana costs: plays highest CMC card it can afford each turn (matches existing heuristic but now with actual cost checking)

### 1B. Card Type Differentiation

**Engine changes:**
- Parse `type_line` from Scryfall data to determine card behavior:
  - **Creatures:** enter battlefield, have `power`/`toughness`, persist, can attack/block
  - **Instants/Sorceries:** resolve immediately, go to graveyard (never hit battlefield)
  - **Enchantments:** enter battlefield, persist (effects non-functional initially except auras in Phase 2)
  - **Artifacts:** enter battlefield, persist (same as enchantments)
- Creatures gain state: `tapped`, `summoningSick`, `damage`
- `power` and `toughness` parsed from Scryfall card data and stored in card state

**Client changes:**
- **P/T badge** on all creatures (bottom-right, small overlay) — shows `power/toughness`
- When creature has damage: show `power/remainingToughness` with remaining in red
- **Spell cast animation** for instants/sorceries: card art briefly displayed center-screen (1-2s) then animates to graveyard
- Summoning sickness indicator: dimmed creature + small hourglass/zzz icon

### 1C. Combat System

**Turn phase restructure:**
```
BEGIN TURN → mana refills, untap all permanents
    ↓
MAIN PHASE 1 → play cards from hand
    ↓
COMBAT → declare attackers → declare blockers → damage
    ↓
MAIN PHASE 2 → play cards from hand
    ↓
END TURN → damage clears, pass to next player
```

**Phase indicator:** Turn bar highlights current phase. Context-sensitive button: "Go to Combat" during Main 1, "Go to Main Phase" after combat, "End Turn" during Main 2.

**Declare attackers (active player):**
- All eligible creatures get a subtle green glow border
- Click/tap creatures to toggle attacker status
- Selected attackers: slide forward ~20px toward opponent, red border, sword icon
- Summoning sick creatures: dimmed, cannot be selected
- Tapped creatures: dimmed, cannot be selected
- "Confirm Attack" button (or skip combat if no attackers selected)

**Declare blockers (defending player):**
- Attacking creatures highlighted in red on opponent's side
- Defender's untapped creatures get green glow (eligible blockers)
- Click/tap your creature, then click/tap an attacking creature to assign block
- SVG line/arrow connects blocker to attacker
- Each creature can only block one attacker (multi-block is a v2 feature)
- "Confirm Blocks" or "No Blocks" button

**Damage resolution (automatic):**
1. Unblocked attackers deal power as damage to defending player → floating red number from life total
2. Blocked creatures deal damage to each other simultaneously (attacker power → blocker, blocker power → attacker)
3. Creatures with damage >= toughness die → red flash, skull icon, animate to graveyard
4. Damage clears at end of turn

**Tapping:**
- Creatures tap (CSS rotate 90deg) when they attack
- Tapped creatures cannot block
- All permanents untap at beginning of controller's turn

**Bot combat AI (Phase 1 — basic):**
- Easy: attacks with everything, blocks randomly
- Medium: only attacks when board advantage exists, blocks to trade up
- Hard: evaluates attack for expected damage vs. creature loss, blocks to maximize trades

### 1D. Life Totals + Win/Loss

**Engine changes:**
- `lifeBySeat` already exists — now actually modified by combat damage
- `dealDamageToPlayer(seat, amount)` action
- `checkStateBasedActions()` — runs after every action: checks life <= 0, creatures with lethal damage, empty library on draw
- `concede(seat)` action
- Game state: `status: 'playing' | 'finished'`, `winner: seat | null`
- Deck-out: if library empty when drawing, that player loses

**Client changes:**
- Life totals: animate on change (count up/down over ~0.5s), flash red on damage, green on healing
- **Win/loss overlay:** semi-transparent dark backdrop, "VICTORY" or "DEFEAT" with scale-up animation
- Final stats: life totals, creatures killed, damage dealt, turns played
- Buttons: "Play Again" (same decks), "Change Decks", "Main Menu"
- **Concede button** in game menu (with confirmation dialog)
- **Game log:** scrollable text feed showing major events ("Player dealt 3 damage", "Creature destroyed"). Cheap to build, massively improves game feel + debugging.

**Life totals:** Standard = 20, Commander = 40

---

## Phase 2: The Game Is Strategic (Keywords + Auras + Targeting)

**Goal:** Cards feel different from each other. A Lightning Bolt is not the same as Llanowar Elves.

### 2A. Keyword Abilities (13 Keywords)

All detected from Scryfall's `keywords` array — no oracle text parsing needed:

| Keyword | Implementation | Icon |
|---------|---------------|------|
| **Flying** | Only blocked by flying/reach | Wing (top-right) |
| **Reach** | Can block flying | Net/arrow (top-right) |
| **First Strike** | Deals damage first; if it kills, no return damage | Lightning bolt (top-right) |
| **Double Strike** | First strike + normal damage (two combat steps) | Double lightning (top-right) |
| **Trample** | Excess damage over blocker toughness hits player | Boot (bottom-left) |
| **Deathtouch** | Any damage kills creature | Skull (bottom-left) |
| **Lifelink** | Controller gains life = damage dealt | Heart (bottom-left) |
| **Haste** | No summoning sickness | Flame (top-left) |
| **Vigilance** | Doesn't tap when attacking | Eye (top-left) |
| **Defender** | Cannot attack | Shield (top-left) |
| **Menace** | Must be blocked by 2+ creatures | Double-fang (top-right) |
| **Indestructible** | Cannot be destroyed by damage or "destroy" effects | Diamond (top-left) |
| **Hexproof** | Cannot be targeted by opponents' spells | Hexagon shield (top-left) |

**Visual:** Simple SVG icons, 16x16px, semi-transparent dark background circle for readability against any card art.

**Unsupported ability indicator:** Yellow warning triangle with "i" on cards with oracle text the engine can't process. Inspect modal shows: "Some abilities on this card are not implemented. This card functions as a [power]/[toughness] creature with [supported keywords]."

### 2B. Aura/Enchantment Attachment

- When playing an Aura (type_line contains "Enchantment — Aura"):
  1. Enter targeting mode — valid targets glow
  2. Click/tap target creature
  3. Aura visually attaches as smaller card overlapping the creature, or as buff indicator
  4. Parse stat modifications via regex (`+N/+N` patterns in oracle text)
  5. When enchanted creature dies, aura goes to graveyard too

### 2C. Basic Targeting System

- When a spell requires a target, board enters "targeting mode"
- Valid targets glow, invalid targets dimmed
- Click/tap valid target to select
- "Cancel" option always visible to back out
- Only support basic target patterns initially: "target creature", "target player"

### 2D. Bot AI Improvements

- Bot evaluates combat math with keywords (don't attack 2/2 into a deathtouch 1/1)
- Bot plays removal/damage spells on biggest threat
- Bot respects flying/reach blocking rules

### 2E. Visual Polish

- Damage numbers floating from combat (red for damage, green for lifelink healing)
- Death animations (red flash → skull → animate to graveyard)
- Spell cast overlay (instant/sorcery card art center-screen for 1-2s)
- Mana crystal depletion animation
- Card slide animations between zones (hand → battlefield, battlefield → graveyard)

---

## Phase 3: The Game Is Polished (Feel + Edge Cases)

**Goal:** The game feels good enough to share. Smooth, responsive, clear.

### 3A. Remaining Combat Depth
- Multiple blockers on one attacker (with even damage split)
- Commander damage tracking (21+ from one commander = loss)
- Damage vs. toughness distinction (damage marked on creature, separate from toughness, clears end of turn)

### 3B. Simple Parseable Effects (Stretch)
- Regex whitelist for common oracle text patterns:
  - `deals (\d+) damage to (any target|target creature|target player)`
  - `destroy target (creature|permanent)`
  - `draw (\d+) cards?`
  - `gains? (\d+) life`
  - `target creature gets [+-](\d+)/[+-](\d+) until end of turn`
- Mark everything else as "abilities not implemented" — card still playable for stats

### 3C. UX Polish
- Mobile: long-press for floating inspector (no hover), swipe up from hand to play
- Touch targets: minimum 44px (Apple HIG)
- Undo: deselect attackers/blockers before confirming, deselect card from hand before playing
- Right-click context menu for "Send to Graveyard" (prevents accidental moves)
- Graveyard/exile zone inspection (click to see all cards)
- Reconnection handling (polling failure → "Reconnecting..." → resume)

### 3D. Game Over Experience
- Victory/defeat screen with stats
- Play Again / Change Decks / Main Menu buttons
- Multiplayer elimination (Commander): removed player's permanents leave, game continues

---

## What's Explicitly Skipped

### Hard No

| Feature | Reason |
|---------|--------|
| **Stack / Priority** | Requires real-time response windows on every action. No WebSockets. |
| **Planeswalkers** | Loyalty counters, multiple abilities, attackable permanents = entire subsystem per card |
| **Mana colors / color identity** | Auto-mana removes color. Multicolor costs are just summed CMC. |
| **Counterspells / instant-speed tricks** | Requires stack + priority |
| **Sideboarding** | Requires best-of-3 match structure |
| **Morph / Manifest / Disguise** | Face-down cards + hidden info tracking |
| **Mutate / Meld** | Combining cards = state management nightmare |
| **Sagas** | Multi-chapter triggers = own sub-system |
| **Adventures / Split cards** | Two-mode cards = choice UI + dual-state |
| **Madness / Flashback / Escape** | Playing from non-hand zones |
| **Phasing / Banding / Protection** | Deprecated, incomprehensible, or too niche |
| **Token generation** | No token system. Cards that create tokens just don't do that part. |
| **Activated abilities** | Tap/pay abilities require new interaction paradigm |
| **Triggered abilities** | ETB/death triggers require event system (stretch goal for a few patterns) |
| **Network multiplayer (real-time)** | Entirely different project |

### Conscious Simplifications

| Simplification | Real MTG | Our Behavior |
|----------------|----------|-------------|
| Mana | Tap lands for colored mana | Auto-increment, colorless, cap 10 |
| Instants | Playable on opponent's turn | Main phase only |
| Damage assignment | Attacker chooses order for multiple blockers | Even split |
| Enchantment effects | Wildly diverse | Only +N/+N stat mods parsed |
| Counters (+1/+1) | Persist, stack | Stretch goal, not at launch |

---

## Technical Risk Areas

### 1. Priority Without WebSockets (Highest Risk)
- **Mitigation:** No priority system at all. All spells are sorcery-speed. Auto-pass everything. Accept this limitation.

### 2. Combat UX on Mobile
- **Mitigation:** Tap-to-toggle for attackers, tap-blocker-then-tap-attacker for blocks. No drag. Larger touch targets.

### 3. State Sync via Polling
- **Mitigation:** Version game state (each mutation increments version). Client sends known version with poll. Optimistic UI updates on player actions, reconcile on next poll.

### 4. Single File Scalability (~2200 lines → likely 4000+)
- **Mitigation:** Clear section comments, table of contents, object namespacing (`const Combat = { ... }`). Split to 2-3 files only if absolutely necessary.

### 5. Bot AI Beyond Random
- **Mitigation:** Easy = attack everything. Medium = evaluate trades. Hard = defer to post-Phase 2. Medium is good enough.

---

## Scope Estimates

| Phase | Name | Scope | Cumulative Result |
|-------|------|-------|-------------------|
| **1** | The Game Exists | **Large (8-13 sessions)** | Mana, combat, life totals, win/loss. It's a game. |
| **2** | The Game Is Strategic | **Large (5-8 sessions)** | Keywords, auras, targeting, combat AI, animations. Worth replaying. |
| **3** | The Game Is Polished | **Medium (3-5 sessions)** | Polish, edge cases, mobile UX, game over. Worth sharing. |
| **4** | Classic Mode (Lands) | **Large (4-6 sessions)** | Traditional land mechanics as opt-in mode. Full MTG card pool. |

**Total: ~16-26 sessions to a polished Spark game. ~20-32 with Classic mode.**

**Minimum viable fun: End of Phase 1.** At that point you have mana tension, creatures fighting, and someone winning. It's simplified Magic, but it's a real game.

---

## Implementation Order Within Phase 1

Ship each sub-step as a working state:

1. **Mana system** (1A) — cards cost mana, bar displays, dimming, bot respects costs
2. **Card type differentiation** (1B) — creatures have P/T, instants/sorceries go to GY, summoning sickness
3. **Turn phases** — restructure to begin/main1/combat/main2/end, phase indicator in turn bar
4. **Declare attackers** — toggle selection, visual feedback, confirm button, tapping
5. **Declare blockers** — assignment UI, SVG lines, confirm button
6. **Damage resolution** — unblocked → player damage, blocked → creature damage, death
7. **Life totals + win/loss** (1D) — life changes, game over screen, concede
8. **Bot combat AI** — basic attack/block heuristics

**Critical rule: Each step must be fully working and tested before the next begins.**

---

## Phase 4: Classic Mode — Traditional Lands & Colored Mana (Future)

> **Status:** Deferred until after Phase 1-3 ship. Build only if player feedback demands it.
>
> **Rationale:** Three independent agents (game designer, research, project manager) assessed this and reached consensus: auto-mana is the right default for a digital fan game. Combat, keywords, and polish are higher priority. The retrofit cost is approximately equal whether built now or later — the 13 mana touchpoints are localized and well-understood.

### Why Consider Classic Mode At All

Auto-mana removes MTG's deepest strategic subsystem. While the tradeoffs are worthwhile for the default experience, significant design space is lost:

- **Deckbuilding depth:** ~40% of traditional deckbuilding decisions revolve around the mana base — how many lands, what color ratio, utility lands vs. color sources, dual lands vs. basics
- **Card ecosystem:** ~1,220-1,570 Commander-legal cards and ~160-215 Standard-legal cards become broken or meaningless without lands (ramp spells, landfall, land destruction, domain, dual lands, fetch lands, utility lands, mana dorks)
- **Color-fixing risk/reward:** Multi-color decks in real MTG trade consistency for power. With auto-mana, there's no cost to greed
- **Green's identity:** ~40% of green's mechanical identity is land-tied (ramp, landfall, land animation, land recursion). Without lands, green loses its primary strategic axis
- **9+ archetypes die entirely:** Landfall, Lands Matter, Domain, Tron, Valakut combo, Maze's End, Dark Depths, Green Ramp, Stax/Resource Denial

However, ~88-91% of Standard cards and ~94-95% of Commander cards remain fully functional without lands. The losses are qualitatively significant but numerically manageable.

### The Multi-Color Problem (Critical Design Decision)

The single hardest challenge with auto-mana: without lands producing specific colors, there's no cost to playing all 5 colors. "Goodstuff" decks that cherry-pick the best card at every CMC from every color would dominate.

**Recommended solution for auto-mana mode — Mana Pip System:**
- Each turn you gain +1 mana AND choose what color that pip is
- Cards with colored costs (e.g., `{1}{W}{W}` for Wrath of God) require the right color pips allocated
- Heavy color commitments (like `{B}{B}{B}` for Necropotence) require real investment across multiple turns
- Decks declare 1-2 colors at deckbuilding; only cards within that color identity are allowed
- Creates meaningful per-turn micro-decisions without land cards

**This is a potential upgrade to the current auto-mana system (where color pips are ignored) and could be implemented independently of Classic mode, possibly as a Phase 2-3 enhancement.**

### Classic Mode Design Specification

Classic mode restores traditional MTG land mechanics alongside the existing auto-mana mode as a player-selectable option.

#### Format Selection UI

```
Format:     [ Standard ]  [ Commander ]
Rules:      [ Spark ✦ ]  [ Classic ]
Opponent:   [ Human ]  [ Bot ]
```

- **Spark** (working name for auto-mana mode): No lands, auto-mana, smaller decks. The default.
- **Classic**: Traditional lands, full-size decks, tap for mana.
- The rules toggle is orthogonal to format — Standard Classic (60 cards) and Commander Classic (100 cards) are both valid.
- Naming alternatives considered: Blitz, Quickcast, Arcane. "Spark" references planeswalker sparks, implies speed.

#### Deck Size & Composition

| Format | Spark (Auto-Mana) | Classic (Lands) |
|--------|-------------------|-----------------|
| Standard | 30 cards, no lands | 60 cards, ~24 lands + 36 spells |
| Commander | 60 cards, no lands | 100 cards, ~37 lands + 63 spells |

#### Engine Changes Required

**Match state additions:**
- `match.game.manaMode`: `'spark'` or `'classic'`
- `match.game.manaPoolBySeat`: `{ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }` per seat (Classic only)
- `match.game.landPlayedThisTurnBySeat`: `{}` tracking 1-per-turn land limit (Classic only)
- Permanent state: `tapped` boolean per card on battlefield (needed for combat anyway)

**13 identified branch points** (all conditional on `manaMode`):

| # | Function | Spark Behavior | Classic Behavior |
|---|----------|---------------|-----------------|
| 1 | `createInitialMatchState` | Init `manaBySeat` | Init `manaPoolBySeat` + `landPlayedThisTurnBySeat` |
| 2 | `engineApplyAction` START_GAME | Set mana `{ current: 0, max: 0 }` | No mana init (comes from lands) |
| 3 | `engineApplyAction` KEEP_HAND | Give starting player 1/1 mana | No auto-mana |
| 4 | `engineApplyAction` PLAY_FROM_HAND | Validate `cmc <= manaCurrent`, deduct | Validate mana pool has required colors, deduct from pool |
| 5 | `engineAdvanceTurn` | Auto-increment max, refill | Untap all permanents, clear mana pool, reset land play counter |
| 6 | `engineBotTakeTurn` | Filter affordable by CMC | Play a land first, tap lands for mana, then play affordable spells |
| 7 | Client: `setSelected()` | Check CMC affordability | Check color + CMC affordability against mana pool |
| 8 | Client: `renderTurnBar()` | Purple mana gem bar | Colored mana pool display (W/U/B/R/G pips) |
| 9 | Client: `renderGame()` hand | Dim by CMC | Dim by color + CMC |
| 10 | `buildQuickstartStandardDeck` | 30 cards, `-t:land` filter | 60 cards, include ~24 basics + nonbasics |
| 11 | `buildQuickstartCommanderDeck` | 60 cards, `-t:land` filter | 100 cards, include ~37 lands with color-appropriate duals |
| 12 | `validateDeck` | 30 / 60 thresholds | 60 / 100 thresholds |
| 13 | CSS | `.manaBar` gem display | Colored mana pool display, tapped land styling |

**New action type for Classic mode:**
- `PLAY_LAND`: Move land from hand to battlefield. Validate `landPlayedThisTurn < 1`. Does not cost mana.

**New interaction for Classic mode:**
- "Tap land for mana": Click/tap a land on battlefield to add its color to your mana pool. Mana pool empties at end of turn.
- **Auto-tap option** (recommended default): When playing a spell, engine automatically selects which lands to tap. Manual tap as advanced option.

#### New Systems Required

| System | Complexity | Description |
|--------|-----------|-------------|
| Mana pool per color | Medium | Track 6 color buckets per seat. Add/drain on land tap / spell cast. |
| Mana cost parsing | Medium | Parse `{2}{W}{W}` strings into `{ generic: 2, W: 2 }`. Validate against pool. |
| Land play action | Small | New action type, 1/turn limit, track in game state. |
| Auto-tap algorithm | Medium | Given a mana cost and available lands, determine optimal tap combination. Greedy algorithm: tap lands that produce only the needed color first, save flexible lands for last. |
| Land row UI | Small-Medium | Separate battlefield row for lands vs. non-lands. Tapped = 90deg rotation (shared with combat tap). |
| Bot land strategy | Small-Medium | Play best color-fixing land available. Easy: random land. Hard: play the land that enables this turn's best spell. |
| Dual land deck building | Medium | Quickstart decks need color-appropriate dual lands from the format's available pool. |

**Estimated scope:** ~500-700 new lines of code, ~80 lines of conditional wrappers at branch points. File grows from ~2,400 to ~3,100 lines.

#### Dual Land Integration for Quickstart Decks

Classic mode quickstart decks should include format-appropriate dual lands:

**Standard Classic (60 cards):**
- ~10 basic lands (split by deck's color identity)
- ~8 dual lands (shock lands, check lands, pain lands — whatever's Standard-legal)
- ~6 utility lands (creature lands, modal DFCs if parseable)
- ~36 spells (same curve logic as Spark mode but more picks to fill 36 slots)

**Commander Classic (100 cards):**
- ~12 basic lands
- ~15 dual/tri lands (from Commander's deep pool: shocks, fetches, checks, pains, triomes)
- ~10 utility lands (Sol Ring land equivalents, creature lands, etc.)
- ~62 spells (same category ratios as current: ramp, draw, removal, other)
- Commander + 99

Dual land selection would use Scryfall queries filtered by format legality and the deck's color identity:
```
f:standard t:land id<=WU -type:basic     # Standard dual lands for W/U deck
legal:commander t:land id<=WUB -type:basic # Commander dual lands for Esper
```

#### Cards That Need Filtering By Mode

Cards that are dead in Spark mode but functional in Classic:

| Category | Example Cards | Spark | Classic |
|----------|--------------|-------|---------|
| Ramp spells | Cultivate, Rampant Growth, Kodama's Reach | Excluded from deckbuilder | Included |
| Landfall | Lotus Cobra, Omnath, Scute Swarm | Excluded | Included |
| Land destruction | Stone Rain, Field of Ruin | Excluded | Included |
| Land recursion | Crucible of Worlds, Life from the Loam | Excluded | Included |
| Land tutors | Expedition Map, Sylvan Scrying | Excluded | Included |
| Mana dorks | Llanowar Elves, Birds of Paradise | Functional but redundant | Core green strategy |
| Domain cards | Leyline Binding, Tribal Flames | Dead (0 types) | Functional |

**Implementation:** Add a `sparkBanned` tag or filter at deck-building time. In Spark mode, Scryfall queries add `-keyword:landfall` and filter results whose oracle text matches land-specific patterns. In Classic mode, no filtering needed — all cards are valid.

#### Bot AI Differences by Mode

| Difficulty | Spark | Classic |
|-----------|-------|---------|
| **Easy** | Play 1 random affordable card | Play a land (random), tap all lands, play 1 random affordable spell |
| **Medium** | Cheapest-first greedy curve | Play best color-fixing land, tap lands optimally, play spells by curve |
| **Hard** | Most expensive first, board cap 6 | Sequence land drops for upcoming turns, hold fetch lands for landfall triggers, play high-value spells first |

#### Migration & Compatibility

- Existing matches (all Spark) continue to work — `manaMode` defaults to `'spark'` if missing
- Existing decks can be tagged with their mode or auto-detected (decks with 0 lands = Spark, decks with lands = Classic)
- Quickstart deck builder generates the appropriate deck based on selected rules mode

### Comparison With Other Digital Card Games

| Game | Resource System | Designed For It? | Result |
|------|----------------|-----------------|--------|
| Hearthstone | Auto +1/turn, cap 10 | Yes (from scratch) | Massive success, but lacks MTG's color depth |
| Legends of Runeterra | Auto +1/turn + spell mana banking | Yes (from scratch) | Praised for mana innovation |
| Pokemon TCG Live | Energy cards (kept land-equivalent) | N/A | Resource cards are core to strategy |
| Marvel SNAP | Auto +1/turn, 6-turn games | Yes (from scratch) | Ultra-fast, works for its scope |
| MTG Arena | Full land system | No (faithful port) | Uses "hand smoother" to patch mana screw in BO1 |
| **Our Game (Spark)** | Auto +1/turn, cap 10 | Retrofitted | Works for 88-95% of card pool |
| **Our Game (Classic)** | Traditional lands | Additive mode | Full card pool, full MTG experience |

**Key insight from research:** No game has successfully retrofitted auto-mana onto an existing land-based system. We're doing it in reverse (starting with auto-mana, potentially adding lands), which is architecturally cleaner — the simpler system is the default, complexity is opt-in.

### Risk Assessment

| Risk | Severity | Mitigation |
|------|---------|-----------|
| Two modes doubles testing surface for every future feature | High | Build Classic only after Phases 1-3 are stable. Classic inherits combat/keywords/targeting. |
| Playerbase split (if multiplayer added) | Medium | Default to Spark. Classic is advanced/optional. |
| Aggro dominance in Spark mode (perfect curve every game) | Medium | Consider higher starting life (25 Standard / 45 Commander) or card pool curation |
| Classic mode auto-tap algorithm complexity | Medium | Start with greedy auto-tap. Manual tap as future option. |
| Green underpowered in Spark mode | Low-Medium | Accept it, or buff green via custom "ramp" cards that increase mana cap |
| Balancing cards across two mana systems | High | Don't try. Accept that some cards are better in one mode. That's a feature, not a bug. |

### Implementation Order (When the Time Comes)

1. Add `manaMode` field to match creation + lobby UI toggle
2. Branch `engineAdvanceTurn` and `PLAY_FROM_HAND` (core mana divergence)
3. Build mana cost string parser (`{2}{W}{W}` → `{ generic: 2, W: 2 }`)
4. Build auto-tap algorithm (greedy: specific-color lands first, flexible lands last)
5. Add `PLAY_LAND` action type with 1/turn limit
6. Update quickstart deck builders with land-inclusive variants
7. Update client: mana pool display replacing gem bar, land row on battlefield
8. Update bot: land-play-first strategy, color-aware spell selection
9. Update `validateDeck` with mode-aware thresholds
10. Playtest extensively — land ratios, color screw rates, game pacing differences

### Decision Log

| Date | Decision | Rationale |
|------|---------|-----------|
| 2026-02-23 | Ship auto-mana (Spark) as only mode for Phases 1-3 | Combat and core gameplay are higher priority than mana variety. Retrofit cost is equal now vs. later. |
| 2026-02-23 | Defer Classic mode to Phase 4 | Three-agent consensus: don't split development effort before the game is fun. |
| 2026-02-23 | Default experience = Spark, Classic = advanced option | Every successful digital card game defaults to simpler mana. Players who want full MTG can play Arena. |
| 2026-02-23 | Mana Pip color-choice system is a candidate Spark enhancement | Could add meaningful color decisions to auto-mana without lands. Evaluate during Phase 2-3. |
