# Buy The Look - Changelog

All notable changes to this project will be documented in this file.

---

## [v0.2.23] - 2026-01-18

### Changed
- **Headline branding** - Changed from "STEAL HIS LOOK!!" to "BUY HIS LOOK!!"
- Updated all variations: BUY HER LOOK, BUY THEIR LOOK, BUY THE LOOK
- Matches patch name "Buy The Look"

---

## [v0.2.22] - 2026-01-18

### Added
- **Reroll button** - Using `sup.button("🔄 Reroll", onReroll)` pattern from jetgrind
- `onReroll()` callback sets `sup.message.set("reroll", true)`
- Main function checks for reroll state and regenerates
- Stores last input for reroll via `sup.message.set("lastInput", ...)`

---

## [v0.2.21] - 2026-01-18

### Attempted
- **Reroll button** - Tried `sup.rerun()` but API doesn't exist (TypeError: not a function)
- Removed reroll button - users can resend input to regenerate

---

## [v0.2.20] - 2026-01-18

### Added
- **Fan merch props guidance** - Prompt now asks for 1-2 fan merch props (shield, sword, backpack, toy)
- Props use character refs in searchQuery and category 'fanMerch'

### Changed
- **Removed bullet points** from buy links output for cleaner look

---

## [v0.2.19] - 2026-01-18

### Fixed
- **v0.2.18 broke analysis** - "Couldn't analyze this image" error returned
- Prompt was too verbose (same issue as v0.2.7-v0.2.9)
- Condensed analysisPrompt from 20 lines to 8 lines
- Condensed schema descriptions
- Kept key guidance: "joggers (not tights), henley (not tunic), vest (not doublet)"

---

## [v0.2.18] - 2026-01-18

### Fixed
- **Costume terms causing bad search results** - "tights" was returning polo shirts at H&M
  - Added "CRITICAL - Use REAL retail product names" section with translation guide:
    - tunic → henley shirt, pullover, v-neck sweater
    - tights → slim joggers, compression pants, skinny jeans, leggings
    - doublet/jerkin → vest, waistcoat
    - cloak/cape → overcoat, poncho
    - gauntlets → leather gloves
  - Updated `productName` schema: "NO costume terms like 'tunic' or 'tights'"
  - Updated `searchQuery` schema with retail term examples

---

## [v0.2.17] - 2026-01-18

