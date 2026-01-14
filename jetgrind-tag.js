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

const MAX_LENGTH = 20;

// Generate the graffiti tag image
async function generateTag(text) {
  const cleanText = text.trim().toUpperCase();
  const prompt = buildPrompt(cleanText);

  // Generate at 1024x256 (4:1 ratio, higher res than 512x128)
  const image = await sup.ai.image.create(prompt, {
    width: 1024,
    height: 256
  });

  return image;
}

// Button handler for form submission
async function handleTag(text) {
  if (!text || text.trim() === "" || text.trim().length > MAX_LENGTH) {
    return "Invalid input. Please enter 1-20 characters.";
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
    return [
      `Too long! Keep it under ${MAX_LENGTH} characters.`,
      renderForm()
    ];
  }

  return await generateTag(cleanText);
}
