// Jet Grind Radio Style Graffiti Tag Generator
// Creates stylized graffiti tags based on user text input
// Repository: https://github.com/heyhaigh/sup-patches

const VERSION = "1.2.16";

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
  "solid pure white background #FFFFFF",
  "clean white background with no texture",
  "pure white background",
  "bright white background"
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
  billboard: { name: "📺 Billboard", prompt: "1999 Dreamcast 3D game screenshot, frontal view, large Japanese advertising billboard on building wall, VERY LOW polygon count chunky 3D geometry, simplified angular shapes, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, muted urban colors with bright sign, PS1 era graphics quality" },
  brick: { name: "🧱 Brick Wall", prompt: "1999 Dreamcast 3D game screenshot, frontal view, weathered red brick wall in alley, VERY LOW polygon count chunky 3D geometry, simplified flat wall with brick texture, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, warm brown and red tones, PS1 era graphics quality" },
  train: { name: "🚃 Train Yard", prompt: "1999 Dreamcast 3D game screenshot, frontal view, silver subway train car side panel, VERY LOW polygon count chunky 3D geometry, simple rectangular metal shapes, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, grey metallic with colored stripe, PS1 era graphics quality" },
  fence: { name: "🌳 Park", prompt: "1999 Dreamcast 3D game screenshot, frontal view, urban park with green chain-link fence, VERY LOW polygon count chunky 3D geometry, extremely simple cone-shaped trees, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, green fence tan ground, PS1 era graphics quality" },
  garage: { name: "🏠 Garage", prompt: "1999 Dreamcast 3D game screenshot, frontal view, underground garage with red support pillars, VERY LOW polygon count chunky 3D geometry, simple box shapes for barrels and crates, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, warm orange rust tones, PS1 era graphics quality" },
  highway: { name: "🛤️ Highway", prompt: "1999 Dreamcast 3D game screenshot, frontal view, highway underpass concrete barrier, VERY LOW polygon count chunky 3D geometry, simple pillar shapes with hazard stripes, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, grey yellow caution colors, PS1 era graphics quality" },
  shutter: { name: "🚪 Shutter", prompt: "1999 Dreamcast 3D game screenshot, frontal view, Japanese storefront metal roll-up shutter, VERY LOW polygon count chunky 3D geometry, simple corrugated door shape, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, grey brown urban tones, PS1 era graphics quality" },
  rooftop: { name: "🌆 Rooftop", prompt: "1999 Dreamcast 3D game screenshot, frontal view, Tokyo rooftop with boxy water tanks, VERY LOW polygon count chunky 3D geometry, simple cube shapes for tanks and AC units, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, grey concrete blue sky, PS1 era graphics quality" },
  alley: { name: "🏚️ Alley", prompt: "1999 Dreamcast 3D game screenshot, frontal view, narrow Tokyo back alley with vending machines, VERY LOW polygon count chunky 3D geometry, simple box shapes, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, warm brown tan concrete, PS1 era graphics quality" },
  factory: { name: "🏭 Factory", prompt: "1999 Dreamcast 3D game screenshot, frontal view, industrial warehouse with red steel beam framework, VERY LOW polygon count chunky 3D geometry, simple beam and pillar shapes, grungy low-res textures, black outlines on edges only, baked shadows, NOT vector art NOT flat illustration, red metal grey concrete, PS1 era graphics quality" }
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

// Simple view → Options view
function onMoreOptions() {
  sup.message.set("view", "tagOptions");
}

// Options view → Simple view
function onBackToSimple() {
  sup.message.set("view", "tag");
}

// Tag view actions - only set state, main() handles async work
function onAddBackground() {
  sup.message.set("action", "generateBackground");
}

function onSaveToTagPortfolio() {
  const tagImage = sup.message.get("currentTag");
  const tagText = sup.message.get("currentTagText");
  const rare = sup.message.get("currentTagRare");

  if (!tagImage) return;

  const portfolio = sup.user.get("tagPortfolio") || [];
  portfolio.push({
    text: tagText,
    image: tagImage,
    rare: rare,
    savedAt: Date.now()
  });
  sup.user.set("tagPortfolio", portfolio.slice(-50));

  sup.message.set("saveMessage", `✅ Saved "${tagText}" to Tag Portfolio! (${portfolio.length} tags)`);
  sup.message.set("view", "saved");
}

// Background view actions
function onRerollBackground() {
  sup.message.set("action", "generateBackground");
}

function onBackToTransparent() {
  sup.message.set("view", "tag");
}

