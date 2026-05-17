/**
 * Formify — Google Forms AI auto-filler
 * Entry point: orchestrates parsing, AI calls, and UI.
 */

import * as Storage from "./core/Storage";
import * as AI from "./core/AIService";
import { parse } from "./core/FormParser";
import * as SettingsDialog from "./ui/SettingsDialog";
import * as ChatPanel from "./ui/ChatPanel";
import * as AnswerCard from "./ui/AnswerCard";
import { getStyles } from "./ui/Styles";
import { log, error } from "./utils/Logger";
import * as Toast from "./ui/Toast";

declare const GM_addStyle: (css: string) => void;

(async function () {
    // ─── Inject styles ──────────────────────────────────────────────────────
    GM_addStyle(getStyles());

    // ─── Init UI components ─────────────────────────────────────────────────
    SettingsDialog.init();
    ChatPanel.init();

    // ─── API key check ──────────────────────────────────────────────────────
    if (!Storage.get("apiKey")) {
        const key = prompt(
            "Formify: Paste your Gemini API key.\n" +
            "Get a free key: https://aistudio.google.com/apikey"
        );
        if (key) {
            Storage.set("apiKey", key);
        } else {
            Toast.show("API key required — open settings with Alt+K");
        }
    }

    // ─── Keyboard shortcuts ─────────────────────────────────────────────────
    document.addEventListener("keydown", (e) => {
        if (e.altKey && e.key === "k") {
            e.preventDefault();
            SettingsDialog.toggle();
        }
        if (e.key === "Escape" && SettingsDialog.isOpen()) {
            SettingsDialog.toggle(false);
        }
        if (e.altKey && e.key === "m") {
            e.preventDefault();
            const current = Storage.get("showAnswers");
            Storage.set("showAnswers", !current);
            document.querySelectorAll(".fy-answer").forEach((el) => {
                el.classList.toggle("hidden", current);
            });
            Toast.show(current ? "Answers hidden" : "Answers visible");
        }
        if (e.altKey && e.key === "j") {
            e.preventDefault();
            ChatPanel.toggle();
        }
    });

    // ─── Parse form ─────────────────────────────────────────────────────────
    let formData;
    try {
        formData = parse();
        log("Parsed", formData.questions.length, "questions");
    } catch (err) {
        error("Failed to parse form:", err);
        Toast.show("Failed to parse form — check console");
        return;
    }

    // ─── Process each question ──────────────────────────────────────────────
    const selectors = Storage.getSelectors();
    const questionEls = document.querySelectorAll(selectors.questionItem);

    for (let i = 0; i < questionEls.length; i++) {
        const container = questionEls[i];
        const question = formData.questions[i];
        if (!question || !question.title) continue;

        const optionsStr = question.options?.map((o) => o.value).join(", ") || "";
        const prompt =
            Storage.get("customPrompt") + "\n" +
            question.title +
            (optionsStr ? "\nOptions: " + optionsStr : "");

        const aiAnswer = await AI.getResponse({ prompt });

        // ─── Auto-fill clickable options ────────────────────────────────
        if (Storage.get("autoFill")) {
            const labelSel = selectors.optionLabel;
            const labels = container.querySelectorAll(labelSel);

            for (const label of labels) {
                const text = label.textContent?.trim();
                if (text && aiAnswer.trim().includes(text)) {
                    // Type 2 = MCQ, Type 4 = Checkboxes
                    if (question.type === 2 || question.type === 4) {
                        (label as HTMLElement).click();
                        if (question.type === 2) break; // MCQ: only one answer
                    }
                }
            }
        }

        // ─── Render answer card ─────────────────────────────────────────
        const card = AnswerCard.create({
            question: question.title,
            options: question.options,
            answer: aiAnswer,
        });

        container.appendChild(card);
    }

    log("Done processing all questions");
    Toast.show("Formify finished ✓");
})();
