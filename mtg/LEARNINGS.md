# MTG Learnings

## Template Literal Escaping (Critical)

When using `sup.html()` with a template literal that contains a `<script>` block, inner template literals (backticks and `${}`) must be escaped:

```javascript
// Inside getClientHtml()'s template literal:
// BAD — terminates the outer template literal
const msg = `Hello ${name}`;

// GOOD — escaped for the outer template literal context
const msg = \`Hello \${name}\`;
```

This applies to ALL backticks and `${}` inside the `<script>` block when the HTML is returned via a JS template literal.

**Also watch out for `\'` inside single-quoted strings.** In a template literal, `\'` is NOT a recognized escape — the backslash is silently dropped, producing a bare `'`. This breaks inner single-quoted JS strings:

```javascript
// BAD — \' becomes ' in template literal context, breaking the string
'Atraxa, Praetors\' Voice'
// Browser receives: 'Atraxa, Praetors' Voice'  ← SyntaxError!

// GOOD — use double quotes for strings containing apostrophes
"Atraxa, Praetors' Voice"
```

A single SyntaxError kills the entire `<script>` block — nothing runs.

### Regex Patterns (The Sneakiest Case)

Regex escape sequences like `\d`, `\s`, `\w`, `\b`, `\/` are **NOT recognized JS string escapes**, so the template literal silently drops the backslash. This breaks regex patterns AND can cause parse errors that kill the entire script:

```javascript
// BAD — template literal eats the backslashes
// \d becomes d, \s becomes s, \/ becomes /
var re = /([+-]\d+)\/([+-]\d+)/g;
// Browser receives: /([+-]d+)/([+-]d+)/g  ← PARSE ERROR!
// The unescaped / splits the regex, creating invalid syntax.

// GOOD — double-escape all backslashes in regex patterns
var re = /([+-]\\d+)\\/([+-]\\d+)/g;
// Browser receives: /([+-]\d+)\/([+-]\d+)/g  ← correct!
```

**Full list of regex escapes that need doubling inside template literals:**
- `\d` → `\\d` (digit)
- `\s` → `\\s` (whitespace)
- `\w` → `\\w` (word char)
- `\b` → `\\b` (word boundary)
- `\D`, `\S`, `\W`, `\B` → same pattern
- `\/` → `\\/` (literal forward slash — **this one causes parse errors**)

**Why this is hard to catch:**
- `node -c` validates the server-side .js file syntax (template literal is valid JS)
- The parse error only occurs in the **browser** when it tries to parse the rendered `<script>` content
- No error is visible — the script silently fails to execute
- Diagnostic: add a small separate `<script>` tag that writes to a visible DOM element; if the main script's diagnostic never appears, there's a parse error

## Selector Helpers

Use separate `$` and `$$` helpers to avoid confusion:

```javascript
const $ = (sel) => document.querySelector(sel);       // Single element
const $$ = (sel) => Array.from(document.querySelectorAll(sel)); // Array
```

Never redeclare `const $` — it's a `SyntaxError: Identifier '$' has already been declared`.

## Scryfall API

- Rate limit: 50-100ms between requests recommended
- `/cards/collection` accepts up to 75 identifiers per request (batch lookups)
- `order=edhrec` is useful for Commander deck building (sorts by EDHREC popularity)
- `order=popular` works well for Standard quickstart
- Basic land resolution: `!"Plains" t:basic t:land` with `order=released` to get a stable ID
- Cache globally via `sup.global.set()` with 7-day TTL to avoid repeated API calls

## SupChat State Scopes

| Scope | Use |
|-------|-----|
| `sup.user.set()` | Deck library (per-user, persists across chats) |
| `sup.chat.set()` | Match state (per-chat, shared between players) |
| `sup.global.set()` | Scryfall cache (shared across all users/chats) |
| `sup.message.set()` | Not used in launch app (for button reroll pattern) |

## supExec Bridge Resilience

SupChat's preview mode often doesn't have the `sup` context available until the user clicks "Share with chat" or refreshes. The `supExec()` wrapper retries on context errors with exponential backoff.

## CSS Specificity vs JS Visibility (The matchActive Trap)

When hiding/showing UI panels, beware of **CSS rules that silently override JS `style.display` changes**.

### What happened

The lobby panel (`#lobbyPanel.card`) needed to stay visible during mulligan phase but hide during gameplay. We tried:

