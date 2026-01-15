// Jet Grind Radio Style Graffiti Tag Generator
// Creates stylized graffiti tags based on user text input
// Repository: https://github.com/heyhaigh/sup-patches

const VERSION = "1.1.7";

// =============================================================================
// STYLE POOLS & CONSTANTS
// =============================================================================

const COLOR_PALETTES = [
  "neon green and hot pink with cyan accents",
  "electric blue and bright orange with purple shadows",
  "vibrant purple and magenta with teal splashes",
  "lime green and yellow with red outlines",
  "hot pink and red with green drips",
  "cyan and purple with neon yellow highlights",
  "orange and gold with blue outlines and green accents",
  "magenta and violet with electric blue flames",
  "neon yellow and black with pink highlights",
  "teal and coral with purple gradients"
];

const LETTER_STYLES = [
  "bold bubble letters with thick black outlines",
  "sharp wildstyle graffiti letters with arrows and connections",
  "chunky block letters with 3D depth and shadows",
  "flowing organic letters with curved flourishes",
  "angular aggressive letters with spike elements",
  "round bubbly letters with glossy highlights",
  "jagged edgy letters with lightning bolt shapes"
];

const FLOURISH_TYPES = [
  "flame wisps and fire trails",
  "liquid drips and paint splashes",
  "organic plant tendrils and vines",
  "electric sparks and energy bolts",
  "spray paint clouds and mist effects",
  "geometric shapes and arrows",
  "stars and sparkle effects",
  "smoke wisps and vapor trails"
];

const TEXTURE_PATTERNS = [
  "leopard spot pattern fills",
  "crackle texture overlays",
  "gradient color fades",
  "halftone dot patterns",
  "stripe and checker patterns",
  "solid flat cel-shaded colors",
  "metallic sheen highlights"
];

const BACKGROUND_EFFECTS = [
  "solid flat white background",
  "solid flat light gray background",
  "clean white background with no texture",
  "pure white background",
  "flat off-white background"
];

const SPRAY_TEXTURES = [
  "visible spray paint overspray and soft bleeding edges where colors meet",
  "aerosol mist gradients with speckled paint particles floating around letters",
  "rough concrete wall texture showing through thin paint areas",
  "weathered and faded paint patches with exposed underlayers",
  "heavy paint drips running down from letter bottoms with pooling effects",
  "multiple spray layers with varying opacity creating depth",
  "gritty urban brick texture bleeding through the paint",
  "splattered paint droplets and fine aerosol speckles across surface",
  "chalky matte spray paint finish with dusty texture",
  "wet glossy fresh paint look with light reflections and thick buildup"
];

const PAINT_TECHNIQUES = [
  "hand-sprayed with visible can control variations and pressure changes",
  "layered stencil edges with slight overspray bleeding",
  "fat cap wide spray strokes with soft fuzzy edges",
  "skinny cap precise lines with sharp details and fine mist halos",
  "dripping wet paint with gravity pulls and running streaks",
  "faded vintage spraypaint with sun-bleached areas",
  "fresh vibrant paint with thick opaque coverage",
  "quick bombing style with raw energetic strokes"
];

const OUTLINE_STYLES = [
  "thick black outline with bright white inner outline creating pop effect",
  "double outline - inner white glow and outer black border",
  "triple-layered outlines in contrasting colors for maximum depth",
  "neon glow outline effect like backlit signage",
  "jagged rough outline with sketchy hand-drawn quality",
  "soft airbrushed glow halo around each letter",
  "hard black outline with colored drop shadow outline behind",
  "electric buzzing outline with energy crackling at edges"
];

const DRIP_EFFECTS = [
  "long paint drips extending well below the letters pooling at bottom",
  "thick goopy drips running down with bulbous ends",
  "thin streaky drips like rain running down glass",
  "splashy drips with secondary splatter where they land",
  "melting effect with letters dissolving into drips at bottom",
  "blood-drip style thick viscous runs",
  "fresh wet paint with multiple drip streams per letter",
  "minimal drips - just a few accent drips on key letters"
];

