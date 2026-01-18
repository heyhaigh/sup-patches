// Buy The Look - SupChat Patch
// Generate shoppable outfit breakdowns from any image
// Repository: https://github.com/heyhaigh/sup-patches

const VERSION = "0.2.0";

// =============================================================================
// CONFIGURATION
// =============================================================================

function pickAspectRatio() {
  const options = ["4:5", "1:1", "9:16"];
  return options[Math.floor(Math.random() * options.length)];
}

function pickLayout() {
  const options = ["left", "right", "grid"];
  return options[Math.floor(Math.random() * options.length)];
}

const layout = pickLayout();
const showPrices = Math.random() < 0.7; // 70% chance to show prices

// =============================================================================
// SCHEMA
// =============================================================================

const schema = {
  schema: {
    title: {
      type: "string",
      description: "Header text like 'GET THE LOOK' or 'SHOP THE LOOK' or 'STYLE BREAKDOWN'"
    },
    lookDescription: {
      type: "string",
      description: "Brief description of the overall style/aesthetic (e.g., 'Minimalist Scandinavian', 'Y2K Streetwear', 'Dark Academia')"
    },
    items: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Product category",
            enum: ["top", "bottom", "shoes", "outerwear", "accessory", "bag", "hat", "jewelry", "eyewear", "other"]
          },
          brand: {
            type: "string",
            description: "Real or realistic brand name (mix of luxury, mid-range, and affordable: Zara, COS, Acne Studios, Uniqlo, The Row, etc.)"
          },
          productName: {
            type: "string",
            description: "Product name (e.g., 'Oversized Wool Coat', 'Leather Chelsea Boots')"
          },
          color: {
            type: "string",
            description: "Color of the item"
          },
          price: {
            type: "string",
            description: "Realistic price with currency (e.g., '$89', '$450', '$1,200')"
          },
          matchReason: {
            type: "string",
            description: "Which part of the original look this matches"
          }
        }
      }
    }
  }
};

// =============================================================================
// PROMPTS
// =============================================================================

const analysisPrompt = [
  "You are a fashion stylist creating a 'Shop The Look' breakdown.",
  "Analyze the outfit/look in the image and identify 3-6 key fashion items.",
  "",
  "Rules:",
  "- Identify actual clothing, shoes, and accessories visible in the image.",
  "- Use realistic brands - mix of price points:",
  "  • Luxury: The Row, Bottega Veneta, Acne Studios, Toteme",
  "  • Mid-range: COS, Arket, & Other Stories, Massimo Dutti",
  "  • Affordable: Zara, Uniqlo, H&M, ASOS",
  "- Prices should be realistic for the brand and item type.",
  "- Focus on items that could actually be purchased.",
  "- Be specific about colors, materials, and styles."
].join("\n");

const layoutInstructions = {
  left: [
    "- LEFT SIDE: The original outfit/person as reference (styled photograph).",
    "- RIGHT SIDE: Individual product images arranged vertically with labels."
  ].join("\n"),
  right: [
    "- RIGHT SIDE: The original outfit/person as reference (styled photograph).",
    "- LEFT SIDE: Individual product images arranged vertically with labels."
  ].join("\n"),
  grid: [
    "- TOP: The original outfit/person as reference (styled photograph).",
    "- BOTTOM: Product images in a clean grid layout with labels."
  ].join("\n")
};

const imagePrompt = [
  "Create a clean, modern 'SHOP THE LOOK' fashion breakdown image from the provided JSON data.",
  "",
  "LAYOUT:",
  layoutInstructions[layout],
  "",
  "VISUAL STYLE:",
  "- Clean, editorial fashion aesthetic (like a fashion blog or magazine).",
  "- White or soft neutral background.",
  "- Products should look like professional e-commerce product shots.",
  "- Minimal, modern typography.",
  "- High-end shopping app or fashion editorial feel.",
  "",
  "TEXT ELEMENTS:",
  "- Header: The 'title' field (e.g., 'SHOP THE LOOK').",
  "- Style description: The 'lookDescription' field.",
  "- For each product show:",
  "  • Brand name (if present)",
  "  • Product name",
  showPrices ? "  • Price" : "  • Do NOT show prices",
  "",
  "PRODUCTS:",
  "- Render each item from the 'items' array as a realistic product image.",
  "- Match the colors and styles described.",
  "- Products should look like real items you could buy.",
  "- Use web search to reference accurate brand aesthetics.",
  "",
  "The final image should look like content from a fashion influencer or shopping app,",
  "showing how to recreate the look with purchasable items."
].join("\n");

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

function inputsToSchema(prompt) {
  if (sup.input.text && sup.input.images.length === 0) {
    sup.status("Analyzing look from description...");
    return sup.ai.promptWithContext(`${prompt}: ${sup.input.text}`, schema);
  }

  if (!sup.input.text && sup.input.images.length > 0) {
    sup.status("Analyzing outfit...");
    return sup.ai.promptWithContext(prompt, sup.input.image, schema);
  }

  if (sup.input.text && sup.input.images.length > 0) {
    sup.status("Analyzing outfit with context...");
    return sup.ai.promptWithContext(`${prompt}: ${sup.input.text}`, sup.input.image, schema);
  }

  return null;
}

function schemaToImage(schemaData) {
  const config = {
    model: "gemini-3-pro-image",
    aspectRatio: pickAspectRatio(),
    referenceImages: sup.input.images || [],
    useWebSearch: true
  };

  const prompt = `${imagePrompt}\n\nJSON DATA:\n${JSON.stringify(schemaData)}`;

  sup.status(`Creating shop the look image (${config.aspectRatio})...`);
  return sup.ai.image.create(prompt, config);
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  if (!sup.input.text && sup.input.images.length === 0) {
    return [
      "👗 Buy The Look",
      "",
      "Upload an outfit image to get a shoppable breakdown!",
      "",
      "I'll identify the pieces and show you how to recreate the look.",
      `Version: ${VERSION}`
    ];
  }

  const schemaData = inputsToSchema(analysisPrompt);

  if (!schemaData || !schemaData.items || schemaData.items.length === 0) {
    return "Couldn't identify any items in this image. Try a clearer outfit photo!";
  }

  return schemaToImage(schemaData);
}
