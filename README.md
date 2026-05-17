# Formify

AI-powered Google Forms auto-filler. Parses questions, sends them to Gemini, and fills in answers automatically.

## Features

- Auto-fills MCQ and checkbox answers using AI
- Shows AI answer cards below each question
- Integrated AI chat panel for follow-up questions
- Light/dark/system theme support
- Fully customizable — models, prompts, selectors, search engines
- Power-user settings for custom DOM selectors
- Keyboard shortcuts for fast workflow

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser

2. Install the script from GitHub:

   [**Install Formify**](https://github.com/Aman524524/Formify/raw/refs/heads/main/dist/formify.user.js)

3. Open any Google Form — you'll be prompted for a [Gemini API key](https://aistudio.google.com/apikey) (free)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + K` | Toggle settings panel |
| `Alt + M` | Show/hide AI answers |
| `Alt + J` | Toggle chat panel |
| `Esc` | Close settings |

## Development

```bash
bun install
bun run dev        # starts dev server on :1024
bun run build      # builds to dist/
bun run final      # production build → dist/formify.user.js
```

For live development, install `formify-dev.user.js` in Tampermonkey — it fetches from the local dev server with cache busting on every page load.

## Project Structure

```
src/
  main.ts              Entry point
  config/
    defaults.ts        Models, engines, selectors, themes
    types.ts           TypeScript interfaces
  core/
    FormParser.ts      Google Forms parser (global var + DOM fallback)
    AIService.ts       Gemini API integration
    Storage.ts         localStorage wrapper
    Network.ts         Fetch utility
  ui/
    Styles.ts          CSS with theme variables
    SettingsDialog.ts  Settings panel
    AnswerCard.ts      Per-question answer card
    ChatPanel.ts       AI chat sidebar
    Theme.ts           Theme system
    Toast.ts           Notifications
  utils/
    Logger.ts          Console utility
```

## License

MIT
