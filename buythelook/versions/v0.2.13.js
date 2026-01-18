// Buy The Look - SupChat Patch
// Steal the Look meme style + actual buy links
// Repository: https://github.com/heyhaigh/sup-patches

const VERSION = "0.2.13";

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
  // Budget / Mass market
  "walmart": "https://www.walmart.com/search?q=",
  "target": "https://www.target.com/s?searchTerm=",
  "amazon": "https://www.amazon.com/s?k=",
  "amazon basics": "https://www.amazon.com/s?k=amazon+basics+",
  "costco": "https://www.costco.com/CatalogSearch?dept=All&keyword=",
  "kohl's": "https://www.kohls.com/search.jsp?search=",
  "kohls": "https://www.kohls.com/search.jsp?search=",
  "jcpenney": "https://www.jcpenney.com/s?searchTerm=",
  "jc penney": "https://www.jcpenney.com/s?searchTerm=",
  "macy's": "https://www.macys.com/shop/featured?keyword=",
  "macys": "https://www.macys.com/shop/featured?keyword=",
  "marshalls": "https://www.marshalls.com/us/store/search/SearchDisplay?searchTerm=",
  "tj maxx": "https://tjmaxx.tjx.com/store/jump/search?searchTerm=",
  "ross": "https://www.rossstores.com/search?q=",

  // Department stores
  "nordstrom": "https://www.nordstrom.com/sr?keyword=",
  "nordstrom rack": "https://www.nordstromrack.com/sr?keyword=",
  "bloomingdale's": "https://www.bloomingdales.com/shop/search?keyword=",
  "bloomingdales": "https://www.bloomingdales.com/shop/search?keyword=",
  "saks": "https://www.saksfifthavenue.com/search?q=",
  "saks fifth avenue": "https://www.saksfifthavenue.com/search?q=",
  "saks off 5th": "https://www.saksoff5th.com/search?q=",
  "neiman marcus": "https://www.neimanmarcus.com/search?q=",
  "dillard's": "https://www.dillards.com/search?searchTerm=",
  "dillards": "https://www.dillards.com/search?searchTerm=",
  "belk": "https://www.belk.com/search?q=",
  "von maur": "https://www.vonmaur.com/Search.aspx?SearchTerm=",

  // Luxury multi-brand retailers
  "farfetch": "https://www.farfetch.com/shopping/women/search/items.aspx?q=",
  "ssense": "https://www.ssense.com/en-us/women/search?q=",
  "net-a-porter": "https://www.net-a-porter.com/en-us/shop/search?keywords=",
  "net a porter": "https://www.net-a-porter.com/en-us/shop/search?keywords=",
  "mr porter": "https://www.mrporter.com/en-us/search?query=",
  "matches fashion": "https://www.matchesfashion.com/us/search?q=",
  "mytheresa": "https://www.mytheresa.com/int_en/search?q=",
  "24s": "https://www.24s.com/en-us/search?q=",

  // Fast fashion
  "h&m": "https://www2.hm.com/en_us/search-results.html?q=",
  "uniqlo": "https://www.uniqlo.com/us/en/search?q=",
  "zara": "https://www.zara.com/us/en/search?searchTerm=",
  "asos": "https://www.asos.com/us/search/?q=",
  "shein": "https://us.shein.com/pdsearch/",
  "forever 21": "https://www.forever21.com/us/shop/search?q=",
  "urban outfitters": "https://www.urbanoutfitters.com/search?q=",
  "free people": "https://www.freepeople.com/search?q=",
  "anthropologie": "https://www.anthropologie.com/search?q=",
  "mango": "https://shop.mango.com/us/search?kw=",
  "pull&bear": "https://www.pullandbear.com/us/search?q=",
  "pull and bear": "https://www.pullandbear.com/us/search?q=",
  "bershka": "https://www.bershka.com/us/search?q=",
  "stradivarius": "https://www.stradivarius.com/us/search?q=",
  "cos": "https://www.cos.com/en_usd/search.html?q=",
  "& other stories": "https://www.stories.com/en_usd/search.html?q=",
  "other stories": "https://www.stories.com/en_usd/search.html?q=",
  "arket": "https://www.arket.com/en_usd/search.html?q=",
  "massimo dutti": "https://www.massimodutti.com/us/search?q=",
  "everlane": "https://www.everlane.com/search?q=",
  "reformation": "https://www.thereformation.com/search?q=",
  "princess polly": "https://us.princesspolly.com/search?q=",
  "revolve": "https://www.revolve.com/r/search.jsp?search=",
  "showpo": "https://www.showpo.com/us/search?q=",
  "boohoo": "https://us.boohoo.com/search?q=",
  "prettylittlething": "https://www.prettylittlething.us/catalogsearch/result/?q=",
  "missguided": "https://www.missguided.com/search?q=",
  "nasty gal": "https://www.nastygal.com/search?q=",

  // Gap brands
  "gap": "https://www.gap.com/browse/search.do?searchText=",
  "old navy": "https://oldnavy.gap.com/browse/search.do?searchText=",
  "banana republic": "https://bananarepublic.gap.com/browse/search.do?searchText=",
  "athleta": "https://athleta.gap.com/browse/search.do?searchText=",

  // Menswear
  "j.crew": "https://www.jcrew.com/r/search?q=",
  "j crew": "https://www.jcrew.com/r/search?q=",
  "bonobos": "https://bonobos.com/search?q=",
  "brooks brothers": "https://www.brooksbrothers.com/search?q=",
  "men's wearhouse": "https://www.menswearhouse.com/search?q=",
  "mens wearhouse": "https://www.menswearhouse.com/search?q=",
  "charles tyrwhitt": "https://www.charlestyrwhitt.com/us/search?q=",
  "suit supply": "https://suitsupply.com/en-us/search?q=",
  "suitsupply": "https://suitsupply.com/en-us/search?q=",
  "express": "https://www.express.com/exp/search?q=",
  "topman": "https://us.topman.com/search?q=",

  // Sportswear / Athletic
  "nike": "https://www.nike.com/w?q=",
  "adidas": "https://www.adidas.com/us/search?q=",
  "lululemon": "https://shop.lululemon.com/search?Ntt=",
  "under armour": "https://www.underarmour.com/en-us/search?q=",
  "puma": "https://us.puma.com/us/en/search?q=",
  "reebok": "https://www.reebok.com/us/search?q=",
  "new balance": "https://www.newbalance.com/search?q=",
  "asics": "https://www.asics.com/us/en-us/search?q=",
  "brooks": "https://www.brooksrunning.com/en_us/search?q=",
  "hoka": "https://www.hoka.com/en/us/search?q=",
  "on running": "https://www.on-running.com/en-us/search?q=",
  "on": "https://www.on-running.com/en-us/search?q=",
  "fila": "https://www.fila.com/search?q=",
  "champion": "https://www.champion.com/search?q=",
  "gymshark": "https://www.gymshark.com/search?q=",
  "alo yoga": "https://www.aloyoga.com/search?q=",
  "alo": "https://www.aloyoga.com/search?q=",
  "vuori": "https://vuori.com/search?q=",
  "outdoor voices": "https://www.outdoorvoices.com/search?q=",

  // Outdoor / Workwear
  "patagonia": "https://www.patagonia.com/search/?q=",
  "the north face": "https://www.thenorthface.com/en-us/search?q=",
  "north face": "https://www.thenorthface.com/en-us/search?q=",
  "rei": "https://www.rei.com/search?q=",
  "columbia": "https://www.columbia.com/search?q=",
  "arc'teryx": "https://arcteryx.com/us/en/search?q=",
  "arcteryx": "https://arcteryx.com/us/en/search?q=",
  "carhartt": "https://www.carhartt.com/search?q=",
  "dickies": "https://www.dickies.com/search?q=",
  "filson": "https://www.filson.com/catalogsearch/result?q=",
  "ll bean": "https://www.llbean.com/llb/search?freeText=",
  "l.l. bean": "https://www.llbean.com/llb/search?freeText=",
  "cabela's": "https://www.cabelas.com/shop/en?q=",
  "cabelas": "https://www.cabelas.com/shop/en?q=",
  "bass pro shops": "https://www.basspro.com/shop/en/search?q=",
  "bass pro": "https://www.basspro.com/shop/en/search?q=",
  "backcountry": "https://www.backcountry.com/search?q=",
  "moosejaw": "https://www.moosejaw.com/search?q=",

  // Shoes
  "converse": "https://www.converse.com/search?q=",
  "vans": "https://www.vans.com/en-us/search?q=",
  "dr. martens": "https://www.drmartens.com/us/en/search?q=",
  "dr martens": "https://www.drmartens.com/us/en/search?q=",
  "crocs": "https://www.crocs.com/search?q=",
  "birkenstock": "https://www.birkenstock.com/us/search?q=",
  "steve madden": "https://www.stevemadden.com/pages/search-results?q=",
  "zappos": "https://www.zappos.com/search?term=",
  "dsw": "https://www.dsw.com/en/us/search?query=",
  "foot locker": "https://www.footlocker.com/search?query=",
  "footlocker": "https://www.footlocker.com/search?query=",
  "finish line": "https://www.finishline.com/store/search?query=",
  "finishline": "https://www.finishline.com/store/search?query=",
  "famous footwear": "https://www.famousfootwear.com/search?q=",
  "clarks": "https://www.clarksusa.com/search?q=",
  "ugg": "https://www.ugg.com/search?q=",
  "timberland": "https://www.timberland.com/search?q=",
  "cole haan": "https://www.colehaan.com/search?q=",
  "stuart weitzman": "https://www.stuartweitzman.com/search?q=",
  "sam edelman": "https://www.samedelman.com/search?q=",
  "aldo": "https://www.aldoshoes.com/us/en_US/search?q=",
  "call it spring": "https://www.callitspring.com/us/en_US/search?q=",
  "skechers": "https://www.skechers.com/search?q=",
  "allbirds": "https://www.allbirds.com/search?q=",

  // Eyewear
  "ray-ban": "https://www.ray-ban.com/usa/search?text=",
  "ray ban": "https://www.ray-ban.com/usa/search?text=",
  "oakley": "https://www.oakley.com/en-us/search?q=",
  "warby parker": "https://www.warbyparker.com/search/",
  "sunglass hut": "https://www.sunglasshut.com/us/search?text=",
  "zenni": "https://www.zennioptical.com/b/all?q=",
  "lenscrafters": "https://www.lenscrafters.com/lc-us/search?q=",

  // Jewelry
  "mejuri": "https://mejuri.com/search?q=",
  "baublebar": "https://www.baublebar.com/search?q=",
  "kendra scott": "https://www.kendrascott.com/search?q=",
  "pandora": "https://us.pandora.net/search?q=",
  "swarovski": "https://www.swarovski.com/en-US/search?q=",
  "alex and ani": "https://www.alexandani.com/search?q=",
  "gorjana": "https://gorjana.com/search?q=",
  "missoma": "https://www.missoma.com/search?q=",
  "monica vinader": "https://www.monicavinader.com/us/search?q=",
  "brilliant earth": "https://www.brilliantearth.com/search/?q=",
  "blue nile": "https://www.bluenile.com/search?q=",
  "james allen": "https://www.jamesallen.com/search?q=",
  "kay": "https://www.kay.com/search?q=",
  "zales": "https://www.zales.com/search?q=",
  "jared": "https://www.jared.com/search?q=",

  // Watches
  "fossil": "https://www.fossil.com/en-us/search?q=",
  "casio": "https://www.casio.com/us/search?q=",
  "g-shock": "https://www.gshock.com/search?q=",
  "gshock": "https://www.gshock.com/search?q=",
  "timex": "https://www.timex.com/search?q=",
  "mvmt": "https://www.mvmt.com/search?q=",
  "daniel wellington": "https://www.danielwellington.com/us/search?q=",
  "nixon": "https://www.nixon.com/us/en/search?q=",

  // Bags / Luggage
  "herschel": "https://herschel.com/search?q=",
  "fjallraven": "https://www.fjallraven.com/us/en-us/search?q=",
  "tumi": "https://www.tumi.com/search?q=",
  "samsonite": "https://www.samsonite.com/search?q=",
  "away": "https://www.awaytravel.com/search?q=",
  "dagne dover": "https://www.dagnedover.com/search?q=",
  "lo & sons": "https://www.loandsons.com/search?q=",
  "béis": "https://beistravel.com/search?q=",
  "beis": "https://beistravel.com/search?q=",
  "calpak": "https://www.calpaktravel.com/search?q=",

  // Lingerie / Intimates
  "victoria's secret": "https://www.victoriassecret.com/us/search?q=",
  "victorias secret": "https://www.victoriassecret.com/us/search?q=",
  "aerie": "https://www.ae.com/us/en/c/aerie/cat10030?q=",
  "savage x fenty": "https://www.savagex.com/search?q=",
  "skims": "https://skims.com/search?q=",
  "cuup": "https://www.shopcuup.com/search?q=",
  "thirdlove": "https://www.thirdlove.com/search?q=",

  // Plus size
  "torrid": "https://www.torrid.com/search?q=",
  "lane bryant": "https://www.lanebryant.com/search?q=",
  "eloquii": "https://www.eloquii.com/search?q=",
  "universal standard": "https://www.universalstandard.com/search?q=",

  // Kids
  "carter's": "https://www.carters.com/search?q=",
  "carters": "https://www.carters.com/search?q=",
  "oshkosh": "https://www.oshkosh.com/search?q=",
  "children's place": "https://www.childrensplace.com/us/search?q=",
  "childrens place": "https://www.childrensplace.com/us/search?q=",
  "gymboree": "https://www.gymboree.com/search?q=",
  "primary": "https://www.primary.com/search?q=",
  "hanna andersson": "https://www.hannaandersson.com/search?q=",

  // Resale / Vintage / Thrift
  "poshmark": "https://poshmark.com/search?q=",
  "depop": "https://www.depop.com/search?q=",
  "thredup": "https://www.thredup.com/products?search=",
  "the realreal": "https://www.therealreal.com/shop?q=",
  "therealreal": "https://www.therealreal.com/shop?q=",
  "vestiaire collective": "https://www.vestiairecollective.com/search?q=",
  "grailed": "https://www.grailed.com/shop?q=",
  "stockx": "https://stockx.com/search?s=",
  "goat": "https://www.goat.com/search?query=",
  "ebay": "https://www.ebay.com/sch/i.html?_nkw=",

  // Beauty / Accessories
  "sephora": "https://www.sephora.com/search?keyword=",
  "ulta": "https://www.ulta.com/search?search=",

  // Fan merch / Costume / Novelty
  "etsy": "https://www.etsy.com/search?q=",
  "hot topic": "https://www.hottopic.com/search?q=",
  "spirit halloween": "https://www.spirithalloween.com/search?q=",
  "boxlunch": "https://www.boxlunch.com/search?q=",
  "thinkgeek": "https://www.gamestop.com/search/?q=",
  "gamestop": "https://www.gamestop.com/search/?q=",
  "fye": "https://www.fye.com/search?q=",
  "spencer's": "https://www.spencersonline.com/search?q=",
  "spencers": "https://www.spencersonline.com/search?q=",
  "party city": "https://www.partycity.com/search?q=",
  "amazon costumes": "https://www.amazon.com/s?k=costume+",
  "halloweencostumes.com": "https://www.halloweencostumes.com/search.php?search=",
  "disney store": "https://www.shopdisney.com/search?q=",
  "shopdisney": "https://www.shopdisney.com/search?q=",
  "build-a-bear": "https://www.buildabear.com/search?q=",
  "build a bear": "https://www.buildabear.com/search?q=",
  "funko": "https://www.funko.com/search?q=",
  "loungefly": "https://www.loungefly.com/search?q=",
  "redbubble": "https://www.redbubble.com/shop?query=",
  "teepublic": "https://www.teepublic.com/t-shirts?query=",
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
      retailer = "Google Shopping";
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
    "**🛒 Shop similar items:**",
    ""
  ];

  for (const link of buyLinks) {
    response.push(`• **${link.name}** ${link.price}`);
    response.push(`  [Shop at ${link.retailer}](${link.url})`);
    response.push("");
  }

  return response;
}
