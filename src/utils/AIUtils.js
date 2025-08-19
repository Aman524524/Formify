// @ts-check

import { request } from "./NetworkUtils.js";
import { getItem } from "./StorageUtils.js";

/**
 * Represents a prompt detail including the prompt text.
 * @typedef {Object} PromptType
 * @property {string} prompt - The text of the prompt to send to the AI.
 */

/**
 * Gets a response from the appropriate AI model based on current settings.
 * @param {PromptType} prompt - The prompt object.
 * @returns {Promise<string>} A promise that resolves to the AI's response text.
 */
const getAIResponse = async (prompt) => {
    const model = getItem("model") || "gemini-1.5-flash"; // Updated to a current model name

    // List of supported Gemini models
    const supportedGeminiModels = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro" 
    ];

    if (supportedGeminiModels.includes(model)) {
        return getGeminiResponse(prompt);
    } else {
        return "Model not supported for now: " + model;
    }
};

/**
 * Fetches a response from the Google Gemini API.
 * @param {PromptType} prompt - The prompt object.
 * @returns {Promise<string>} A promise that resolves to the Gemini model's response text.
 */
const getGeminiResponse = async (prompt) => {
    const model = getItem("model") || "gemini-1.5-flash";
    const apiKey = getItem("apiKey") || "";

    if (!apiKey) {
        return "API Key is missing. Please configure it in the settings.";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await request(url, {
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        method: "POST",
        body: JSON.stringify({
            "contents": [{
                "parts": [{ "text": prompt.prompt }],
            }],
        }),
    });

    if (!response.success) {
        return "Failed to fetch: " + response.statusText;
    }

    try {
        const parsedContent = JSON.parse(response.response);
        const text = parsedContent?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text === undefined) {
             // Provides more helpful error message if the response structure is unexpected
            return "Failed to parse response: The response structure was unexpected.";
        }
        return text;
    } catch (err) {
        return "Failed to parse JSON response: " + err.message;
    }
};

export { getAIResponse };
