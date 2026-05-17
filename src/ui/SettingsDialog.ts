import { MODELS, SEARCH_ENGINES } from "../config/defaults";
import type { ThemeMode } from "../config/types";
import * as Storage from "../core/Storage";
import * as Toast from "./Toast";

let overlay: HTMLDivElement | null = null;

// ─── Build the settings dialog DOM ──────────────────────────────────────────

const build = (): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "fy-overlay formify-root";

    const dialog = document.createElement("div");
    dialog.className = "fy-dialog";

    const headerDiv = document.createElement("div");
    headerDiv.className = "fy-dialog-header";
    const titleSpan = document.createElement("span");
    titleSpan.className = "fy-title";
    titleSpan.textContent = "Formify";
    const closeBtn = document.createElement("button");
    closeBtn.className = "fy-close";
    closeBtn.title = "Close (Esc)";
    closeBtn.textContent = "✕";
    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "fy-dialog-body";

    const section = (title: string): HTMLDivElement => {
        const sec = document.createElement("div");
        sec.className = "fy-section";
        const t = document.createElement("div");
        t.className = "fy-section-title";
        t.textContent = title;
        sec.appendChild(t);
        return sec;
    };

    const field = (labelText: string, control: HTMLElement): HTMLDivElement => {
        const f = document.createElement("div");
        f.className = "fy-field";
        const lbl = document.createElement("label");
        lbl.textContent = labelText;
        f.appendChild(lbl);
        f.appendChild(control);
        return f;
    };

    const makeSelect = (id: string, options: { label: string; value: string }[]): HTMLSelectElement => {
        const sel = document.createElement("select");
        sel.id = id;
        for (const opt of options) {
            const o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.label;
            sel.appendChild(o);
        }
        return sel;
    };

    const makeInput = (id: string, type: string, placeholder?: string): HTMLInputElement => {
        const inp = document.createElement("input");
        inp.type = type;
        inp.id = id;
        if (placeholder) inp.placeholder = placeholder;
        return inp;
    };

    const makePasswordInput = (id: string, placeholder?: string): HTMLDivElement => {
        const wrap = document.createElement("div");
        wrap.className = "fy-password-wrap";
        const inp = document.createElement("input");
        inp.type = "password";
        inp.id = id;
        if (placeholder) inp.placeholder = placeholder;
        const eyeBtn = document.createElement("button");
        eyeBtn.type = "button";
        eyeBtn.className = "fy-eye-btn";
        eyeBtn.title = "Toggle visibility";
        eyeBtn.textContent = "👁";
        eyeBtn.addEventListener("click", () => {
            const isPassword = inp.type === "password";
            inp.type = isPassword ? "text" : "password";
            eyeBtn.textContent = isPassword ? "🙈" : "👁";
        });
        wrap.appendChild(inp);
        wrap.appendChild(eyeBtn);
        return wrap;
    };

    const generalSec = section("General");
    generalSec.appendChild(field("API Key", makePasswordInput("fy-apikey", "Paste Gemini API key")));
    generalSec.appendChild(field("Model", makeSelect("fy-model", MODELS.map((m) => ({ label: m.name, value: m.id })))));
    generalSec.appendChild(field("Search Engine", makeSelect("fy-search", SEARCH_ENGINES.map((s) => ({ label: s.name, value: s.urlTemplate })))));
    body.appendChild(generalSec);

    const promptSec = section("Prompt");
    const textarea = document.createElement("textarea");
    textarea.id = "fy-prompt";
    textarea.rows = 3;
    textarea.placeholder = "Instructions for the AI...";
    promptSec.appendChild(field("System Prompt", textarea));
    body.appendChild(promptSec);

    const behaviorSec = section("Behavior");

    const makeToggle = (id: string): HTMLLabelElement => {
        const lbl = document.createElement("label");
        lbl.className = "fy-toggle";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = id;
        const slider = document.createElement("span");
        slider.className = "fy-slider";
        lbl.appendChild(cb);
        lbl.appendChild(slider);
        return lbl;
    };

    behaviorSec.appendChild(field("Auto-fill answers", makeToggle("fy-autofill")));
    behaviorSec.appendChild(field("Show AI answers", makeToggle("fy-showanswers")));
    body.appendChild(behaviorSec);

    const appearanceSec = section("Appearance");
    appearanceSec.appendChild(field("Theme", makeSelect("fy-theme", [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "System", value: "auto" },
    ])));
    body.appendChild(appearanceSec);

    const advancedSec = section("Advanced (Selectors)");
    advancedSec.appendChild(field("Form", makeInput("fy-sel-form", "text")));
    advancedSec.appendChild(field("Question Item", makeInput("fy-sel-questionItem", "text")));
    advancedSec.appendChild(field("Question Data", makeInput("fy-sel-questionDataDiv", "text")));
    advancedSec.appendChild(field("Option Label", makeInput("fy-sel-optionLabel", "text")));
    body.appendChild(advancedSec);

    const footer = document.createElement("div");
    footer.className = "fy-dialog-footer";

    const shortcuts = document.createElement("span");
    const kbd1 = document.createElement("kbd");
    kbd1.className = "fy-kbd";
    kbd1.textContent = "Alt+K";
    const kbd2 = document.createElement("kbd");
    kbd2.className = "fy-kbd";
    kbd2.textContent = "Alt+M";
    shortcuts.appendChild(kbd1);
    shortcuts.append(" toggle \u00a0 ");
    shortcuts.appendChild(kbd2);
    shortcuts.append(" hide answers");

    const ghLink = document.createElement("a");
    ghLink.href = "https://github.com/Aman524524/Formify";
    ghLink.target = "_blank";
    ghLink.textContent = "GitHub ↗";

    footer.appendChild(shortcuts);
    footer.appendChild(ghLink);

    dialog.appendChild(headerDiv);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    el.appendChild(dialog);

    return el;
};

