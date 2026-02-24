# MTG Web Game: Implementation Roadmap

---

## Critical Path: Current State to "Playable Game"

Before diving into phases, here is the shortest path from what exists today (a card display platform) to something that is actually a game:

**Mana System → Combat System → Life Total / Win Condition**

That is it. Three things. Without mana, there is no resource tension. Without combat, there is no interaction. Without life totals and win conditions, there is no game. Everything else (abilities, stack, enchantments) is flavor on top of these three pillars. The phases below are organized around this spine.

---

## Phase 1: Mana & Resource System

**Goal:** Playing cards costs something, which means decisions matter.

### Features
- Land cards are distinguished from non-land cards (use Scryfall type_line data already cached)
- Playing a land does not cost mana but is limited to one per turn
- Tapping a land produces mana of its color identity
- Mana pool tracks WUBRG + colorless, visible to the player
- Non-land cards require their printed mana cost to be paid before resolving
- Mana pool empties at end of each phase (simplified: end of turn for now)
- UI shows mana pool as colored pips near the player's life area
- Lands on battlefield show tapped/untapped state visually (90-degree rotation)
- Untap step at start of turn untaps all permanents

### Engine Changes
- New state fields: `player.manaPool` (object: `{W:0, U:0, B:0, R:0, G:0, C:0}`), `player.landsPlayedThisTurn`
- New action: `tapForMana(cardId)` — taps a land, adds mana to pool
- Modify `playCard` action: validate mana cost before resolving, deduct from pool
- New action: `untapAll(playerId)` — called at turn start
- Card state gains `tapped: boolean`
- Land-per-turn enforcement (check `landsPlayedThisTurn < 1` before allowing land play)

### Client Changes
- Tap/untap visual: CSS rotation on tapped cards (`.card.tapped { transform: rotate(90deg); }`)
- Mana pool display: small bar above player's hand showing available mana as colored circles
- Click land to tap for mana (before playing a spell)
- When playing a non-land card: validate client-side that mana is available, send tap+play sequence to engine
- Land play button or drag distinct from spell play
- Visual feedback when insufficient mana (dim unplayable cards in hand, or shake on failed attempt)

### Estimated Scope
**Medium (3-5 sessions)**. Mana cost parsing from Scryfall's `mana_cost` field (e.g., `{2}{R}{R}`) needs a parser. Generic mana payment (choosing which lands to tap for `{2}`) is the hardest UX problem here.

### Dependencies
None. This is the foundation.

### Risk Factors
- **Generic mana payment UX is notoriously fiddly.** Player has `{2}{R}` to pay, has a Mountain and two Forests. They must tap the Mountain for R, then two Forests for the generic 2. Auto-pay is desirable but complex (greedy algorithm: pay colored first, then generic from least-constrained sources). Start with manual tapping and add auto-pay as polish.
- **Hybrid mana, Phyrexian mana, X costs** — defer all of these. Parse only `{W}`, `{U}`, `{B}`, `{R}`, `{G}`, `{C}`, `{N}` (where N is a number for generic). Anything else, treat the card as unplayable for now and log it.
- **Multi-color lands** (e.g., duals that produce W or U): each tap needs a choice. Start by supporting basic lands only (one color per land), then add choice UI later.

---

## Phase 2: Combat System

**Goal:** Creatures fight each other. Turns have stakes. The board state changes through conflict, not just by playing cards.

### Features
- Creatures have power/toughness (parsed from Scryfall data)
- Declare attackers step: active player selects creatures to attack with
- Declaring an attacker taps the creature
- Declare blockers step: defending player assigns blockers to attackers
- Damage resolution: unblocked attackers deal damage to defending player, blocked creatures deal damage to each other simultaneously
- Creatures with toughness reduced to 0 or less move to graveyard
- Summoning sickness: creatures cannot attack the turn they enter the battlefield (unless they have haste, but defer keyword abilities to Phase 4)
- Combat math displayed clearly: show power/toughness on battlefield cards, highlight damage assignments

### Engine Changes
- Card state gains: `power: number`, `toughness: number`, `summoningSick: boolean`, `damage: number`
- New turn phases modeled explicitly: `untap → upkeep → main1 → combat_begin → declare_attackers → declare_blockers → combat_damage → combat_end → main2 → end`
- New actions:
  - `declareAttackers(cardIds[])` — validates creatures are untapped + not summoning sick, taps them, moves to declare blockers
  - `declareBlockers(assignments: {blockerId: attackerId}[])` — validates defending player controls blockers
  - `resolveCombatDamage()` — calculates damage, applies it, moves dead creatures to graveyard
