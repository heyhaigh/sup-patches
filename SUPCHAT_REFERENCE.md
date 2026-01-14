# SupChat Patch Development Reference

## Quick Links

- **Repository**: https://github.com/heyhaigh/sup-patches.git
- **SupChat Platform**: https://supchat.com/chat/
- **Getting Started Guide**: https://supchat.com/docs/guides/getting-started
- **Full API Documentation**: https://supchat.com/docs/llms.txt

---

## What Are Patches?

Patches are JavaScript programs that run on the Sup platform. They center around a `main()` function and use the globally available `sup` object to access chat features and APIs.

---

## Core Structure

### Entry Points

| Function | Purpose | Required |
|----------|---------|----------|
| `main()` | Primary entry point, called on each execution | Yes |
| `init()` | Initialization function for state setup | No |
| `launch()` | HTML-specific entry point | No |
| `onThreadReply()` | Callback for thread responses | No |
| `onReact()` | Callback for emoji reactions | No |

### Basic Patch Template

```javascript
// Configuration constants (easily customizable)
const CONFIG = {
  greeting: "Hello!",
  maxItems: 10
};

function main() {
  const userInput = sup.input.text;

  if (!userInput) {
    return "Please provide some input!";
  }

  return `${CONFIG.greeting} You said: ${userInput}`;
}
```

---

## The `sup` Object

### Core Properties

| Property | Description |
|----------|-------------|
| `sup.user` | Current user context |
| `sup.message` | Current message data |
| `sup.input` | User-provided content (text, images, audio, video, files) |
| `sup.assets` | Uploaded patch resources |
| `sup.chat` | Chat-scoped operations |

### Input Types (`sup.input`)

```javascript
sup.input.text      // String - text input
sup.input.images    // SupImage[] - attached images
sup.input.audio     // SupAudio[] - attached audio
sup.input.video     // SupVideo[] - attached video
sup.input.files     // SupFile[] - attached files
```

---

## State Management

Four storage scopes available:

| Scope | Set | Get | Accessibility |
|-------|-----|-----|---------------|
| Chat | `sup.set(key, value)` | `sup.get(key)` | Current chat only |
| Message | `sup.message.set(key, value)` | `sup.message.get(key)` | Single message |
| User | `sup.user.set(key, value)` | `sup.user.get(key)` | Per-user basis |
| Global | `sup.global.set(key, value)` | `sup.global.get(key)` | All patch runs |

### Example

```javascript
function main() {
  // Get count from chat state (defaults to 0)
  let count = sup.get("counter") || 0;
  count++;
  sup.set("counter", count);

  return `This patch has been run ${count} times in this chat.`;
}
```

---

## Interactive Elements

### Buttons

```javascript
sup.button(label, callback, value)
```

**Example:**

```javascript
function main() {
  return [
    "Choose an option:",
    sup.button("Option A", handleChoice, "a"),
    sup.button("Option B", handleChoice, "b")
  ];
}

function handleChoice(value) {
  return `You selected: ${value}`;
}
```

### HTML Content

JSX syntax supported with Tailwind CSS. Rendering modes: `"html"`, `"image"`, or `"video"`.

```javascript
function main() {
  return (
    <html type="image" width={400} height={300}>
      <div className="flex items-center justify-center h-full bg-blue-500">
        <h1 className="text-white text-2xl">Hello World!</h1>
      </div>
    </html>
  );
}
```

**Dimension constraints:** 100-1600px for width/height.

---

## AI Capabilities (`sup.ai`)

| Method | Purpose |
|--------|---------|
| `sup.ai.prompt(text)` | Text generation with multimodal support |
| `sup.ai.promptWithContext(text)` | Text generation with conversation context |
| `sup.ai.tts(text)` | Text-to-speech generation |
| `sup.ai.embedding(text)` | Vector embeddings |
| `sup.ai.image.create(prompt)` | Image generation |
| `sup.ai.image.edit(image, prompt)` | Image manipulation |
| `sup.ai.video.create(prompt)` | Video generation |
| `sup.ai.audio.interpret(audio)` | Audio analysis |

### Example

```javascript
async function main() {
  const userInput = sup.input.text;
  const response = await sup.ai.prompt(`Respond helpfully to: ${userInput}`);
  return response;
}
```

---

## Media Operations

### Images

```javascript
// Create from URL, blob, or filename
const img = sup.image(url);
const img = sup.image(blob);
const img = sup.asset("myimage.png");  // From assets
```

