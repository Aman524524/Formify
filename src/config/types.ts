// ─── Model Configuration ────────────────────────────────────────────────────

export interface ModelOption {
    id: string;
    name: string;
    provider: "gemini" | "openai";
}

// ─── Search Engine ──────────────────────────────────────────────────────────

export interface SearchEngine {
    id: string;
    name: string;
    urlTemplate: string; // must end with the query param, e.g. "?q="
}

// ─── Theme ──────────────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeColors {
    bg: string;
    bgSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentHover: string;
    shadow: string;
}

// ─── Form Selectors (power-user customizable) ───────────────────────────────

export interface FormSelectors {
    form: string;
    contentContainer: string;
    headerContainer: string;
    titleContainer: string;
    descriptionContainer: string;
    questionList: string;
    questionItem: string;
    questionDataDiv: string;
    optionLabel: string;
}

// ─── Settings (stored in localStorage) ──────────────────────────────────────

export interface Settings {
    apiKey: string;
    model: string;
    customPrompt: string;
    searchEngine: string;
    theme: ThemeMode;
    selectors: FormSelectors;
    autoFill: boolean;
    showAnswers: boolean;
}

// ─── Parsed Form Types ──────────────────────────────────────────────────────

export interface ParsedResult {
    title: string | null;
    description: string | null;
    questions: ParsedQuestion[];
}

export interface ParsedQuestion {
    title: string;
    moreInfo: any[] | null;
    /**
     * Question types:
     * 0 = Short Answer, 1 = Paragraph, 2 = Multiple Choice,
     * 3 = Dropdown, 4 = Checkboxes, 5 = Linear Scale,
     * 7 = Grid Choice, 9 = Date, 10 = Time, 13 = File Upload
     */
    type: number;
    id: number;
    required: boolean;
    options: ParsedOption[];
}

export interface ParsedOption {
    value: string;
    moreInfo: any[] | null;
}

// ─── Network ────────────────────────────────────────────────────────────────

export interface RequestOptions {
    body?: string;
    headers?: Headers;
    method: "GET" | "POST";
}

export interface RequestResponse {
    success: boolean;
    response: string;
    statusText: string;
}