const DECORATIVE_ELEMENTS = [
  "scattered stars and sparkles floating around the text",
  "dynamic speed lines and motion streaks suggesting movement",
  "crown floating above the text like royalty",
  "arrows pointing outward in multiple directions",
  "small skulls and crossbones as accent pieces",
  "hearts and love symbols scattered throughout",
  "lightning bolts and energy symbols crackling around",
  "musical notes and sound waves emanating outward",
  "dollar signs and diamond gems as bling accents",
  "eyeballs and lips as surreal decorative elements"
];

const SHADOW_STYLES = [
  "hard drop shadow offset to bottom-right in dark color",
  "long dramatic cast shadow extending far behind letters",
  "multi-colored layered shadow creating 3D stack effect",
  "soft diffused shadow like letters floating above surface",
  "harsh geometric shadow at 45-degree angle",
  "glitchy double shadow with slight offset like misprint",
  "gradient shadow fading from dark to transparent",
  "colored shadow in contrasting hue for psychedelic effect"
];

const JAPANESE_ELEMENTS = [
  "small katakana characters scattered as decorative accents",
  "Japanese kanji symbols floating around the edges",
  "hiragana characters integrated into the design as flourishes",
  "Japanese sound effect text (like manga) as background elements",
  "mixed English and Japanese characters in harmony",
  "katakana version of the word subtly echoed behind main text",
  "Japanese aesthetic with cherry blossom petals and kanji",
  "Tokyo street sign style with Japanese text accents"
];

const CHARACTER_CAMEOS = [
  "silhouette of a skater doing a trick integrated into the letters",
  "small anime-style character peeking from behind the text",
  "roller-blading figure silhouette as part of the composition",
  "DJ character with headphones worked into the design",
  "spray-painting figure silhouette adding to the graffiti",
  "breakdancing silhouette as a dynamic accent",
  "masked graffiti artist character integrated subtly",
  "cute chibi character sitting on top of the letters"
];

const STYLE_PRESETS = {
  random: null,
  ggs: {
    name: "GGs",
    description: "Classic colorful funk",
    colors: ["neon green and hot pink with cyan accents", "vibrant orange and teal with yellow highlights", "electric blue and lime green with pink pops"],
    letters: ["bold bubble letters with thick black outlines", "round bubbly letters with glossy highlights", "flowing organic letters with curved flourishes"],
    decorations: ["scattered stars and sparkles floating around the text", "musical notes and sound waves emanating outward", "crown floating above the text like royalty"],
    flourish: ["stars and sparkle effects", "spray paint clouds and mist effects"],
    outline: ["neon glow outline effect like backlit signage", "soft airbrushed glow halo around each letter"],
    shadow: ["multi-colored layered shadow creating 3D stack effect", "colored shadow in contrasting hue for psychedelic effect"],
    vibe: "upbeat funky positive energy, classic Jet Set Radio style, colorful and fun"
  },
  noisetanks: {
    name: "Noise Tanks",
    description: "Techy cyber future",
    colors: ["electric blue and white with silver chrome accents", "cyan and black with neon green data streams", "purple and blue with holographic silver"],
    letters: ["sharp wildstyle graffiti letters with arrows and connections", "angular aggressive letters with spike elements", "jagged edgy letters with lightning bolt shapes"],
    decorations: ["lightning bolts and energy symbols crackling around", "dynamic speed lines and motion streaks suggesting movement", "arrows pointing outward in multiple directions"],
    flourish: ["electric sparks and energy bolts", "geometric shapes and arrows"],
    outline: ["electric buzzing outline with energy crackling at edges", "neon glow outline effect like backlit signage"],
    shadow: ["glitchy double shadow with slight offset like misprint", "harsh geometric shadow at 45-degree angle"],
    vibe: "futuristic cyber tech aesthetic, digital glitch effects, robotic precision with electric energy"
  },
  poisonjam: {
    name: "Poison Jam",
    description: "Dark horror vibes",
    colors: ["blood red and black with sickly green accents", "dark purple and crimson with toxic yellow", "black and neon green with blood red drips"],
    letters: ["jagged edgy letters with lightning bolt shapes", "angular aggressive letters with spike elements", "chunky block letters with 3D depth and shadows"],
    decorations: ["small skulls and crossbones as accent pieces", "eyeballs and lips as surreal decorative elements", "lightning bolts and energy symbols crackling around"],
    flourish: ["flame wisps and fire trails", "smoke wisps and vapor trails"],
    outline: ["jagged rough outline with sketchy hand-drawn quality", "hard black outline with colored drop shadow outline behind"],
    shadow: ["long dramatic cast shadow extending far behind letters", "hard drop shadow offset to bottom-right in dark color"],
    drips: ["blood-drip style thick viscous runs", "melting effect with letters dissolving into drips at bottom"],
    vibe: "dark horror punk aesthetic, menacing and aggressive, monster movie vibes with toxic elements"
  },
  loveshockers: {
    name: "Love Shockers",
    description: "Romantic rebel style",
    colors: ["hot pink and red with white highlights", "magenta and coral with gold accents", "pink and purple with red heart accents"],
    letters: ["round bubbly letters with glossy highlights", "flowing organic letters with curved flourishes", "bold bubble letters with thick black outlines"],
    decorations: ["hearts and love symbols scattered throughout", "scattered stars and sparkles floating around the text", "crown floating above the text like royalty"],
    flourish: ["stars and sparkle effects", "liquid drips and paint splashes"],
    outline: ["soft airbrushed glow halo around each letter", "double outline - inner white glow and outer black border"],
    shadow: ["soft diffused shadow like letters floating above surface", "colored shadow in contrasting hue for psychedelic effect"],
    vibe: "romantic rebel aesthetic, passionate and bold, love-struck with attitude"
  }
};