function onSaveToPhotoJournal() {
  const tagText = sup.message.get("currentTagText");
  const rare = sup.message.get("currentTagRare");
  const bgKey = sup.message.get("currentBgKey");
  const composite = sup.message.get("currentComposite");

  if (!composite) return;

  const bg = BACKGROUNDS[bgKey];
  const journal = sup.user.get("photoJournal") || [];
  journal.push({
    text: tagText,
    image: composite,
    rare: rare,
    backdropName: bg.name,
    savedAt: Date.now()
  });
  sup.user.set("photoJournal", journal.slice(-50));

  sup.message.set("saveMessage", `✅ Saved "${tagText}" on ${bg.name} to Photo Journal! (${journal.length} photos)`);
  sup.message.set("view", "saved");
}

// Navigation
function onBackToTag() {
  sup.message.set("view", "tag");
}

function onViewTagPortfolio() {
  sup.message.set("portfolioPage", 0);
  sup.message.set("view", "tagPortfolio");
}

function onViewPhotoJournal() {
  sup.message.set("journalPage", 0);
  sup.message.set("view", "photoJournal");
}

// Tag Portfolio actions
function onPortfolioNewerPage() {
  const page = sup.message.get("portfolioPage") || 0;
  sup.message.set("portfolioPage", Math.max(0, page - 1));
}

function onPortfolioOlderPage() {
  const page = sup.message.get("portfolioPage") || 0;
  sup.message.set("portfolioPage", page + 1);
}

function onViewPortfolioItem(index) {
  sup.message.set("selectedPortfolioIndex", index);
  sup.message.set("view", "portfolioDetail");
}

function onRemovePortfolioItem() {
  const index = sup.message.get("selectedPortfolioIndex");
  const portfolio = sup.user.get("tagPortfolio") || [];
  if (index >= 0 && index < portfolio.length) {
    portfolio.splice(index, 1);
    sup.user.set("tagPortfolio", portfolio);
  }
  sup.message.set("view", "tagPortfolio");
}

function onAddBackdropFromPortfolio() {
  const index = sup.message.get("selectedPortfolioIndex");
  const portfolio = sup.user.get("tagPortfolio") || [];
  if (index >= 0 && index < portfolio.length) {
    const tag = portfolio[index];
    // Set this tag as the current tag for backdrop generation
    sup.message.set("currentTag", tag.image);
    sup.message.set("currentTagText", tag.text);
    sup.message.set("currentTagRare", tag.rare);
    // Trigger backdrop generation
    sup.message.set("action", "generateBackground");
  }
}

// Photo Journal actions
function onJournalNewerPage() {
  const page = sup.message.get("journalPage") || 0;
  sup.message.set("journalPage", Math.max(0, page - 1));
}

function onJournalOlderPage() {
  const page = sup.message.get("journalPage") || 0;
  sup.message.set("journalPage", page + 1);
}

function onViewJournalItem(index) {
  sup.message.set("selectedJournalIndex", index);
  sup.message.set("view", "journalDetail");
}

function onRemoveJournalItem() {
  const index = sup.message.get("selectedJournalIndex");
  const journal = sup.user.get("photoJournal") || [];
  if (index >= 0 && index < journal.length) {
    journal.splice(index, 1);
    sup.user.set("photoJournal", journal);
  }
  sup.message.set("view", "photoJournal");
}

// Favorite style actions
function onViewFavorites() {
  sup.message.set("view", "favorites");
}

function onSetFavorite(key) {
  sup.user.set("favoriteStyle", key);
}

function onClearFavorite() {
  sup.user.set("favoriteStyle", null);
}

function onBackToWelcome() {
  sup.message.set("view", "welcome");
}

// =============================================================================
// VIEW RENDERERS (called from main based on state)
// =============================================================================

// Simple tag view - just the tag + "More Options" button
function renderTagView() {
  const tagImage = sup.message.get("currentTag");
  const rare = sup.message.get("currentTagRare");

  const response = [];

  if (rare) {
    response.push(getRareMessage(rare));
  }

  response.push(tagImage);
  response.push(sup.button("⚙️ More Options", onMoreOptions));

  return response;
}

// Expanded options view - all the buttons
function renderTagOptionsView() {
  const tagImage = sup.message.get("currentTag");
  const rare = sup.message.get("currentTagRare");

  const response = [];

  if (rare) {
    response.push(getRareMessage(rare));
  }

  response.push(tagImage);
  response.push(sup.button("🎨 Add Backdrop", onAddBackground));
  response.push(sup.button("💾 Save to Tag Portfolio", onSaveToTagPortfolio));
  response.push(sup.button("🏷️ Tag Portfolio", onViewTagPortfolio));
  response.push(sup.button("📸 Photo Journal", onViewPhotoJournal));
  response.push(sup.button("↩️ Back to Simple View", onBackToSimple));

  return response;
}

