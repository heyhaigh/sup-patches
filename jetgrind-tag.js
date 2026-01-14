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

const BACKGROUND_EFFECTS = [
  "transparent background with floating paint splatters",
  "transparent background with subtle spray mist",
  "transparent background with dripping paint edges",
  "transparent background with scattered geometric shapes",
  "transparent background with fading color wisps"
];

// Helper to pick random element from array
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build the generation prompt
function buildPrompt(text) {
  const colors = randomChoice(COLOR_PALETTES);
  const letters = randomChoice(LETTER_STYLES);
  const flourish = randomChoice(FLOURISH_TYPES);
  const texture = randomChoice(TEXTURE_PATTERNS);
  const background = randomChoice(BACKGROUND_EFFECTS);

  return `Jet Set Radio / Jet Grind Radio video game style graffiti tag artwork. The word "${text}" written in ${letters}, colored with ${colors}. Letters have ${texture}. Decorated with ${flourish} around and between the letters. ${background}. Wide panoramic landscape format, stylized cel-shaded Japanese video game graffiti art style, bold graphic design, high contrast colors, spray paint aesthetic, urban street art, Dreamcast era video game graphics style. No realistic elements, purely stylized illustrated graffiti art.`;
}

async function main() {
  const text = sup.input.text;

  if (!text || text.trim() === "") {
    return "Enter a word or phrase to generate a Jet Grind Radio style graffiti tag!";
  }

  // Clean up input - graffiti tags work best with shorter text
  const cleanText = text.trim().toUpperCase();

  if (cleanText.length > 20) {
    return "Keep it short! Graffiti tags work best with 1-3 words (20 characters max).";
  }

  const prompt = buildPrompt(cleanText);

  // Generate at 1024x256 (4:1 ratio, higher res than 512x128)
  const image = await sup.ai.image.create(prompt, {
    width: 1024,
    height: 256
  });

  return image;
}