const RARE_DROPS = [
  {
    name: "GOLD",
    chance: 5,
    prompt: (text) => `Ultra luxurious solid GOLD graffiti tag artwork. The word "${text}" in bold 3D letters made entirely of shiny polished gold metal. Gleaming reflective gold surface with bright specular highlights and light rays. Dripping with liquid gold, gold sparkles and gold dust particles floating around. Diamond and gem encrusted accents. Bling aesthetic with brilliant shine. Chrome gold metallic finish catching light from multiple angles. Luxurious wealthy opulent style. Gold bars and gold coins scattered as decorations. Rich solid gold with no other colors. Solid white background for clean clipping. Wide panoramic landscape format.`
  },
  {
    name: "HOLOGRAPHIC",
    chance: 3,
    prompt: (text) => `Holographic rainbow iridescent graffiti tag artwork. The word "${text}" in chrome letters with shifting rainbow holographic finish. Prismatic light refraction creating rainbow spectrum colors that shift and change. Iridescent mother-of-pearl sheen. Laser hologram effect with light diffraction patterns. Cyberpunk futuristic chrome with rainbow oil-slick coloring. Shimmering pearlescent surface. Y2K aesthetic holographic style. Solid white background. Wide panoramic landscape format.`
  },
  {
    name: "DIAMOND",
    chance: 1,
    prompt: (text) => `Crystalline diamond and ice graffiti tag artwork. The word "${text}" made entirely of sparkling cut diamonds and clear crystals. Brilliant light refraction through transparent gemstones. Icy frozen aesthetic with frost and snowflake accents. Luxury jewelry quality diamonds catching light. Prismatic rainbow light scattered through crystal facets. Glittering platinum and silver metallic accents. Frozen ice drips. Ultra premium precious gemstone aesthetic. Solid white background. Wide panoramic landscape format.`
  }
];