function renderBackdropView() {
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
  response.push(sup.button("🔄 Reroll Backdrop", onRerollBackground));
  response.push(sup.button("💾 Save to Photo Journal", onSaveToPhotoJournal));
  response.push(sup.button("↩️ Back to Original", onBackToTransparent));

  return response;
}

function renderSavedView() {
  const message = sup.message.get("saveMessage");
  return [
    message,
    sup.button("↩️ Back to Tag", onBackToTag),
    sup.button("🏷️ Tag Portfolio", onViewTagPortfolio),
    sup.button("📸 Photo Journal", onViewPhotoJournal)
  ];
}

function renderTagPortfolioView() {
  const portfolio = sup.user.get("tagPortfolio") || [];
  const hasCurrentTag = sup.message.get("currentTag");
  const pageSize = 6;

  const response = [
    `🏷️ Tag Portfolio (${portfolio.length}/50)`
  ];

  if (portfolio.length === 0) {
    response.push("");
    response.push("No tags saved yet!");
    response.push("Generate a tag and save it here.");
  } else {
    const currentPage = sup.message.get("portfolioPage") || 0;
    const totalPages = Math.ceil(portfolio.length / pageSize);

    // Calculate which items to show (newest first)
    const startIdx = portfolio.length - 1 - (currentPage * pageSize);
    const endIdx = Math.max(0, startIdx - pageSize + 1);

    response.push(`Page ${currentPage + 1}/${totalPages}`);

    // TEST 2: Template literal with simple variable
    const count = portfolio.length;
    response.push(sup.html(`<div style="padding:20px;background:white;"><h2>You have ${count} tags</h2></div>`, { width: 300, height: 100, type: 'image' }));

    response.push("");

    // Display thumbnails with edit buttons below each
    for (let i = startIdx; i >= endIdx; i--) {
      const tag = portfolio[i];
      response.push(tag.image);
      response.push(sup.button("✏️ Edit Tag", () => onViewPortfolioItem(i)));
    }

    // Pagination
    if (totalPages > 1) {
      response.push("");
      if (currentPage > 0) {
        response.push(sup.button("⬅️ Newer", onPortfolioNewerPage));
      }
      if (currentPage < totalPages - 1) {
        response.push(sup.button("➡️ Older", onPortfolioOlderPage));
      }
    }
  }

  response.push("");
  if (hasCurrentTag) {
    response.push(sup.button("↩️ Back to Tag", onBackToTag));
  }
  response.push(sup.button("📸 Photo Journal", onViewPhotoJournal));

  return response;
}

function renderPortfolioDetailView() {
  const portfolio = sup.user.get("tagPortfolio") || [];
  const index = sup.message.get("selectedPortfolioIndex");

  if (index === undefined || index < 0 || index >= portfolio.length) {
    return [
      "Tag not found",
      sup.button("↩️ Back to Portfolio", onViewTagPortfolio)
    ];
  }

  const tag = portfolio[index];
  const rareLabel = tag.rare ? ` ✨${tag.rare}` : "";

  return [
    `🏷️ "${tag.text}"${rareLabel}`,
    tag.image,
    sup.button("🎨 Add Backdrop", onAddBackdropFromPortfolio),
    sup.button("🗑️ Remove from Portfolio", onRemovePortfolioItem),
    sup.button("↩️ Back to Portfolio", onViewTagPortfolio)
  ];
}

function renderPhotoJournalView() {
  const journal = sup.user.get("photoJournal") || [];
  const hasCurrentTag = sup.message.get("currentTag");
  const pageSize = 6;

  const response = [
    `📸 Photo Journal (${journal.length}/50)`
  ];

  if (journal.length === 0) {
    response.push("");
    response.push("No photos saved yet!");
    response.push("Add a backdrop to a tag and save it here.");
  } else {
    const currentPage = sup.message.get("journalPage") || 0;
    const totalPages = Math.ceil(journal.length / pageSize);

    // Calculate which items to show (newest first)
    const startIdx = journal.length - 1 - (currentPage * pageSize);
    const endIdx = Math.max(0, startIdx - pageSize + 1);

    response.push(`Page ${currentPage + 1}/${totalPages}`);
    response.push("");

    // Display thumbnails with edit buttons below each
    for (let i = startIdx; i >= endIdx; i--) {
      const photo = journal[i];
      response.push(photo.image);
      response.push(sup.button("✏️ Edit Photo", () => onViewJournalItem(i)));
    }

    // Pagination
    if (totalPages > 1) {
      response.push("");
      if (currentPage > 0) {
        response.push(sup.button("⬅️ Newer", onJournalNewerPage));
      }
      if (currentPage < totalPages - 1) {
        response.push(sup.button("➡️ Older", onJournalOlderPage));
      }
    }
  }

  response.push("");
  if (hasCurrentTag) {
    response.push(sup.button("↩️ Back to Tag", onBackToTag));
  }
  response.push(sup.button("🏷️ Tag Portfolio", onViewTagPortfolio));

  return response;
}

