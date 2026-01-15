# Jet Grind Tag Generator - Development Learnings

This document captures key learnings, technical insights, and problem-solving approaches from developing the Jet Grind Radio style graffiti tag generator for SupChat.

---

## Table of Contents
1. [SupChat Platform Architecture](#supchat-platform-architecture)
2. [State Management Pattern](#state-management-pattern)
3. [Image Generation & Editing](#image-generation--editing)
4. [Achieving the JSR Visual Style](#achieving-the-jsr-visual-style)
5. [Prompt Engineering Insights](#prompt-engineering-insights)
6. [Version History & Key Fixes](#version-history--key-fixes)

---

## SupChat Platform Architecture

### Key Insight: State-Based UI Pattern
SupChat patches follow a **React-like state-based pattern** where:

- `main()` acts like a `render()` function - it's called after every user interaction
- Button callbacks should **only set state**, never return UI directly
- The runtime is **synchronous** - async work happens in `main()` based on state flags

```javascript
// WRONG - Don't return UI from button callbacks
sup.button("Click", () => {
  return ["Some UI"]; // This won't work
});

// CORRECT - Set state, let main() handle rendering
sup.button("Click", () => {
  sup.message.set("action", "doSomething");
});

// In main():
if (sup.message.get("action") === "doSomething") {
  // Do async work here, then set view state
}
```

### State Scopes
SupChat provides different state scopes:

| Scope | Method | Persistence | Use Case |
|-------|--------|-------------|----------|
| Message | `sup.message.set/get` | Within single message | Current tag, view state, action flags |
| User | `sup.user.set/get` | Across all sessions | Portfolios, favorites, settings |
| Chat | `sup.set/get` | Within chat session | Generally avoid - inconsistent |

**Critical Learning:** We initially used `sup.set/get` for state, but it didn't persist between button clicks. Switching to `sup.message.set/get` fixed all state persistence issues.

---

## State Management Pattern

### The Action Flag Pattern
For async operations triggered by buttons:

```javascript
// Button sets an action flag
function onGenerateBackground() {
  sup.message.set("action", "generateBackground");
}

// main() checks for action flags FIRST
async function main() {
  const action = sup.message.get("action");

  if (action === "generateBackground") {
    sup.message.set("action", null); // Clear flag immediately
    // Do async work...
    const result = await sup.ai.image.edit(...);
    sup.message.set("result", result);
    sup.message.set("view", "showResult");
  }

  // Then render based on view state
  const view = sup.message.get("view");
  switch (view) {
    case "showResult": return renderResult();
    // ...
  }
}
```

### View State Machine
Organize UI as a state machine with clear view names:

```javascript
switch (view) {
  case "tag":           return renderTagView();
  case "background":    return renderBackdropView();
  case "tagPortfolio":  return renderTagPortfolioView();
  case "portfolioDetail": return renderPortfolioDetailView();
  // ...
}
```

---

## Image Generation & Editing

### Preserving Original Tag When Adding Backdrops
**The Problem:** When adding backgrounds to tags, the original tag was being regenerated/altered.

**The Solution:** Use `sup.ai.image.edit()` instead of `sup.ai.image.create()`:

```javascript
// WRONG - Creates a new image, loses original tag
const result = await sup.ai.image.create(
  `${tagText} graffiti on ${backgroundDescription}`
);

// CORRECT - Edits existing image, preserves tag
const existingTag = sup.message.get("currentTag");
const editPrompt = `Add a stylized background behind this graffiti tag.
  Replace the transparent background with: ${bg.prompt}.
  Keep the graffiti text exactly as it appears.`;
const composite = await sup.ai.image.edit(existingTag, editPrompt);
```

**Key Insight:** `sup.ai.image.edit()` takes an existing image and modifies it based on a prompt, preserving elements you want to keep.

---

## Achieving the JSR Visual Style

This was the most challenging aspect of the project. Here's what we learned:

### What JSR Actually Looks Like
After analyzing 20+ screenshots from the actual Jet Set Radio / Jet Grind Radio games:

1. **NOT flat vector art** - The environments are 3D rendered, not illustrated
2. **NOT pure cel-shading** - Cel-shading is applied as a POST-PROCESS on 3D geometry
3. **Low-resolution realistic textures** - Grungy, photo-based textures at very low resolution (blurry/pixelated Dreamcast quality)
4. **Black outlines on EDGES only** - Outlines appear on geometry silhouettes, not on every surface
5. **Baked lighting** - Shadows are pre-rendered into textures
6. **Simple 3D geometry** - Low polygon count with visible facets
7. **Muted realistic colors** - Browns, grays, concrete tones with bright accent colors

### Prompt Evolution

#### Attempt 1: Flat Cel-Shading (Too Vector)
```
"flat solid color fills NO gradients, thick black outlines on everything"
```
**Result:** Looked like vector art, completely flat

#### Attempt 2: Generic "Jet Set Radio Style" (Inconsistent)
```
"Jet Set Radio Dreamcast game screenshot, cel-shaded..."
```
**Result:** AI doesn't actually know what JSR looks like - inconsistent results

#### Attempt 3: Technical Description (Much Better)
```
"Dreamcast era 3D video game screenshot, LOW RESOLUTION grungy realistic
textures on simple 3D geometry, blurry pixelated texture quality,
black outlines on geometry edges only, baked lighting..."
```
**Result:** Started getting actual 3D-looking environments

#### Attempt 4: Anti-Vector + Stronger Low-Poly (Current)
```
"1999 Dreamcast 3D game screenshot, frontal view, VERY LOW polygon count
chunky 3D geometry, simplified angular shapes, grungy low-res textures,
black outlines on edges only, baked shadows, NOT vector art NOT flat
illustration, PS1 era graphics quality"
```
**Result:** Best results so far - 3D geometry with that retro game feel

### Key Prompt Insights

1. **Describe technical characteristics, not brand names** - AI doesn't know "Jet Set Radio" but understands "low polygon count 3D geometry"

2. **Use negative prompting** - "NOT vector art NOT flat illustration" helps prevent flat outputs

3. **Reference the era** - "1999 Dreamcast", "PS1 era graphics" gives context for the visual quality level

4. **Be specific about geometry** - "simple box shapes", "chunky 3D geometry", "cone-shaped trees"

5. **Distinguish outlines** - "black outlines on edges only" vs "thick black outlines on everything" produces very different results

6. **Texture quality matters** - "grungy low-res textures", "blurry pixelated texture quality" captures that retro look

### Backdrop Variety
To prevent monotonous backgrounds (we kept getting green industrial scenes):

1. **Use distinct color palettes** per location
2. **Vary the scene elements** - don't repeat "pipes and equipment" across multiple backdrops
3. **10 diverse locations** with unique visual signatures:
   - Billboard, Brick Wall, Train Yard, Park, Garage
   - Highway, Shutter, Rooftop, Alley, Factory

---

## Prompt Engineering Insights

### For Graffiti Tags
- Wide panoramic format works best for tags
- Solid white/transparent backgrounds for clean compositing
- Rich style variety: colors, letter styles, flourishes, textures
- Gang presets (GGs, Noise Tanks, Poison Jam, Love Shockers) for thematic consistency

### For Backdrops
- **Frontal view** prevents perspective conflicts with the tag
- Technical descriptions > brand references
- Negative prompting to prevent unwanted styles
- Era-specific references for quality level

### General Tips
- Caps for emphasis: "VERY LOW polygon count"
- Specific shape descriptions: "simple cube shapes for tanks"
- Texture quality descriptions: "blurry pixelated"
- Lighting descriptions: "baked shadows", "pre-rendered lighting"

---

## Version History & Key Fixes

| Version | Key Changes |
|---------|-------------|
| v1.0.0 | Initial release, fixed HTML rendering |
| v1.1.0 | Refactored to state-based UI pattern |
| v1.1.9 | Fixed backdrop generation with `sup.ai.image.edit` |
| v1.2.0 | Renamed Background → Backdrop terminology |
| v1.2.1 | Split saving: Tag Portfolio + Photo Journal |
| v1.2.2 | Individual item removal, clickable thumbnails |
| v1.2.4 | "Edit Tag/Photo" buttons, Add Backdrop from portfolio |
| v1.2.5 | First attempt at improved JSR prompts (too flat) |
| v1.2.6 | Added "3D rendered with cel-shading post-process" |
| v1.2.7 | Distinct color palettes per backdrop |
| v1.2.8 | "Low-res realistic textures on 3D geometry" approach |
| v1.2.9 | Anti-vector prompting, 10 diverse backdrops |
| v1.2.10 | Explicit tag sizing instructions for backdrop compositing |
| v1.2.11 | Pure white backgrounds only (removed gray/off-white) |
| v1.2.12 | Fixed reply context triggering length validation |

---

## Known Platform Limitations

### Backdrop Tag Sizing Inconsistency
When using `sup.ai.image.edit()` to add backdrops behind tags, the tag renders at inconsistent sizes and positions each time - despite explicit prompt instructions to keep it centered and at original size.

**What we tried:**
```javascript
const editPrompt = `Add a background BEHIND this graffiti tag. CRITICAL: Keep the
graffiti at EXACTLY its current size - do NOT resize, scale, shrink or enlarge.
Keep the graffiti CENTERED in the frame...`;
```

**Result:** AI still varies the output. This appears to be a limitation of how the image edit model interprets sizing instructions.

**Potential platform solutions:**
- Compositing layer support (locked foreground layer)
- Size/position parameters for `image.edit()`
- Mask-based editing regions
- Reference image anchoring

### Reply Context in Input
When users reply to a message, `sup.input.text` may include the original message content, not just the user's new input. This caused "Too long" validation errors even when the user's actual input was short.

**The Fix (v1.2.12):**
```javascript
// Skip input validation if user already has an active session
const existingView = sup.message.get("view");
const hasExistingTag = sup.message.get("currentTag");

if (text && text.trim() !== "" && !existingView && !hasExistingTag) {
  // Only validate and process NEW tag generation
}
```

**Key Insight:** Always check if the user is in an existing session before processing `sup.input.text` - it may contain stale or concatenated content from replies.

---

## UI/UX Learnings

### White Backgrounds for Card Integration
Tags should be generated on **pure white backgrounds** (`#FFFFFF`) to blend seamlessly with the white card UI in SupChat. Earlier versions included "light gray" and "off-white" options that created visible tinting.

**Before (tinted):**
```javascript
const BACKGROUND_EFFECTS = [
  "solid flat white background",
  "solid flat light gray background",  // causes tinting
  "flat off-white background"           // causes tinting
];
```

**After (clean):**
```javascript
const BACKGROUND_EFFECTS = [
  "solid pure white background #FFFFFF",
  "clean white background with no texture",
  "pure white background",
  "bright white background"
];
```

---

## Reference Images

Background reference images from actual JSR gameplay are stored in:
```
/jetgrind/backgrounds/
```

These were critical for understanding the true visual style - analyzing actual game screenshots revealed that JSR environments use textured 3D (not flat cel-shading) with edge outlines applied as a post-process effect.

---

## Future Considerations

1. **Backdrop consistency** - Some renders still revert to vector style; may need backend filtering or stronger prompting
2. **Even lower poly** - Current results sometimes still too detailed; could push further
3. **Reference image support** - If SupChat API supports style references, could improve consistency dramatically
4. **User-selectable backdrop** - Currently random; could let users pick specific locations

---

*Last updated: January 2026*
*Current version: v1.2.9*