const BACKGROUNDS = {
  shibuya: { name: "🌃 Shibuya", prompt: "Jet Set Radio game screenshot style background, dense Tokyo cityscape with neon billboards and Japanese signs, flat cel-shaded colors with thick black outlines, muted grey buildings with bright neon accents, low-poly geometric shapes, dark street level, Dreamcast era 3D graphics aesthetic" },
  garage: { name: "🏠 Garage", prompt: "Jet Set Radio game screenshot style background, indoor garage or basement with dark tiled floor grid pattern, industrial equipment, muted dark green and grey flat shaded walls, thick black outlines, speakers and machinery, Dreamcast era 3D cel-shaded aesthetic" },
  shutter: { name: "🚪 Shutter", prompt: "Jet Set Radio game screenshot style background, metal roll-up shutter door on urban storefront, corrugated metal texture with flat cel-shaded colors, muted grey and brown tones, thick black outlines, Japanese storefront aesthetic, Dreamcast era 3D graphics" },
  street: { name: "🛣️ Street", prompt: "Jet Set Radio game screenshot style background, Tokyo street scene with flat cel-shaded buildings, dark asphalt ground, muted browns and greys with neon sign accents, thick black outlines, low-poly geometric architecture, Dreamcast era 3D aesthetic" },
  train: { name: "🚃 Train Yard", prompt: "Jet Set Radio game screenshot style background, subway train car side panel, silver and grey metal with flat cel-shaded colors, industrial train yard setting, thick black outlines, Dreamcast era 3D graphics aesthetic" },
  rooftop: { name: "🌆 Rooftop", prompt: "Jet Set Radio game screenshot style background, Tokyo rooftop with water tanks and AC units, city skyline in distance, flat cel-shaded muted colors, thick black outlines, geometric shapes, Dreamcast era 3D aesthetic" },
  highway: { name: "🛤️ Highway", prompt: "Jet Set Radio game screenshot style background, elevated highway or overpass, concrete barriers and road signs, flat cel-shaded grey and brown tones, thick black outlines, urban infrastructure, Dreamcast era 3D graphics" },
  sewers: { name: "🚰 Sewers", prompt: "Jet Set Radio game screenshot style background, underground sewer tunnel with pipes and grates, dark green and grey flat shaded colors, wet floor reflections, thick black outlines, industrial underground aesthetic, Dreamcast era 3D" },
  plaza: { name: "🏬 Plaza", prompt: "Jet Set Radio game screenshot style background, Tokyo shopping plaza with storefronts, flat cel-shaded colors, muted tones with bright signage accents, thick black outlines, tiled floor pattern, Dreamcast era 3D aesthetic" },
  tower: { name: "📡 Tower", prompt: "Jet Set Radio game screenshot style background, Tokyo Tower or radio tower structure, geometric metal framework, flat cel-shaded orange and grey colors, thick black outlines, city backdrop, Dreamcast era 3D graphics aesthetic" }
};

const MAX_LENGTH = 20;
const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 256;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(percent) {
  return Math.random() * 100 < percent;
}

function checkRareDrop() {
  for (const rare of RARE_DROPS) {
    if (chance(rare.chance)) {
      return rare;
    }
  }
  return null;
}

function buildPrompt(text, presetKey = "random") {
  if (presetKey === "random") {
    const rareDrop = checkRareDrop();
    if (rareDrop) {
      return { prompt: rareDrop.prompt(text), rare: rareDrop.name };
    }
  }

  const preset = STYLE_PRESETS[presetKey];
  const colors = preset?.colors ? randomChoice(preset.colors) : randomChoice(COLOR_PALETTES);
  const letters = preset?.letters ? randomChoice(preset.letters) : randomChoice(LETTER_STYLES);
  const flourish = preset?.flourish ? randomChoice(preset.flourish) : randomChoice(FLOURISH_TYPES);
  const decorations = preset?.decorations ? randomChoice(preset.decorations) : randomChoice(DECORATIVE_ELEMENTS);
  const outline = preset?.outline ? randomChoice(preset.outline) : randomChoice(OUTLINE_STYLES);
  const shadow = preset?.shadow ? randomChoice(preset.shadow) : randomChoice(SHADOW_STYLES);
  const drips = preset?.drips ? randomChoice(preset.drips) : randomChoice(DRIP_EFFECTS);
  const presetVibe = preset?.vibe || "";
  const texture = randomChoice(TEXTURE_PATTERNS);
  const sprayTexture = randomChoice(SPRAY_TEXTURES);
  const paintTechnique = randomChoice(PAINT_TECHNIQUES);
  const backgroundPrompt = randomChoice(BACKGROUND_EFFECTS);
  const japaneseElement = chance(40) ? `JAPANESE ACCENT: ${randomChoice(JAPANESE_ELEMENTS)}.` : "";
  const characterCameo = chance(30) ? `CHARACTER: ${randomChoice(CHARACTER_CAMEOS)}.` : "";

  let prompt = `Jet Set Radio / Jet Grind Radio video game style graffiti tag artwork, real spray paint on wall aesthetic. The word "${text}" written in ${letters}, colored with ${colors}. Letters have ${texture}. OUTLINES: ${outline}. DRIPS: ${drips}. DECORATIONS: ${decorations}. SHADOW: ${shadow}. ${japaneseElement} ${characterCameo} Decorated with ${flourish} around and between the letters. Painted with authentic spray paint texture: ${sprayTexture}. Technique style: ${paintTechnique}. ${backgroundPrompt}. Wide panoramic landscape format, stylized Japanese video game graffiti art but with realistic spray paint material qualities, bold graphic design, high contrast colors, genuine aerosol paint aesthetic with visible paint texture and spray artifacts, urban street art.`;

  if (presetVibe) {
    prompt += ` Style vibe: ${presetVibe}.`;
  }

  return { prompt, rare: null };
}

