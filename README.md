# QuantumPrompt

QuantumPrompt is a browser extension that enhances your AI prompts with one click. It currently works with Gemini, making your interactions with AI more productive.

## Features

- 🚀 One-click prompt enhancement
- 💡 Intelligently improves your prompts using AI
- 🔄 Works with Gemini 
- 🎯 Non-intrusive UI that appears only when needed

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "QuantumPrompt"
3. Click "Add to Chrome"

### Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use

## How to Use

1. Visit Gemini at https://gemini.google.com/
2. Type your prompt in the input field
3. Hover over the input field to reveal the "✨ Enhance" button
4. Click the button to enhance your prompt
5. Wait for the enhancement to complete
6. The enhanced prompt will replace your original text
7. Send the enhanced prompt to the AI

## Development

### Project Structure
- `manifest.json` - Extension configuration
- `content.js` - Main script that runs on the supported websites
- `styles.css` - Styling for the enhance button
- `popup.html` - Extension popup UI
- `popup.js` - Script for the popup
- `background.js` - Background service worker
- `icons/` - Extension icons

### API
The extension uses a custom API to enhance prompts:
- See backend website here: https://quantum-prompt-f11mg4oq5-ethan2000lius-projects.vercel.app/
- Endpoint: `https://quantum-prompt-api.vercel.app/api/enhance`
- Method: POST
- Body: `{ "prompt": "Your original prompt" }`
- Response: `{ "enhancedPrompt": "Your enhanced prompt" }`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

We're especially interested in:
- Adding support for ChatGPT and other AI platforms
- adding modle support for other LLMs and allow user to add api keys to increase quota
- Improving prompt enhancement quality
- Adding user customization options
- UI/UX improvements

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Thanks to all the AI assistants that helped debug this extension
- Inspired by the need for better AI prompts 