// ─── Sync values from storage → inputs ──────────────────────────────────────

const syncToUI = () => {
    if (!overlay) return;
    const settings = Storage.getAll();

    const q = (sel: string) => overlay!.querySelector(sel) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

    const apiKey = q("#fy-apikey") as HTMLInputElement;
    if (apiKey) apiKey.value = settings.apiKey;

    const model = q("#fy-model") as HTMLSelectElement;
    if (model) model.value = settings.model;

    const search = q("#fy-search") as HTMLSelectElement;
    if (search) search.value = settings.searchEngine;

    const prompt = q("#fy-prompt") as HTMLTextAreaElement;
    if (prompt) prompt.value = settings.customPrompt;

    const autofill = q("#fy-autofill") as HTMLInputElement;
    if (autofill) autofill.checked = settings.autoFill;

    const showAns = q("#fy-showanswers") as HTMLInputElement;
    if (showAns) showAns.checked = settings.showAnswers;

    const theme = q("#fy-theme") as HTMLSelectElement;
    if (theme) theme.value = settings.theme;

    // Selectors
    const selForm = q("#fy-sel-form") as HTMLInputElement;
    if (selForm) selForm.value = settings.selectors.form;

    const selQI = q("#fy-sel-questionItem") as HTMLInputElement;
    if (selQI) selQI.value = settings.selectors.questionItem;

    const selQD = q("#fy-sel-questionDataDiv") as HTMLInputElement;
    if (selQD) selQD.value = settings.selectors.questionDataDiv;

    const selOL = q("#fy-sel-optionLabel") as HTMLInputElement;
    if (selOL) selOL.value = settings.selectors.optionLabel;
};

// ─── Bind input events → storage ────────────────────────────────────────────

const bindEvents = () => {
    if (!overlay) return;

    const bind = (sel: string, handler: (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => void) => {
        const el = overlay!.querySelector(sel);
        if (el) {
            el.addEventListener("input", () => handler(el as any));
            el.addEventListener("change", () => handler(el as any));
        }
    };

    bind("#fy-apikey", (el) => Storage.set("apiKey", (el as HTMLInputElement).value));
    bind("#fy-model", (el) => Storage.set("model", (el as HTMLSelectElement).value));
    bind("#fy-search", (el) => Storage.set("searchEngine", (el as HTMLSelectElement).value));
    bind("#fy-prompt", (el) => Storage.set("customPrompt", (el as HTMLTextAreaElement).value));

    bind("#fy-autofill", (el) => Storage.set("autoFill", (el as HTMLInputElement).checked));
    bind("#fy-showanswers", (el) => {
        const show = (el as HTMLInputElement).checked;
        Storage.set("showAnswers", show);
        document.querySelectorAll(".fy-answer").forEach((card) => {
            card.classList.toggle("hidden", !show);
        });
    });

    bind("#fy-theme", (el) => {
        Storage.set("theme", (el as HTMLSelectElement).value as ThemeMode);
        Toast.show("Theme updated — reload page to fully apply");
    });

    bind("#fy-sel-form", (el) => {
        const sel = Storage.get("selectors");
        sel.form = (el as HTMLInputElement).value;
        Storage.set("selectors", sel);
    });
    bind("#fy-sel-questionItem", (el) => {
        const sel = Storage.get("selectors");
        sel.questionItem = (el as HTMLInputElement).value;
        Storage.set("selectors", sel);
    });
    bind("#fy-sel-questionDataDiv", (el) => {
        const sel = Storage.get("selectors");
        sel.questionDataDiv = (el as HTMLInputElement).value;
        Storage.set("selectors", sel);
    });
    bind("#fy-sel-optionLabel", (el) => {
        const sel = Storage.get("selectors");
        sel.optionLabel = (el as HTMLInputElement).value;
        Storage.set("selectors", sel);
    });

    overlay!.querySelector(".fy-close")?.addEventListener("click", () => toggle(false));
    overlay!.addEventListener("click", (e) => {
        if (e.target === overlay) toggle(false);
    });
};

// ─── Public API ─────────────────────────────────────────────────────────────

export const init = () => {
    overlay = build();
    document.body.appendChild(overlay);
    syncToUI();
    bindEvents();
};

export const toggle = (force?: boolean) => {
    if (!overlay) return;
    if (force === true) overlay.classList.add("active");
    else if (force === false) overlay.classList.remove("active");
    else overlay.classList.toggle("active");
};

export const isOpen = (): boolean => {
    return overlay?.classList.contains("active") ?? false;
};

export const refresh = () => syncToUI();
