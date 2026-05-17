import { MODELS, SEARCH_ENGINES } from "../config/defaults";
import type { ThemeMode } from "../config/types";
import * as Storage from "../core/Storage";
import * as Toast from "./Toast";

let overlay: HTMLDivElement | null = null;

// ─── Build the settings dialog DOM ──────────────────────────────────────────

const build = (): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "fy-overlay formify-root";
    el.innerHTML = `
        <div class="fy-dialog">
            <div class="fy-dialog-header">
                <span class="fy-title">Formify</span>
                <button class="fy-close" title="Close (Esc)">✕</button>
            </div>
            <div class="fy-dialog-body">
                <!-- General -->
                <div class="fy-section">
                    <div class="fy-section-title">General</div>
                    <div class="fy-field">
                        <label>API Key</label>
                        <input type="password" id="fy-apikey" placeholder="Paste Gemini API key" />
                    </div>
                    <div class="fy-field">
                        <label>Model</label>
                        <select id="fy-model">
                            ${MODELS.map((m) => `<option value="${m.id}">${m.name}</option>`).join("")}
                        </select>
                    </div>
                    <div class="fy-field">
                        <label>Search Engine</label>
                        <select id="fy-search">
                            ${SEARCH_ENGINES.map((s) => `<option value="${s.urlTemplate}">${s.name}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <!-- Prompt -->
                <div class="fy-section">
                    <div class="fy-section-title">Prompt</div>
                    <div class="fy-field">
                        <label>System Prompt</label>
                        <textarea id="fy-prompt" rows="3" placeholder="Instructions for the AI..."></textarea>
                    </div>
                </div>

                <!-- Behavior -->
                <div class="fy-section">
                    <div class="fy-section-title">Behavior</div>
                    <div class="fy-field">
                        <label>Auto-fill answers</label>
                        <label class="fy-toggle">
                            <input type="checkbox" id="fy-autofill" />
                            <span class="fy-slider"></span>
                        </label>
                    </div>
                    <div class="fy-field">
                        <label>Show AI answers</label>
                        <label class="fy-toggle">
                            <input type="checkbox" id="fy-showanswers" />
                            <span class="fy-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Appearance -->
                <div class="fy-section">
                    <div class="fy-section-title">Appearance</div>
                    <div class="fy-field">
                        <label>Theme</label>
                        <select id="fy-theme">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">System</option>
                        </select>
                    </div>
                </div>

                <!-- Advanced -->
                <div class="fy-section">
                    <div class="fy-section-title">Advanced (Selectors)</div>
                    <div class="fy-field">
                        <label>Form</label>
                        <input type="text" id="fy-sel-form" />
                    </div>
                    <div class="fy-field">
                        <label>Question Item</label>
                        <input type="text" id="fy-sel-questionItem" />
                    </div>
                    <div class="fy-field">
                        <label>Question Data</label>
                        <input type="text" id="fy-sel-questionDataDiv" />
                    </div>
                    <div class="fy-field">
                        <label>Option Label</label>
                        <input type="text" id="fy-sel-optionLabel" />
                    </div>
                </div>
            </div>
            <div class="fy-dialog-footer">
                <span><kbd class="fy-kbd">Alt+K</kbd> toggle &nbsp; <kbd class="fy-kbd">Alt+M</kbd> hide answers</span>
                <a href="https://github.com/Aman524524/Formify" target="_blank">GitHub ↗</a>
            </div>
        </div>
    `;

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

    // Selector fields
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

    // Close button + overlay click
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
