import { request } from "./Network";
import * as Storage from "./Storage";

interface PromptInput {
    prompt: string;
}

export const getResponse = async ({ prompt }: PromptInput): Promise<string> => {
    const model = Storage.get("model");
    const apiKey = Storage.get("apiKey");

    if (!apiKey) {
        return "⚠️ API key not set. Open settings (Alt+K) to configure.";
    }

    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await request(url, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
        }),
    });

    if (!res.success) {
        return "❌ API error: " + res.statusText;
    }

    try {
        const json = JSON.parse(res.response);
        return json?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from model.";
    } catch {
        return "❌ Failed to parse API response.";
    }
};
