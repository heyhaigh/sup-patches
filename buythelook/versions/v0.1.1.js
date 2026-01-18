// Buy The Look - SupChat Patch
// Find and shop real products that match any outfit/look
// Repository: https://github.com/heyhaigh/sup-patches

const VERSION = "0.1.1";

// =============================================================================
// CONFIGURATION
// =============================================================================

const MAX_PRODUCTS = 6;
const MIN_PRODUCTS = 1;

// =============================================================================
// SCHEMA FOR AI ANALYSIS
// =============================================================================

const analysisSchema = {
  schema: {
    lookDescription: {
      type: "string",
      description: "Brief description of the overall look/style being analyzed."
    },
    items: {
      type: "array",
      minItems: MIN_PRODUCTS,
      maxItems: MAX_PRODUCTS,
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Product category",
            enum: ["top", "bottom", "shoes", "outerwear", "accessory", "bag", "hat", "jewelry", "eyewear", "other"]
          },
          description: {
            type: "string",
            description: "Detailed description of the item for search (e.g., 'black leather motorcycle jacket with silver zippers')"
          },
          color: {
            type: "string",
            description: "Primary color of the item"
          },
          style: {
            type: "string",
            description: "Style keywords (e.g., 'casual', 'formal', 'streetwear', 'vintage')"
          },
          searchQuery: {
            type: "string",
            description: "Optimized search query to find this product online (e.g., 'black leather moto jacket women')"
          }
        }
      }
    }
  }
};

const productSearchSchema = {
  schema: {
    productName: {
      type: "string",
      description: "Full product name as listed"
    },
    brand: {
      type: "string",
      description: "Brand name"
    },
    price: {
      type: "string",
      description: "Price with currency symbol"
    },
    productUrl: {
      type: "string",
      description: "Direct URL to purchase the product"
    },
    imageDescription: {
      type: "string",
      description: "Brief description of what the product looks like"
    },
    retailer: {
      type: "string",
      description: "Name of the store/retailer selling the product"
    }
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getCategoryEmoji(category) {
  const emojis = {
    top: "👕",
    bottom: "👖",
    shoes: "👟",
    outerwear: "🧥",
    accessory: "💍",
    bag: "👜",
    hat: "🎩",
    jewelry: "💎",
    eyewear: "🕶️",
    other: "✨"
  };
  return emojis[category] || "🛍️";
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

async function analyzeLook(image, textContext) {
  const prompt = [
    "Analyze this image and identify the distinct fashion/clothing items visible.",
    "For each item, provide details that would help find a REAL, similar product to purchase online.",
    "Focus on items that are clearly visible and could realistically be shopped for.",
    "Include clothing, shoes, bags, accessories, jewelry, eyewear, etc.",
    textContext ? `Additional context: ${textContext}` : "",
    "",
    "IMPORTANT for searchQuery field:",
    "- Generate practical shopping search terms, NOT costume/fantasy descriptions",
    "- Use common retail terminology (e.g., 'green mock neck top women' NOT 'medieval tunic')",
    "- Include gender if apparent (men's, women's)",
    "- Focus on: color + style + item type + material if visible",
    "- Examples: 'brown slouchy ankle boots women', 'white fitted leggings', 'olive green tunic top'"
  ].join("\n");

  sup.status("Analyzing the look...");
  return await sup.ai.promptWithContext(prompt, image, analysisSchema);
}

async function findProduct(item) {
  const searchPrompt = [
    `Search for: "${item.searchQuery}"`,
    "",
    `Find ONE real product currently for sale that matches:`,
    `- Color: ${item.color}`,
    `- Type: ${item.category}`,
    "",
    "Requirements:",
    "- Must be a real product with an actual purchase URL",
    "- Prefer major retailers: Amazon, Nordstrom, ASOS, Zara, H&M, Target, Macy's, Revolve",
    "- The product should be similar in style and color",
    "- Return the direct product page URL (not search results page)"
  ].join("\n");

  sup.status(`Finding ${item.category}...`);

  const result = await sup.ai.prompt(searchPrompt, {
    useWebSearch: true,
    schema: productSearchSchema
  });

  return {
    ...item,
    ...result
  };
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main() {
  // Check for input
  if (!sup.input.images || sup.input.images.length === 0) {
    return [
      "👗 Buy The Look",
      "",
      "Upload an image of an outfit or look you want to shop!",
      "",
      "I'll identify the items and find real products you can buy.",
      `Version: ${VERSION}`
    ];
  }

  const image = sup.input.image;
  const textContext = sup.input.text || null;

  // Step 1: Analyze the look
  const analysis = await analyzeLook(image, textContext);

  if (!analysis || !analysis.items || analysis.items.length === 0) {
    return "Couldn't identify any shoppable items in this image. Try a clearer photo of an outfit!";
  }

  // Step 2: Find products for each item
  sup.status(`Finding ${analysis.items.length} products...`);

  const products = [];
  for (const item of analysis.items) {
    try {
      const product = await findProduct(item);
      if (product.productUrl) {
        products.push(product);
      }
    } catch (e) {
      // Skip items we couldn't find
      console.log(`Couldn't find product for: ${item.description}`);
    }
  }

  if (products.length === 0) {
    return "Couldn't find any matching products for sale. Try a different image!";
  }

  // Step 3: Build response with product cards and buy buttons
  const response = [
    "🛍️ Buy The Look",
    "",
    analysis.lookDescription || "Here's what I found:",
    ""
  ];

  for (const product of products) {
    const emoji = getCategoryEmoji(product.category);

    // Product info
    response.push(`${emoji} **${product.brand || ""}** ${product.productName}`);
    if (product.price) {
      response.push(`   ${product.price} at ${product.retailer || "retailer"}`);
    }

    // Buy button with deep link
    if (product.productUrl) {
      response.push(sup.button(`Buy ${product.category}`, () => {
        return sup.link(product.productUrl, `Shop ${product.productName}`);
      }));
    }

    response.push("");
  }

  response.push(`Found ${products.length} items to shop!`);

  return response;
}
