import type { ModelOption, SearchEngine, FormSelectors, Settings, ThemeColors } from "./types";

// ─── Available Models ───────────────────────────────────────────────────────

export const MODELS: ModelOption[] = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite", provider: "gemini" },
    { id: "gemini-2.0-pro-exp-02-05", name: "Gemini 2.0 Pro (Exp)", provider: "gemini" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "gemini" },
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
    "Answer the following question concisely in plain text. " +
    "If options are provided, your answer MUST include one of the given options exactly. " +
    "No markdown, no bullet points, no extra formatting. Keep it short.";

// ─── Theme Colors ───────────────────────────────────────────────────────────

export const THEMES: Record<"light" | "dark", ThemeColors> = {
    light: {
        bg: "#ffffff",
        bgSecondary: "#f7f8fa",
        text: "#1a1a2e",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        accent: "#6366f1",
        accentHover: "#4f46e5",
        shadow: "rgba(0, 0, 0, 0.08)",
    },
    dark: {
        bg: "#1e1e2e",
        bgSecondary: "#282840",
        text: "#e2e8f0",
        textSecondary: "#94a3b8",
        border: "#334155",
        accent: "#818cf8",
        accentHover: "#a5b4fc",
        shadow: "rgba(0, 0, 0, 0.3)",
    },
};

// ─── Default Settings ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Settings = {
    apiKey: "",
    model: "gemini-2.0-flash",
    customPrompt: DEFAULT_PROMPT,
    searchEngine: "https://www.google.com/search?q=",
    theme: "light",
    selectors: DEFAULT_SELECTORS,
    autoFill: true,
    showAnswers: true,
};
