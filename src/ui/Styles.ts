import { getCSSVariables } from "./Theme";

export const getStyles = (): string => {
    const vars = getCSSVariables();

    return `
/* ─── Formify Root Variables ──────────────────────────────────────────────── */

.formify-root {
    ${vars}
    --fy-radius: 12px;
    --fy-radius-sm: 8px;
    --fy-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --fy-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Settings Dialog Overlay ─────────────────────────────────────────────── */

.fy-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    font-family: var(--fy-font);
}

.fy-overlay.active {
    display: flex;
}

/* ─── Dialog Panel ────────────────────────────────────────────────────────── */

.fy-dialog {
    background: var(--fy-bg);
    color: var(--fy-text);
    border-radius: var(--fy-radius);
    width: min(480px, 90vw);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 48px var(--fy-shadow), 0 0 0 1px var(--fy-border);
    overflow: hidden;
    animation: fy-slide-up 0.25s ease-out;
}

@keyframes fy-slide-up {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ─── Dialog Header ───────────────────────────────────────────────────────── */

.fy-dialog-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--fy-border);
    gap: 12px;
}

.fy-dialog-header .fy-title {
    flex: 1;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--fy-accent), #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.fy-dialog-header .fy-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--fy-text2);
    font-size: 18px;
    cursor: pointer;
    transition: var(--fy-transition);
}

.fy-dialog-header .fy-close:hover {
    background: var(--fy-bg2);
    color: var(--fy-text);
}

/* ─── Dialog Body ─────────────────────────────────────────────────────────── */

.fy-dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
}

.fy-section {
    margin-bottom: 20px;
}

.fy-section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fy-text2);
    margin-bottom: 10px;
}

.fy-field {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--fy-border);
}

.fy-field:last-child {
    border-bottom: none;
}

.fy-field label {
    flex: 0 0 120px;
    font-size: 13px;
    font-weight: 500;
    color: var(--fy-text);
}

.fy-field input,
.fy-field select,
.fy-field textarea {
    flex: 1;
    padding: 8px 12px;
    font-size: 13px;
    border: 1px solid var(--fy-border);
    border-radius: var(--fy-radius-sm);
    background: var(--fy-bg2);
    color: var(--fy-text);
    outline: none;
    transition: var(--fy-transition);
    font-family: var(--fy-font);
}

.fy-field input:focus,
.fy-field select:focus,
.fy-field textarea:focus {
    border-color: var(--fy-accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.fy-field textarea {
    min-height: 60px;
    resize: vertical;
}

.fy-field select {
    cursor: pointer;
}

/* ─── Toggle Switch ───────────────────────────────────────────────────────── */

.fy-toggle {
    position: relative;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
}

.fy-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.fy-toggle .fy-slider {
    position: absolute;
    inset: 0;
    background: var(--fy-border);
    border-radius: 11px;
    cursor: pointer;
    transition: var(--fy-transition);
}

.fy-toggle .fy-slider::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: var(--fy-transition);
}

.fy-toggle input:checked + .fy-slider {
    background: var(--fy-accent);
}

.fy-toggle input:checked + .fy-slider::before {
    transform: translateX(18px);
}

/* ─── Dialog Footer ───────────────────────────────────────────────────────── */

.fy-dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--fy-border);
    font-size: 12px;
    color: var(--fy-text2);
}

.fy-dialog-footer a {
    color: var(--fy-accent);
    text-decoration: none;
    font-weight: 500;
}

.fy-dialog-footer a:hover {
    text-decoration: underline;
}

.fy-kbd {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    font-size: 11px;
    font-family: var(--fy-font);
    background: var(--fy-bg2);
    border: 1px solid var(--fy-border);
    border-radius: 4px;
    color: var(--fy-text2);
}

/* ─── Answer Card ─────────────────────────────────────────────────────────── */

.fy-answer {
    margin: 12px 0;
    border-radius: var(--fy-radius-sm);
    border: 1px solid var(--fy-border);
    overflow: hidden;
    box-shadow: 0 2px 8px var(--fy-shadow);
    font-family: var(--fy-font);
    background: var(--fy-bg);
    color: var(--fy-text);
}

.fy-answer.hidden {
    display: none;
}

.fy-answer-header {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    gap: 8px;
    background: var(--fy-bg2);
    border-bottom: 1px solid var(--fy-border);
}

.fy-answer-header .fy-model-badge {
    font-size: 11px;
    font-weight: 600;
    color: var(--fy-accent);
    flex: 1;
}

.fy-answer-header .fy-actions {
    display: flex;
    gap: 4px;
}

.fy-answer-header .fy-actions button {
    border: none;
    background: transparent;
    color: var(--fy-text2);
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: var(--fy-transition);
    font-family: var(--fy-font);
}

.fy-answer-header .fy-actions button:hover {
    background: var(--fy-border);
    color: var(--fy-text);
}

.fy-answer-body {
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
}

/* ─── Chat Panel ──────────────────────────────────────────────────────────── */

.fy-chat {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 340px;
    height: 440px;
    background: var(--fy-bg);
    border: 1px solid var(--fy-border);
    border-radius: var(--fy-radius);
    box-shadow: 0 16px 48px var(--fy-shadow);
    display: none;
    flex-direction: column;
    z-index: 99998;
    font-family: var(--fy-font);
    overflow: hidden;
    animation: fy-slide-up 0.2s ease-out;
}

.fy-chat.active {
    display: flex;
}

.fy-chat-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--fy-border);
    cursor: move;
}

.fy-chat-header span {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: var(--fy-text);
}

.fy-chat-header button {
    border: none;
    background: transparent;
    font-size: 18px;
    color: var(--fy-text2);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
}

.fy-chat-header button:hover {
    background: var(--fy-bg2);
}

.fy-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

.fy-chat-msg {
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: var(--fy-radius-sm);
    font-size: 13px;
    line-height: 1.4;
    max-width: 85%;
}

.fy-chat-msg.user {
    background: var(--fy-accent);
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 4px;
}

.fy-chat-msg.ai {
    background: var(--fy-bg2);
    color: var(--fy-text);
    border-bottom-left-radius: 4px;
}

.fy-chat-input {
    display: flex;
    padding: 10px;
    border-top: 1px solid var(--fy-border);
    gap: 8px;
}

.fy-chat-input input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--fy-border);
    border-radius: var(--fy-radius-sm);
    background: var(--fy-bg2);
    color: var(--fy-text);
    font-size: 13px;
    outline: none;
    font-family: var(--fy-font);
}

.fy-chat-input input:focus {
    border-color: var(--fy-accent);
}

.fy-chat-input button {
    padding: 8px 14px;
    border: none;
    border-radius: var(--fy-radius-sm);
    background: var(--fy-accent);
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--fy-transition);
    font-family: var(--fy-font);
}

.fy-chat-input button:hover {
    background: var(--fy-accent-hover);
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */

.fy-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--fy-text);
    color: var(--fy-bg);
    padding: 10px 20px;
    border-radius: var(--fy-radius-sm);
    font-size: 13px;
    font-family: var(--fy-font);
    z-index: 999999;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
}

.fy-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
`;
};
