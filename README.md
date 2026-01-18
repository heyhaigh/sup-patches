# sup-patches

A collection of SupChat patches for creative image generation and interactive experiences.

## Patches

| Patch | Description | Version |
|-------|-------------|---------|
| [jetgrind](./jetgrind/) | Jet Grind Radio style graffiti tag generator | v1.2.27 |
| [buythelook](./buythelook/) | "Buy The Look" fashion meme generator with shopping links | v0.2.23 |

---

## Patch Overviews

### Jetgrind

Generates stylized graffiti tags inspired by Jet Set Radio / Jet Grind Radio aesthetics.

**Features:**
- Multiple graffiti styles: drip, bubble, wildstyle, throw-up, blockbuster, stencil
- Urban background generation (walls, trains, underpasses)
- Text and image input support
- Random style selection for variety
- Reroll button for regeneration

**Input:** Text (tag name) and/or reference image
**Output:** Stylized graffiti artwork on urban background

---

### Buy The Look

Creates viral "Steal His/Her/Their Look" style memes that match fashion items to any subject's colors and features, with actual shopping links.

**Features:**
- Analyzes any subject (characters, animals, people, objects)
- Matches 4-6 fashion items to subject's visual features
- Smart routing to 150+ retailers by brand/category
- Mix of luxury brands (60%) and budget items (40%)
- Fan merch props (shields, swords) for humor
- Gender-aware search queries ("mens" prefix)
- Reroll button for regeneration

**Input:** Text description and/or image of subject
**Output:** Fashion meme image + clickable shopping links

---

## Development Standards

### Directory Structure

Each patch follows a consistent structure:

```
/patch-name/
├── patch-name.js        # Current active version (deployed to SupChat)
├── README.md            # Patch-specific documentation
├── CHANGELOG.md         # Version history with what changed/failed
├── LEARNINGS.md         # Development insights and gotchas
├── /versions/           # Archive of all previous versions
│   ├── v0.1.0.js
│   ├── v0.1.1.js
│   └── ...
└── /assets/             # Images, backgrounds, etc. (if needed)
```

### Coding Patterns

**Schema-First Design:**
```javascript
// Define structured output schema
const schema = {
  schema: {
    fieldName: { type: "string", description: "..." },
    items: { type: "array", items: { ... } }
  }
};

// Use sup.ai.promptWithContext() for structured extraction
const data = sup.ai.promptWithContext(prompt, schema);
```

**Image Generation Pipeline:**
```javascript
// 1. Analyze input → structured data
const schemaData = inputsToSchema(analysisPrompt, defaultsPrompt);

// 2. Transform data → generated image
const image = schemaToImage(schemaData);
```

**Reroll Button Pattern:**
```javascript
function main() {
  const isReroll = sup.message.get("reroll");
  if (isReroll) {
    sup.message.set("reroll", null);
    // Regenerate using stored input
  }

  // Store input for potential reroll
  sup.message.set("lastInput", { text: sup.input.text, images: sup.input.images });

  // ... generation logic ...

  response.push(sup.button("🔄 Reroll", onReroll));
  return response;
}

function onReroll() {
  sup.message.set("reroll", true);
}
```

### Documentation Standards

**CHANGELOG.md:**
- Document every version, even failures
- Include what was attempted, what broke, and why
- Use consistent format: `## [vX.Y.Z] - YYYY-MM-DD`

**LEARNINGS.md:**
- Capture API limitations discovered
- Document patterns that work vs. don't work
- Include code examples for reference
- Note external service behaviors (Etsy blocking, etc.)

### Key API Learnings

1. **Prompt Verbosity Limit:** Keep `analysisPrompt` under ~10 lines or parsing fails
2. **No `sup.rerun()`:** Use `sup.button(label, callback)` with state management instead
3. **Web Search:** Set `useWebSearch: true` in config for image generation
4. **Constructed URLs > Web Search:** For product links, constructed URLs are more reliable than web search discovery

---

## Repository Structure

```
/sup-patches/
├── README.md                    # This file
├── SUPCHAT_REFERENCE.md         # Shared SupChat API documentation
├── .gitignore
│
├── /jetgrind/                   # Graffiti tag generator
│   ├── jetgrind.js
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── LEARNINGS.md
│   ├── /versions/
│   └── /assets/
│
├── /buythelook/                 # Fashion meme generator
│   ├── buythelook.js
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── LEARNINGS.md
│   └── /versions/
│
└── /shared/                     # Reusable utilities (future)
```

---

## Resources

- [SupChat Platform](https://supchat.com/chat/)
- [SupChat Docs](https://supchat.com/docs/guides/getting-started)
- [Full API Documentation](https://supchat.com/docs/llms.txt)
