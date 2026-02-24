# SUP PATCHES: MTG Game Design Document

## 1. Core Design Philosophy

**This game should be "MTG Lite" -- a simplified but strategically meaningful card game that uses real Magic cards.**

Think of it as the relationship between Chess and Checkers, not Chess and a broken Chess set. The worst outcome is a game that *tries* to be full MTG and fails -- cards with abilities that don't work, interactions that should happen but don't, players confused about what's a bug versus what's a design choice. The second worst outcome is stripping so much away that it becomes "put cards on table, biggest number wins."

The right target is somewhere between Hearthstone and MTG Arena in complexity. Specifically:

**Design Principles:**

1. **Every card you play should feel like a decision.** If you can play anything for free, there are no decisions. The mana system must exist.
2. **Combat should be the primary interaction.** MTG without combat is a card-viewing application. Combat is where tension and strategy live.
3. **Abilities should be opt-in, not opt-out.** Rather than trying to parse oracle text and failing on 80% of cards, support a curated set of keywords that cover the most-played cards and let everything else be a vanilla body.
4. **Be honest about limitations.** When a card has abilities the engine can't handle, say so clearly. Players will forgive missing features. They won't forgive broken features that look like they should work.
5. **Prioritize feel over fidelity.** A smooth animation on a simplified combat system feels better than a laggy frame-accurate rules engine.

**The tagline for design decisions should be: "Would a new player understand what just happened?"**

---

## 2. Mana System Design

**Recommendation: Hearthstone-style auto-mana with MTG flavor.**

Here is the specific design:

### The System

- Each turn, your maximum mana increases by 1 (starting at 0, capping at 10).
- At the start of your turn, your mana refills to your maximum.
- Playing a card costs mana equal to its converted mana cost (CMC). The specific color pips on the card are ignored.
- Lands are removed from the game entirely. They do not appear in decks.

### Why This Over Alternatives

**Full tap-lands-for-mana** requires: land cards in hand, a play-land action, tapping/untapping state on lands, color-specific mana pools, mana floating between phases, and the ability to tap specific lands for specific colors. This is an enormous amount of UI and logic for a system that mostly results in "I play a land and pass." The interesting decisions in MTG are not "which land do I tap" -- they're "which spell do I cast." Skip the boring part.

**Auto-mana like Arena** still requires lands in the deck, which creates non-games when you draw too many or too few. Land screw and land flood are widely considered MTG's worst design flaw. Arena can get away with it because the full rules engine makes up for it. Here, the land system would add complexity without adding fun.

**No mana at all** (current state) removes all resource tension. You could dump your hand on turn 1. There's no curve, no tempo, no "do I play the 3-drop or hold for the 5-drop?" decision. The game collapses.

### Implementation Details

