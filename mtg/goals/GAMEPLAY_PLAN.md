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

**Total: ~16-26 sessions to a polished, playable game.**

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
