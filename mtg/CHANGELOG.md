# MTG Changelog

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