1. **CSS approach** (`.appRoot.matchActive #lobbyPanel { display:none !important }`) — broke lobby completely because `matchActive` is added on match **create/join** (lobby phase), not game start.

2. **JS approach** (`renderLobby` hides panel when `phase === 'playing'`) — still blank during mulligan because a pre-existing CSS rule `.appRoot.matchActive #tab-play > .card:last-child { display:none }` was targeting `#lobbyPanel` (it's the last `.card` child of `#tab-play`). The CSS rule silently overrode the JS `display:''`.

### Root causes

- **`matchActive` doesn't mean "game is playing"** — it's set during lobby creation to hide the topbar/sidebar/create-join UI. The mulligan panel is nested inside the lobby panel, so hiding lobby = hiding mulligan.
- **CSS `:last-child` selectors are fragile** — they match based on DOM position, not intent. Adding/removing elements changes what they target.
- **CSS `display:none` beats JS `el.style.display = ''`** — unless the JS uses `!important` or the CSS rule is removed/narrowed.

### Fix applied

```css
/* BAD — catches #lobbyPanel since it's the last .card child */
.appRoot.matchActive #tab-play > .card:last-child { display:none; }

/* GOOD — exclude lobbyPanel, let renderLobby() control its visibility */
.appRoot.matchActive #tab-play > .card:last-child:not(#lobbyPanel) { display:none; }
```

### Rules to follow

1. **Always check when `matchActive` is toggled** before using it in CSS — it's set on create/join, NOT game start.
2. **Before hiding an element with CSS**, check what's nested inside it (mulligan UI was inside lobby).
3. **Audit existing CSS rules** when adding JS visibility logic — use browser DevTools "Computed" tab to spot conflicting rules.
4. **Prefer JS-controlled visibility** for panels with phase-dependent behavior; use CSS only for static layout concerns.
5. **Avoid `:last-child` / `:first-child` selectors** for hiding specific elements — use explicit IDs or classes instead.

## Scryfall Cache Performance (sup.global)

### The Problem

`sup.global.get/set` serializes/deserializes the **entire** stored object on every call. The Scryfall cache (`mtg.scryfallCache`) stores full raw Scryfall JSON per card (50+ fields each) plus full search result pages. With no size cap, it grew unbounded — after many matches and searches, serialization overhead caused **20-30 second delays** on match creation.

### Why It's Expensive

The match creation flow hits the cache multiple times:
```
validateAndCreateMatch() → refreshMatch() → hydrateCardIndexForMatch()
  → api_getCardsBulk → scryfallGetCardsByIdsCached()
  → (also scryfallSearchAll during deck building stores full page responses)
```

Each `sup.global.get()` and `sup.global.set()` round-trips the ENTIRE cache object through JSON serialization. As the cache grows to hundreds or thousands of entries, this becomes the bottleneck — not network calls.

### Fix Applied (v2 cache)

1. **LRU eviction**: Cap at 400 entries. On every write, if over limit, sort by timestamp and evict oldest.
2. **Expired entry cleanup**: `scryfallCacheGet` deletes entries older than 7 days on access (previously left them in place).
3. **Cache key bump**: `v1` → `v2` to start fresh (orphans the bloated v1 cache).

```javascript
var SCRYFALL_CACHE_MAX = 400;

function scryfallCacheGet(cache, url) {
    const hit = cache[url];
    if (hit && hit.at && Date.now() - hit.at < 1000 * 60 * 60 * 24 * 7) return hit.json;
    if (hit) delete cache[url];  // Clean expired
    return null;
}

function scryfallCacheSet(cache, url, json) {
    cache[url] = { at: Date.now(), json };
    var keys = Object.keys(cache);
    if (keys.length > SCRYFALL_CACHE_MAX) {
        keys.sort(function(a, b) { return (cache[a].at || 0) - (cache[b].at || 0); });
        var toRemove = keys.length - SCRYFALL_CACHE_MAX;
        for (var i = 0; i < toRemove; i++) delete cache[keys[i]];
    }
}
```

### Future Scaling Considerations

When multiple concurrent users share the same `sup.global` cache:
- **400 entries may be tight** — each unique deck search or card collection lookup is a cache entry. With N concurrent users building decks, cache churn increases.
- **Potential improvements**:
  - Store only the fields we actually use (name, image, mana cost, type, oracle text, power/toughness, legalities) instead of full Scryfall JSON — could reduce per-entry size by 60-70%.
  - Split into separate cache keys by purpose: `mtg.scryfallCards.v1` (individual card lookups) vs `mtg.scryfallSearch.v1` (search results) — so heavy search results don't evict frequently-needed card data.
  - Increase `SCRYFALL_CACHE_MAX` if trimmed fields make entries smaller.
  - Consider per-user deck card caching in `sup.user` to avoid global cache contention.
- **Monitoring**: If match creation slows down again, check `Object.keys(sup.global.get("mtg.scryfallCache.v2") || {}).length` in the browser console to see if the cache is consistently hitting the 400 cap.
- **Orphaned v1 cache**: The old `mtg.scryfallCache.v1` key still exists in `sup.global`. It will persist until manually cleaned up or the platform garbage-collects it. Not harmful but wastes storage.

## Creature Lethal Damage: Multi-Source Kill Bug

### The Bug

When two damage sources target the same creature in a single turn (e.g. ability deals 3, spell deals 4 to a 5/6), the game log shows "Creature died" but the creature stays on the battlefield with full health (damage resets to 0, stats display as base P/T).

### Why It Was Hard to Find

Static analysis of the code showed each function working correctly in isolation:
- `engineApplyEffect` adds damage to `cardState[targetId].damage` ✓
- `engineCheckLethalDamage` checks `damage >= toughness` and calls `engineMoveCard` ✓
- `engineMoveCard` splices card from battlefield array and pushes to graveyard ✓
- `api_matchAction` saves match via `sup.chat.set` after action ✓

The damage accumulation path (3 + 4 = 7 >= 6 → lethal) looks correct on paper. The actual root cause was likely one of:
1. **Missing `engineCheckLethalDamage` calls** — `ACTIVATE_ABILITY` handler never called it, so damage dealt by abilities wasn't checked for lethality
2. **`sup.chat` eventual consistency** — back-to-back `set` then `get` might return stale data, causing the second action to read the match without the first action's damage
3. **`engineMoveCard` failure not caught** — `engineCheckLethalDamage` logged `CREATURE_DIED` without checking if the zone transfer succeeded

### Key Insight: Defensive Layers > Precise Root Cause

When the exact root cause involves platform behavior (`sup.chat` consistency) that can't be debugged directly, add defensive safety nets:

### Fixes Applied

1. **Safety net in `api_matchAction`** — EVERY action now runs `engineCheckLethalDamage` + `engineCheckGameOver` before `sup.chat.set`, regardless of which handler processed the action. This catches accumulated damage even if individual handlers miss it.

2. **`ACTIVATE_ABILITY` calls `engineCheckLethalDamage`** — class level-ups, treasure sacrifice, or any future ability that deals damage will now trigger death checks.

3. **`engineCheckLethalDamage` verifies `engineMoveCard` result** — only logs `CREATURE_DIED` if the move actually succeeded. Prevents phantom death entries that confuse players.

### Architecture Lesson: State-Based Actions Need a Guaranteed Check Point

In MTG, "state-based actions" (SBA) like creature death from lethal damage should be checked after **every game state change**, not just after specific known actions. The engine had `engineCheckLethalDamage` calls sprinkled in individual handlers (spell resolution, combat damage, debuffs), but missed:
- Ability activations
- Any future action type that might deal damage
- Edge cases with accumulated damage across separate API calls

The fix puts the SBA check at the `api_matchAction` level — the single gateway for ALL state changes — so no action can ever skip it.

### Debugging Technique: Display State vs Log State

The key clue was: creature shows **5/6 with no damage styling** on the battlefield, but log says "took 3 damage," "took 4 damage," "died." This means:
- `cardState.damage` was 0 at render time (not 7)
- The CREATURE_DIED log entry existed but the zone transfer didn't stick
- Either the damage was never persisted, or the creature was moved then somehow restored

When investigating state bugs, always compare **what the display renders** (which reads current state) against **what the log says happened** (which is append-only). A mismatch means the state was modified after the log was written.

## Workflow: Always Commit & Push After Plan Completion

Every completed phase/plan improvement must be committed and pushed to git before considering it done. Don't wait for the user to ask — commit and push immediately after verifying the changes (syntax check, etc.).
