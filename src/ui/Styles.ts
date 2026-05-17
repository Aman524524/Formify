import { getCSSVariables } from "./Theme";

export const getStyles = (): string => {
    const vars = getCSSVariables();

    return `
/* ═══════════════════════════════════════════════════════════════════════════
   FORMIFY — Material You / Google Pixel UI System
   Google Sans · Pastel Green · Pixel-Perfect
   ═══════════════════════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Google+Sans+Text:wght@400;500&family=Google+Sans+Mono:wght@400;500&display=swap');

/* ─── Root Variables ──────────────────────────────────────────────────────── */

.formify-root {
    ${vars}
    --fy-radius: 28px;
    --fy-radius-md: 16px;
    --fy-radius-sm: 12px;
    --fy-radius-xs: 8px;
    --fy-font: 'Google Sans', 'Google Sans Text', 'Product Sans', Roboto, -apple-system, sans-serif;
    --fy-mono: 'Google Sans Mono', 'Roboto Mono', monospace;
    --fy-ease: cubic-bezier(0.2, 0, 0, 1);
    --fy-duration: 0.2s;
    --fy-spring: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─── Animations ──────────────────────────────────────────────────────────── */

@keyframes fy-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes fy-slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes fy-scale-in {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
}

@keyframes fy-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

@keyframes fy-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* ─── Settings Overlay ────────────────────────────────────────────────────── */

.fy-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    font-family: var(--fy-font);
    animation: fy-fade-in 0.15s var(--fy-ease);
}

.fy-overlay.active {
    display: flex;
}

/* ─── Dialog ──────────────────────────────────────────────────────────────── */

.fy-dialog {
    background: var(--fy-bg);
    color: var(--fy-text);
    border-radius: var(--fy-radius);
    width: min(480px, 92vw);
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    box-shadow:
        0 1px 3px rgba(0,0,0,0.08),
        0 8px 24px rgba(0,0,0,0.12);
    overflow: hidden;
    animation: fy-scale-in var(--fy-spring) forwards;
}

/* ─── Dialog Header ───────────────────────────────────────────────────────── */

.fy-dialog-header {
    display: flex;
    align-items: center;
    padding: 20px 24px;
    gap: 12px;
}

.fy-dialog-header .fy-title {
    flex: 1;
    font-size: 22px;
    font-weight: 600;
    color: var(--fy-text);
    letter-spacing: 0;
}

.fy-dialog-header .fy-close {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--fy-text2);
    font-size: 18px;
    cursor: pointer;
    transition: background var(--fy-duration) var(--fy-ease);
}

.fy-dialog-header .fy-close:hover {
    background: var(--fy-bg2);
}

.fy-dialog-header .fy-close:active {
    background: var(--fy-border);
}

/* ─── Dialog Body ─────────────────────────────────────────────────────────── */

.fy-dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 0 24px 20px;
}

.fy-dialog-body::-webkit-scrollbar {
    width: 4px;
}

.fy-dialog-body::-webkit-scrollbar-track {
    background: transparent;
}

.fy-dialog-body::-webkit-scrollbar-thumb {
    background: var(--fy-border);
    border-radius: 2px;
}

.fy-section {
    margin-bottom: 28px;
}

.fy-section:last-child {
    margin-bottom: 0;
}

.fy-section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--fy-accent);
    margin-bottom: 8px;
    padding-left: 4px;
}

.fy-field {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 4px;
}

.fy-field > label:first-child {
    flex: 0 0 120px;
    font-size: 14px;
    font-weight: 500;
    color: var(--fy-text);
}

/* ─── Inputs (Material You style) ─────────────────────────────────────────── */

.fy-field input[type="text"],
.fy-field input[type="password"],
.fy-field select,
.fy-field textarea {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
    border: 1px solid var(--fy-border);
    border-radius: var(--fy-radius-xs);
    background: var(--fy-bg);
    color: var(--fy-text);
    outline: none;
    transition: border-color var(--fy-duration) var(--fy-ease), box-shadow var(--fy-duration) var(--fy-ease);
    font-family: var(--fy-font);
}

.fy-field input:focus,
.fy-field select:focus,
.fy-field textarea:focus {
    border-color: var(--fy-accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--fy-accent) 20%, transparent);
}

.fy-field input:hover:not(:focus),
.fy-field select:hover:not(:focus),
.fy-field textarea:hover:not(:focus) {
    border-color: var(--fy-text2);
}

.fy-field textarea {
    min-height: 72px;
    resize: vertical;
    line-height: 1.5;
}

.fy-field select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 38px;
}

/* ─── Password field with eye toggle ──────────────────────────────────────── */

.fy-password-wrap {
    flex: 1;
    position: relative;
    display: flex;
}

.fy-password-wrap input {
    flex: 1;
    padding: 12px 44px 12px 16px;
    font-size: 14px;
    border: 1px solid var(--fy-border);
    border-radius: var(--fy-radius-xs);
    background: var(--fy-bg);
    color: var(--fy-text);
    outline: none;
    transition: border-color var(--fy-duration) var(--fy-ease), box-shadow var(--fy-duration) var(--fy-ease);
    font-family: var(--fy-font);
    width: 100%;
}

.fy-password-wrap input:focus {
    border-color: var(--fy-accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--fy-accent) 20%, transparent);
}

.fy-password-wrap input:hover:not(:focus) {
    border-color: var(--fy-text2);
}

.fy-password-wrap .fy-eye-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--fy-text2);
    font-size: 16px;
    cursor: pointer;
    transition: background var(--fy-duration) var(--fy-ease);
}

.fy-password-wrap .fy-eye-btn:hover {
    background: var(--fy-bg2);
}

/* ─── Toggle Switch (Material You pill) ───────────────────────────────────── */

.fy-toggle {
    position: relative;
    width: 52px;
    height: 32px;
    flex-shrink: 0;
    cursor: pointer;
}

.fy-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
}

.fy-toggle .fy-slider {
    position: absolute;
    inset: 0;
    background: var(--fy-border);
    border-radius: 16px;
    transition: background var(--fy-duration) var(--fy-ease);
    border: 2px solid var(--fy-border);
}

.fy-toggle .fy-slider::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--fy-bg);
    border-radius: 50%;
    transition: all var(--fy-spring);
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.fy-toggle input:checked + .fy-slider {
    background: var(--fy-accent);
    border-color: var(--fy-accent);
}

.fy-toggle input:checked + .fy-slider::before {
    transform: translateY(-50%) translateX(20px);
    background: #ffffff;
}

/* ─── Dialog Footer ───────────────────────────────────────────────────────── */

.fy-dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-top: 1px solid var(--fy-border);
    font-size: 12px;
    color: var(--fy-text2);
}

.fy-dialog-footer a {
    color: var(--fy-accent);
    text-decoration: none;
    font-weight: 500;
    border-radius: var(--fy-radius-xs);
    padding: 6px 12px;
    transition: background var(--fy-duration) var(--fy-ease);
}

.fy-dialog-footer a:hover {
    background: color-mix(in srgb, var(--fy-accent) 10%, transparent);
}

.fy-kbd {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    font-size: 11px;
    font-family: var(--fy-mono);
    font-weight: 500;
    background: var(--fy-bg2);
    border: 1px solid var(--fy-border);
    border-radius: 6px;
    color: var(--fy-text2);
}

/* ═════════════════════════════════════════════════════════════════════════════
   ANSWER CARD
   ═════════════════════════════════════════════════════════════════════════════ */

.fy-answer {
    margin: 12px 0;
    border-radius: var(--fy-radius-md);
    overflow: hidden;
    background: var(--fy-bg);
    color: var(--fy-text);
    border: 1px solid var(--fy-border);
    font-family: var(--fy-font);
    animation: fy-slide-up 0.3s var(--fy-ease) forwards;
    transition: box-shadow var(--fy-duration) var(--fy-ease), border-color var(--fy-duration) var(--fy-ease);
}

.fy-answer:hover {
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08);
}

.fy-answer.hidden {
    display: none;
}

.fy-answer-header {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    gap: 8px;
    background: var(--fy-bg2);
    border-bottom: 1px solid var(--fy-border);
}

.fy-answer-header .fy-model-badge {
    font-size: 11px;
    font-weight: 600;
    font-family: var(--fy-mono);
    color: var(--fy-accent);
    flex: 1;
}

.fy-answer-header .fy-actions {
    display: flex;
    gap: 0;
}

.fy-answer-header .fy-actions button {
    border: none;
    background: transparent;
    color: var(--fy-text2);
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 100px;
    cursor: pointer;
    transition: background var(--fy-duration) var(--fy-ease), color var(--fy-duration) var(--fy-ease);
    font-family: var(--fy-font);
    white-space: nowrap;
}

.fy-answer-header .fy-actions button:hover {
    background: var(--fy-border);
    color: var(--fy-text);
}

.fy-answer-header .fy-actions button:active {
    background: color-mix(in srgb, var(--fy-border) 80%, var(--fy-text2));
}

.fy-answer-body {
    padding: 16px;
    font-size: 14px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
}

.fy-answer-body.loading {
    color: var(--fy-text2);
    font-style: normal;
}

.fy-answer-body.loading::after {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-left: 8px;
    border: 2px solid var(--fy-border);
    border-top-color: var(--fy-accent);
    border-radius: 50%;
    animation: fy-spin 0.7s linear infinite;
    vertical-align: middle;
}

.fy-answer-body.error {
    color: #d93025;
    background: color-mix(in srgb, #d93025 5%, transparent);
    border-radius: 0 0 var(--fy-radius-md) var(--fy-radius-md);
}

.fy-answer-text {
    font-weight: 500;
}

.fy-explanation {
    margin-top: 6px;
    font-size: 12px;
    color: var(--fy-text2);
    line-height: 1.5;
}

/* ═════════════════════════════════════════════════════════════════════════════
   CHAT PANEL
   ═════════════════════════════════════════════════════════════════════════════ */

.fy-chat {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 360px;
    height: 480px;
    background: var(--fy-bg);
    border-radius: var(--fy-radius);
    box-shadow:
        0 2px 6px rgba(0,0,0,0.06),
        0 12px 40px rgba(0,0,0,0.14);
    display: none;
    flex-direction: column;
    z-index: 99998;
    font-family: var(--fy-font);
    overflow: hidden;
    animation: fy-scale-in var(--fy-spring) forwards;
}

.fy-chat.active {
    display: flex;
}

.fy-chat-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--fy-border);
    cursor: move;
    user-select: none;
}

.fy-chat-header span {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: var(--fy-text);
}

.fy-chat-header button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    font-size: 18px;
    color: var(--fy-text2);
    cursor: pointer;
    border-radius: 50%;
    transition: background var(--fy-duration) var(--fy-ease);
}

.fy-chat-header button:hover {
    background: var(--fy-bg2);
}

.fy-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

.fy-chat-messages::-webkit-scrollbar {
    width: 4px;
}

.fy-chat-messages::-webkit-scrollbar-thumb {
    background: var(--fy-border);
    border-radius: 2px;
}

.fy-chat-msg {
    margin-bottom: 8px;
    padding: 10px 14px;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1.5;
    max-width: 80%;
    animation: fy-slide-up 0.2s var(--fy-ease) forwards;
    word-break: break-word;
}

.fy-chat-msg.user {
    background: var(--fy-accent);
    color: #ffffff;
    margin-left: auto;
    border-bottom-right-radius: 6px;
}

.fy-chat-msg.ai {
    background: var(--fy-bg2);
    color: var(--fy-text);
    border-bottom-left-radius: 6px;
}

.fy-chat-msg.error {
    background: color-mix(in srgb, #d93025 8%, transparent);
    color: #d93025;
}

.fy-chat-input {
    display: flex;
    padding: 12px 16px;
    border-top: 1px solid var(--fy-border);
    gap: 8px;
}

.fy-chat-input input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid var(--fy-border);
    border-radius: 100px;
    background: var(--fy-bg2);
    color: var(--fy-text);
    font-size: 14px;
    outline: none;
    font-family: var(--fy-font);
    transition: border-color var(--fy-duration) var(--fy-ease), box-shadow var(--fy-duration) var(--fy-ease);
}

.fy-chat-input input:focus {
    border-color: var(--fy-accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--fy-accent) 20%, transparent);
}

.fy-chat-input button {
    padding: 10px 20px;
    border: none;
    border-radius: 100px;
    background: var(--fy-accent);
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background var(--fy-duration) var(--fy-ease), box-shadow var(--fy-duration) var(--fy-ease);
    font-family: var(--fy-font);
}

.fy-chat-input button:hover {
    background: var(--fy-accent-hover);
    box-shadow: 0 1px 6px color-mix(in srgb, var(--fy-accent) 25%, transparent);
}

.fy-chat-input button:active {
    transform: scale(0.97);
}

.fy-chat-input button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

/* ═════════════════════════════════════════════════════════════════════════════
   TOAST
   ═════════════════════════════════════════════════════════════════════════════ */

.fy-toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: #323232;
    color: #ffffff;
    padding: 14px 24px;
    border-radius: var(--fy-radius-xs);
    font-size: 14px;
    font-weight: 500;
    font-family: var(--fy-font);
    z-index: 999999;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: all 0.3s var(--fy-ease);
}

.fy-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.fy-toast.error {
    background: #d93025;
}

.fy-toast.success {
    background: #1a7f4b;
}

/* ═════════════════════════════════════════════════════════════════════════════
   SKELETON
   ═════════════════════════════════════════════════════════════════════════════ */

.fy-skeleton {
    background: linear-gradient(
        90deg,
        var(--fy-bg2) 25%,
        color-mix(in srgb, var(--fy-border) 50%, var(--fy-bg2)) 50%,
        var(--fy-bg2) 75%
    );
    background-size: 200% 100%;
    animation: fy-shimmer 1.5s ease-in-out infinite;
    border-radius: var(--fy-radius-xs);
    height: 16px;
    margin: 4px 0;
}

/* ═════════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═════════════════════════════════════════════════════════════════════════════ */

@media (max-width: 640px) {
    .fy-dialog {
        width: 96vw;
        max-height: 90vh;
        border-radius: var(--fy-radius-md);
    }

    .fy-chat {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 12px;
        height: 60vh;
    }

    .fy-field {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .fy-field > label:first-child {
        flex: none;
    }
}
`;
};