### Fixed
- **Inaccurate color matching** - AI was generating wrong colors (e.g., "green pants" for Link's white tights)
  - Added "CRITICAL - Accurate matching" section to analysisPrompt
  - Added explicit example: "Link: green tunic, white tights, brown boots..."
  - Updated `color` field description to emphasize EXACT color matching

### Removed
- **"🛒 Shop similar items:" label** - Gratuitous header removed from buy links output

---

## [v0.2.16] - 2026-01-18

### Changed
- **Schema fine-tuning** - Improved field descriptions for better AI output:
  - `brand` - Now explicitly lists luxury vs budget brand examples
  - `productName` - Changed to "Menswear product" to guide male-oriented results
  - Added `category` enum field for explicit category routing

### Added
- **Schema `category` field** with enum: clothing, shoes, accessories, costume, fanMerch, athletic, formal, outdoor
- **Smart routing for clothing/shoes** - Generic clothing → Amazon Fashion, generic shoes → Zappos
- Keywords for "clothing" and "shoes" categories in fallback detection

### Improved
- Condensed `analysisPrompt` - More concise, explicit MENSWEAR guidance
- Condensed `defaultsPrompt` - Shorter, added male character examples (Link, Mario)
- `detectCategory()` now uses schema-provided category first, keyword detection as fallback
- Price range guidance: Luxury $500-$5000, Budget $15-$150, Unbranded $5-$50

---

## [v0.2.15] - 2026-01-18

### Fixed
- **Etsy blocked** - Switched fan merch routing from Etsy to Amazon (Etsy aggressively blocks bot-like traffic)
- **Women's products showing** - Added "mens" prefix to clothing searches
- **Removed female-focused stores** - Victoria's Secret, Aerie, Torrid, Lane Bryant, etc.

### Added
- `isClothingItem()` function to detect clothing items that need "mens" prefix
- Clothing keywords: shirts, pants, boots, jackets, tights, leggings, etc.

### Changed
- All clothing searches now include "mens" prefix:
  - Target "brown boots" → "mens brown boots"
  - Google Shopping "Balenciaga white tights" → "Balenciaga mens white tights"
- Smart routing now uses Amazon instead of Etsy for all fan merch
- Generic item routing adds "mens" by default

---

## [v0.2.14] - 2026-01-18

### Added
- **Smart routing for generic items** - no longer always Amazon:
  - Costume/cosplay items → Etsy
  - Fan merch (shields, swords, props) → Etsy
  - Athletic wear → Amazon Sports category
  - Formal wear → Nordstrom
  - Outdoor gear → REI
  - Vintage items → Poshmark
  - Jewelry → Etsy Jewelry
  - Accessories → Amazon

- **Category-aware search enhancement** - adds context to queries:
  - Costume items get "+ costume" or "+ cosplay" appended
  - Fan merch gets "+ replica" or "+ prop"
  - Athletic gets "+ athletic" or "+ sports"
  - etc. (only if not already in query)

- **Product category detection** via keywords:
  - Detects "zelda", "link", "shield", "sword" → routes to Etsy for fan merch
  - Detects "hiking", "waterproof", "outdoor" → routes to REI
  - Detects "vintage", "retro", "80s" → routes to Poshmark

### How it works now
```
1. Detect product category from productName + searchQuery
2. Enhance search query with category context
3. Route to appropriate retailer:
   - Known brand → that brand's store
   - Unknown brand → Google Shopping
   - Generic + costume/fan → Etsy
   - Generic + athletic → Amazon Sports
   - Generic + formal → Nordstrom
   - etc.
```

---

## [v0.2.13] - 2026-01-18

### Added
- **150+ reliable store URLs** - doubled the list with new categories:
  - Luxury multi-brand: Farfetch, SSENSE, Net-a-Porter, Mr Porter, Mytheresa
  - More fast fashion: Mango, Pull&Bear, Bershka, COS, Everlane, Reformation, Revolve, Boohoo, PrettyLittleThing
  - Menswear: J.Crew, Bonobos, Brooks Brothers, Express, SuitSupply
  - More sportswear: ASICS, Brooks, Hoka, On Running, Gymshark, Alo Yoga, Vuori
  - Outdoor/Workwear: Columbia, Arc'teryx, Carhartt, Dickies, L.L. Bean, Cabela's, Bass Pro
  - More shoes: Zappos, DSW, Foot Locker, UGG, Timberland, Allbirds, Skechers
  - Jewelry: Mejuri, Pandora, Swarovski, Kendra Scott, Kay, Zales
  - Watches: Fossil, Casio, G-Shock, Timex, MVMT
  - Bags: Herschel, Fjällräven, Tumi, Away, Calpak
  - Lingerie: Victoria's Secret, Aerie, Savage X Fenty, Skims
  - Plus size: Torrid, Lane Bryant, Eloquii
  - Kids: Carter's, Children's Place
  - Resale: Poshmark, Depop, ThredUp, The RealReal, Grailed, StockX, GOAT
  - More fan merch: Disney Store, Loungefly, Redbubble, TeePublic

---

## [v0.2.12] - 2026-01-18

### Added
- **60+ reliable store URLs** organized by category:
  - Budget/Mass market: Walmart, Target, Amazon, Kohl's, JCPenney, Macy's
  - Department stores: Nordstrom, Bloomingdale's, Saks, Neiman Marcus
  - Fast fashion: H&M, Uniqlo, Zara, ASOS, Shein, Forever 21, Urban Outfitters, Free People, Anthropologie
  - Gap brands: Gap, Old Navy, Banana Republic, Athleta
  - Sportswear: Nike, Adidas, Lululemon, Under Armour, Puma, Reebok, New Balance, Patagonia, North Face, REI
  - Shoes: Converse, Vans, Dr. Martens, Crocs, Birkenstock, Steve Madden
  - Eyewear: Ray-Ban, Oakley, Warby Parker
  - Fan merch: Etsy, Hot Topic, Spirit Halloween, BoxLunch

---

## [v0.2.11] - 2026-01-18

### Changed
- Simplified retailer display: "Gucci (Google Shopping)" → just "Google Shopping"
- Changed "Actually buy these items" → "Shop similar items" (more honest)
- Added Zara and Etsy to reliable store URLs (Etsy great for fan merch!)

---

## [v0.2.10] - 2026-01-18

### Fixed
- **Restored v0.2.5 base** - v0.2.7-v0.2.9 all failed with "Couldn't analyze this image"
- Minimal changes only: just updated searchQuery guidance for dual strategy
- Kept all original prompts and schema from working v0.2.5

### Result
**SUCCESS** - Works correctly with dual search strategy

### Changed
- searchQuery now supports dual strategy:
  - Luxury brands: generic terms ('green sweater')
  - Budget items: character refs OK ('Link tunic', 'Hylian shield')

---

## [v0.2.9] - 2026-01-18

### Changed
- **Dual search strategy** based on brand type

### Result
**FAILED** - Still getting "Couldn't analyze this image" error.

### Why this approach
User feedback: fantasy search terms sometimes work BETTER for budget items because
fan merch exists on Amazon. "Hylian shield backpack" finds real products.
Only luxury brands need generic terms since Gucci doesn't make Zelda merch.

---

## [v0.2.8] - 2026-01-18

### Fixed
- **Simplified prompts** - v0.2.7 prompts were too verbose and caused analysis to fail
- Schema `searchQuery` description shortened to one line
- `analysisPrompt` reduced from 22 lines to 8 lines
- `defaultsPrompt` reduced from 6 lines to 3 lines

### Why v0.2.7 failed
Overly verbose schema descriptions and prompts can cause parsing issues.
Kept the key instruction (use real retail terms) but made it concise.

---

## [v0.2.7] - 2026-01-18

### Changed
- **Reverted to constructed URLs** - v0.2.6 web search approach failed completely
- **Improved searchQuery prompting** - explicit instructions to use real retail terms only
- Added BAD/GOOD examples in schema and prompts
- Simplified retailer display
- Changed "Actually buy these items" → "Shop similar items"
- Added Zara to reliable store URLs

### Result
**FAILED** - Prompts too verbose, caused "Couldn't analyze this image" error.

### Why v0.2.6 failed
Web search with `useWebSearch: true` in `sup.ai.prompt()` doesn't reliably return product URLs.
Every search failed with "Couldn't find product for: X" and fell back to Google Shopping.
Constructed URLs with better search queries is the more reliable approach.

---

## [v0.2.6] - 2026-01-18

### Changed
- **Direct product URL discovery** - now uses web search to find actual product pages
- Links go to SPECIFIC products, not search results
- Added `findProductUrl()` async function that searches for each item individually
- Shows found product name and actual price when available
- Falls back to Google Shopping only if direct URL can't be found
- `main()` is now async to support product discovery

### Result
**FAILED** - Web search doesn't return product URLs reliably. All searches failed.

### How it works
1. Generate meme image (same as before)
2. For each item, use `sup.ai.prompt()` with `useWebSearch: true` to find a specific product URL
3. Return direct product page links (e.g., `amazon.com/dp/B08XYZ` not `amazon.com/s?k=...`)

---

## [v0.2.5] - 2026-01-18

### Fixed
- Reverted to markdown links - `sup.link()` throws TypeError
- Kept Google Shopping strategy for luxury brands from v0.2.4

---

## [v0.2.4] - 2026-01-18

### Changed
- Use `sup.link()` directly (should restore button styling)
- Simplified brand URL strategy:
  - Reliable stores (Walmart, Target, Amazon, Nike, etc.) → direct search URLs
  - All luxury/other brands → Google Shopping (more reliable than brand sites)
  - Generic/unbranded → Amazon
- Removed 70+ brand URLs that weren't working (luxury sites often have broken URL-based search)

### Why Google Shopping for luxury brands
Luxury brand sites (Gucci, Prada, Balenciaga, etc.) often:
- Require JavaScript for search
- Have dynamic URLs that don't accept query params
- Just redirect to homepage

Google Shopping reliably shows actual products for sale.

---

## [v0.2.3] - 2026-01-18

### Fixed
- Replaced `sup.button()` + `sup.link()` combo with markdown links
- Button combo was causing internal service error on click
- Now uses `[Shop at Retailer](url)` markdown format

---

## [v0.2.2] - 2026-01-18

### Added
- **Brand-specific retailer links** - 70+ brand URLs mapped to their official sites
- Luxury brands link to their official websites (Gucci, Prada, Louis Vuitton, etc.)
- Mid-range brands link to their sites (COS, Arket, Theory, etc.)
- Fast fashion links to respective stores (Zara, H&M, Uniqlo, etc.)
- Budget stores link properly (Walmart, Target, Amazon)
- Sportswear brands (Nike, Adidas, Lululemon, etc.)
- Shoe brands (Louboutin, Dr. Martens, Vans, etc.)
- Accessory/jewelry brands (Cartier, Tiffany, Ray-Ban, etc.)

### Fallback logic
1. Known brand → Brand's official website
2. Unknown luxury brand → SSENSE
3. Unknown other brand → Google Shopping
4. Generic/unbranded → Amazon

### Changed
- Button now shows "Shop at [Retailer]" instead of generic "Shop on Amazon"

---

## [v0.2.1] - 2026-01-18

### Changed
- **Restored original "Steal the Look" meme style** with humor/absurd matches
- Now outputs BOTH the meme image AND Amazon buy links below
- Added `searchQuery` field to schema for generating simple Amazon search URLs
- Buy links use constructed Amazon search URLs (no API needed)
- Same prompts/style as original Steal the Look

### How it works
1. Generate the meme image (same as Steal the Look)
2. Extract items from schema
3. Build Amazon search URLs from `searchQuery` field
4. Display image + "Shop on Amazon" buttons for each item

---

## [v0.2.0] - 2026-01-18

### Changed - MAJOR REWRITE
- **Pivoted to image generation approach** (like Steal the Look)
- Now generates collage images with product breakdowns instead of trying to find real URLs
- Uses `sup.ai.image.create()` with `useWebSearch: true` in config
- Random layouts: left, right, grid
- Random aspect ratios: 4:5, 1:1, 9:16
- 70% chance to show prices
- Mix of luxury, mid-range, and affordable brands
- Clean editorial fashion aesthetic

### Removed
- URL-based product discovery (didn't work reliably)
- Buy buttons and deep links
- Fallback search mechanisms

---

## [v0.1.2] - 2026-01-18

### Changed
- Amazon-first search strategy (most comprehensive catalog)
- Added fallback mechanism: if specific search fails, tries generic "[color] [category]" search
- Simplified prompts to be more direct
- Relaxed matching: "similar" products acceptable, not exact match required

---

## [v0.1.1] - 2026-01-18

### Fixed
- Analysis prompt now generates practical shopping queries instead of fantasy/costume descriptions
- Changed MIN_PRODUCTS from 3 to 1 so partial results can be returned
- Simplified product search prompt to focus on the searchQuery field
- Added explicit guidance for retail terminology in analysis

---

## [v0.1.0] - 2026-01-16

### Added
- Initial patch scaffold
