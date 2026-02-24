---

# Digital TCG Core Gameplay UX: Research & Patterns

## 1. Mana/Resource System UX

### How Players See Available Mana

Each game takes a distinct approach to resource visualization:

**Hearthstone** uses the simplest model. Mana Crystals appear as a row of blue hexagons on the right side of the hero. Two numbers display: available mana / total mana crystals. Crystals fill one-per-turn automatically up to 10. When you spend mana, crystals visually dim. Modified card costs display in color: green if reduced, red if increased.

**Legends of Runeterra** extends this with a dual-mana display. Regular mana appears as blue gem slots on the center-right beneath "The Button." Below those, three smaller circle icons represent banked spell mana (up to 3 unused mana carries over, usable only for spells). The system spends spell mana first before regular mana. This is visible to both players -- opponent mana is shown above The Button.

**MTG Arena** has the most complex resource system because lands produce specific colors. Your land cards sit in rows on the battlefield. The auto-tapper algorithm selects which lands to tap when you cast a spell, analyzing your hand to preserve color flexibility. Players can manually tap by holding Q and clicking lands, or tap QQ to auto-tap all non-creature mana sources. The auto-tapper struggles with utility lands (like Phyrexian Tower, Cavern of Souls) and color-intensive spells.

**Marvel Snap** has the simplest system. Energy starts at 1 on turn 1 and increases by 1 each turn up to 6 on turn 6. The current energy is displayed as a number at the bottom-center of the screen. Card cost appears in blue in the top-left corner of every card.

**Pokemon TCG Live** uses energy attachment rather than a shared pool. Players manually attach one Energy card per turn from hand to a Pokemon. The interface uses drag-and-drop to place energy cards onto Pokemon. The in-play zone changes appearance based on the energy type of the active Pokemon.

### Implementation Patterns for a Web-Based MTG Game

- **Auto-tap with override**: Build an algorithm that examines the hand and prioritizes tapping lands that produce only one color before duals, and preserves utility lands. Always show which lands the system selected before the spell resolves. Let players click individual lands to override.
- **Mana pool display**: Show a compact indicator near the player avatar with colored pips (W/U/B/R/G) and counts. Update in real-time as lands are tapped/untapped.
- **Cost validation**: Grey out or dim cards in hand that cannot be cast with available mana. Cards that are playable should glow or have a subtle highlight. When a card's effective cost differs from printed cost, color the mana number (green = cheaper, red = more expensive), following Hearthstone's pattern.
- **Floating mana warning**: If mana is in the pool but no spell has been cast, show a brief reminder before advancing phases (MTG Arena does this).

