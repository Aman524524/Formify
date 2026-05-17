import type { ParsedOption } from "../config/types";
import * as Storage from "../core/Storage";
import * as AI from "../core/AIService";
import * as Toast from "./Toast";

interface AnswerCardParams {
    question: string;
    options: ParsedOption[] | null;
    answer: string;
    isError?: boolean;
}

export const create = ({ question, options, answer, isError }: AnswerCardParams): HTMLDivElement => {
    const model = Storage.get("model");
    const showAnswers = Storage.get("showAnswers");
    const optionsStr = options?.map((o) => o.value).join(", ") || "";

    const card = document.createElement("div");
    card.className = `fy-answer formify-root${showAnswers ? "" : " hidden"}`;

    card.innerHTML = `
        <div class="fy-answer-header">
            <span class="fy-model-badge">${escapeHtml(model)}</span>
            <span class="fy-actions">
                <button data-action="copy" title="Copy to clipboard">Copy</button>
                <button data-action="regen" title="Re-generate">Retry</button>
                <button data-action="search" title="Search this question">Search</button>
                <button data-action="chat" title="Open in chat">Chat</button>
            </span>
        </div>
        <div class="fy-answer-body${isError ? " error" : ""}">${escapeHtml(answer)}</div>
    `;

    const body = card.querySelector(".fy-answer-body") as HTMLElement;
    let currentAnswer = answer;

    card.addEventListener("click", async (e) => {
        const btn = (e.target as HTMLElement).closest("button[data-action]") as HTMLElement | null;
        if (!btn) return;

        const action = btn.dataset["action"];

        if (action === "copy") {
            try {
                await navigator.clipboard.writeText(currentAnswer);
                Toast.show("Copied to clipboard", 2000, "success");
            } catch {
                // Fallback for clipboard API failure
                selectAndCopy(currentAnswer);
                Toast.show("Copied to clipboard", 2000, "success");
            }
        }

        if (action === "regen") {
            body.textContent = "Thinking...";
            body.classList.add("loading");
            body.classList.remove("error");
            btn.setAttribute("disabled", "");

            try {
                const prompt = buildPrompt(question, optionsStr);
                const res = await AI.getResponse({ prompt });
                currentAnswer = res;
                body.textContent = res;
                body.classList.remove("loading");

                if (res.startsWith("❌") || res.startsWith("⚠️")) {
                    body.classList.add("error");
                }
            } catch (err) {
                body.textContent = "Failed to regenerate: " + (err instanceof Error ? err.message : "Unknown error");
                body.classList.remove("loading");
                body.classList.add("error");
            } finally {
                btn.removeAttribute("disabled");
            }
        }

        if (action === "search") {
            const url = Storage.get("searchEngine") + encodeURIComponent(question);
            window.open(url, "_blank");
        }

        if (action === "chat") {
            document.dispatchEvent(new CustomEvent("formify:open-chat", {
                detail: { message: buildPrompt(question, optionsStr) },
            }));
        }
    });

    return card;
};

// ─── Skeleton placeholder shown while waiting for AI ────────────────────────

export const createSkeleton = (): HTMLDivElement => {
    const card = document.createElement("div");
    card.className = "fy-answer formify-root";
    card.innerHTML = `
        <div class="fy-answer-header">
            <span class="fy-model-badge">${escapeHtml(Storage.get("model"))}</span>
            <span class="fy-actions"></span>
        </div>
        <div class="fy-answer-body loading">Thinking...</div>
    `;
    return card;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

const buildPrompt = (question: string, optionsStr: string): string => {
    return Storage.get("customPrompt") + "\n" + question +
        (optionsStr ? "\nOptions: " + optionsStr : "");
};

const selectAndCopy = (text: string) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
};
