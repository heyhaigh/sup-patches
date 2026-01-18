// Buy The Look - SupChat Patch
// Steal the Look meme style + actual buy links
// Repository: https://github.com/heyhaigh/sup-patches

const VERSION = "0.2.10";

// =============================================================================
// CONFIGURATION
// =============================================================================

function pickAspectRatio() {
  const options = ["4:5", "1:1", "4:3"];
  return options[Math.floor(Math.random() * options.length)];
}

function pickLayout() {
  const options = ["left", "right", "center"];
  return options[Math.floor(Math.random() * options.length)];
}

const layout = pickLayout();
const showPrices = Math.random() < 0.4;

// =============================================================================
// SCHEMA
// =============================================================================

const schema = {
  schema: {
    title: {
      type: "string",
      description: "The header text like 'STEAL HIS LOOK!!' or 'STEAL HER LOOK!!' or 'STEAL THEIR LOOK!!' with appropriate pronouns."
    },
    subjectName: {
      type: "string",
      description: "The name/title of the subject (e.g., 'Shrek', 'The Common Yellowthroat', 'Walter White', 'Kirby')."
    },
    subjectType: {
      type: "string",
      description: "What kind of subject this is.",
      enum: ["character", "celebrity", "animal", "object", "meme", "concept", "other"]
    },
    subjectDescription: {
      type: "string",
      description: "Brief visual description of the subject focusing on colors, textures, and distinctive features that will be matched to fashion items."
    },
    subjectPose: {
      type: "string",
      description: "How the subject should be posed/positioned in the image (e.g., 'standing confidently', 'perched on a branch', 'sitting casually')."
    },
    items: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          brand: {
            type: "string",
            description: "Brand name. Can be luxury (Gucci, Prada), budget (Walmart, Target, Amazon Basics), or empty string for unbranded/generic items."
          },
          productName: {
            type: "string",
            description: "Product name/type (e.g., 'Cashmere Sweater', 'Leather Belt', 'Silk Tie')."
          },
          price: {
            type: "string",
            description: "Price with currency symbol (e.g., '$2,550', '€1,890', '$450')."
          },
          color: {
            type: "string",
            description: "The color of the item that matches a feature of the subject."
          },
          matchReason: {
            type: "string",
            description: "Which part of the subject this item matches (e.g., 'matches the yellow chest', 'matches the green skin')."
          },
          searchQuery: {
            type: "string",
            description: "Search query. Luxury: generic ('green sweater'). Budget: character refs OK ('Link tunic', 'Hylian shield')."
          }
        }
      }
    },
    artStyle: {
      type: "string",
      description: "Should always be: Clean digital collage style with the subject and product images arranged with text labels."
    }
  }
};

// =============================================================================
// PROMPTS
// =============================================================================

const analysisPrompt = [
  "You are a fashion meme creator specializing in 'Steal His/Her/Their Look' style content.",
  "Convert the user's input (text describing a character, person, animal, or concept, and/or images) into a structured plan",
  "for a humorous 'Steal The Look' fashion meme.",
  "",
  "Rules:",
  "- The subject can be ANYTHING: a fictional character, celebrity, animal, object, meme, video game character, etc.",
  "- Identify 4-6 items that visually match colors, patterns, or features of the subject.",
  "- About 60% of items should be luxury/designer brands (Gucci, Prada, Louis Vuitton, Balenciaga, etc.).",
  "- About 40% of items should be from cheaper brands, generic stores, or have NO brand at all (e.g., 'Yellow Raincoat', 'Cotton T-Shirt', 'Walmart', 'Target', 'Amazon Basics', 'generic', 'unbranded').",
  "- For items with brands, use realistic pricing. For unbranded items, use cheap prices ($5-$50).",
  "- Items can include: clothing, accessories, shoes, bags, jewelry, watches, sunglasses, hats, etc.",
  "- Be creative with matching: a bird's yellow chest = yellow cashmere sweater, green skin = olive trench coat, etc.",
  "- Include at least one slightly absurd or humorous item match.",
  "- The tone is satirical/humorous but the items should look like real products.",
  "- For searchQuery: luxury brands use generic terms ('green sweater'). Budget/generic items can use character names ('Link tunic', 'Hylian shield') since fan merch exists on Amazon."
].join("\n");

