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
  const sprayTexture = randomChoice(SPRAY_TEXTURES);
  const paintTechnique = randomChoice(PAINT_TECHNIQUES);

  return `Jet Set Radio / Jet Grind Radio video game style graffiti tag artwork, real spray paint on wall aesthetic. The word "${text}" written in ${letters}, colored with ${colors}. Letters have ${texture}. Decorated with ${flourish} around and between the letters. Painted with authentic spray paint texture: ${sprayTexture}. Technique style: ${paintTechnique}. ${background}. Wide panoramic landscape format, stylized Japanese video game graffiti art but with realistic spray paint material qualities, bold graphic design, high contrast colors, genuine aerosol paint aesthetic with visible paint texture and spray artifacts, urban street art. Mix of stylized illustration with tactile paint surface quality.`;
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
async function generateTag(text) {
  const cleanText = text.trim().toUpperCase();
  const prompt = buildPrompt(cleanText);

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
async function handleTag(text) {
  if (!text || text.trim() === "") {
    return renderError("EMPTY TAG", "Enter some text first!");
  }
  if (text.trim().length > MAX_LENGTH) {
    return renderError("TAG TOO LONG", `Max ${MAX_LENGTH} characters. You entered ${text.trim().length}.`);
  }
  return await generateTag(text);
}

// Render the input form UI
function renderForm() {
  const currentText = sup.message.get("inputText") || "";
  const charCount = currentText.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = charCount === 0;
  const isDisabled = isEmpty || isOverLimit;

  return (
    <html type="html" width={400} height={160}>
      <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-purple-900 via-black to-green-900 h-full font-mono">
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

        <button
          onClick={() => handleTag(currentText)}
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
