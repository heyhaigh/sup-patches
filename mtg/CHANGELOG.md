# MTG Changelog

## [v0.1.1] - 2026-03-11

### Fixed
- **Bot turn sequencing**: Bot-played cards no longer appear on the battlefield before their turn animation plays. Cards are hidden after receiving the final match state, then revealed progressively as each bot's turn is animated (one-by-one in full mode, all-at-once per bot in quick mode).
- **Equipment visibility**: Equipment artifacts no longer disappear from the battlefield once equipped. They now remain visible with a golden "Equipped to [creature name]" badge. Auras are still filtered (shown as enchantment badges on their target creature).
- **Turn bar stuck on "Bot is thinking..."**: After bot animations complete, the turn bar now correctly shows action buttons. Previously, the `renderTurnBar` cache key matched between the first and final `refreshMatch()` calls (since game state didn't change — bots had already completed server-side), so the stale "thinking" HTML was never overwritten.
- **Animation error safety**: Bot card reveal animation is wrapped in `try/finally` to guarantee `_hiddenBotCards` cleanup. Without this, an error mid-animation would permanently hide bot cards until page refresh.

### Changed
- Bot animation in full mode now uses sequential `await` chains instead of `setTimeout` scheduling, ensuring each card reveal completes before the next begins.
- Non-creature battlefield permanents (artifacts, enchantments) now support tapped state rendering.

## [v0.1.0] - 2026-02-23

Initial version. Deck library + Scryfall search + match state scaffolding.

### Added
- Full HTML launch app with sidebar navigation (Play, Decks, Deck Builder)
- Deck CRUD with per-user persistence via `sup.user.set()`
- Scryfall card search with 7-day global cache
- Bulk card lookup via `/cards/collection` endpoint
- Quickstart Standard decks (mono W/U/B/R/G — 9 nonlands x4 + 24 basics)
- Quickstart Commander decks from popular commanders or custom search
- Deck validation: count, legality, commander color identity, singleton + special card rules
- Match creation with lobby phase (assign deck, ready up)
- Mulligan phase (simplified v1: redraw with one fewer card)
- Basic playing phase: draw, play from hand, move to graveyard, end turn
- AI bot opponent for Standard 1v1 (easy/medium/hard)
- Commander multiplayer support (2-5 players)
- Player-specific match views (hides opponents' hands/library order)
- Toast notification system
- Debug match JSON viewer
- Resilient `supExec()` bridge with retry for preview/iframe context errors

### Known Limitations
- Rules engine is minimal — no priority, stack, layers, or combat
- Bot AI is random card selection based on difficulty
- No mana system enforcement
- Commander tax not tracked
- No partner/companion commanders (v1 single commander only)