const defaultsPrompt = [
  "Create a 'Steal The Look' meme for a random iconic or funny subject.",
  "Choose from options like: Shrek, a specific bird species, Kirby, SpongeBob, a famous painting subject,",
  "a video game character, or an unexpected animal. Be creative and humorous.",
  "Match 4-6 fashion items to the subject's colors and features (mix of luxury and budget/unbranded).",
  "Include at least one slightly absurd but still matches visually.",
].join("\n");

const layoutInstructions = {
  left: [
    "- LEFT SIDE: The subject (character/person/animal) as a high-quality image or illustration.",
    "- RIGHT SIDE: Individual product images arranged vertically or in a grid."
  ].join("\n"),
  right: [
    "- RIGHT SIDE: The subject (character/person/animal) as a high-quality image or illustration.",
    "- LEFT SIDE: Individual product images arranged vertically or in a grid."
  ].join("\n"),
  center: [
    "- CENTER: The subject (character/person/animal) as a high-quality image or illustration.",
    "- AROUND THE SUBJECT: Individual product images arranged around the subject (top, bottom, sides)."
  ].join("\n")
};

const imagePrompt = [
  "Create a 'STEAL THE LOOK' fashion meme image assembled from the provided JSON data.",
  "",
  "CRITICAL LAYOUT REQUIREMENTS:",
  "- This is a COLLAGE-STYLE MEME IMAGE, not a realistic photo.",
  layoutInstructions[layout],
  "- Each product should appear as a SEPARATE cutout image with clean white/transparent background style.",
  "",
  "TEXT ELEMENTS (must be readable and prominent):",
  "- Large bold header at TOP: The 'title' field (e.g., 'STEAL HIS LOOK!!' or 'STEAL HER LOOK!!').",
  "- Optionally include the 'subjectName' near the subject image.",
  "- Next to EACH product image, show:",
  "  • Brand name (bold) - if the item has a brand",
  "  • Product name",
  showPrices ? "  • Price" : "  • Do NOT show prices",
  "- Text should be clean, sans-serif, easy to read.",
  "",
  "VISUAL STYLE:",
  "- Clean, modern meme aesthetic.",
  "- White or light neutral background.",
  "- Product images should look like e-commerce product shots.",
  "- Subject image should be high quality and recognizable.",
  "- Overall look similar to fashion magazine layouts or social media fashion content.",
  "",
  "PRODUCTS TO INCLUDE:",
  "- Use the 'items' array from the JSON data.",
  "- Each item has: brand (may be empty for generic items), productName, price, color.",
  "- Render each as a realistic product image in the specified color.",
  "- Products should visually match the colors/features described in matchReason.",
  "- Mix of luxury and everyday/generic items is expected.",
  "",
  "RESEARCH & AUTHENTICITY:",
  "- Use web search to find accurate representations of brand products.",
  "- Products should look like real items.",
  "",
  "The final image should look like the viral 'steal his look' memes shared on social media,",
  "with a humorous subject matched to expensive designer items based on color/visual similarity.",
].join("\n");

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

function inputsToSchema(prompt, defaults) {
  if (sup.input.text && sup.input.images.length === 0) {
    sup.status("Analyzing look from text...");
    return sup.ai.promptWithContext(`${prompt}: ${sup.input.text}`, schema);
  }

  if (!sup.input.text && sup.input.images.length > 0) {
    sup.status("Analyzing look from image...");
    return sup.ai.promptWithContext(prompt, sup.input.image, schema);
  }

  if (sup.input.text && sup.input.images.length > 0) {
    sup.status("Analyzing look from text + image...");
    return sup.ai.promptWithContext(`${prompt}: ${sup.input.text}`, sup.input.image, schema);
  }

  sup.status("Picking a random iconic look...");
  return sup.ai.promptWithContext(defaults, schema);
}