function getRareMessage(rare) {
  const messages = {
    GOLD: "✨🏆 RARE TAG: SOLID GOLD! 🏆✨",
    HOLOGRAPHIC: "✨🌈 RARE TAG: HOLOGRAPHIC! 🌈✨",
    DIAMOND: "✨💎 GRAIL TAG: DIAMOND! 💎✨"
  };
  return messages[rare] || null;
}

// =============================================================================
// BUTTON HANDLERS (only set state - async work happens in main())
// =============================================================================

// Tag view actions - only set state, main() handles async work
function onAddBackground() {
  sup.set("action", "generateBackground");
}

function onSaveToPortfolio() {
  const tagImage = sup.message.get("currentTag");
  const tagText = sup.message.get("currentTagText");
  const rare = sup.message.get("currentTagRare");

  if (!tagImage) return;

  const portfolio = sup.user.get("tagPortfolio") || [];
  portfolio.push({
    text: tagText,
    image: tagImage,
    rare: rare,
    backgroundName: null,
    savedAt: Date.now()
  });
  sup.user.set("tagPortfolio", portfolio.slice(-50));

  sup.set("saveMessage", `✅ Saved "${tagText}" to portfolio! (${portfolio.length} tags)`);
  sup.set("view", "saved");
}

// Background view actions
function onRerollBackground() {
  sup.set("action", "generateBackground");
}

function onBackToTransparent() {
  sup.set("view", "tag");
}

function onSaveWithBackground() {
  const tagText = sup.message.get("currentTagText");
  const rare = sup.message.get("currentTagRare");
  const bgKey = sup.message.get("currentBgKey");
  const composite = sup.message.get("currentComposite");

  if (!composite) return;

  const bg = BACKGROUNDS[bgKey];
  const portfolio = sup.user.get("tagPortfolio") || [];
  portfolio.push({
    text: tagText,
    image: composite,
    rare: rare,
    backgroundName: bg.name,
    savedAt: Date.now()
  });
  sup.user.set("tagPortfolio", portfolio.slice(-50));

  sup.set("saveMessage", `✅ Saved "${tagText}" on ${bg.name}! (${portfolio.length} tags)`);
  sup.set("view", "saved");
}

// Navigation
function onBackToForm() {
  sup.set("view", "form");
}

function onViewPortfolio() {
  sup.set("portfolioPage", 0);
  sup.set("view", "portfolio");
}

function onViewFavorites() {
  sup.set("view", "favorites");
}

// Portfolio actions
function onPortfolioNewerPage() {
  const page = sup.get("portfolioPage") || 0;
  sup.set("portfolioPage", Math.max(0, page - 1));
}

function onPortfolioOlderPage() {
  const page = sup.get("portfolioPage") || 0;
  sup.set("portfolioPage", page + 1);
}

function onClearPortfolio() {
  sup.set("view", "clearConfirm");
}

function onConfirmClearPortfolio() {
  sup.user.set("tagPortfolio", []);
  sup.set("view", "portfolio");
}

function onCancelClear() {
  sup.set("view", "portfolio");
}

// Favorite style actions
function onSetFavorite(key) {
  sup.user.set("favoriteStyle", key);
}

function onClearFavorite() {
  sup.user.set("favoriteStyle", null);
}

// =============================================================================
// VIEW RENDERERS (called from main based on state)
// =============================================================================

function renderFormView() {
  const favoriteStyle = sup.user.get("favoriteStyle");
  const favName = favoriteStyle ? (STYLE_PRESETS[favoriteStyle]?.name || "Random") : "Random";

  return [
    "🎨 JET GRIND TAG GENERATOR",
    "",
    `Type your tag text (1-3 words, max ${MAX_LENGTH} chars)`,
    "",
    `Current style: ${favName}`,
    "",
    sup.button("⭐ Set Style", onViewFavorites),
    sup.button("📂 Portfolio", onViewPortfolio)
  ];
}