### Sources
- [Hearthstone Mana Wiki](https://hearthstone.wiki.gg/wiki/Mana)
- [MTG Arena Interface Guide](https://mtgazone.com/arena-hot-keys-and-interface-guide-simplify-your-game-with-these-easy-tricks/)
- [How Mana is Decided in MTG Arena](https://www.playbite.com/q/how-is-mana-use-decided-mtg-arena)
- [LoR Mana System](https://support-legendsofruneterra.riotgames.com/hc/en-us/articles/360035562074-Let-s-Talk-About-Mana)
- [Marvel Snap Energy System](https://marvelsnap.helpshift.com/hc/en/3-marvel-snap/faq/23-what-is-energy/)

---

## 2. Playing Cards from Hand

### Drag vs Click-to-Play vs Tap

**Hearthstone**: Drag-and-drop is the primary interaction. You drag a card from your hand onto the battlefield. For targeted spells, you drag the card to the board, then a bold red arrow appears from the card to your cursor -- you drag the arrow to select a target. Releasing on an invalid area cancels the play. The tactile drag interaction is widely cited as core to Hearthstone's "snappy" feel.

**MTG Arena (Desktop)**: Click-to-play. You click a card in hand, it highlights and floats up, then you click the zone where you want to play it (battlefield for permanents). For targeted spells, after clicking the card, valid targets highlight and you click the target. Right-click cancels.

**MTG Arena (Mobile)**: Tap-and-drag. Tap a card and drag it to the battlefield. For combat, tap creatures to select attackers; tap a blocking creature then tap the attacker it should block.

**Marvel Snap**: Pick-up-and-place. You pick up a card and play it at one of three locations. The core interaction is deliberately as simple as possible -- the design mantra was "you pick up a card and you play it at a location."

**Legends of Runeterra**: Drag-to-play. Drag units from hand to the back row. For spells, drag them to the play area and targets highlight. Committing requires pressing "The Button" -- this is critical because it creates a deliberate confirmation step before passing priority.

**Pokemon TCG Live**: Drag-and-drop throughout. Drag Energy cards onto Pokemon, drag Trainer cards to the play area, drag Pokemon to the bench or active slot.

### Legal Play Highlighting

Across all games, **playable cards glow or highlight** when they can be legally played:

- **Hearthstone**: Playable cards get a green glow border when you have enough mana.
- **LoR**: Cards glow blue-white when affordable and it is your action.
- **MTG Arena**: Playable cards have a subtle highlight. Valid targets for spells get a target-highlight effect.
- **Marvel Snap**: All cards that can be played given your current energy are interactable; unplayable cards appear dimmer.

### Targeting Patterns

**Hearthstone's model** (most influential): When you play a targeted spell, a bold red arrow extends from the source to your cursor. You drag the arrow to select the target. The opponent can see the arrow during selection. Invalid targets show an error message. Releasing on empty space cancels.

**LoR**: Targeting activates immediately when you play a card. Even if the spell is countered before resolving, the act of targeting counts for triggers. After selecting targets, you press The Button to commit.

**MTG Arena**: After playing a targeted spell, the game highlights all valid targets on the board. You click a target to select it. Multiple targets for modal spells show numbered selection. Invalid plays show an error tooltip.

### Animation and Feedback

**Hearthstone** set the gold standard for "juice." Cards slam onto the board with particle effects, the board shakes on big plays, and each legendary minion has a unique entrance animation with sound. The design philosophy: use lighter visual approaches for common events but make impactful moments feel spectacular.

**LoR** has champion level-up animations that are full cinematic moments. Spells appear on a visual stack and resolve with themed effects.

**Marvel Snap** uses card reveal animations with 3D flips, and location reveals have dramatic environmental changes.

### Implementation Recommendations

- **Desktop**: Use click-to-play as primary (faster for experienced players), with drag-and-drop as an alternative.
- **Mobile**: Use drag-and-drop exclusively.
- **Targeting**: Implement an arrow/line from source to cursor. Highlight valid targets with a pulsing border. Dim invalid targets. Cancel on release over empty space.
- **Playability glow**: Apply a CSS glow/shadow animation to playable cards. Use `filter: drop-shadow(0 0 6px #4CAF50)` or similar.
- **Confirmation**: For irreversible actions (especially with a stack/response system), require explicit confirmation before passing priority.

### Sources
- [Hearthstone Target System](https://hearthstone.fandom.com/wiki/Target)
- [LoR Targeting](https://support-legendsofruneterra.riotgames.com/hc/en-us/articles/360044215414-Targeting-in-Legends-of-Runeterra)
- [Marvel Snap Designer Interview](https://www.gameshub.com/news/features/marvel-snap-designer-interview-kent-erik-hagman-smart-card-game-design-31692/)
- [Hearthstone Magnetic Card Design](https://playhearthstone.com/en-us/blog/22552047/)
- [MTG Arena Snappiness](https://www.pcgamesn.com/magic-the-gathering-arena/mtg-arena-snappiness-flow)

---

## 3. Combat/Attack System

### MTG Arena Combat UX

MTG Arena's combat follows the full MTG rules with three sub-phases, each represented by icons on the phase ladder:

- **Sword icon** = Declare Attackers step. Click/tap creatures to select them as attackers. Selected creatures get a visual indicator (glow/highlight). An arrow points from each attacker toward the defending player.
- **Shield icon** = Declare Blockers step. The defending player taps a creature they want to block with, then taps the attacker it should block. Arrows show blocking assignments. When multiple blockers are assigned to one attacker, the game prompts for damage ordering.
- **Explosion icon** = Damage step. Damage resolves and numbers appear briefly on creatures showing damage dealt. Destroyed creatures play a death animation. When first strike is involved, the damage icon splits to show two separate damage steps.

**Known UX issues**: On mobile, multiple blockers assigned to one attacker can be unclear -- a single arrow may point to only one creature. Token creatures stacked on top of each other lack clear multi-blocker indicators.

### Legends of Runeterra Combat UX

LoR uses a lane-based combat system that is more visually intuitive:

- The attacking player drags units from their back row onto the battlefield (attack row). Units line up in lanes.
- Press The Button to commit the attack.
- The defending player drags their units into blocking positions directly opposite the attackers. A **blue box** indicates a unit has been committed to blocking.
- Press The Button to commit defense.
- Before resolution, both players can play fast/burst spells (creating response windows).
- Combat resolves left-to-right. Units strike each other simultaneously (unless Quick Attack keyword applies).
- If a blocker is removed before combat, the attacker still does not hit the Nexus unless it has Overwhelm -- the "blue box blocked" state persists.

### Hearthstone Combat

Simplest model: drag your minion onto the target (enemy minion or hero). An arrow shows the attack path. Both minions deal damage to each other simultaneously. Damage numbers pop up. Dead minions explode off the board. No blocking mechanic exists -- the attacker always chooses the target.

### Implementation Recommendations for Web-Based MTG

- **Declare Attackers**: Clicking a creature toggles it as an attacker. Show a sword icon or red border on selected attackers. Draw animated arrows from each attacker toward the opponent's avatar.
- **Declare Blockers**: Implement a two-click system: click your creature (blocker), then click the attacker it blocks. Draw a blocking arrow. Support multiple blockers per attacker with a visual stack/group indicator.
- **Damage Resolution**: Show floating damage numbers briefly on each creature. Flash the creature red if it takes lethal damage. Use a brief death animation (fade out, shatter effect, etc.).
- **Combat arrow system**: Use SVG or Canvas overlays for arrows. Arrows should be curved (bezier), colored by intent (red for attack, blue for block), with arrowheads. Animate them drawing in.
- **Mobile**: Use tap-based selection instead of drag for combat. Tap attacker to select, tap again to deselect. For blockers, tap blocker then tap the attacker.

### Sources
- [MTG Arena Interface Guide (Combat)](https://mtgazone.com/arena-hot-keys-and-interface-guide-simplify-your-game-with-these-easy-tricks/)
- [LoR Round FAQ](https://support-legendsofruneterra.riotgames.com/hc/en-us/articles/360035562034-Round-FAQ)
- [LoR Block Keyword](https://leagueoflegends.fandom.com/wiki/Keywords_(Legends_of_Runeterra)/Block)
- [MTG Arena Multiple Blockers Discussion](https://steamcommunity.com/app/2141910/discussions/0/3839927185117748866/)

---

## 4. Card Attachments (Enchantments/Equipment)

### MTG Arena

Auras and Equipment in MTG Arena are displayed as smaller cards tucked underneath the creature they are attached to, with a slight vertical offset so you can see the edge/name of each attachment. Clicking the creature fans out all attachments for inspection. With 5+ enchantments stacked, the visual can become cluttered -- this is a known pain point. The creature's power/toughness numbers update in real-time to reflect all modifications.

### Hearthstone

Enchantments (buffs/debuffs) use a layered visual approach:
- **On the battlefield**: Golden sparkles overlay for buffs, red effects for debuffs.
- **On hover/inspect**: A tooltip below the minion card lists all active enchantments in order they were applied, showing each enchantment's name, icon, and text.
- **Stat changes**: The minion's attack/health numbers change color -- green for buffed above base, red for damaged, white for base value.
- **In hand**: Enchantments on hand cards are not listed as separate items but are reflected in highlighted stat changes on the card itself.

Hearthstone's approach to the Magnetic keyword (which attaches mech cards to other mechs) is instructive: the UI evolved from simple arrows with sparks, to larger/simpler shapes, and finally a beam effect to create a clear "magical connection" visual. The design had to communicate: valid targets, where to drag to attach, whether something was going to attach, and to what.

### Pokemon TCG Live

Energy cards attached to Pokemon are visually stacked below the Pokemon card with small icons showing energy type and count. Tools (item cards attached to Pokemon) appear as a small overlay icon.

### Implementation Recommendations

- **Attachment display**: Show auras/equipment as small card slices (showing name + mana cost) tucked behind the creature, offset vertically by ~15-20px each. Cap visible attachments at 3-4; show a "+N more" badge for overflow.
- **Inspect mode**: On hover or click, fan out all attachments into a readable popup/overlay showing full card details.
- **Stat modification indicators**: Change the creature's P/T numbers to green when buffed above base, red when damaged below current toughness, white for base. Show a small up-arrow icon next to buffed stats.
- **Attachment animation**: When an aura is played, animate it flying from the hand to the target creature, then sliding behind it. Play a brief glow/sparkle effect on the creature.
- **Equipment move**: When equipment is re-equipped, animate it sliding from one creature to another.

### Sources
- [Hearthstone Enchantment System](https://hearthstone.wiki.gg/wiki/Enchantment)
- [Hearthstone Buff Display](https://hearthstone.wiki.gg/wiki/Buff)
- [Hearthstone Magnetic Card Design (GDC)](https://playhearthstone.com/en-us/blog/22552047/)
- [MTG Arena Stacked Cards Feedback](https://feedback.wizards.com/forums/918667-mtg-arena-bugs-product-suggestions/suggestions/40528594-stack-cards-blocking-view-of-cards-beneath-them-on)

---

## 5. Stack/Response Windows

### MTG Arena's Priority System

MTG Arena implements the full MTG priority system with multiple modes:

- **Default mode**: Arena auto-passes priority through your opponent's turn if you have nothing to play at instant speed. It auto-resolves triggered abilities and ETB effects.
- **Full Control mode** (Ctrl key): No priority is ever passed without you explicitly clicking "Resolve" or "Pass." This is essential when you want to respond to your own triggers or hold priority after casting a spell.
- **Shift+Enter**: Toggles auto-priority pass for all future events until toggled off.
- **Per-phase stops**: Click phase icons on the phase ladder to set stops (orange = your turn, blue = opponent's turn). When the game reaches that phase, it pauses and gives you priority even if you have nothing obvious to play.

The critical UX tension: the game must be "snappy" (not pausing every phase for both players) while still allowing full rules-correct interaction. Arena's solution is to auto-pass when you have no instant-speed plays in hand, but this can inadvertently reveal information to opponents (they can deduce you have no instants when priority passes quickly).

### Legends of Runeterra's Spell Speed System

LoR solved the priority problem more elegantly with spell speed categories:

- **Burst** spells resolve instantly with no response window. Priority does not pass to opponent.
- **Focus** spells also resolve instantly but can only be played on your action (not in response).
- **Fast** spells go on a visual stack and the opponent gets a chance to respond with their own fast/burst spells.
- **Slow** spells can only be played during your main action (not in combat, not in response). They create a response window.

The stack is visually represented as a horizontal row of circular spell icons between the two players. A maximum of 9 fast/slow spells can occupy the stack, with a 10th slot reserved for burst spells. Spells resolve right-to-left (most recently played first, like MTG's LIFO stack).

The commitment mechanic (pressing The Button) is crucial: nothing resolves until both players pass consecutively. This prevents accidental actions.

### Hearthstone

No response window exists. There is no instant-speed interaction. Secrets (trap cards) trigger automatically when conditions are met. This eliminates priority management entirely, which is why Hearthstone feels faster but has less strategic depth in interaction.

### Implementation Recommendations

- **Default auto-pass**: Skip priority when the player has no instant-speed cards in hand and no activated abilities available. This keeps the game fast.
- **Smart stop detection**: Auto-pause when the opponent does something the player could respond to AND the player has a relevant card (e.g., opponent plays a creature, player has a counterspell in hand).
- **Full control toggle**: Provide a prominent button/hotkey to enter full control mode. Show a visible indicator when full control is active.
- **Visual stack**: Display spells on the stack as a horizontal row of card previews between the two player areas. Most recent spell on top/right. Animate spells resolving by popping off the stack one at a time.
- **Response timer**: Show a countdown timer (rope/fuse) during response windows. Give ~30 seconds for priority decisions.
- **Phase stops**: Let players pre-configure which phases they want to stop at. Show stops as small icons on the phase indicator.

### Sources
- [MTG Priority and Phases](https://mtgazone.com/priority-and-the-phases-of-each-turn/)
- [MTG Arena Full Control Mode](https://mtgazone.com/arena-hot-keys-and-interface-guide-simplify-your-game-with-these-easy-tricks/)
- [LoR Spell Types](https://support-legendsofruneterra.riotgames.com/hc/en-us/articles/360036067293-Types-of-Spell-Cards-and-How-They-Work)
- [LoR Spell Speed Explained](https://www.gamepur.com/guides/legends-of-runeterra-spell-speeds-explained)
- [MTG Timing and Priority](https://mtg.fandom.com/wiki/Timing_and_priority)

---

## 6. Phase Management

### MTG Arena Phase Ladder

The phase ladder runs vertically on the right side of the screen, showing all phases of the current turn:

1. **Untap** (automatic)
2. **Upkeep** (trigger icon)
3. **Draw** (card icon)
4. **Pre-combat Main** (hand/play icon)
5. **Combat**: Sword (attackers), Shield (blockers), Explosion (damage)
6. **Post-combat Main** (hand/play icon)
7. **End step** (hourglass icon)

The currently active phase glows/highlights. Players can click any phase icon to set a **stop** (forced priority pause):
- **Orange octagon** = stop on your turn
- **Blue octagon** = stop on opponent's turn

When first strike is relevant, the damage icon splits into two to show first-strike damage and regular damage as separate steps.

Pressing "L" toggles the phase ladder visibility.

### Legends of Runeterra

LoR does not have a traditional phase ladder. Instead, it uses an action-based round structure:
- Players alternate taking single actions
- The attack token indicates who can initiate combat
- The round ends when both players pass consecutively
- Unused mana banks as spell mana (up to 3)

The visual indicator is simpler: "The Button" in the center shows the current state (your action / opponent's action / commit).

### Hearthstone

No phases at all. A turn is a single uninterrupted action window. Play cards, attack with minions, use hero power, in any order. The rope timer is the only constraint.

### Implementation Recommendations

- **Phase strip**: Render a vertical strip on the right edge with icons for each MTG phase. Highlight the active phase. Use distinct icons (sword, shield, explosion for combat sub-phases).
- **Click-to-stop**: Clicking a phase icon toggles a stop. Use orange dot for your-turn stops, blue dot for opponent-turn stops.
- **Auto-advance**: Skip phases where there are no actions to take (e.g., skip upkeep if no triggers, skip combat if no creatures).
- **Phase transitions**: Use a brief slide/fade animation when transitioning between phases. Flash the new phase icon.
- **Keyboard shortcuts**: Spacebar or Enter to pass priority / advance to next phase. This is critical for game speed.

### Sources
- [MTG Arena Phase Ladder Update](https://mtgarena.pro/news/updated-phase-ladder/)
- [Phase Indicator Toggle](https://sudofry.com/2023/08/27/phase-indicator-wont-toggle-on-and-off-with-l-button-in-mtga/)
- [MTG Turn Structure](https://mtg.gamepedia.com/Turn_structure)
- [MTG Phases Explained](https://www.wargamer.com/magic-the-gathering/mtg-phases)

---

## 7. Card Selection and Inspection

### Hover Preview vs Tap-to-Inspect

**MTG Arena (Desktop)**: Hovering over a card triggers a zoomed preview. The timing is tuned by three factors: where the preview appears, how big it is, and how long it takes to appear. The goal is to display cards promptly when you want information while avoiding unwanted zooms when moving your cursor. Right-click opens a full detailed view. Cards on the stack automatically zoom in.

**MTG Arena (Mobile)**: Long-press a card in play or at the top of the graveyard to see full detail (replaces hover).

**Hearthstone (Desktop)**: Hover to enlarge. Enchantments on the minion display below the card when moused over, showing name, icon, and text for each buff/debuff in the order applied.

**Marvel Snap**: Tap/click a card for detail view. The Card Details screen went through many iterations to optimize secondary actions.

**LoR**: Hover for enlarged preview on desktop, long-press on mobile. Champion cards show level-up progress on inspect.

### Card State Display

**Tapped/Untapped (MTG Arena)**: Tapped cards rotate 90 degrees clockwise. This is the universal visual for "used/exhausted" state in MTG.

**Counters**: +1/+1 counters in MTG Arena appear as small glowing numbers overlaid on the creature card, updating the P/T display. Other counter types show with distinct icons.

**Damage**: Damaged creatures in MTG Arena show their current toughness in red (below base). In Hearthstone, damaged minion health turns red.

**Summoning sickness**: In MTG Arena, creatures that just entered have a subtle visual indicator showing they cannot attack this turn (a small "zzz" or dimmer appearance).

### Implementation Recommendations

- **Desktop hover preview**: On mouseenter with a ~200ms delay, show a larger card preview positioned near the cursor but not overlapping it. Use CSS `transform: scale(2)` or render a separate overlay element. Cancel on mouseleave.
- **Mobile long-press**: On touchstart, start a 300ms timer. If touch holds, show full card overlay. If touch moves (drag), cancel the preview.
- **Right-click detail**: Open a modal with full card text, oracle text, rulings, and any active buffs/counters.
- **Tapped state**: Apply `transform: rotate(90deg)` with a smooth ~200ms transition.
- **Counter display**: Overlay a small badge on the card (like a notification badge) showing counter count. Use distinct colors: green for +1/+1, red for -1/-1, blue for other types.
- **Modified stats**: Display power in green if above base, toughness in red if below max. Show base stats in parentheses on hover.

### Sources
- [MTG Arena Settings Explained](https://draftsim.com/mtg-arena-settings/)
- [MTG Arena Mobile Hands-On](https://www.techradar.com/news/mtg-arena-mobile-hands-on-with-phone-sized-fantasy-card-battles)
- [MTGO Visual Update (Hover Zoom)](https://www.mtgo.com/news/frame-refactor)
- [MTG Arena Mobile FAQ](https://magic.wizards.com/en/news/mtg-arena/mtg-arena-mobile-faqs-2021-01-28)

---

## 8. Mobile-Specific Patterns

### Touch Targets and Gesture Handling

**Marvel Snap** (mobile-first design reference):
- Interactive elements are positioned toward the bottom half of the screen for thumb reachability
- Cards take visual precedence -- the UI serves the cards, not the other way around
- Dark "piano glass" theme with holographic light elements creates depth without clutter
- Simultaneous turns eliminate the need for response windows, keeping mobile sessions short

**MTG Arena Mobile Adaptations**:
- Battlefield layout rebalanced for rectangular mobile aspect ratios
- Player avatars repositioned and resized
- Creatures made larger for better tap targets
- Tap-and-drag replaces click for playing cards
- Combat uses tap selection (tap to select attacker, tap creature to assign blocker)
- Long-press replaces hover for card inspection
- Auto-tap toggleable in settings
- Collection browsing uses left/right swipe

**Pokemon TCG Live**:
- Condensed card art for benched Pokemon and Stadiums, showing key characteristics but hiding text unless selected
- Drag-and-drop for all card placement

### Board Layout for Small Screens

The key challenge is fitting MTG's complex board (two player areas with lands, creatures, artifacts, enchantments, planeswalkers, graveyard, exile, hand, stack, phase indicator) onto a phone screen.

Common solutions across games:
- **Zone collapsing**: Stack similar cards (e.g., same-name tokens collapse into a pile with a count badge)
- **Scrollable zones**: Allow horizontal scrolling within crowded zones (MTG Arena does this for lands and creatures)
- **Toggleable views**: Hide less-critical zones (graveyard, exile) behind buttons/tabs
- **Condensed card views**: Show simplified card representations on the board (name + P/T + status icons) with full art available on inspect
- **Portrait orientation**: Most mobile TCGs use portrait; MTG Arena uses landscape because the battlefield is inherently wider than tall

### Implementation Recommendations

- **Minimum touch target**: 44x44px (Apple HIG) / 48x48dp (Material). Cards on the battlefield should be at least this size.
- **Bottom-heavy UI**: Place hand, mana, and primary actions in the bottom 40% of the screen.
- **Swipe gestures**: Swipe up on hand to fan cards wider. Swipe left/right to scroll zones. Pinch to zoom the board.
- **Card size tiers**: Full size in hand (bottom), medium on battlefield, small/icon for lands and tokens.
- **Landscape for MTG**: Use landscape orientation. Place your zones on bottom half, opponent on top half. Phase ladder on right edge. Stack in center.
- **Responsive breakpoints**: At <768px, switch to mobile layout (larger touch targets, simplified zones, long-press inspect). At >1024px, use full desktop layout with hover.

### Sources
- [Marvel Snap UI Design - Tiffany Smart](https://www.tiffanysmart.com/work/marvel-snap)
- [Marvel Snap UI Analysis - ArtStation](https://www.artstation.com/artwork/GemNDd)
- [Marvel Snap UX Case Study](https://bootcamp.uxdesign.cc/marvels-snap-ui-ux-case-study-9f727d8f3875)
- [MTG Arena Mobile FAQ](https://magic.wizards.com/en/news/mtg-arena/mtg-arena-mobile-faqs-2021-01-28)
- [MTG Arena Mobile Hands-On](https://www.techradar.com/news/mtg-arena-mobile-hands-on-with-phone-sized-fantasy-card-battles)
- [Pokemon TCG Live - Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Trading_Card_Game_Live)

---

## 9. Key UX Principles from These Games

### What Makes a Digital TCG "Feel Good"

**1. Snappiness / Responsiveness**
Hearthstone proved that the tactile feel of dragging cards and making things happen at pace is the single most important UX quality. Every interaction should have immediate visual and audio feedback. Card plays should slam onto the board, not fade in. Spells should flash, not gently appear. As PCGamesN noted, "snappiness is chief among the reasons Hearthstone became successful."

**2. Smart Defaults with Manual Override**
MTG Arena's auto-tapper and auto-pass system is the model: automate the tedious decisions (tapping lands, passing empty priority) but always let experienced players override (manual tapping, full control mode). This serves both casual and competitive players.

**3. Information on Demand, Not All at Once**
Show the minimum needed information on the board at all times. Full details available on hover/inspect. Hearthstone's Derek Sakamoto (GDC 2015) said: "our game IS UI" -- the entire game experience is the interface, so it must be clean and intuitive.

**4. Clear Visual Hierarchy**
Marvel Snap's principle: cards take precedence in the visual hierarchy. The UI exists to highlight the cards. Background elements, chrome, and decorations should never compete with card art and game state information.

**5. Emotional Reinforcement**
LoR's champion level-up animations and Marvel Snap's "Escaped!" message (instead of "You lost") demonstrate how emotional design affects player experience. Big moments deserve big animations. Retreating is framed as a strategic choice, not a failure.

### Most Important Quality-of-Life Features

1. **Undo / Cancel**: Let players cancel card plays before they commit (drag back to hand, right-click to cancel). This is universal across all games.
2. **Card history / log**: Show a sidebar log of recent plays. Essential for catching up after alt-tabbing or understanding what the opponent did.
3. **Auto-pass / auto-yield**: Skip priority windows when the player has no relevant actions. Huge time saver.
4. **Keyboard shortcuts**: Space to pass priority, Enter to confirm, Escape to cancel, Z to undo (MTG Arena has extensive hotkey support).
5. **Playable card highlighting**: Glow/highlight on cards you can afford to play right now.
6. **Pre-configurable stops**: Let players set which phases they want to stop at before the game even begins.
7. **Graveyard/exile browser**: A scrollable overlay showing all cards in public zones.
8. **Connection resilience**: Reconnection support so dropped connections do not forfeit the game.
9. **Damage preview**: Before confirming combat, show predicted damage outcomes (LoR does this well by showing strike damage on units).

### Common Mistakes to Avoid

1. **Overcrowded boards without scaling**: MTG boards can have 20+ permanents. If you do not implement dynamic card sizing (shrinking cards as more enter the zone), the board becomes unreadable.
2. **No cancel/undo path**: If players accidentally start an action, they need a clear way to back out. Lack of undo is the most frustrating UX failure.
3. **Timer too short or too long**: Hearthstone uses 75 seconds per turn with a visual rope at ~20 seconds remaining. MTG Arena uses a chess-clock system with hourglasses for extensions. Too short punishes thinking; too long enables stalling.
4. **Auto-pass revealing information**: If the game instantly passes priority, the opponent knows you have no instant-speed plays. MTG Arena partially addresses this with configurable stops, but it remains a fundamental digital TCG problem.
5. **Animations blocking gameplay**: Hearthstone has a known "animation penalty" where long animations eat into the opponent's turn timer. Animations must be cancellable or fast enough not to block play.
6. **Poor mobile adaptation as an afterthought**: Marvel Snap and Hearthstone were designed mobile-first. MTG Arena retrofitted mobile and it shows in tight tap targets and crowded screens. Design for mobile first, then expand for desktop.
7. **Information hiding without access**: Condensing cards for space is fine, but players must always be able to inspect any card on any zone. Pokemon TCG Pocket was criticized for poor UI that made accessing card details frustrating.
8. **Inconsistent interaction models**: If some cards drag-to-play and others click-to-play, players get confused. Pick one primary interaction model and stick with it.

### Sources
- [Hearthstone GDC: Immersive UI](https://gdcvault.com/play/1022036/Hearthstone-How-to-Create-an)
- [MTG Arena Snappiness](https://www.pcgamesn.com/magic-the-gathering-arena/mtg-arena-snappiness-flow)
- [LoR 10 Exceptional Design Choices](https://nerdlab-games.com/048-legends-of-runeterra-10-exceptional-design-choices-and-what-we-can-learn-from-them/)
- [Marvel Snap Behind the Design (Apple)](https://developer.apple.com/news/?id=sosm2p7q)
- [Marvel Snap Design Deconstruction](https://www.deconstructoroffun.com/blog/2023/5/23/marvel-snap-the-definitive-deconstruction)
- [5 UX Lessons from Card Game Design](https://medium.com/@acbassettone/5-ux-ui-lessons-from-designing-a-card-game-b689d3f3187)
- [Card Layout Tips](https://medium.com/@dylanmangini/4-layout-tips-for-designing-card-games-17cc98b89b96)
- [Fairtravel Battle UI Design](https://gdkeys.com/the-card-games-ui-design-of-fairtravel-battle/)
- [Pokemon TCG Pocket UI Criticism](https://www.thegamer.com/why-is-pokemon-tcg-pockets-ui-so-annoying/)
- [Card Game UX at GDC](https://www.gamedeveloper.com/design/glean-unique-ux-insights-from-centuries-of-card-game-design-at-gdc)
- [Hearthstone Turn Timer](https://hearthstone.fandom.com/wiki/Turn)
- [MTG Arena Roping](https://draftsim.com/mtg-arena-roping/)

---

## Summary: Priority Implementation Order for a Web-Based MTG Game

If I had to order what to build first based on player impact:

1. **Card rendering + hand management** (fan cards, hover preview, playable highlighting)
2. **Drag/click-to-play with targeting arrows** (the core interaction loop)
3. **Mana system with auto-tap + manual override** (resource management)
4. **Phase ladder with stops** (turn structure)
5. **Combat arrow system** (attacker/blocker declaration)
6. **Stack visualization with response timers** (instant-speed interaction)
7. **Attachment/enchantment display** (stacked card visuals)
8. **Mobile layout adaptation** (responsive breakpoints, touch targets)
9. **Animation polish** (card slam effects, damage numbers, death animations)
10. **Timer/rope system** (anti-stall)
