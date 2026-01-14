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

// Helper to pick random element from array
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random chance helper (returns true X% of the time)
function chance(percent) {
  return Math.random() * 100 < percent;
}

// Build the generation prompt
function buildPrompt(text, presetKey = "random") {
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
  const background = randomChoice(BACKGROUND_EFFECTS);
  const sprayTexture = randomChoice(SPRAY_TEXTURES);
  const paintTechnique = randomChoice(PAINT_TECHNIQUES);

  // Japanese elements - 40% chance to include
  const japaneseElement = chance(40) ? `JAPANESE ACCENT: ${randomChoice(JAPANESE_ELEMENTS)}.` : "";

  // Character cameo - 30% chance to include
  const characterCameo = chance(30) ? `CHARACTER: ${randomChoice(CHARACTER_CAMEOS)}.` : "";

  // Build the prompt
  let prompt = `Jet Set Radio / Jet Grind Radio video game style graffiti tag artwork, real spray paint on wall aesthetic. The word "${text}" written in ${letters}, colored with ${colors}. Letters have ${texture}. OUTLINES: ${outline}. DRIPS: ${drips}. DECORATIONS: ${decorations}. SHADOW: ${shadow}. ${japaneseElement} ${characterCameo} Decorated with ${flourish} around and between the letters. Painted with authentic spray paint texture: ${sprayTexture}. Technique style: ${paintTechnique}. ${background}. Wide panoramic landscape format, stylized Japanese video game graffiti art but with realistic spray paint material qualities, bold graphic design, high contrast colors, genuine aerosol paint aesthetic with visible paint texture and spray artifacts, urban street art.`;

  // Add preset vibe if using a preset
  if (presetVibe) {
    prompt += ` Style vibe: ${presetVibe}.`;
  }

  return prompt;
}

const MAX_LENGTH = 20;

// Styled error message display
function renderError(message, subtitle) {
  return (
    <html type="image" width={1024} height={256}>
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-red-900 via-black to-red-900 font-mono">
        <div className="text-6xl mb-4">🚫</div>
        <div className="text-2xl font-bold text-red-400 mb-2 tracking-wider">
          {message}
        </div>
        <div className="text-sm text-gray-400">
          {subtitle}
        </div>
      </div>
    </html>
  );
}

// Output dimensions (4:1 aspect ratio)
const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 256;

// Generate the graffiti tag image
async function generateTag(text, presetKey = "random") {
  const cleanText = text.trim().toUpperCase();
  const prompt = buildPrompt(cleanText, presetKey);

  // Generate at 1024x256 (4:1 ratio, higher res than 512x128)
  const image = await sup.ai.image.create(prompt, {
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT
  });

  // Use imageclip patch to remove background and make transparent
  const imageclipPatch = await sup.patch("/baby/imageclip");
  const transparentImage = await imageclipPatch.run(image);

  return transparentImage;
}

// Button handler for form submission
async function handleTag(text, presetKey = "random") {
  if (!text || text.trim() === "") {
    return renderError("EMPTY TAG", "Enter some text first!");
  }
  if (text.trim().length > MAX_LENGTH) {
    return renderError("TAG TOO LONG", `Max ${MAX_LENGTH} characters. You entered ${text.trim().length}.`);
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
    <html type="html" width={400} height={220}>
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

        <button
          onClick={() => handleTag(currentText, selectedPreset)}
          disabled={isDisabled}
          className={`w-full py-2 rounded-lg font-bold text-lg transition-all ${
            isDisabled
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 via-pink-500 to-cyan-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50"
          }`}
        >
          TAG
        </button>
      </div>
    </html>
  );
}

// Main entry point
async function main() {
  const text = sup.input.text;

  // If no text input, show the form UI
  if (!text || text.trim() === "") {
    return renderForm();
  }

  // Direct text input - validate and generate
  const cleanText = text.trim();

  if (cleanText.length > MAX_LENGTH) {
    return renderError("TAG TOO LONG", `Max ${MAX_LENGTH} characters. You entered ${cleanText.length}. Keep it short!`);
  }

  return await generateTag(cleanText);
}