function renderTagView() {
  const tagImage = sup.message.get("currentTag");
  const rare = sup.message.get("currentTagRare");

  const response = [];

  if (rare) {
    response.push(getRareMessage(rare));
  }

  response.push(tagImage);
  response.push(sup.button("🎨 Add Background", onAddBackground));
  response.push(sup.button("💾 Save to Portfolio", onSaveToPortfolio));
  response.push(sup.button("🔄 New Tag", onBackToForm));

  return response;
}

function renderBackgroundView() {
  const composite = sup.message.get("currentComposite");
  const bgKey = sup.message.get("currentBgKey");
  const rare = sup.message.get("currentTagRare");
  const bg = BACKGROUNDS[bgKey];

  const response = [];

  if (rare) {
    response.push(getRareMessage(rare));
  }

  response.push(`📍 ${bg.name}`);
  response.push(composite);
  response.push(sup.button("🔄 Reroll Background", onRerollBackground));
  response.push(sup.button("💾 Save to Portfolio", onSaveWithBackground));
  response.push(sup.button("↩️ Back to Transparent", onBackToTransparent));

  return response;
}

function renderSavedView() {
  const message = sup.get("saveMessage");
  return [
    message,
    sup.button("🎨 Create Another", onBackToForm),
    sup.button("📂 View Portfolio", onViewPortfolio)
  ];
}

function renderPortfolioView() {
  const portfolio = sup.user.get("tagPortfolio") || [];

  if (portfolio.length === 0) {
    return [
      "📂 Your portfolio is empty!",
      "Generate some tags and save them.",
      sup.button("🎨 Create a Tag", onBackToForm)
    ];
  }

  const pageSize = 3;
  const currentPage = sup.get("portfolioPage") || 0;
  const totalPages = Math.ceil(portfolio.length / pageSize);
  const startIdx = portfolio.length - 1 - (currentPage * pageSize);
  const endIdx = Math.max(startIdx - pageSize + 1, 0);

  const response = [
    `📂 Portfolio (${portfolio.length} tags) - Page ${currentPage + 1}/${totalPages}`
  ];

  for (let i = startIdx; i >= endIdx; i--) {
    const tag = portfolio[i];
    const rareLabel = tag.rare ? ` [${tag.rare}]` : "";
    const bgLabel = tag.backgroundName ? ` on ${tag.backgroundName}` : "";
    response.push(`\n"${tag.text}"${rareLabel}${bgLabel}`);
    response.push(tag.image);
  }

  if (currentPage > 0) {
    response.push(sup.button("⬅️ Newer", onPortfolioNewerPage));
  }
  if (currentPage < totalPages - 1) {
    response.push(sup.button("➡️ Older", onPortfolioOlderPage));
  }

  response.push(sup.button("🎨 Create New Tag", onBackToForm));
  response.push(sup.button("🗑️ Clear Portfolio", onClearPortfolio));

  return response;
}

function renderClearConfirmView() {
  return [
    "⚠️ Delete ALL saved tags?",
    sup.button("✅ Yes, Delete All", onConfirmClearPortfolio),
    sup.button("❌ Cancel", onCancelClear)
  ];
}