- Phase advancement: engine tracks current phase, restricts actions per phase (e.g., cannot play sorcery-speed cards during combat)
- Damage clears at end of turn (set `damage: 0` on all creatures during cleanup)

### Client Changes
- Turn phase indicator bar (already has a turn bar, extend it to show current phase with clickable "Next Phase" / "Go to Combat" button)
- Attacker selection UI: during declare attackers, click creatures to toggle attack state. Visual indicator (red border, arrow pointing toward opponent, or slide forward toward center)
- Blocker assignment UI: during declare blockers, click a creature you control, then click an attacker to assign it as a blocker. Lines or arrows showing assignments
- Combat damage preview: before resolving, show what will happen (e.g., "3 damage to opponent," "your 2/2 trades with their 2/3 — your creature dies")
- Power/toughness overlay on creature cards (small badge, bottom-right, already common in digital MTG)
- "Confirm" button for each combat sub-step
- Bot opponent makes blocking decisions (server-side): simple heuristic — block the biggest attacker with the smallest creature that survives, or chump-block if no favorable blocks exist

### Estimated Scope
**Large (5+ sessions)**. This is the single most complex phase. Combat is the heart of Magic and even simplified combat has many edge cases.

### Dependencies
Phase 1 (Mana). Without mana, every creature enters for free and the board floods immediately. Mana creates the pacing that makes combat meaningful.

### Risk Factors
- **Blocking assignment UX on mobile.** Dragging lines between cards on a small screen is painful. Consider a two-tap approach: tap blocker, then tap attacker to assign. Show the assignment as a colored highlight or number badge.
- **Multiple blockers on one attacker** (legal in MTG). The attacker's controller orders blockers and assigns damage. This is complex. For v1, restrict to one blocker per attacker. Add multi-block later.
- **Damage vs. toughness tracking.** MTG uses "damage marked on creature until end of turn" not "reduced toughness." This matters for healing effects later but can be simplified initially — just track `damage` separately from `toughness` and check `damage >= toughness` for death.
- **Bot combat AI is an entire problem space.** Start dumb: bot attacks with everything, blocks greedily. Medium bot evaluates trades. Hard bot does nothing you can ship in Phase 2 — defer smart AI to later.
- **Polling-based updates hurt here.** When the defending player needs to declare blockers, they must see the attackers. If using polling, there is a latency gap. Consider a short poll interval during combat (500ms) and immediate poll on phase change.

---

## Phase 3: Life Totals, Win Conditions & Game Flow

**Goal:** The game can end. Someone wins. There is a reason to keep playing.

### Features
- Each player starts at 20 life (40 for Commander)
- Unblocked combat damage reduces life total
- Life total displayed prominently for all players
- Player at 0 or less life loses the game
- Win/loss screen with rematch option
- Concede button (instant loss)
- Draw step: player draws a card at the start of each turn (draw phase)
- Deck-out loss: if a player cannot draw because their library is empty, they lose
- Turn timer (optional, useful for multiplayer — 90 seconds per turn, auto-pass if exceeded)

### Engine Changes
- `player.life` field (initialize 20 or 40)
- `dealDamageToPlayer(playerId, amount)` action
- `checkStateBasedActions()` — runs after every action: checks life <= 0, checks creatures with lethal damage, checks empty library on draw. This is a core MTG concept and centralizing it now pays off hugely later
- `concede(playerId)` action
- `drawCard(playerId)` action (move from `checkDraw` or initial implementation into formal action)
- Game state gains `status: 'playing' | 'finished'` and `winner: playerId | null`
- Turn structure formalized: untap, upkeep, draw, main1, combat, main2, end, cleanup

### Client Changes
- Life total display: large number next to each player's avatar/name area. Animate changes (flash red on damage, flash green on gain)
- Win/loss modal: "You Win!" or "You Lose!" overlay with stats (turns played, damage dealt) and "Rematch" / "Back to Lobby" buttons
- Concede button in game menu (confirm dialog to prevent misclicks)
- Draw animation: card slides from library to hand at start of turn
- Library count visible (number on deck pile)
- Game log/history feed: scrollable text feed showing major events ("Player dealt 3 damage," "Creature destroyed"). This is cheap to build and massively improves game feel and debugging

### Estimated Scope
**Small-Medium (2-3 sessions)**. Most of this is straightforward state management. The state-based actions engine is the only architecturally significant piece.

### Dependencies
Phase 2 (Combat). Life changes come from combat damage. Without combat, life totals are static and meaningless.

