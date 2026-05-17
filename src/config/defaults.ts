import type { ModelOption, SearchEngine, FormSelectors, Settings, ThemeColors } from "./types";

// ─── Available Models ───────────────────────────────────────────────────────

export const MODELS: ModelOption[] = [
    // Gemini
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (Preview)", provider: "gemini" },
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)", provider: "gemini" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", provider: "gemini" },
    { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash-Lite (Preview)", provider: "gemini" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini" },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "gemini" },
    { id: "gemini-flash-latest", name: "Gemini Flash (Latest)", provider: "gemini" },
    // OpenAI
    { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
    { id: "gpt-4.1", name: "GPT-4.1", provider: "openai" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai" },
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "openai" },
    { id: "o4-mini", name: "o4-mini", provider: "openai" },
];

// ─── Search Engines ─────────────────────────────────────────────────────────

export const SEARCH_ENGINES: SearchEngine[] = [
    { id: "google", name: "Google", urlTemplate: "https://www.google.com/search?q=" },
    { id: "chatgpt", name: "ChatGPT", urlTemplate: "https://chatgpt.com/?q=" },
    { id: "bing", name: "Bing", urlTemplate: "https://www.bing.com/search?q=" },
    { id: "duckduckgo", name: "DuckDuckGo", urlTemplate: "https://duckduckgo.com/?q=" },
    { id: "brave", name: "Brave", urlTemplate: "https://search.brave.com/search?q=" },
    { id: "startpage", name: "Startpage", urlTemplate: "https://www.startpage.com/do/search?q=" },
];

// ─── Default Selectors (Google Forms DOM structure) ─────────────────────────

export const DEFAULT_SELECTORS: FormSelectors = {
    form: "form#mG61Hd",
    contentContainer: ".lrKTG",
    headerContainer: ".m7w29c.O8VmIc.tIvQIf",
    titleContainer: ".ahS2Le",
    descriptionContainer: ".cBGGJ.OIC90c",
    questionList: ".o3Dpx[role='list']",
    questionItem: ".Qr7Oae[role='listitem']",
    questionDataDiv: "div[jsmodel='CP1oW']",
    optionLabel: "label",
};

// ─── Default System Prompt ──────────────────────────────────────────────────

export const DEFAULT_PROMPT =
    "Answer the following question. Respond ONLY with a valid JSON object: " +
    "{\"answer\": \"your answer\", \"explanation\": \"brief reason\"}. " +
    "If options are listed, 'answer' MUST be exactly one of the given options as written. " +
    "'explanation' should be one concise sentence. No markdown, no extra text outside the JSON.";

// ─── Theme Colors ───────────────────────────────────────────────────────────

export const THEMES: Record<"light" | "dark", ThemeColors> = {
    light: {
        bg: "#ffffff",
        bgSecondary: "#f2f5f3",
        text: "#1f1f1f",
        textSecondary: "#5f6368",
        border: "#dadce0",
        accent: "#1a7f4b",
        accentHover: "#146b3e",
        shadow: "rgba(0, 0, 0, 0.06)",
    },
    dark: {
        bg: "#1f1f1f",
        bgSecondary: "#2d2d2d",
        text: "#e3e3e3",
        textSecondary: "#9aa0a6",
        border: "#3c4043",
        accent: "#81c995",
        accentHover: "#a8dab5",
        shadow: "rgba(0, 0, 0, 0.28)",
    },
};

// ─── Default Settings ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Settings = {
    apiKey: "",
    model: "gemini-2.5-flash",
    customPrompt: DEFAULT_PROMPT,
    searchEngine: "https://www.google.com/search?q=",
    theme: "light",
    selectors: DEFAULT_SELECTORS,
    autoFill: true,
    showAnswers: true,
};