function renderJournalDetailView() {
  const journal = sup.user.get("photoJournal") || [];
  const index = sup.message.get("selectedJournalIndex");

  if (index === undefined || index < 0 || index >= journal.length) {
    return [
      "Photo not found",
      sup.button("↩️ Back to Journal", onViewPhotoJournal)
    ];
  }

  const photo = journal[index];
  const rareLabel = photo.rare ? ` ✨${photo.rare}` : "";

  return [
    `📸 "${photo.text}" on ${photo.backdropName}${rareLabel}`,
    photo.image,
    sup.button("🗑️ Remove from Photo Journal", onRemoveJournalItem),
    sup.button("↩️ Back to Photo Journal", onViewPhotoJournal)
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
    sup.button("↩️ Back", onBackToWelcome)
  ].filter(Boolean);
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main() {
  // Check for pending actions from button clicks (Dom's pattern)
  const action = sup.message.get("action");

  if (action === "generateBackground") {
    // Clear action immediately
    sup.message.set("action", null);

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

    // Try to use image.edit to add background behind existing tag
    // IMPORTANT: Explicit size/placement instructions for consistency
    const editPrompt = `Add a background BEHIND this graffiti tag. CRITICAL: Keep the graffiti at EXACTLY its current size - do NOT resize, scale, shrink or enlarge the graffiti. Keep the graffiti CENTERED in the frame. Only replace the white/transparent background with: ${bg.prompt}. The graffiti must remain the dominant element taking up most of the frame width. Do not move or reposition the graffiti.`;

    const composite = await sup.ai.image.edit(existingTag, editPrompt);

    // Store results
    sup.message.set("currentComposite", composite);
    sup.message.set("currentBgKey", randomBgKey);
    sup.message.set("view", "background");

    // Return backdrop view
    const response = [];
    if (rare) {
      response.push(getRareMessage(rare));
    }
    response.push(`📍 ${bg.name}`);
    response.push(composite);
    response.push(sup.button("🔄 Reroll Backdrop", onRerollBackground));
    response.push(sup.button("💾 Save to Photo Journal", onSaveToPhotoJournal));
    response.push(sup.button("↩️ Back to Original", onBackToTransparent));
    return response;
  }

  // Check for text input - generate tag immediately
  // IMPORTANT: Skip if we already have a view set (user is interacting with existing session)
  // This prevents reply context from triggering validation errors
  const existingView = sup.message.get("view");
  const hasExistingTag = sup.message.get("currentTag");

  const text = sup.input.text;
  if (text && text.trim() !== "" && !existingView && !hasExistingTag) {
    const cleanText = text.trim();

    // Special commands
    const lower = cleanText.toLowerCase();
    if (lower === "tags" || lower === "portfolio") {
      sup.message.set("view", "tagPortfolio");
    } else if (lower === "photos" || lower === "journal") {
      sup.message.set("view", "photoJournal");
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
      sup.message.set("view", "tag");

      // Return SIMPLE tag view with just "More Options" button
      const response = [];
      if (result.rare) {
        response.push(getRareMessage(result.rare));
      }
      response.push(transparentImage);
      response.push(sup.button("⚙️ More Options", onMoreOptions));
      return response;
    }
  }

  // Render based on view state (for other button interactions)
  const view = sup.message.get("view") || "welcome";

  switch (view) {
    case "tag":
      return renderTagView();
    case "tagOptions":
      return renderTagOptionsView();
    case "background":
      return renderBackdropView();
    case "saved":
      return renderSavedView();
    case "tagPortfolio":
      return renderTagPortfolioView();
    case "portfolioDetail":
      return renderPortfolioDetailView();
    case "photoJournal":
      return renderPhotoJournalView();
    case "journalDetail":
      return renderJournalDetailView();
    case "favorites":
      return renderFavoritesView();
    default:
      const favoriteStyle = sup.user.get("favoriteStyle");
      const styleName = favoriteStyle ? (STYLE_PRESETS[favoriteStyle]?.name || "Random") : "Random";
      return [
        "🎨 JET GRIND TAG",
        "",
        "Type any text to generate a graffiti tag!",
        `Style: ${styleName}`,
        "",
        sup.button("⭐ Set Style", onViewFavorites),
        sup.button("🏷️ Tag Portfolio", onViewTagPortfolio),
        sup.button("📸 Photo Journal", onViewPhotoJournal)
      ];
  }
}