### Risk Factors
- **State-based actions need to be bulletproof.** In real MTG, SBAs are checked constantly and can cascade (creature dies, triggers leave-the-battlefield effect, which deals damage, which kills another creature). For now, SBAs only check life and lethal damage — no triggers, no cascading. But architect the SBA checker as a loop that re-checks until no more actions are found, so it is extensible later.
- **Commander damage tracking** (21 damage from a single commander kills you) — defer this entirely. Commander players will accept simplified rules for an MVP.
- **Multiplayer win conditions** (last player standing). When a player loses, remove them from turn order. Their permanents leave the game. This is simple conceptually but needs testing with 3+ players.

---

## Phase 4: Card Type Differentiation & Basic Abilities

**Goal:** Cards feel different from each other. A Lightning Bolt is not the same as a Llanowar Elves.

### Features
- **Card types enforced:**
  - Creatures: have power/toughness, can attack/block (already from Phase 2)
  - Instants: play from hand, effect resolves, goes to graveyard immediately (no battlefield presence)
  - Sorceries: same as instants but only playable at sorcery speed (main phase, stack empty)
  - Enchantments: enter battlefield, persist (no effects yet unless simple)
  - Artifacts: enter battlefield, persist
  - Planeswalkers: defer entirely
- **Keyword abilities (subset):**
  - Flying: can only be blocked by creatures with flying or reach
  - Reach: can block flyers
  - Trample: excess combat damage carries over to defending player
  - Haste: no summoning sickness
  - First Strike: deals damage before normal combat damage
  - Deathtouch: any damage is lethal
  - Vigilance: does not tap when attacking
  - Lifelink: damage dealt gains that much life
- **Targeting system (basic):** "Target creature" and "Target player" — when casting a spell that targets, player selects a valid target before it resolves
- **Damage spells:** Parse oracle text for simple patterns like "deals N damage to any target" and implement them

### Engine Changes
- Card type checking before allowing actions (cannot attack with an enchantment)
- Keyword ability parser: read Scryfall `keywords` array (already provided by API) and set boolean flags on card state
- Modify combat resolution to account for keywords:
  - Flying/reach check during blocker validation
  - First strike creates a separate damage step
  - Trample calculates excess damage
  - Deathtouch marks any damage as lethal
  - Vigilance skips tap on attack
  - Lifelink adds life on damage dealt
- Targeting system: new action `selectTarget(sourceCardId, targetCardId | targetPlayerId)` with validation
- Simple oracle text parser for direct damage spells: regex for "deals {N} damage to" patterns, implement as `dealDamage` effect
- Speed restriction: sorceries and creatures only during main phase when stack is empty

### Client Changes
- Keyword ability icons/badges on cards (small icons for flying, trample, etc.)
- Targeting mode: when casting a targeted spell, board enters "select target" state. Valid targets highlighted, invalid targets dimmed. Click to confirm
- Instant-speed play: allow playing instants during opponent's turn (need a way to hold priority — simplest approach: "You have an instant you could play. Respond?" prompt during opponent's combat/main phase)
- Card type visuals: different border color or subtle indicator for creature vs. enchantment vs. artifact on the battlefield

### Estimated Scope
**Large (5+ sessions)**. Keyword abilities alone are a medium effort. The targeting system is a new interaction paradigm. Oracle text parsing is a rabbit hole.

### Dependencies
Phases 1-3 (full game loop). Card abilities are meaningless without the game loop to contextualize them.

### Risk Factors
- **Oracle text parsing is a trap.** MTG has thousands of unique card texts. Do NOT try to parse arbitrary oracle text. Instead, support a whitelist of simple effects (deal damage, gain life, draw cards, destroy target creature) and mark unsupported cards. Expand the whitelist over time.
- **Priority and the stack** start mattering here. When an opponent casts a spell, the other player should be able to respond with an instant. Without WebSockets, this is the hardest problem in the system. The polling approach means: engine sets `awaitingResponse: playerId`, client polls, sees it needs input, player acts, engine continues. This adds latency to every interaction. For v1, use a simplified priority: only pause for responses during combat and when a spell targets you. Auto-pass priority in all other cases.
- **First strike + deathtouch interaction** and similar keyword combos need careful ordering. First strike creature with deathtouch kills the blocker before it deals damage. Test these combos explicitly.
- **Instant-speed response UX on mobile.** A "respond?" popup is annoying but necessary. Add an "auto-pass" toggle so players who have no instants (or do not want to respond) skip the prompt.

