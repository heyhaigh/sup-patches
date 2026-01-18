# Buy The Look - Development Learnings

This document captures key learnings, technical insights, and problem-solving approaches from developing the Buy The Look patch for SupChat.

---

## Table of Contents

1. [Understanding "Steal the Look" Architecture](#understanding-steal-the-look-architecture)
2. [Web Search Limitations](#web-search-limitations)
3. [The Pivot (v0.2.0)](#the-pivot-v020)
4. [The Solution: Constructed URLs (v0.2.1)](#the-solution-constructed-urls-v021)
5. [Brand-Specific Retailer Mapping (v0.2.2)](#brand-specific-retailer-mapping-v022)
6. [Direct Product URL Discovery (v0.2.6)](#direct-product-url-discovery-v026)
7. [v0.2.6 Web Search Failure & Reversion](#v026-web-search-failure--reversion)
8. [Critical Learning: Prompt Verbosity Limit](#critical-learning-prompt-verbosity-limit-v027-v029-v0218)
9. [Etsy Blocking (v0.2.14-v0.2.15)](#etsy-blocking-v0214-v0215)
10. [Gender-Aware Search Queries (v0.2.15)](#gender-aware-search-queries-v0215)
11. [Costume Terms Don't Work in Retail (v0.2.17-v0.2.19)](#costume-terms-dont-work-in-retail-v0217-v0219)
12. [Smart Routing by Product Category (v0.2.14-v0.2.16)](#smart-routing-by-product-category-v0214-v0216)
13. [Balancing Retail Terms vs Fan Merch (v0.2.20)](#balancing-retail-terms-vs-fan-merch-v0220)
14. [150+ Reliable Store URLs (v0.2.12-v0.2.13)](#150-reliable-store-urls-v0212-v0213)
15. [Reroll Button Implementation (v0.2.22)](#reroll-button-implementation-v0222)

---

## Understanding "Steal the Look" Architecture

### Key Discovery (v0.1.2)

When analyzing the original "Steal the Look" patch as reference, discovered a critical architectural difference:

**"Steal the Look" does NOT find real product URLs.** It generates a meme IMAGE with fictional product information rendered visually.

```javascript
// Steal the Look approach
const config = {
  model: "gemini-3-pro-image",
  useWebSearch: true  // Helps IMAGE model render accurate products visually
};

// Uses sup.ai.image.create() to generate collage
return sup.ai.image.create(prompt, config);
```

The `useWebSearch: true` in the image config helps the image generation model:
- Render accurate-looking brand products
- Get visual reference for colors/styles
- Create realistic e-commerce style product shots

**It does NOT:**
- Find actual product URLs
- Return purchasable links
- Connect to real retailer inventory

### Implications for Buy The Look

"Buy The Look" attempts something more ambitious - finding REAL purchasable products with actual URLs. This requires a fundamentally different approach than "Steal the Look".

**Possible approaches:**
1. **Visual-only (like Steal the Look)** - Generate meme image, no real links
2. **Real product discovery** - Need different API/method than `useWebSearch` in prompts
3. **Hybrid** - Generate visual + attempt product matching separately

---

## Web Search Limitations

### Observed Behavior (v0.1.0 - v0.1.2)

Using `sup.ai.prompt()` with `useWebSearch: true` and a schema expecting `productUrl`:

```javascript
const result = await sup.ai.prompt(searchPrompt, {
  useWebSearch: true,
  schema: productSearchSchema  // expects productUrl field
});
```

**Results:**
- Analysis phase works (identifies items correctly)
- Product search consistently fails to return URLs
- Even simple items ("black platform shoes", "clear frame glasses") return no URLs

**Possible reasons:**
1. Web search may not be designed for e-commerce URL extraction
2. Schema constraints may conflict with search behavior
3. Retailers may have anti-scraping measures
4. May need direct retailer API integration instead

### Items Tested That Failed
- "Chunky black platform shoes"
- "Headphones with futuristic design"
- "Clear frame glasses"
- "Green tunic with high collar"
- "White fitted leggings"
- "Brown slouchy ankle boots"

All are common items easily found on Amazon manually.

---

## The Pivot (v0.2.0)

### Decision

After v0.1.0-v0.1.2 failed to reliably find product URLs, pivoted to match "Steal the Look" architecture:

**Before (v0.1.x):** Analyze image → Search for real products → Return URLs with buy buttons
**After (v0.2.0):** Analyze image → Generate collage image with product visuals

### Why Image Generation Works

The `useWebSearch: true` in image config serves a different purpose than in prompts:

```javascript
// This works - web search helps render accurate visuals
const config = {
  model: "gemini-3-pro-image",
  useWebSearch: true  // References real products for visual accuracy
};
return sup.ai.image.create(prompt, config);

// This doesn't work reliably for URLs
const result = await sup.ai.prompt(searchPrompt, {
  useWebSearch: true,  // Can't reliably extract purchase URLs
  schema: productSearchSchema
});
```

### Key Architecture Pattern

From Steal the Look:
1. `inputsToSchema()` - Convert user input to structured data
2. `schemaToImage()` - Convert structured data to visual output
3. Randomization for variety (layout, aspect ratio, show/hide prices)

---

## The Solution: Constructed URLs (v0.2.1)

### Breakthrough

Instead of trying to find specific product URLs via web search (which failed), construct Amazon search URLs directly from the schema data:

```javascript
function generateBuyLinks(schemaData) {
  const links = [];
  for (const item of schemaData.items) {
    const query = item.searchQuery || `${item.color} ${item.productName}`;
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    links.push({ name: item.productName, url: amazonUrl });
  }
  return links;
}
```

### Why This Works

1. **No API dependency** - Just string construction
2. **Always valid URLs** - Amazon search always works
3. **Relevant results** - `searchQuery` field generates simple, generic terms
4. **User can browse** - Links to search results, not specific products

### Schema Addition

Added `searchQuery` field to prompt generic search terms:
```javascript
searchQuery: {
  type: "string",
  description: "Simple search query to find this product (e.g., 'green cashmere sweater' not 'Gucci Yellow Cashmere Crewneck')"
}
```

This ensures the AI generates simple terms like "yellow cashmere sweater" instead of specific branded terms that might not match Amazon's inventory.

---

## Brand-Specific Retailer Mapping (v0.2.2)

### The Problem

Linking everything to Amazon doesn't match the meme's content - when the meme shows a "Gucci Cashmere Sweater", the buy link should go to Gucci, not Amazon.

### Solution: Brand URL Dictionary

Created a comprehensive mapping of 70+ brands to their search URLs:

```javascript
const BRAND_URLS = {
  // Luxury
  "gucci": "https://www.gucci.com/us/en/search?search=",
  "prada": "https://www.prada.com/us/en/search.html?q=",
  // ... etc

  // Fast fashion
  "zara": "https://www.zara.com/us/en/search?searchTerm=",
  "h&m": "https://www2.hm.com/en_us/search-results.html?q=",
  // ... etc

  // Budget
  "walmart": "https://www.walmart.com/search?q=",
  "target": "https://www.target.com/s?searchTerm=",
  // ... etc
};
```

### Fallback Chain

For brands not in the dictionary:

1. **Known brand** → Use mapped URL
2. **Unknown luxury brand** (detected by keyword matching) → SSENSE
3. **Unknown other brand** → Google Shopping
4. **No brand / generic** → Amazon

### Brand Detection

```javascript
function isLuxuryBrand(brand) {
  const luxuryKeywords = [
    "gucci", "prada", "louis", "vuitton", "balenciaga", ...
  ];
  return luxuryKeywords.some(keyword => brand.includes(keyword));
}
```

### Benefits

- Links feel authentic to the meme content
- Users land on actual brand sites
- Better shopping experience
- Maintains humor/satire while being functional

---

## Direct Product URL Discovery (v0.2.6)

### The Problem (v0.2.5)

Constructed search URLs (Google Shopping, Amazon search) were too generic. Users wanted links to **specific products**, not search results pages that show a list of somewhat-related items.

### Solution: Per-Item Web Search

Instead of constructing URLs, use `sup.ai.prompt()` with `useWebSearch: true` for each item to find actual product pages:

```javascript
const productUrlSchema = {
  schema: {
    productUrl: {
      type: "string",
      description: "Direct URL to a specific product page (not a search results page)"
    },
    productName: { type: "string" },
    retailer: { type: "string" },
    price: { type: "string" }
  }
};

async function findProductUrl(item) {
  const prompt = `Find a SPECIFIC product for sale: "${item.brand} ${item.searchQuery}"
  Return a DIRECT product page URL (not search results)
  Example good: https://www.amazon.com/dp/B08XYZ
  Example bad: https://www.amazon.com/s?k=green+sweater`;

  const result = await sup.ai.prompt(prompt, {
    useWebSearch: true,
    schema: productUrlSchema
  });

  if (result?.productUrl?.startsWith("http")) {
    return result;
  }
  // Fallback to Google Shopping
  return { url: `https://www.google.com/search?tbm=shop&q=...` };
}
```

### Key Differences from v0.1.x Attempts

**v0.1.x (failed):**
- Tried to find ALL products in a single prompt
- Complex schema expecting multiple URLs
- No fallback mechanism

**v0.2.6 (new approach):**
- Searches for ONE product at a time
- Simple schema with single URL
- Clear examples of good vs bad URLs
- Falls back gracefully to Google Shopping

### Trade-offs

**Pros:**
- Links go to actual product pages
- More relevant results
- Better user experience

**Cons:**
- Slower (sequential web searches for each item)
- May still fall back to search results if product not found
- Dependent on web search reliability

### Implementation Notes

- `main()` must be `async` to await product searches
- Use `sup.status()` to show progress ("Finding product 1/5...")
- Display both original meme price AND found product price if different
- Show found product name to indicate what was actually matched

---

## v0.2.6 Web Search Failure & Reversion

### What Happened

v0.2.6's per-item web search approach failed completely in production:
- Every search returned "Couldn't find product for: X"
- All items fell back to Google Shopping
- Web search with `useWebSearch: true` in `sup.ai.prompt()` doesn't reliably return product URLs

### Resolution

Reverted to constructed URLs approach (v0.2.5 base). Constructed URLs are more reliable than web search for product discovery.

---

## Critical Learning: Prompt Verbosity Limit (v0.2.7-v0.2.9, v0.2.18)

### The Problem

Overly verbose prompts cause the schema parsing to fail with "Couldn't analyze this image" error.

**v0.2.7-v0.2.9:** Added detailed BAD/GOOD examples and verbose instructions → FAILED
**v0.2.18:** Added detailed costume-to-retail translation guide → FAILED

### The Solution

Keep prompts CONCISE. When v0.2.10 restored the minimal v0.2.5 base, it worked again.

**Rule of thumb:** analysisPrompt should be ~8-10 lines max. If you need to add guidance, remove something else or condense existing lines.

```javascript
// BAD - Too verbose (20+ lines)
const analysisPrompt = [
  "CRITICAL - Accurate color matching:",
  "- CAREFULLY identify EACH item...",
  "- Match EXACT colors...",
  "",
  "CRITICAL - Use REAL retail product names:",
  "- tunic → 'henley shirt', 'pullover'...",
  "- tights → 'slim joggers'...",
  // ... many more lines
].join("\n");  // BREAKS PARSING

// GOOD - Concise (8 lines)
const analysisPrompt = [
  "Create 'Steal The Look' fashion meme matching subject's outfit to real menswear.",
  "",
  "Rules:",
  "- Match EXACT colors from subject's outfit.",
  "- Use RETAIL product names: joggers (not tights), henley (not tunic).",
  "- 4-6 items: 60% luxury brands, 40% budget/unbranded.",
  "- Include 1-2 FAN MERCH props with character refs in searchQuery.",
  "- Set category for each item."
].join("\n");  // WORKS
```

---

## Etsy Blocking (v0.2.14-v0.2.15)

### Observation

Etsy aggressively blocks bot-like traffic. Some links worked, others didn't.

### Key Insight

Initially thought it was timing-based (first request blocked, subsequent allowed). User testing revealed the OPPOSITE - first link worked, second was blocked.

**Actual cause:** Content-based filtering on trademarked terms. "Hylian Shield" (Nintendo trademark) was blocked, but generic "Plastic Sword" worked.

### Solution

Switched all fan merch routing from Etsy to Amazon. Amazon doesn't block these requests and has extensive fan merch inventory.

---

## Gender-Aware Search Queries (v0.2.15)

### The Problem

Target and other retailers were showing women's/girls' products in search results.

### User Feedback

"This platform is predominantly men using these patches"

### Solution

1. Added `isClothingItem()` function to detect clothing items
2. Added "mens" prefix to all clothing searches
3. Removed female-focused stores (Victoria's Secret, Aerie, Torrid, Lane Bryant, etc.)

```javascript
function isClothingItem(productName) {
  const clothingKeywords = ["shirt", "pants", "boots", "jacket", "tights", ...];
  return clothingKeywords.some(kw => productName.toLowerCase().includes(kw));
}

// In generateBuyLinks:
const needsMens = isClothingItem(item.productName);
const mensQuery = needsMens ? `mens ${query}` : query;
```

---

## Costume Terms Don't Work in Retail (v0.2.17-v0.2.19)

### The Problem

AI was generating terms like "tunic" and "tights" which don't map to actual retail product names.

**Example:** "H&M white athletic tights" returned polo shirts, not pants.

### Solution

Added guidance to translate costume/fantasy terms to retail terms:

- tunic → henley shirt, pullover, v-neck sweater
- tights → slim joggers, compression pants, skinny jeans, leggings
- doublet/jerkin → vest, waistcoat
- cloak/cape → overcoat, poncho
- gauntlets → leather gloves

**Key constraint:** Must keep guidance concise or parsing breaks (see Prompt Verbosity Limit above).

Condensed to single line in prompt:
```
"- Use RETAIL product names: joggers (not tights), henley (not tunic), vest (not doublet)."
```

---

## Smart Routing by Product Category (v0.2.14-v0.2.16)

### Concept

Instead of routing all generic items to Amazon, route based on detected product category:

| Category | Retailer |
|----------|----------|
| clothing | Amazon Fashion |
| shoes | Zappos |
| costume | Amazon (with "costume mens" suffix) |
| fanMerch | Amazon |
| athletic | Amazon Sports |
| formal | Nordstrom |
| outdoor | REI |
| vintage | Amazon (with "vintage" suffix) |

### Implementation

1. Added `category` field to schema (enum with valid categories)
2. `detectCategory()` uses schema category first, keyword fallback second
3. `getSmartRetailer()` routes to appropriate retailer based on category

---

## Balancing Retail Terms vs Fan Merch (v0.2.20)

### The Tension

- Retail terms (joggers, henley) → Better search results for clothing
- Character refs (Zelda shield, Link sword) → Fun fan merch that makes the meme entertaining

### Solution

Prompt explicitly asks for BOTH:
```
"- Use RETAIL product names: joggers (not tights), henley (not tunic)."
"- Include 1-2 FAN MERCH props (shield, sword, backpack, toy) with character refs in searchQuery."
```

This gives best of both worlds:
- Clothing items use retail terms → H&M, Nike links work properly
- Fan merch uses character refs → Amazon finds the replica shields and toy swords

---

## 150+ Reliable Store URLs (v0.2.12-v0.2.13)

### Categories Covered

- Budget/Mass market: Walmart, Target, Amazon, Kohl's, JCPenney, Macy's
- Department stores: Nordstrom, Bloomingdale's, Saks, Neiman Marcus
- Fast fashion: H&M, Uniqlo, Zara, ASOS, Shein, Forever 21
- Menswear: J.Crew, Bonobos, Brooks Brothers, Express, SuitSupply
- Sportswear: Nike, Adidas, Lululemon, Under Armour, Puma, Reebok
- Outdoor: Patagonia, North Face, REI, Columbia, Arc'teryx, Carhartt
- Shoes: Zappos, DSW, Foot Locker, Dr. Martens, Timberland
- Resale: Poshmark, Depop, ThredUp, Grailed, StockX, GOAT
- Fan merch: Hot Topic, BoxLunch, Redbubble, TeePublic

### URL Pattern

All URLs use query parameter format for direct search:
```javascript
"nike": "https://www.nike.com/w?q=",
"h&m": "https://www2.hm.com/en_us/search-results.html?q=",
```

---

## Reroll Button Implementation (v0.2.22)

### Failed Attempt: `sup.rerun()`

First tried `sup.rerun("🔄 Reroll")` but got `TypeError: not a function`. This API doesn't exist.

### Working Solution: Jetgrind Button Pattern

Use `sup.button()` with a callback that sets state, then check that state in main():

```javascript
// 1. Add button to response
response.push(sup.button("🔄 Reroll", onReroll));

// 2. Define callback that sets state
function onReroll() {
  sup.message.set("reroll", true);
}

// 3. Check state at start of main()
function main() {
  const isReroll = sup.message.get("reroll");
  if (isReroll) {
    sup.message.set("reroll", null);  // Clear the flag
    // Fall through to regenerate
  }

  // Store input for reroll
  if (hasInput) {
    sup.message.set("lastInput", { text: sup.input.text, images: sup.input.images });
  }

  // ... rest of generation logic
}
```

### Key Points

1. **`sup.button(label, callback)`** - Creates pink SupChat-styled button
2. **Callback sets state** - Use `sup.message.set()` to flag the action
3. **Main checks state** - At start of main(), check for the flag and clear it
4. **Store input** - Save original input so reroll has data to work with

### Why This Works

SupChat re-runs main() when a button is clicked. By setting state in the callback, main() can detect it was triggered by a button click and act accordingly (regenerate instead of showing welcome screen).

---

*Last updated: January 2026*
*Current version: v0.2.23*