function renderFavoritesView() {
  const favorite = sup.user.get("favoriteStyle");
  const favName = favorite ? (STYLE_PRESETS[favorite]?.name || "Random") : "None";

  return [
    "⭐ Favorite Style",
    `Current: ${favName}`,
    "",
    sup.button(favorite === "random" ? "🎲 Random ✓" : "🎲 Random", () => onSetFavorite("random")),
    sup.button(favorite === "ggs" ? "⭐ GGs ✓" : "⭐ GGs", () => onSetFavorite("ggs")),
    sup.button(favorite === "noisetanks" ? "⚡ Noise Tanks ✓" : "⚡ Noise Tanks", () => onSetFavorite("noisetanks")),
    sup.button(favorite === "poisonjam" ? "💀 Poison Jam ✓" : "💀 Poison Jam", () => onSetFavorite("poisonjam")),
    sup.button(favorite === "loveshockers" ? "💖 Love Shockers ✓" : "💖 Love Shockers", () => onSetFavorite("loveshockers")),
    "",
    favorite ? sup.button("🗑️ Clear Favorite", onClearFavorite) : null,
    sup.button("↩️ Back", onBackToForm)
  ].filter(Boolean);
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main() {
  // Check for pending actions from button clicks (Dom's pattern)
  const action = sup.get("action");

  if (action === "generateBackground") {
    // Clear action immediately
    sup.set("action", null);

    // Get the existing tag data
    const existingTag = sup.message.get("currentTag");
    const tagText = sup.message.get("currentTagText");
    const rare = sup.message.get("currentTagRare");

    // Safety check
    if (!existingTag || !tagText) {
      return "⚠️ No tag found. Generate a tag first!";
    }

    // Pick random background
    const bgKeys = Object.keys(BACKGROUNDS);
    const randomBgKey = randomChoice(bgKeys);
    const bg = BACKGROUNDS[randomBgKey];

    // Generate composite with tag text on stylized background
    // (Using image.create since image.edit may not preserve the original)
    let tagStyle = "colorful vibrant Jet Set Radio graffiti style with bold colors, thick black outlines, drips and spray paint effects";
    if (rare === "GOLD") {
      tagStyle = "solid shiny gold metallic graffiti letters with gleaming highlights";
    } else if (rare === "HOLOGRAPHIC") {
      tagStyle = "holographic rainbow iridescent chrome graffiti letters";
    } else if (rare === "DIAMOND") {
      tagStyle = "crystalline diamond sparkling gemstone graffiti letters";
    }

    const prompt = `The word "${tagText}" as graffiti spray painted on a wall. The graffiti is in ${tagStyle}. Background: ${bg.prompt}. Wide panoramic format 4:1 aspect ratio. The tag is prominently displayed and clearly readable.`;

    const composite = await sup.ai.image.create(prompt, {
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT
    });

    // Store results
    sup.message.set("currentComposite", composite);
    sup.message.set("currentBgKey", randomBgKey);
    sup.set("view", "background");

    // Return background view
    const response = [];
    if (rare) {
      response.push(getRareMessage(rare));
    }
    response.push(`📍 ${bg.name}`);
    response.push(composite);
    response.push(sup.button("🔄 Reroll Background", onRerollBackground));
    response.push(sup.button("💾 Save to Portfolio", onSaveWithBackground));
    response.push(sup.button("↩️ Back to Transparent", onBackToTransparent));
    return response;
  }

  // Check for text input - generate tag immediately
  const text = sup.input.text;
  if (text && text.trim() !== "") {
    const cleanText = text.trim();

    // Special commands
    const lower = cleanText.toLowerCase();
    if (lower === "portfolio" || lower === "my tags" || lower === "saved") {
      sup.set("view", "portfolio");
    } else if (cleanText.length > MAX_LENGTH) {
      return `🚫 Too long! Max ${MAX_LENGTH} characters (you entered ${cleanText.length}).`;
    } else {
      // Generate tag immediately
      const preset = sup.user.get("favoriteStyle") || "random";
      const result = buildPrompt(cleanText.toUpperCase(), preset);

      const image = await sup.ai.image.create(result.prompt, {
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT
      });

      const imageclipPatch = await sup.patch("/baby/imageclip");
      const transparentImage = await imageclipPatch.run(image);

      // Store for button actions
      sup.message.set("currentTag", transparentImage);
      sup.message.set("currentTagText", cleanText.toUpperCase());
      sup.message.set("currentTagRare", result.rare);
      sup.set("view", "tag");

      // Return tag with buttons
      const response = [];
      if (result.rare) {
        response.push(getRareMessage(result.rare));
      }
      response.push(transparentImage);
      response.push(sup.button("🎨 Add Background", onAddBackground));
      response.push(sup.button("💾 Save to Portfolio", onSaveToPortfolio));
      response.push(sup.button("📂 Portfolio", onViewPortfolio));
      return response;
    }
  }

  // Render based on view state (for other button interactions)
  const view = sup.get("view") || "welcome";

  switch (view) {
    case "tag":
      return renderTagView();
    case "background":
      return renderBackgroundView();
    case "saved":
      return renderSavedView();
    case "portfolio":
      return renderPortfolioView();
    case "clearConfirm":
      return renderClearConfirmView();
    default:
      return [
        "🎨 JET GRIND TAG",
        "",
        "Type any text to generate a graffiti tag!",
        "",
        sup.button("📂 Portfolio", onViewPortfolio)
      ];
  }
}