---

## Phase 5: Polish, UX & Playability

**Goal:** The game feels good to play, not just functionally correct.

### Features
- Card play animations (hand to battlefield, battlefield to graveyard)
- Smooth tapping animation (rotation transition)
- Drag-and-drop as alternative to click-to-play
- Sound effects (card play, damage, turn change) — optional, off by default in webview
- Game log with expandable detail
- Graveyard/exile zone inspection (click to see all cards)
- Opponent hand size indicator (N cards in hand)
- Undo last action (before confirming phase changes)
- Reconnection handling (if polling fails, show "reconnecting" and resume)
- Mobile layout optimizations (hand as horizontal scroll, larger tap targets)
- Card hover preview (larger image on hover/long-press)

### Engine Changes
- Undo stack: snapshot game state before each action, allow rollback of last N actions within a turn
- Exile zone support (separate from graveyard)

### Client Changes
- CSS transitions for card movement (transform, opacity, position)
- requestAnimationFrame-based animation for combat damage numbers
- Touch event handling for drag-and-drop
- Viewport-responsive layout adjustments
- Game log component (appended div list with auto-scroll)

### Estimated Scope
**Medium (3-5 sessions)**. Each individual item is small, but there are many of them. Prioritize animations and mobile UX — those are the highest-impact items.

### Dependencies
Phases 1-4 (complete game). Polish a working game, not a broken one.

### Risk Factors
- **Animations in a single file.** CSS transitions are fine. JS animations (requestAnimationFrame) in a template literal are awkward but workable. Keep animations simple — slide and fade, not particle effects.
- **Drag-and-drop on mobile webviews** has inconsistent behavior. Touch events (touchstart/touchmove/touchend) are more reliable than drag events. Test on actual devices early.
- **Undo is deceptively complex** in multiplayer. Limit undo to single-player (vs. bot) games, or only allow undo before the opponent has seen the action.

---

## What to Cut (Explicitly Deferred)

| Feature | Why Cut |
|---|---|
| **Stack/priority system (full)** | Correct MTG priority passing requires real-time communication. Polling makes this painful. Simplified priority (auto-pass with interrupt prompts) covers 80% of gameplay. Full stack is a post-launch feature. |
| **Enchantment auras / equipment attachment** | Requires a targeting + attachment system. Auras that fall off when the creature dies need state-based action cascading. Medium complexity, low impact for MVP. |
| **Planeswalkers** | Loyalty counters, activated abilities, attackable permanents — each is a subsystem. Planeswalkers are an entire feature set. Cut entirely for MVP. |
| **Triggered abilities** | "When this creature enters the battlefield" effects require an event/trigger system layered on top of the game engine. This is the gateway to full rules complexity. Defer until post-launch. |
| **Activated abilities** | "Tap: deal 1 damage" effects require a new interaction paradigm (select permanent, select ability, select target). Defer. |
| **Commander-specific rules** | Commander damage tracking, command zone, commander tax, color identity restrictions beyond deck building. Commander players are forgiving — basic rules are enough. |
| **Sideboard** | Best-of-3 sideboarding. Zero gameplay impact for casual matches. |
| **Graveyard interaction** | Flashback, recursion, reanimation. Requires graveyard as an interactive zone, not just a discard pile. Defer. |
| **Counter spells** | Requires stack and priority to work. Auto-pass system could support a simplified "counter?" prompt, but it is not worth the complexity for Phase 1-4. Add in a future "stack" phase. |
| **Multiplayer politics** | No in-game chat, no deal-making UI. Players can use external communication. |
| **Custom card rendering** | Currently uses Scryfall images, which is correct and sufficient. Do not build a custom card renderer. |
| **Animations beyond basic transitions** | No 3D card flips, no particle effects, no attack slash animations. A smooth slide and a fade cover 95% of needed visual feedback. |
| **Deck import/export (beyond current)** | If deck building works now, do not touch it until the game itself is playable. |

---

## Technical Risk Areas

### 1. Priority System Without WebSockets (HIGHEST RISK)

This is the single biggest technical challenge in the entire project. MTG is a game where both players can act at almost any time (instants, abilities). Without WebSockets, the defending player does not know the attacking player has acted until the next poll.

**Mitigation strategy:**
- Implement a "stop" system. The engine knows when it needs input from a non-active player (blocking, responding to targeted spells). It sets `game.awaitingInput = { playerId, reason, timeout }`.
- Client polls at 1-second intervals normally, 500ms during combat.
- When the engine is awaiting input, the active player sees "Waiting for opponent..." and the non-active player sees the prompt on their next poll.
- Add an auto-pass preference: if a player has no instants in hand and no activated abilities, skip the prompt entirely. This eliminates most unnecessary waits.
- Accept that there will be 0.5-1 second latency on interactive responses. This is fine for casual play.

