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

## Workflow: Always Commit & Push After Plan Completion

Every completed phase/plan improvement must be committed and pushed to git before considering it done. Don't wait for the user to ask — commit and push immediately after verifying the changes (syntax check, etc.).
