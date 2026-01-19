# Jet Grind Tag Generator - Changelog

All notable changes to this project will be documented in this file.

---

## [v1.2.27] - 2026-01-18

### Added
- **Shared grid renderer** - `renderGrid()` function for portfolio/journal views
- Pre-computed `BACKGROUND_KEYS` for performance optimization

### Changed
- Minor code organization improvements

---

## [v1.2.26] - 2026-01-18

### Changed
- Style selection now includes `null` option for fully random combinations
- Random style picker chooses from preset styles OR fully random (millions of combos)

---

## [v1.2.25] - 2026-01-18

### Added
- **Blackwork style preset** - Mike Giant tattoo aesthetic
  - Bold black linework with crisp white accents
  - Chicano graffiti influence
  - Decorations: skulls, roses, geometric patterns, chicano flourishes
  - High contrast black and white with graphic precision

---

## [v1.2.24] - 2026-01-18

### Added
- **Grunge style preset** - Raw punk aesthetic
  - Muted colors: olive green, rust orange, burgundy, dirty yellow
  - Rough hand-painted letters with weathered texture
  - Decorations: rust stains, torn paper edges, scratches
  - Urban decay vibes with authentic street grit

---

## [v1.2.23] - 2026-01-18

### Changed
- Reorganized assets into `assets/backgrounds` and `assets/graffiti` folders
- Moved version files to `versions/` subdirectory
- Added CHANGELOG.md and README.md to jetgrind folder

---

## [v1.2.22] - 2026-01-15

### Changed
- Portfolio grid styling refinements:
  - Removed white container background (transparent)
  - Added 10px rounded corners on image thumbnails
  - Vertically centered images using flexbox
  - Replaced stacked image display with numbered "Edit #1, #2, #3" buttons
  - Cleaner visual separation between grid and action buttons

---

## [v1.2.21] - 2026-01-15

### Fixed
- **Image grid now working** - Images display correctly in 3-column grid
- Discovered that `tag.image` is a SupImage object with `.url` property
- Changed from `${tag.image}` to `${tag.image.url}` in img src attributes

### Added
- Working 3-column image grid using `sup.html()` for Tag Portfolio view

---

## [v1.2.20] - 2026-01-15

### Added
- Debug output to reveal image object structure
- Discovered SupImage object: `{ filename: undefined, url: 'https://...' }`

---

## [v1.2.19] - 2026-01-15

### Changed
- Attempted image grid with `<img src="${tag.image}">`
- Images appeared broken (no JS error) - led to discovery that tag.image is an object

---

## [v1.2.18] - 2026-01-15

### Changed
- Test: `.map()` over actual portfolio data (text only)
- Confirmed portfolio data access works correctly

---

## [v1.2.17] - 2026-01-15

### Changed
- Test: `.map()` with hardcoded array in `sup.html()`
- Confirmed array mapping works in HTML template

---

## [v1.2.16] - 2026-01-15

### Changed
- Test: Template literals with variables in `sup.html()`
- Confirmed template literal interpolation works

---

## [v1.2.15] - 2026-01-15

### Changed
- Test: Static string in `sup.html()`
- Baseline test confirmed `sup.html()` works with simple strings

---

## [v1.2.14] - 2026-01-15

### Changed
- Reverted grid experiments after errors
- Stable fallback to list view for portfolio

---

## [v1.2.13] - 2026-01-15

### Added
- Simplified tag view after generation
  - Shows only generated tag + "More Options" button
  - "More Options" expands to show all action buttons
  - "Back to Simple View" collapses back to minimal view
- New "tagOptions" view state for expanded options

### Changed
- Default post-generation view is now simplified (less button clutter)

---

## [v1.2.12] - 2026-01-14

### Fixed
- Reply context triggering length validation errors
- Added check for existing session before validating input text
- Users can now reply to existing tag sessions without validation errors

---

## [v1.2.11] - 2026-01-14

### Changed
- Pure white backgrounds only for tag generation
- Removed gray/off-white background options that caused visible tinting

---

## [v1.2.10] - 2026-01-14

### Changed
- Added explicit tag sizing instructions for backdrop compositing
- Attempted to fix inconsistent tag sizing (platform limitation)

---

## [v1.2.9] - 2026-01-14

### Changed
- Anti-vector prompting for backdrop generation
- Added "NOT vector art NOT flat illustration" to prompts
- Expanded to 10 diverse backdrop locations

---

## [v1.2.8] - 2026-01-14

### Changed
- "Low-res realistic textures on 3D geometry" approach for backdrops
- Better captures actual JSR visual style

---

## [v1.2.7] - 2026-01-14

### Changed
- Distinct color palettes per backdrop location
- Prevents monotonous green industrial scenes

---

## [v1.2.6] - 2026-01-14

### Changed
- Added "3D rendered with cel-shading post-process" to prompts
- Moving away from flat vector interpretations

---

## [v1.2.5] - 2026-01-14

### Changed
- First attempt at improved JSR prompts (still too flat)
- Started technical description approach

---

## [v1.2.4] - 2026-01-14

### Added
- "Edit Tag" and "Edit Photo" buttons in portfolio views
- "Add Backdrop" option from Tag Portfolio

---

## [v1.2.2] - 2026-01-14

### Added
- Individual item removal from portfolios
- Clickable thumbnails for portfolio items

---

## [v1.2.1] - 2026-01-14

### Changed
- Split saving into separate collections:
  - Tag Portfolio (original tags only)
  - Photo Journal (tags with backdrops/composites)

---

## [v1.2.0] - 2026-01-14

### Changed
- Renamed "Background" to "Backdrop" throughout codebase
- Clearer terminology distinction

---

## [v1.1.9] - 2026-01-14

### Fixed
- Backdrop generation now preserves original tag
- Switched from `sup.ai.image.create()` to `sup.ai.image.edit()`

---

## [v1.1.0] - 2026-01-14

### Changed
- Major refactor to state-based UI pattern
- Button callbacks now only set state
- All async work happens in `main()` based on state flags

---

## [v1.0.0] - 2026-01-14

### Added
- Initial release
- Jet Grind Radio style graffiti tag generation
- Gang presets (GGs, Noise Tanks, Poison Jam, Love Shockers)
- Basic tag portfolio saving

---

## Technical Notes

### Key Discoveries (v1.2.15-v1.2.21)

**sup.html() Behavior:**
- Renders HTML as a static screenshot/image
- Cannot fetch external resources dynamically
- CSS Grid and Flexbox fully supported
- Returns image that can be added to response array

**SupImage Object Structure:**
```javascript
// Images from sup.ai.image.create() are objects:
{
  filename: undefined,
  url: 'https://user-uploads.supcontent.com/xxxxx.webp'
}

// Access URL with .url property:
tag.image.url  // ✓ Correct
tag.image      // ✗ Wrong (object, not string)
```

---

*Maintained for persistent memory across Claude sessions*