### Video

```javascript
// Single video
const video = sup.video(url);

// Sequence of clips
const sequence = sup.sequence([clip1, clip2, clip3]);

// Editing
const edited = await video.edit()
  .duration(5)
  .fadeIn(0.5)
  .render();
```

### Audio

```javascript
// Create
const audio = sup.audio(url);

// Editing
const edited = await audio.edit()
  .trimStart(2)
  .fadeOut(1)
  .render();

// Mixing
const mixed = await audio.edit()
  .mixWith(otherAudio)
  .render();
```

---

## External Integrations

### Web Operations

```javascript
// HTTP requests
const response = await sup.fetch(url, options);

// Web scraping with AI
const data = await sup.scrape(url, "Extract the main article text");
```

### External AI Services

```javascript
sup.ex.fal()           // Fal AI models
sup.ex.elevenlabs()    // ElevenLabs TTS
sup.ex.openrouter()    // OpenRouter LLM models
sup.ex.huggingface()   // Hugging Face inference
```

### Blockchain (Read-Only)

```javascript
// Ethereum mainnet
sup.blockchain.eth

// L2 networks
sup.blockchain.eth.chain("base")
sup.blockchain.eth.chain("optimism")
sup.blockchain.eth.chain("arbitrum")
sup.blockchain.eth.chain("polygon")

// Token operations
.erc20(address)
.erc721(address)
.erc1155(address)

// Price queries
.price("ETH")
.price(tokenAddress)
```

---

## Linux VM Environment

```javascript
const vm = await sup.vm();

// Execute commands
const result = await vm.exec("ls -la");
const stream = await vm.execStreaming("long-running-command");

// File operations
await vm.upload(file, "/path/to/destination");
const file = await vm.download("/path/to/file");

// Public URL (port 3000)
console.log(vm.url);

// Cleanup
await vm.delete();
```

---

## Utilities

### Random (`sup.random`)

```javascript
sup.random.integer(min, max)
sup.random.float(min, max)
sup.random.boolean()
sup.random.choice(array)
sup.random.shuffle(array)
```

### Search

```javascript
// Find patches
const patches = await sup.search.patches("image editor", 10);

// Find custom emojis
const emojis = await sup.search.emojis("happy", 10);
```

### Loading Other Patches

```javascript
// Load by ID or path
const patch = await sup.patch("/username/patchname");

// Execute
const result = await patch.run(arg1, arg2);

// Call exposed functions
const result = await patch.public.someFunction();
```

---

## Assets

**Important:** Use `sup.asset(filename)` - NOT array syntax.

```javascript
// Correct
const image = sup.asset("background.png");

// Incorrect - will not work
const image = sup.assets["background.png"];
```

---

## NPC Interaction

```javascript
// Check if NPC available
if (sup.chat.npc.enabled) {
  // Get direct response
  const response = await sup.chat.npc.prompt("What do you think?");

  // Prompt NPC to participate
  await sup.chat.npc.nudge();

  // Private message to NPC
  await sup.chat.npc.whisper("Secret message");

  // Post as NPC
  await sup.chat.npc.say("Hello everyone!");
}
```

---

## Valid Return Types from `main()`

- **Primitives:** `string`, `number`, `boolean`
- **Media:** `SupImage`, `SupAudio`, `SupVideo`, `SupHTML`, `SupSVG`
- **Interactive:** `SupButton`
- **Collections:** Arrays containing any of the above

```javascript
// Multiple returns
function main() {
  return [
    "Here's some text",
    sup.image("https://example.com/image.png"),
    sup.button("Click me", handleClick, "value")
  ];
}
```

---

## Best Practices

1. **Define constants at top** - Makes patches easily customizable
2. **Validate inputs** - Check for required input before processing
3. **Handle errors gracefully** - Use try/catch for async operations
4. **Add comments** - Document complex logic
5. **Break down functions** - Keep functions small and focused
6. **Use appropriate state scope** - Choose the right storage level for your data

---

## Error Handling

### VM Execution Errors

```javascript
try {
  await vm.exec("command");
} catch (error) {
  // SupVMExecError provides:
  // error.exitCode
  // error.stdout
  // error.stderr
  // error.output
  // error.reason
}
```

### Non-Throwing Alternative

```javascript
const result = await vm.execResult("command");
// Returns status object without throwing
```