function schemaToImage(schemaData) {
  const config = {
    model: "gemini-3-pro-image",
    aspectRatio: pickAspectRatio(),
    referenceImages: sup.input.images || [],
    useWebSearch: true
  };

  const prompt = `${imagePrompt}\n\nJSON DATA:\n${JSON.stringify(schemaData)}`;

  sup.status(`Composing steal the look image (${config.aspectRatio})...`);
  return sup.ai.image.create(prompt, config);
}


// Stores with RELIABLE URL-based search (direct links work)
const RELIABLE_STORE_URLS = {
  // Budget / Generic stores - these have reliable search URLs
  "walmart": "https://www.walmart.com/search?q=",
  "target": "https://www.target.com/s?searchTerm=",
  "amazon": "https://www.amazon.com/s?k=",
  "amazon basics": "https://www.amazon.com/s?k=amazon+basics+",
  "costco": "https://www.costco.com/CatalogSearch?dept=All&keyword=",
  "nordstrom": "https://www.nordstrom.com/sr?keyword=",
  "nordstrom rack": "https://www.nordstromrack.com/sr?keyword=",

  // Fast fashion - generally reliable
  "h&m": "https://www2.hm.com/en_us/search-results.html?q=",
  "uniqlo": "https://www.uniqlo.com/us/en/search?q=",
  "asos": "https://www.asos.com/us/search/?q=",
  "gap": "https://www.gap.com/browse/search.do?searchText=",
  "old navy": "https://oldnavy.gap.com/browse/search.do?searchText=",

  // Sportswear - reliable
  "nike": "https://www.nike.com/w?q=",
  "adidas": "https://www.adidas.com/us/search?q=",
  "lululemon": "https://shop.lululemon.com/search?Ntt=",
};

function generateBuyLinks(schemaData) {
  const links = [];

  for (const item of schemaData.items) {
    const query = item.searchQuery || `${item.color} ${item.productName}`;
    const brandLower = (item.brand || "").toLowerCase().trim();
    const fullQuery = item.brand ? `${item.brand} ${query}` : query;

    let url;
    let retailer;

    if (brandLower && RELIABLE_STORE_URLS[brandLower]) {
      // Known reliable store - use direct search URL
      url = RELIABLE_STORE_URLS[brandLower] + encodeURIComponent(query);
      retailer = item.brand;
    } else if (brandLower) {
      // For all branded items (luxury or otherwise), use Google Shopping
      // This is more reliable than brand sites which often have broken search URLs
      url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(fullQuery)}`;
      retailer = `${item.brand} (Google Shopping)`;
    } else {
      // Generic/unbranded - Amazon
      url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
      retailer = "Amazon";
    }

    links.push({
      name: item.brand ? `${item.brand} ${item.productName}` : item.productName,
      price: item.price,
      url: url,
      retailer: retailer
    });
  }

  return links;
}


// =============================================================================
// MAIN
// =============================================================================

function main() {
  if (!sup.input.text && sup.input.images.length === 0) {
    return [
      "🛍️ Buy The Look",
      "",
      "Send an image or describe a character/person/thing!",
      "",
      "I'll create a 'Steal The Look' meme AND give you links to actually buy the items.",
      `Version: ${VERSION}`
    ];
  }

  // Step 1: Analyze and create schema
  const schemaData = inputsToSchema(analysisPrompt, defaultsPrompt);

  if (!schemaData || !schemaData.items || schemaData.items.length === 0) {
    return "Couldn't analyze this image. Try a different one!";
  }

  // Step 2: Generate the meme image
  const memeImage = schemaToImage(schemaData);

  // Step 3: Generate buy links
  const buyLinks = generateBuyLinks(schemaData);

  // Step 4: Build response with image + buy buttons
  const response = [
    memeImage,
    "",
    "**🛒 Actually buy these items:**",
    ""
  ];

  for (const link of buyLinks) {
    response.push(`• **${link.name}** ${link.price}`);
    response.push(`  [Shop at ${link.retailer}](${link.url})`);
    response.push("");
  }

  return response;
}
