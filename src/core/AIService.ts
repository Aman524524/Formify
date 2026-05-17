import { request } from "./Network";
import * as Storage from "./Storage";
import { MODELS } from "../config/defaults";

interface PromptInput {
    prompt: string;
}

const getProvider = (modelId: string): "gemini" | "openai" => {
    return MODELS.find((m) => m.id === modelId)?.provider ?? (modelId.startsWith("gemini") ? "gemini" : "openai");
};

// ─── Gemini (x-goog-api-key header, v1beta) ────────────────────────────────

const callGemini = async (model: string, apiKey: string, prompt: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const res = await request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
        }),
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        }),
    });

    if (!res.success) return "❌ Gemini API error: " + res.statusText;

    try {
        const json = JSON.parse(res.response);
        return json?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from model.";
    } catch {
        return "❌ Failed to parse Gemini response.";
    }
};

// ─── OpenAI (Authorization: Bearer, /v1/chat/completions) ───────────────────

const callOpenAI = async (model: string, apiKey: string, prompt: string): Promise<string> => {
    const url = "https://api.openai.com/v1/chat/completions";

    const res = await request(url, {
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        }),
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        }),
    });

    if (!res.success) return "❌ OpenAI API error: " + res.statusText;

    try {
        const json = JSON.parse(res.response);
        return json?.choices?.[0]?.message?.content || "No response from model.";
    } catch {
        return "❌ Failed to parse OpenAI response.";
    }
};

// ─── Public API ─────────────────────────────────────────────────────────────

// ─── Response parsing ────────────────────────────────────────────────────────

export interface AIAnswer {
    answer: string;
    explanation: string;
}

export const parseResponse = (raw: string): AIAnswer => {
    try {
        const json = JSON.parse(raw);
        if (json.answer) return { answer: json.answer, explanation: json.explanation || "" };
    } catch {
        const match = raw.match(/\{[\s\S]*?"answer"[\s\S]*?\}/);
        if (match) {
            try {
                const json = JSON.parse(match[0]);
                if (json.answer) return { answer: json.answer, explanation: json.explanation || "" };
            } catch { /* fall through */ }
        }
    }
    return { answer: raw, explanation: "" };
};

// ─── Public API ─────────────────────────────────────────────────────────────

export const getResponse = async ({ prompt }: PromptInput): Promise<string> => {
    const model = Storage.get("model");
    const apiKey = Storage.get("apiKey");

    if (!apiKey) {
        return "⚠️ API key not set. Open settings (Alt+K) to configure.";
    }

    const provider = getProvider(model);
    return provider === "openai"
        ? callOpenAI(model, apiKey, prompt)
        : callGemini(model, apiKey, prompt);
};