- Remove all cards with type "Land" from deck building, or auto-filter them out when importing.
- Display a mana crystal bar (like Hearthstone's) in the turn bar area, showing current/max. Use gem icons with the MTG color wheel aesthetic -- purple/colorless gems rather than Hearthstone blue.
- When a player tries to play a card, check `card.cmc <= currentMana`. If insufficient, flash the mana bar red and briefly show "Not enough mana" near the card.
- Cards in hand that cost more than current mana should be visually dimmed (reduce opacity to 0.5, desaturate slightly).
- When a card is played, animate the mana gems depleting (left to right) with a brief crystal-shatter particle effect.

### Deck Building Adjustment

Since lands are removed, deck sizes should be adjusted. A standard 60-card MTG deck is roughly 24 lands and 36 spells. Set the deck size to 30-40 cards (recommend 30 for faster games). Commander decks go from 100 to ~60.

### Edge Case: Cards That Reference Lands or Mana

Cards that say "search your library for a land" or "add {G} to your mana pool" simply will not function. This is acceptable. Their oracle text still displays, and the card still has its body (if it's a creature). This falls under the "be honest about limitations" principle -- the card's stats work, its text doesn't, and that's clearly communicated.

---

## 3. Combat System Design

**This is the most important system in the game. Get this right and the game is fun even if nothing else works.**

### Phase Structure

Restructure the turn into these phases:

```
BEGIN TURN → mana refills, "start of turn" triggers
    ↓
MAIN PHASE 1 → play cards from hand
    ↓
COMBAT → declare attackers → declare blockers → damage
    ↓
MAIN PHASE 2 → play cards from hand
    ↓
END TURN → "end of turn" cleanup, pass to next player
```

The phase indicator in the turn bar should highlight the current phase. Players advance phases explicitly with a button that changes label contextually: "Go to Combat" during Main 1, "Go to Main Phase" after combat, "End Turn" during Main 2.

### Declare Attackers (Active Player)

1. When the active player enters combat, all their creatures that can attack get a subtle green glow border.
2. Creatures with "summoning sickness" (entered the battlefield this turn, and don't have haste) are dimmed and cannot be selected. Show a small hourglass or zzz icon on them.
3. The player clicks/taps creatures to toggle them as attackers. Selected attackers slide forward slightly (translate ~20px toward the opponent's side) and get a red sword icon overlay.
4. A "Confirm Attack" button appears. The player can also deselect attackers before confirming.
5. On mobile, the same tap-to-toggle works. No drag needed.
6. If no creatures are selected and the player confirms, combat is skipped entirely (go straight to Main Phase 2).

**Visual state during attacker declaration:**
- Attacking creatures: shifted forward, red border, sword icon
- Eligible but not attacking: green glow border
- Cannot attack (summoning sickness): dimmed, hourglass icon
- Cannot attack (already tapped from an ability): dimmed, turned sideways

### Declare Blockers (Defending Player)

1. After attackers are confirmed, the defending player sees the attacking creatures highlighted in red on the opponent's battlefield.
2. The defender's untapped creatures get a green glow (eligible blockers).
3. The defender clicks/taps one of their creatures, then clicks/taps an attacking creature to assign the block. A visual line or arrow connects the blocker to the attacker.
4. Multiple creatures can block the same attacker (draw multiple lines to the same target).
5. Each creature can only block one attacker.
6. The defender clicks "Confirm Blocks" (or "No Blocks" to let everything through).

**Visual state during blocker declaration:**
- Attacking creatures on opponent's side: red glow, shifted forward
- Eligible blockers on your side: green glow
- Assigned blockers: blue border, with an arrow/line connecting to the creature they're blocking
- The arrow should be a simple SVG line with a slight curve, colored to match the blocker's owner

### Damage Resolution

Damage resolves automatically after blockers are confirmed. The sequence:

1. **Unblocked attackers** deal damage equal to their power to the defending player. Show the damage number floating up from the life total with a red flash.
2. **Blocked creatures** deal damage to each other simultaneously:
   - Attacker's power is dealt to blocker(s). If multiple blockers, the attacking player's damage is divided (simplified: split evenly, rounded down, with remainder to the first blocker).
   - Each blocker's power is dealt to the attacker.
   - Actually, simplify further: the attacking player does NOT choose damage assignment order. Damage is just dealt simultaneously and proportionally. This avoids a complex sub-UI.
3. **Creatures with damage >= toughness die.** They get a brief red flash, then animate to the graveyard. Show a small skull icon briefly.
4. **Damage clears at end of turn** (not immediately -- this matters for effects that happen later in the turn).

### Damage Tracking

Each creature on the battlefield needs a damage counter. Display this as a small red number overlaid on the toughness when damage has been taken. For example, a 3/4 creature that has taken 2 damage would show: `3/4` with a small red `2` or alternatively show the effective toughness as `3/2` in red to indicate the creature is damaged.

I recommend displaying `power/toughness` on every creature at all times (bottom right of the card, like a small badge). When damaged, show `power/remaining` with remaining in red. This is how Arena does it and it works well.

### Keyword Abilities in Combat

Handle these during combat resolution:

**Flying:** A creature with flying can only be blocked by creatures with flying or reach. During blocker declaration, non-flying/non-reach creatures targeting a flyer show an error indicator ("Can't block -- flying"). Display a small wing icon on flying creatures.

**First Strike:** Creatures with first strike deal their damage before creatures without it. If a first-strike creature kills its blocker/attacker before the other creature deals damage, the dead creature deals no damage. Visually, show two damage steps with a brief pause between them.

**Trample:** If a creature with trample is blocked, and its power exceeds the total toughness of all blockers, the excess damage is dealt to the defending player. Show the excess damage as a number flying from the combat to the life total.

**Deathtouch:** Any amount of damage from a deathtouch creature kills the target creature. Show a skull icon on deathtouch creatures and a poison-drip visual on the damage.

**Lifelink:** When a creature with lifelink deals damage, its controller gains that much life. Show a green +N floating up from the life total.

**Vigilance:** Attacking doesn't cause this creature to tap. (If you implement tapping -- see below.)

**Haste:** This creature can attack the turn it enters the battlefield (no summoning sickness).

**Reach:** Can block flying creatures. Show a small net/arrow icon.

### Tapping

Creatures should tap (turn sideways) when they attack, unless they have vigilance. Tapped creatures cannot block. Creatures untap at the beginning of their controller's turn. This is simple to implement (a CSS rotation of 90 degrees) and adds meaningful tactical depth -- attacking with everything leaves you defenseless.

### Bot Combat AI

The bot needs combat logic at three difficulty tiers:

**Easy:** Attacks with all eligible creatures every turn. Blocks randomly (assigns one blocker per attacker if possible).

**Medium:** Only attacks when the total power of attackers exceeds the opponent's potential blocking toughness, or when it has a significant board advantage. Blocks optimally to trade up (assigns blockers where blocker toughness > attacker power, prioritizing killing the biggest threat).

**Hard:** Evaluates each possible attack configuration for expected damage versus creature loss. Considers combat math including keywords. Will make "alpha strike" attacks when lethal. Will hold back creatures strategically to maintain a board presence. Blocks to maximize trades (kill their creature, keep mine alive).

---

## 4. Card Type Handling

### Lands

**Removed from the game.** See mana system above. If a card's type line contains "Land" and nothing else, it is excluded from deck building. This is a clean cut.

### Creatures

The core card type. Creatures:
- Enter the battlefield from hand (pay mana cost).
- Have summoning sickness (cannot attack the turn they enter unless they have haste).
- Display power/toughness as a badge on the card.
- Can attack and block per the combat system.
- Go to the graveyard when damage >= toughness or when destroyed by an effect.
- Persist on the battlefield across turns.

### Instants

**Simplified behavior:** Instants can only be played during your own main phases (not during combat or the opponent's turn). This eliminates the need for a priority system and a response stack. When played:
1. Deduct mana cost.
2. If the instant has a recognized effect (see ability system), apply it.
3. If the instant requires a target (e.g., "deals 3 damage to target creature"), enter targeting mode.
4. Move the card to the graveyard. It never hits the battlefield.

This is a significant simplification. True instant-speed interaction (counterspells, combat tricks) is one of the deepest parts of MTG, but it requires a full priority system where both players can respond to everything. That is a massive engineering effort. Cutting it keeps the game playable.

**Display:** When an instant resolves, show the card art briefly in the center of the screen (like a "spell cast" animation) for 1-2 seconds, then animate it to the graveyard.

### Sorceries

Identical to instants in this system (both are main-phase only). Same resolution flow. The distinction between instants and sorceries only matters when instants can be played at instant speed, which they cannot here.

### Enchantments

Two sub-types:

**Global Enchantments:** Enter the battlefield and persist. Their effects apply as long as they're on the battlefield. For the initial implementation, treat them as "cards that sit on the battlefield and display their text." Most enchantment effects are too diverse to implement generically. Specific high-value enchantments could be hard-coded later (e.g., "all creatures you control get +1/+1").

**Auras (Enchantment -- Aura):** These must attach to a target. When played:
1. Enter targeting mode. Highlight valid targets (usually creatures).
2. Player clicks/taps a creature.
3. The aura visually attaches to that creature -- display it as a smaller card overlapping the creature, or as an icon/buff indicator on the creature.
4. Apply stat modifications if parseable (e.g., "+2/+2" is straightforward to extract from oracle text with regex).
5. When the enchanted creature dies, the aura goes to the graveyard too.

### Artifacts

Treat identically to enchantments for now. They enter the battlefield and persist. Equipment (Artifact -- Equipment) could work like auras with an attach action, but this is a stretch goal, not a launch requirement.

### Planeswalkers

**Skip entirely.** Planeswalkers have loyalty counters, multiple activated abilities per card, can be attacked directly, and have unique rules interactions. They are the most complex permanent type in MTG. Exclude them from deck building with a filter.

### Tribal / Other

Cards with the "Tribal" supertype or unusual types (Conspiracy, Phenomenon, etc.) should be allowed in decks but treated as their most relevant type. A "Tribal Enchantment" is just an enchantment. A "Tribal Instant" is just an instant.

---

## 5. Card Interaction Model

### Desktop Interaction

**Primary pattern: Click to select, click to target.**

- **Playing a card from hand:** Click the card in hand (it lifts up and highlights). The "Play" button activates (or just click the battlefield to play it there). Alternatively, double-click a card in hand to play it immediately (current behavior -- keep this as a shortcut).

- **Attacking:** Click creatures to toggle attacker status during combat (see combat section above).

- **Blocking:** Click your creature (selected state), then click the attacker you want to block. The line/arrow draws between them.

- **Targeting (spells/abilities):** When a spell requires a target, the game enters "targeting mode." Valid targets glow. Click a valid target to select it. A "Cancel" option is always visible to back out.

- **Inspecting a card:** Hover to show the floating inspector (current behavior). Right-click or long-press for the full inspect modal.

- **Moving to graveyard (manual):** Right-click a card on the battlefield, select "Send to Graveyard" from a small context menu. This replaces the current click-to-graveyard behavior, which is too easy to do accidentally.

### Mobile Interaction

**Primary pattern: Tap to select, tap to target.** Same as desktop but with these adjustments:

- **No hover.** The floating inspector activates on long-press (~500ms) instead of hover. Release to dismiss.
- **Full inspect:** Double-tap a card to open the full modal.
- **Card selection feedback:** When a card is tapped/selected, it scales up slightly (1.1x) and gets a bright border. This compensates for the lack of hover state.
- **Larger touch targets:** Cards in hand should have a minimum tap target of 44x44px (Apple HIG minimum). If the hand has many cards, they overlap, but the tap target for each card's visible portion should still be at least 44px wide.
- **Gesture: swipe up from hand to play.** As an alternative to tap-then-tap, allow swiping a card from the hand area upward onto the battlefield. This feels natural on touch devices.
- **No drag-and-drop for blocking.** Tap blocker, tap attacker. Drag is imprecise on mobile and would be frustrating with small card targets.

### Confirmation Flows

**Require confirmation for:**
- Attacking (the "Confirm Attack" button).
- Blocking (the "Confirm Blocks" button).
- Playing spells that target your own creatures (accidental Lightning Bolts on your own creature are tilting).

**Do NOT require confirmation for:**
- Playing creatures or enchantments to the battlefield (low risk, high frequency action -- confirmation would be tedious).
- Ending your turn.

### Undo

Allow undoing the following actions until they are "committed":
- Selecting/deselecting attackers (before confirming attack).
- Selecting/deselecting blockers (before confirming blocks).
- Selecting a card from hand (before paying mana and placing it).

Do not allow undoing:
- A spell that has resolved.
- Damage that has been dealt.
- A turn that has been ended.

---

## 6. Ability System (Simplified)

### Tier 1: Keyword Abilities (Implement These)

These keywords are detectable from oracle text or keyword arrays in Scryfall data, and they modify combat or entry behavior in simple, predictable ways:

| Keyword | Implementation |
|---------|---------------|
| **Flying** | Can only be blocked by flying/reach creatures |
| **Reach** | Can block flying creatures |
| **First Strike** | Deals damage first in combat; if it kills, no return damage |
| **Double Strike** | First strike damage AND normal damage (implement as two combat steps) |
| **Trample** | Excess damage over blocker toughness hits the player |
| **Deathtouch** | Any damage kills the target creature |
| **Lifelink** | Controller gains life equal to damage dealt |
| **Haste** | No summoning sickness |
| **Vigilance** | Doesn't tap when attacking |
| **Defender** | Cannot attack |
| **Menace** | Must be blocked by two or more creatures |
| **Indestructible** | Cannot be destroyed by damage or "destroy" effects |
| **Hexproof** | Cannot be targeted by opponents' spells/abilities |

That is 13 keywords. All of them modify existing systems (combat, targeting, entry) rather than requiring new systems. All are detectable from the `keywords` array in Scryfall card data (no oracle text parsing needed).

### Tier 2: Static Abilities (Stretch Goal)

These require parsing oracle text but have high impact:

- **"+N/+N to all creatures you control"** -- regex parseable, applies a buff to all friendly creatures.
- **"When this creature enters the battlefield, [effect]"** -- ETB triggers. Only implement a few specific patterns: "deal N damage to target," "gain N life," "draw a card."
- **"When this creature dies, [effect]"** -- Death triggers. Same limited pattern set.

### Tier 3: Activated Abilities (Future)

Activated abilities (tap symbol: effect, or pay mana: effect) require a UI for activating them (a button or tap on the card) and parsing diverse effects. This is a future enhancement, not a launch feature.

### Handling Unsupported Abilities

When a card has oracle text that the engine cannot process:

1. **Display the oracle text** as-is (already implemented).
2. **Add a small icon** on the card -- a yellow warning triangle with an "i" -- indicating "This card has abilities that aren't supported in this version."
3. **On the inspect modal**, show a clear message: "Some abilities on this card are not implemented. This card functions as a [power]/[toughness] creature with [supported keywords]."
4. **Do NOT prevent the card from being played.** A 4/4 flyer with an unsupported triggered ability is still a 4/4 flyer. Let it be played for its stats.

### Keyword Detection

Scryfall card data includes a `keywords` array. Use this directly:

```javascript
const SUPPORTED_KEYWORDS = new Set([
  'Flying', 'Reach', 'First strike', 'Double strike',
  'Trample', 'Deathtouch', 'Lifelink', 'Haste',
  'Vigilance', 'Defender', 'Menace', 'Indestructible', 'Hexproof'
]);

function getSupportedKeywords(card) {
  return (card.keywords || []).filter(kw => SUPPORTED_KEYWORDS.has(kw));
}

function getUnsupportedKeywords(card) {
  return (card.keywords || []).filter(kw => !SUPPORTED_KEYWORDS.has(kw));
}

function hasUnsupportedAbilities(card) {
  // Has oracle text beyond just keywords
  const oracleText = card.oracle_text || '';
  const keywordsInText = card.keywords || [];
  const strippedText = oracleText;
  // Remove keyword lines, flavor text markers, reminder text in parentheses
  // If remaining text is non-trivial, card has unsupported abilities
  return strippedText.replace(/\(.*?\)/g, '').trim().length > 0
    && getUnsupportedKeywords(card).length > 0;
}
```

### Visual Indicators for Keywords

Display small icons on cards with supported keywords, overlaid on the card's battlefield representation:

| Keyword | Icon | Position |
|---------|------|----------|
| Flying | Wing silhouette | Top-right |
| First Strike / Double Strike | Lightning bolt | Top-right |
| Trample | Boot/stomp | Bottom-left |
| Deathtouch | Skull | Bottom-left |
| Lifelink | Heart | Bottom-left |
| Haste | Flame | Top-left |
| Vigilance | Eye | Top-left |
| Defender | Shield | Top-left |
| Menace | Double-fang | Top-right |
| Hexproof | Hexagon shield | Top-left |
| Indestructible | Diamond | Top-left |

Use simple SVG icons, 16x16px, with a semi-transparent dark background circle for readability against any card art.

---

## 7. Win/Loss and Life Totals

### Life Totals

- **Standard:** Each player starts at 20 life.
- **Commander:** Each player starts at 40 life.
- Life totals are prominently displayed near each player's avatar/name area.
- When life changes, animate the number (count up/down over ~0.5s) and flash the background (red for damage, green for healing).

### Dealing Damage to Players

Damage to players comes from:
1. **Unblocked attacking creatures.** Damage equals the creature's power.
2. **Trample damage** that exceeds blocker toughness.
3. **Direct damage spells** (if/when implemented in the ability system, e.g., "Lightning Bolt deals 3 damage to any target").

### Win Conditions

1. **Life total reaches 0 or below.** The player whose life hits 0 loses. In a 2-player game, the other player wins. In multiplayer Commander, the eliminated player is removed and the game continues.
2. **Concession.** A player can concede at any time via a menu option. Confirm with an "Are you sure?" dialog.
3. **Deck out.** If a player would draw a card but their library is empty, they lose. (This is a natural MTG rule and trivial to implement.)

### Commander Damage

In Commander format, track damage dealt to each player by each commander (the designated commander card). If a single commander deals 21 or more cumulative combat damage to a player, that player loses regardless of life total.

Implementation: maintain a simple map of `{ [targetPlayerId]: { [commanderCardId]: damageTotal } }`. Check after each combat damage step.

Display: show commander damage as small counters near each player's life total in Commander games. Only show non-zero values.

### Game Over Screen

When a player wins or loses:
1. Freeze the game state (no more actions).
2. Overlay a semi-transparent dark backdrop.
3. Display "VICTORY" or "DEFEAT" in large text with a brief scale-up animation.
4. Show final stats: life totals, creatures killed, damage dealt, turns played.
5. Buttons: "Play Again" (restart with same decks), "Change Decks" (back to deck builder), "Main Menu."

---

## 8. What to SKIP

These features are explicitly out of scope. They are either too complex, too niche, or too performance-heavy for this platform.

### Hard No -- Do Not Implement

| Feature | Reason |
|---------|--------|
| **The Stack / Priority System** | Requires both players to have response windows on every action. Massively complex, massively slow for gameplay pacing. Without it, no counterspells or instant-speed tricks, which is a real loss, but the alternative is a game that takes 3x longer per turn. |
| **Planeswalkers** | Loyalty counters, multiple abilities, attackable permanents. Each planeswalker is essentially a mini-game. Way too much per-card implementation. |
| **Mana colors / color identity** | The Hearthstone mana system removes color entirely. This means color-specific cards (e.g., "destroy target black creature") lose their meaning, and multicolor costs are just summed. This is acceptable. |
| **Sideboarding** | Requires best-of-3 match structure and a sideboard UI. Not worth it for casual play. |
| **Mulligan scry** | The current mulligan works. The London mulligan's "put N cards on bottom" is additional UI complexity for marginal benefit. |
| **Mana abilities on creatures** | "Tap: Add {G}" requires the mana pool system we're avoiding. |
| **Morph / Manifest / Disguise** | Face-down cards require hidden information tracking and a flip mechanic. |
| **Mutate / Meld** | Combining cards into one permanent is a significant state management challenge. |
| **Saga enchantments** | Multi-chapter enchantments with per-turn triggers need their own sub-system. |
| **Adventures / Split cards** | Cards with two modes need a choice UI and dual-state tracking. |
| **Madness / Flashback / Escape** | Playing cards from non-hand zones requires zone-aware casting permissions. |
| **Phasing / Banding / Protection** | Either deprecated, incomprehensible, or too niche. |
| **Multiplayer politics** | No deal-making, no "choose target opponent" voting. Commander is multiplayer but mechanically simple (attack whoever you want). |
| **Deck import from text** | Nice to have, but Scryfall search and adding cards individually works. Not a gameplay feature. |
| **Network multiplayer** | This is a single-device or bot-opponent game. Real-time networking is an entirely different project. |

### Conscious Simplifications (Things That Work Differently Than Real MTG)

| Simplification | Real MTG Behavior | Our Behavior |
|----------------|-------------------|--------------|
| Mana | Tap lands for colored mana | Auto-increment, colorless |
| Instants | Can be played on opponent's turn | Main phase only |
| Damage assignment | Attacker chooses order for multiple blockers | Even split |
| Multiple blockers | Each blocks independently, attacker assigns damage | Damage split evenly across blockers |
| "Destroy" effects | Many cards say "destroy target creature" | Only implement as direct-damage equivalents when parseable |
| Enchantment effects | Wildly diverse | Only stat modifications (+N/+N) parsed; other text displayed but non-functional |
| Token generation | Many cards create tokens | Skip initially. No token system. Cards that create tokens just don't do that part. |
| Counters (+1/+1, -1/-1) | Persist across turns, stack | Implement +1/+1 and -1/-1 counters as a stretch goal. Not at launch. |

---

## Implementation Priority

If I were building this, here is the order I would implement features, structured as phases:

### Phase 1: The Game Exists (make it playable)
1. Mana system (auto-increment, cost checking, visual bar)
2. Card type differentiation (creatures have P/T, instants/sorceries go to graveyard on resolve)
3. Summoning sickness
4. Basic combat (declare attackers, declare blockers, damage resolution, creatures die)
5. Life total interaction (unblocked creatures deal damage)
6. Win/loss condition (life reaches 0)
7. Creature tapping on attack, untap at start of turn

### Phase 2: The Game Is Strategic (make it interesting)
8. Keyword abilities: Flying, First Strike, Trample, Deathtouch, Lifelink, Haste, Vigilance
9. Aura attachment (enchantments that attach to creatures with +N/+N)
10. Improved bot AI (evaluate combat math, not just play cards by CMC)
11. Visual feedback: damage numbers, death animations, spell cast overlay, mana crystal depletion

### Phase 3: The Game Is Polished (make it feel good)
12. Remaining keywords: Reach, Double Strike, Menace, Defender, Hexproof, Indestructible
13. Card animation system: cards slide between zones, attack animations, smooth transitions
14. Targeting system for damage spells (tap-to-target flow)
15. Commander damage tracking
16. Unsupported ability indicators (warning icons, clear messaging)
17. Sound effects (card play, damage, death, victory)

Each phase should be a playable, testable state. Phase 1 alone transforms the project from a card viewer into a game. Phase 2 makes it a game worth replaying. Phase 3 makes it a game worth sharing.

---

## Final Note on Scope

The single most important thing is to **ship Phase 1 completely before starting Phase 2.** The temptation will be to implement keywords alongside combat because "they're part of combat." Resist this. A working game with vanilla creatures and basic combat is infinitely more valuable than a half-working game with flying and trample but broken damage resolution. Every system should be fully functional and tested before adding the next one. The mana system needs to work perfectly before combat begins. Combat needs to work perfectly before keywords are layered on.

The second most important thing: **the bot must be good enough to lose to.** If the bot plays randomly, the game feels pointless. Phase 1 must include a bot that at minimum plays creatures on curve (highest CMC it can afford) and attacks when it has a board advantage. That alone makes games feel like games.