### 2. Mana Payment UX in a Single-File Vanilla JS App

Auto-tapping lands to pay mana costs is a solved problem in Arena/MTGO, but those have full UI frameworks. In vanilla JS inside a template literal:

**Mitigation strategy:**
- Start with manual tapping. Player clicks lands to float mana, then plays the spell. Engine validates payment.
- Add a "auto-pay" button that runs a greedy algorithm: pay colored costs first (tap lands that only produce that color), then generic costs from remaining untapped lands.
- Auto-pay covers 90% of cases. Manual tapping handles edge cases.
- Do not build a modal mana payment dialog. Just tap-to-float, play-to-spend.

### 3. State Synchronization via Polling

Polling means clients can see stale state. Two players might see different board states for up to 1 second.

**Mitigation strategy:**
- Version the game state. Each mutation increments a version number. Client sends its known version with each poll. Server only sends data if the version is newer.
- On the client, optimistically update the UI when the player takes an action (move card to battlefield immediately), then reconcile on next poll. If the server rejected the action, snap back.
- Include a "state hash" in poll responses. If the client's local state hash does not match, do a full re-render. This prevents drift.

### 4. Oracle Text Parsing

There are over 27,000 unique cards in MTG. Trying to parse all oracle text is a multi-year effort.

**Mitigation strategy:**
- Do not parse oracle text at all for Phases 1-3. Cards are defined by their type, mana cost, power/toughness, and keywords (all structured data from Scryfall).
- In Phase 4, implement a whitelist of ~10-15 simple effects using regex patterns on oracle text:
  - `deals (\d+) damage to (any target|target creature|target player)`
  - `destroy target (creature|permanent)`
  - `draw (\d+) cards?`
  - `gains? (\d+) life`
  - `target creature gets [+-](\d+)/[+-](\d+) until end of turn`
- Mark all other cards as "abilities not implemented" in the card inspector. They can still be played as vanilla creatures/permanents.
- This whitelist approach scales. Add patterns as needed without architectural changes.

### 5. Single File Scalability

2200 lines is already substantial. By Phase 4, the file could be 5000+ lines.

**Mitigation strategy:**
- Use clear section comments and a table of contents at the top of the file.
- Organize by concern: engine state at top, engine actions next, client rendering, client event handlers, CSS, HTML.
- Use object namespacing inside the file (e.g., `const Engine = { ... }`, `const UI = { ... }`, `const Combat = { ... }`). This provides module-like organization without actual modules.
- Consider splitting into 2-3 files if the webview environment allows it. Even without imports, you can load multiple script tags. But only do this if the single file becomes genuinely unmanageable.

### 6. Bot AI Beyond "Random"

The bot needs to make decisions: when to play cards, what to attack with, how to block. Easy/Medium/Hard difficulties compound this.

**Mitigation strategy:**
- **Easy bot:** Play the most expensive card it can afford each turn. Attack with everything. Block randomly.
- **Medium bot:** Evaluate trades before attacking (do not attack a 2/2 into a 3/3). Block optimally (minimize own creature losses). Play removal spells on the biggest threat.
- **Hard bot:** Defer to post-MVP. Real MTG AI is an unsolved problem. Medium is good enough.
- Bot runs synchronously on the server, so no polling issues. It just takes its turn and the state updates.

---

## Summary: Phase Timeline

| Phase | Name | Scope | Cumulative Result |
|---|---|---|---|
| 1 | Mana & Resources | Medium (3-5 sessions) | Cards cost mana. Decisions begin. |
| 2 | Combat | Large (5+ sessions) | Creatures fight. Board state is contested. |
| 3 | Life & Win Conditions | Small-Medium (2-3 sessions) | Games can be won or lost. Full loop. |
| 4 | Card Types & Abilities | Large (5+ sessions) | Cards feel unique. Strategy emerges. |
| 5 | Polish & UX | Medium (3-5 sessions) | Game feels good, not just correct. |

**Total estimate: 18-23 sessions to a polished, playable game.**

**Minimum viable "fun" checkpoint: End of Phase 3 (~10-13 sessions).** At that point you have a game where mana creates resource tension, creatures fight in combat, and someone wins. It is simplified Magic, but it is a real game. Everything after Phase 3 is about depth and feel.
