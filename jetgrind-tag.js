// Jet Grind Radio Style Graffiti Tag Generator
// Creates stylized graffiti tags based on user text input

// Style variation pools for randomization
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

// Solid backgrounds that are easy to clip/remove
const BACKGROUND_EFFECTS = [
  "solid flat white background",
  "solid flat light gray background",
  "clean white background with no texture",
  "pure white background",
  "flat off-white background"
];

// Spray paint and painterly texture effects
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

// === QUICK WINS ===

// 1. Aggressive outline styles
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

// 2. Drip extensions
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

// 3. Decorative elements
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

// 4. Shadow styles
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

// === MEDIUM EFFORT FEATURES ===

// Japanese text elements (randomly added as accents)
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

// Character cameos (silhouettes integrated into design)
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

// Style presets inspired by JGR gangs
const STYLE_PRESETS = {
  random: null, // Uses default random selection

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

// === RARE ELEMENTS (super low drop rate) ===

const RARE_DROPS = [
  {
    name: "GOLD",
    chance: 5, // 5% chance
    prompt: (text) => `Ultra luxurious solid GOLD graffiti tag artwork. The word "${text}" in bold 3D letters made entirely of shiny polished gold metal. Gleaming reflective gold surface with bright specular highlights and light rays. Dripping with liquid gold, gold sparkles and gold dust particles floating around. Diamond and gem encrusted accents. Bling aesthetic with brilliant shine. Chrome gold metallic finish catching light from multiple angles. Luxurious wealthy opulent style. Gold bars and gold coins scattered as decorations. Rich solid gold with no other colors. Solid white background for clean clipping. Wide panoramic landscape format.`
  },
  {
    name: "HOLOGRAPHIC",
    chance: 3, // 3% chance
    prompt: (text) => `Holographic rainbow iridescent graffiti tag artwork. The word "${text}" in chrome letters with shifting rainbow holographic finish. Prismatic light refraction creating rainbow spectrum colors that shift and change. Iridescent mother-of-pearl sheen. Laser hologram effect with light diffraction patterns. Cyberpunk futuristic chrome with rainbow oil-slick coloring. Shimmering pearlescent surface. Y2K aesthetic holographic style. Solid white background. Wide panoramic landscape format.`
  },
  {
    name: "DIAMOND",
    chance: 1, // 1% chance - ultra rare!
    prompt: (text) => `Crystalline diamond and ice graffiti tag artwork. The word "${text}" made entirely of sparkling cut diamonds and clear crystals. Brilliant light refraction through transparent gemstones. Icy frozen aesthetic with frost and snowflake accents. Luxury jewelry quality diamonds catching light. Prismatic rainbow light scattered through crystal facets. Glittering platinum and silver metallic accents. Frozen ice drips. Ultra premium precious gemstone aesthetic. Solid white background. Wide panoramic landscape format.`
  }
];

// Helper to pick random element from array
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random chance helper (returns true X% of the time)
function chance(percent) {
  return Math.random() * 100 < percent;
}

// Check for rare drop
function checkRareDrop() {
  for (const rare of RARE_DROPS) {
    if (chance(rare.chance)) {
      return rare;
    }
  }
  return null;
}

// Build the generation prompt (always transparent for initial generation)
function buildPrompt(text, presetKey = "random") {
  // Check for rare drop first (unless using a specific preset)
  if (presetKey === "random") {
    const rareDrop = checkRareDrop();
    if (rareDrop) {
      return { prompt: rareDrop.prompt(text), rare: rareDrop.name };
    }
  }

  const preset = STYLE_PRESETS[presetKey];

  // Use preset values if available, otherwise random from full pools
  const colors = preset?.colors ? randomChoice(preset.colors) : randomChoice(COLOR_PALETTES);
  const letters = preset?.letters ? randomChoice(preset.letters) : randomChoice(LETTER_STYLES);
  const flourish = preset?.flourish ? randomChoice(preset.flourish) : randomChoice(FLOURISH_TYPES);
  const decorations = preset?.decorations ? randomChoice(preset.decorations) : randomChoice(DECORATIVE_ELEMENTS);
  const outline = preset?.outline ? randomChoice(preset.outline) : randomChoice(OUTLINE_STYLES);
  const shadow = preset?.shadow ? randomChoice(preset.shadow) : randomChoice(SHADOW_STYLES);
  const drips = preset?.drips ? randomChoice(preset.drips) : randomChoice(DRIP_EFFECTS);
  const presetVibe = preset?.vibe || "";

  // Always random (not preset-specific)
  const texture = randomChoice(TEXTURE_PATTERNS);
  const sprayTexture = randomChoice(SPRAY_TEXTURES);
  const paintTechnique = randomChoice(PAINT_TECHNIQUES);

  // Always use solid background for clipping (backgrounds added post-generation)
  const backgroundPrompt = randomChoice(BACKGROUND_EFFECTS);

  // Japanese elements - 40% chance to include
  const japaneseElement = chance(40) ? `JAPANESE ACCENT: ${randomChoice(JAPANESE_ELEMENTS)}.` : "";

  // Character cameo - 30% chance to include
  const characterCameo = chance(30) ? `CHARACTER: ${randomChoice(CHARACTER_CAMEOS)}.` : "";

  // Build the prompt
  let prompt = `Jet Set Radio / Jet Grind Radio video game style graffiti tag artwork, real spray paint on wall aesthetic. The word "${text}" written in ${letters}, colored with ${colors}. Letters have ${texture}. OUTLINES: ${outline}. DRIPS: ${drips}. DECORATIONS: ${decorations}. SHADOW: ${shadow}. ${japaneseElement} ${characterCameo} Decorated with ${flourish} around and between the letters. Painted with authentic spray paint texture: ${sprayTexture}. Technique style: ${paintTechnique}. ${backgroundPrompt}. Wide panoramic landscape format, stylized Japanese video game graffiti art but with realistic spray paint material qualities, bold graphic design, high contrast colors, genuine aerosol paint aesthetic with visible paint texture and spray artifacts, urban street art.`;

  // Add preset vibe if using a preset
  if (presetVibe) {
    prompt += ` Style vibe: ${presetVibe}.`;
  }

  return { prompt, rare: null };
}

const MAX_LENGTH = 20;

// === BACKGROUND SURFACES ===
const BACKGROUNDS = {
  none: null, // Transparent (default)

  brick: {
    name: "🧱 Brick Wall",
    prompt: "on a gritty urban red brick wall with weathered mortar, some bricks cracked and worn, street lighting casting shadows"
  },
  concrete: {
    name: "🏢 Concrete",
    prompt: "on a raw concrete wall with texture and imperfections, urban underpass vibes, industrial setting"
  },
  dumpster: {
    name: "🗑️ Dumpster",
    prompt: "spray painted on the side of a green metal dumpster in an alley, rust spots and dents visible"
  },
  train: {
    name: "🚃 Train Car",
    prompt: "on the side of a silver subway train car, metal panels and rivets visible, train yard setting"
  },
  billboard: {
    name: "📋 Billboard",
    prompt: "painted over an old billboard advertisement, peeling posters underneath, rooftop urban setting"
  },
  shutter: {
    name: "🚪 Metal Shutter",
    prompt: "on a corrugated metal roll-up shutter door of a closed shop, urban storefront at night"
  },
  highway: {
    name: "🛣️ Highway Wall",
    prompt: "on a highway sound barrier wall, concrete with drainage stains, cars blurred in background"
  },
  container: {
    name: "📦 Shipping Container",
    prompt: "on a rusty shipping container at the docks, industrial port setting, stacked containers behind"
  },
  tunnel: {
    name: "🚇 Tunnel",
    prompt: "inside a dark urban tunnel or underpass, curved concrete walls, dramatic lighting from entrance"
  },
  rooftop: {
    name: "🏙️ Rooftop",
    prompt: "on a rooftop water tank or HVAC unit, city skyline in background, urban exploration vibes"
  }
};

// Output dimensions (4:1 aspect ratio)
const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 256;

// Generate the graffiti tag image (always transparent)
async function generateTag(text, presetKey = "random") {
  const cleanText = text.trim().toUpperCase();
  const result = buildPrompt(cleanText, presetKey);

  // Generate at 1024x256 (4:1 ratio, higher res than 512x128)
  const image = await sup.ai.image.create(result.prompt, {
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT
  });

  // Always remove background for transparent output
  const imageclipPatch = await sup.patch("/baby/imageclip");
  const transparentImage = await imageclipPatch.run(image);

  // Store the tag for later use (backgrounds, portfolio)
  sup.message.set("currentTag", transparentImage);
  sup.message.set("currentTagText", cleanText);
  sup.message.set("currentTagRare", result.rare);

  // Build response with tag and action buttons
  const response = [];

  // Add rare message if applicable
  if (result.rare) {
    const rareMessages = {
      GOLD: "✨🏆 RARE TAG: SOLID GOLD! 🏆✨",
      HOLOGRAPHIC: "✨🌈 RARE TAG: HOLOGRAPHIC! 🌈✨",
      DIAMOND: "✨💎 GRAIL TAG: DIAMOND! 💎✨"
    };
    response.push(rareMessages[result.rare]);
  }

  // Add the tag image
  response.push(transparentImage);

  // Add action buttons
  response.push(sup.button("🎨 Add Background", handleAddBackground));
  response.push(sup.button("💾 Save to Portfolio", handleSaveToPortfolio));

  return response;
}

// Generate a random background image
async function generateBackground(bgKey) {
  const bg = BACKGROUNDS[bgKey];
  if (!bg) return null;

  const bgPrompt = `Illustrated stylized urban scene, ${bg.prompt}. Wide panoramic landscape format 4:1 aspect ratio. Jet Set Radio / Jet Grind Radio video game art style, cel-shaded, colorful, detailed environment, no text or graffiti, empty wall space in center for graffiti placement.`;

  const bgImage = await sup.ai.image.create(bgPrompt, {
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT
  });

  return bgImage;
}

// Composite tag on background using HTML
function compositeTagOnBackground(tagImage, bgImage, bgName) {
  return (
    <html type="image" width={OUTPUT_WIDTH} height={OUTPUT_HEIGHT}>
      <div className="relative w-full h-full">
        <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" />
        <img src={tagImage} className="absolute inset-0 w-full h-full object-contain" />
      </div>
    </html>
  );
}

// Handler for "Add Background" button
async function handleAddBackground() {
  const tagImage = sup.message.get("currentTag");
  if (!tagImage) {
    return "🚫 No tag found. Generate a tag first!";
  }

  // Pick a random background (excluding "none")
  const bgKeys = Object.keys(BACKGROUNDS).filter(k => k !== "none");
  const randomBgKey = randomChoice(bgKeys);
  const bg = BACKGROUNDS[randomBgKey];

  // Generate the background
  const bgImage = await generateBackground(randomBgKey);

  // Store current background for reroll/save
  sup.message.set("currentBgKey", randomBgKey);
  sup.message.set("currentBgImage", bgImage);

  // Composite and return with action buttons
  const composite = compositeTagOnBackground(tagImage, bgImage, bg.name);

  return [
    `📍 ${bg.name}`,
    composite,
    sup.button("🔄 Reroll Background", handleRerollBackground),
    sup.button("💾 Save to Portfolio", handleSaveWithBackground),
    sup.button("↩️ Back to Transparent", handleBackToTransparent)
  ];
}

// Handler for rerolling background
async function handleRerollBackground() {
  return await handleAddBackground(); // Just generate a new random one
}

// Handler to go back to transparent tag
function handleBackToTransparent() {
  const tagImage = sup.message.get("currentTag");
  const rare = sup.message.get("currentTagRare");

  if (!tagImage) {
    return "🚫 No tag found.";
  }

  const response = [];
  if (rare) {
    const rareMessages = {
      GOLD: "✨🏆 RARE TAG: SOLID GOLD! 🏆✨",
      HOLOGRAPHIC: "✨🌈 RARE TAG: HOLOGRAPHIC! 🌈✨",
      DIAMOND: "✨💎 GRAIL TAG: DIAMOND! 💎✨"
    };
    response.push(rareMessages[rare]);
  }

  response.push(tagImage);
  response.push(sup.button("🎨 Add Background", handleAddBackground));
  response.push(sup.button("💾 Save to Portfolio", handleSaveToPortfolio));

  return response;
}

// Save transparent tag to portfolio
async function handleSaveToPortfolio() {
  const tagImage = sup.message.get("currentTag");
  const tagText = sup.message.get("currentTagText");
  const rare = sup.message.get("currentTagRare");

  if (!tagImage) {
    return "🚫 No tag to save!";
  }

  // Get existing portfolio or create new
  const portfolio = sup.user.get("tagPortfolio") || [];

  // Add new entry
  portfolio.push({
    text: tagText,
    image: tagImage,
    rare: rare,
    background: null,
    savedAt: Date.now()
  });

  // Save back (keep last 50)
  sup.user.set("tagPortfolio", portfolio.slice(-50));

  return [`✅ Saved "${tagText}" to your portfolio! (${portfolio.length} tags saved)`];
}

// Save tag with background to portfolio
async function handleSaveWithBackground() {
  const tagImage = sup.message.get("currentTag");
  const tagText = sup.message.get("currentTagText");
  const rare = sup.message.get("currentTagRare");
  const bgKey = sup.message.get("currentBgKey");
  const bgImage = sup.message.get("currentBgImage");

  if (!tagImage || !bgImage) {
    return "🚫 No tag or background to save!";
  }

  const bg = BACKGROUNDS[bgKey];

  // Get existing portfolio or create new
  const portfolio = sup.user.get("tagPortfolio") || [];

  // Add new entry with background
  portfolio.push({
    text: tagText,
    image: tagImage,
    rare: rare,
    background: { key: bgKey, name: bg.name, image: bgImage },
    savedAt: Date.now()
  });

  // Save back (keep last 50)
  sup.user.set("tagPortfolio", portfolio.slice(-50));

  return [`✅ Saved "${tagText}" on ${bg.name} to your portfolio! (${portfolio.length} tags saved)`];
}

// Button handler for form submission
async function handleTag(text, presetKey = "random") {
  if (!text || text.trim() === "") {
    return "🚫 Enter some text first!";
  }
  if (text.trim().length > MAX_LENGTH) {
    return `🚫 Too long! Max ${MAX_LENGTH} characters (you entered ${text.trim().length}). Keep it short!`;
  }
  return await generateTag(text, presetKey);
}

// Render the input form UI
function renderForm() {
  const currentText = sup.message.get("inputText") || "";
  const selectedPreset = sup.message.get("selectedPreset") || "random";
  const charCount = currentText.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = charCount === 0;
  const isDisabled = isEmpty || isOverLimit;

  // Style button configs
  const styleButtons = [
    { key: "random", label: "🎲 RANDOM", color: "from-gray-600 to-gray-800" },
    { key: "ggs", label: "⭐ GGs", color: "from-green-500 to-pink-500" },
    { key: "noisetanks", label: "⚡ NOISE", color: "from-cyan-500 to-blue-700" },
    { key: "poisonjam", label: "💀 POISON", color: "from-red-700 to-green-900" },
    { key: "loveshockers", label: "💖 LOVE", color: "from-pink-500 to-red-500" },
  ];

  return (
    <html type="html" width={400} height={200}>
      <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-purple-900 via-black to-green-900 h-full font-mono">
        <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-pink-500 to-cyan-400">
          JET GRIND TAG
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Enter your tag..."
            value={currentText}
            onChange={(e) => {
              sup.message.set("inputText", e.target.value);
            }}
            className={`w-full px-3 py-2 bg-black/50 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none ${
              isOverLimit
                ? "border-red-500 text-red-400"
                : "border-green-500 focus:border-pink-500"
            }`}
            maxLength={25}
          />

          <div className="flex justify-between text-xs">
            <span className={isOverLimit ? "text-red-400" : "text-gray-400"}>
              {isOverLimit ? "Too long! Max 20 characters" : "1-3 words work best"}
            </span>
            <span className={isOverLimit ? "text-red-400 font-bold" : "text-gray-400"}>
              {charCount}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Style preset selector */}
        <div className="flex gap-1">
          {styleButtons.map((style) => (
            <button
              key={style.key}
              onClick={() => sup.message.set("selectedPreset", style.key)}
              className={`flex-1 py-1 px-1 rounded text-xs font-bold transition-all ${
                selectedPreset === style.key
                  ? `bg-gradient-to-r ${style.color} text-white ring-2 ring-white`
                  : "bg-black/50 text-gray-400 hover:text-white"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleTag(currentText, selectedPreset)}
            disabled={isDisabled}
            className={`flex-1 py-2 rounded-lg font-bold text-lg transition-all ${
              isDisabled
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 via-pink-500 to-cyan-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50"
            }`}
          >
            TAG
          </button>
          <button
            onClick={() => handleViewPortfolio()}
            className="px-3 py-2 rounded-lg font-bold text-sm bg-black/50 text-gray-300 hover:text-white hover:bg-black/70 transition-all"
          >
            📂
          </button>
        </div>
      </div>
    </html>
  );
}

// === PORTFOLIO VIEWER ===

// View portfolio handler
function handleViewPortfolio() {
  const portfolio = sup.user.get("tagPortfolio") || [];

  if (portfolio.length === 0) {
    return [
      "📂 Your portfolio is empty!",
      "Generate some tags and save them to build your collection.",
      sup.button("🎨 Create a Tag", () => renderForm())
    ];
  }

  // Show most recent first
  const pageSize = 5;
  const currentPage = sup.message.get("portfolioPage") || 0;
  const totalPages = Math.ceil(portfolio.length / pageSize);
  const startIdx = portfolio.length - 1 - (currentPage * pageSize);
  const endIdx = Math.max(startIdx - pageSize + 1, 0);

  const response = [
    `📂 Your Portfolio (${portfolio.length} tags) - Page ${currentPage + 1}/${totalPages}`
  ];

  // Show tags for current page (newest first)
  for (let i = startIdx; i >= endIdx; i--) {
    const tag = portfolio[i];
    const rareLabel = tag.rare ? ` [${tag.rare}]` : "";
    const bgLabel = tag.background ? ` on ${tag.background.name}` : "";
    const date = new Date(tag.savedAt).toLocaleDateString();

    response.push(`\n"${tag.text}"${rareLabel}${bgLabel} - ${date}`);

    // Show the image (with background if saved with one)
    if (tag.background) {
      response.push(compositeTagOnBackground(tag.image, tag.background.image, tag.background.name));
    } else {
      response.push(tag.image);
    }
  }

  // Pagination buttons
  const navButtons = [];
  if (currentPage > 0) {
    navButtons.push(sup.button("⬅️ Newer", () => {
      sup.message.set("portfolioPage", currentPage - 1);
      return handleViewPortfolio();
    }));
  }
  if (currentPage < totalPages - 1) {
    navButtons.push(sup.button("➡️ Older", () => {
      sup.message.set("portfolioPage", currentPage + 1);
      return handleViewPortfolio();
    }));
  }

  if (navButtons.length > 0) {
    response.push(...navButtons);
  }

  // Action buttons
  response.push(sup.button("🎨 Create New Tag", () => renderForm()));
  response.push(sup.button("🗑️ Clear Portfolio", handleClearPortfolio));

  return response;
}

// Clear portfolio confirmation
function handleClearPortfolio() {
  return [
    "⚠️ Are you sure you want to delete ALL your saved tags?",
    sup.button("✅ Yes, Delete All", handleConfirmClearPortfolio),
    sup.button("❌ Cancel", handleViewPortfolio)
  ];
}

// Confirm clear portfolio
function handleConfirmClearPortfolio() {
  sup.user.set("tagPortfolio", []);
  return [
    "🗑️ Portfolio cleared!",
    sup.button("🎨 Create a Tag", () => renderForm())
  ];
}

// Main entry point
async function main() {
  const text = sup.input.text;

  // If no text input, show the form UI
  if (!text || text.trim() === "") {
    return renderForm();
  }

  // Check for special commands
  const lowerText = text.trim().toLowerCase();
  if (lowerText === "portfolio" || lowerText === "my tags" || lowerText === "saved") {
    return handleViewPortfolio();
  }

  // Direct text input - validate and generate
  const cleanText = text.trim();

  if (cleanText.length > MAX_LENGTH) {
    return `🚫 Too long! Max ${MAX_LENGTH} characters (you entered ${cleanText.length}). Keep it short!`;
  }

  return await generateTag(cleanText);
}
