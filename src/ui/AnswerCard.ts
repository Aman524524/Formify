import type { ParsedOption } from "../config/types";
import * as Storage from "../core/Storage";
import * as AI from "../core/AIService";
import * as Toast from "./Toast";

interface AnswerCardParams {
    question: string;
    options: ParsedOption[] | null;
    answer: string;
}

export const create = ({ question, options, answer }: AnswerCardParams): HTMLDivElement => {
    const model = Storage.get("model");
    const showAnswers = Storage.get("showAnswers");
    const optionsStr = options?.map((o) => o.value).join(", ") || "";

    const card = document.createElement("div");
    card.className = `fy-answer formify-root${showAnswers ? "" : " hidden"}`;

    card.innerHTML = `
        <div class="fy-answer-header">
            <span class="fy-model-badge">${model}</span>
            <span class="fy-actions">
                <button data-action="copy" title="Copy to clipboard">Copy</button>
                <button data-action="regen" title="Re-generate">Retry</button>
                <button data-action="search" title="Search this question">Search</button>
                <button data-action="chat" title="Open in chat">Chat</button>
            </span>
        </div>
        <div class="fy-answer-body">${escapeHtml(answer)}</div>
    `;

    const body = card.querySelector(".fy-answer-body") as HTMLElement;

    // Action handlers
    card.addEventListener("click", async (e) => {
        const btn = (e.target as HTMLElement).closest("button[data-action]") as HTMLElement | null;
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === "copy") {
            await navigator.clipboard.writeText(answer);
            Toast.show("Copied to clipboard");
        }

        if (action === "regen") {
            body.textContent = "Regenerating...";
            const prompt = Storage.get("customPrompt") + "\n" + question +
                (optionsStr ? "\nOptions: " + optionsStr : "");
            const res = await AI.getResponse({ prompt });
            body.textContent = res;
        }

        if (action === "search") {
            const url = Storage.get("searchEngine") + encodeURIComponent(question);
            window.open(url, "_blank");
        }

        if (action === "chat") {
            // Dispatch custom event that ChatPanel listens to
            document.dispatchEvent(new CustomEvent("formify:open-chat", {
                detail: { message: Storage.get("customPrompt") + "\n" + question + (optionsStr ? "\nOptions: " + optionsStr : "") },
            }));
        }
    });

    return card;
};

const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};
