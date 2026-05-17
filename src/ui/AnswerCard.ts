import type { ParsedOption } from "../config/types";
import * as Storage from "../core/Storage";
import * as AI from "../core/AIService";
import * as Toast from "./Toast";

interface AnswerCardParams {
    question: string;
    options: ParsedOption[] | null;
    answer: string;
    explanation: string;
    isError?: boolean;
}

export const create = ({ question, options, answer, explanation, isError }: AnswerCardParams): HTMLDivElement => {
    const model = Storage.get("model");
    const showAnswers = Storage.get("showAnswers");
    const optionsStr = options?.map((o) => o.value).join(", ") || "";

    const card = document.createElement("div");
    card.className = `fy-answer formify-root${showAnswers ? "" : " hidden"}`;

    const header = document.createElement("div");
    header.className = "fy-answer-header";

    const badge = document.createElement("span");
    badge.className = "fy-model-badge";
    badge.textContent = "🦕 " + model;

    const actions = document.createElement("span");
    actions.className = "fy-actions";
    const buttonDefs: [string, string, string][] = [
        ["copy", "Copy to clipboard", "Copy"],
        ["regen", "Re-generate", "Retry"],
        ["search", "Search this question", "Search"],
        ["chat", "Open in chat", "Chat"],
    ];
    for (const [action, title, label] of buttonDefs) {
        const btn = document.createElement("button");
        btn.dataset["action"] = action;
        btn.title = title;
        btn.textContent = label;
        actions.appendChild(btn);
    }

    header.appendChild(badge);
    header.appendChild(actions);

    const body = document.createElement("div");
    body.className = `fy-answer-body${isError ? " error" : ""}`;

    const answerEl = document.createElement("div");
    answerEl.className = "fy-answer-text";
    answerEl.textContent = answer;
    body.appendChild(answerEl);

    const explEl = document.createElement("div");
    explEl.className = "fy-explanation";
    explEl.textContent = explanation;
    if (!explanation) explEl.style.display = "none";
    body.appendChild(explEl);

    card.appendChild(header);
    card.appendChild(body);
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
                selectAndCopy(currentAnswer);
                Toast.show("Copied to clipboard", 2000, "success");
            }
        }

        if (action === "regen") {
            answerEl.textContent = "Thinking...";
            explEl.textContent = "";
            explEl.style.display = "none";
            body.classList.add("loading");
            body.classList.remove("error");
            btn.setAttribute("disabled", "");

            try {
                const prompt = buildPrompt(question, optionsStr);
                const res = await AI.getResponse({ prompt });
                const reParsed = AI.parseResponse(res);
                currentAnswer = reParsed.answer;
                answerEl.textContent = reParsed.answer;
                explEl.textContent = reParsed.explanation;
                explEl.style.display = reParsed.explanation ? "" : "none";
                body.classList.remove("loading");

                if (res.startsWith("❌") || res.startsWith("⚠️")) {
                    body.classList.add("error");
                }
            } catch (err) {
                answerEl.textContent = "Failed to regenerate: " + (err instanceof Error ? err.message : "Unknown error");
                body.classList.remove("loading");
                body.classList.add("error");
            } finally {
                btn.removeAttribute("disabled");
            }
        }

        if (action === "search") {
            const query = question + (optionsStr ? " " + optionsStr : "");
            const url = Storage.get("searchEngine") + encodeURIComponent(query);
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

    const header = document.createElement("div");
    header.className = "fy-answer-header";

    const badge = document.createElement("span");
    badge.className = "fy-model-badge";
    badge.textContent = "🦕 " + Storage.get("model");

    const actionsSpan = document.createElement("span");
    actionsSpan.className = "fy-actions";

    header.appendChild(badge);
    header.appendChild(actionsSpan);

    const body = document.createElement("div");
    body.className = "fy-answer-body loading";
    body.textContent = "Thinking...";

    card.appendChild(header);
    card.appendChild(body);
    return card;
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
