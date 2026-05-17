import { getCSSVariables } from "./Theme";

export const getStyles = (): string => {
    const vars = getCSSVariables();

    return `
/* ═══════════════════════════════════════════════════════════════════════════
   FORMIFY — Premium UI System
   Fluent Design · Smooth Animations · Pixel-Perfect Layout
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Root Variables ──────────────────────────────────────────────────────── */

.formify-root {
    ${vars}
    --fy-radius: 16px;
    --fy-radius-sm: 10px;
    --fy-radius-xs: 6px;
    --fy-font: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    --fy-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
    --fy-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --fy-spring: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    --fy-blur: 20px;
    --fy-glow: 0 0 0 1px var(--fy-accent), 0 0 20px -4px rgba(99, 102, 241, 0.3);
}

/* ─── Animations ──────────────────────────────────────────────────────────── */

@keyframes fy-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes fy-slide-up {
    from { opacity: 0; transform: translateY(16px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fy-slide-down {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes fy-scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
}

@keyframes fy-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes fy-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
}

@keyframes fy-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

@keyframes fy-gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* ─── Settings Dialog Overlay ─────────────────────────────────────────────── */

.fy-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(var(--fy-blur));
    -webkit-backdrop-filter: blur(var(--fy-blur));
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    font-family: var(--fy-font);
    animation: fy-fade-in 0.2s ease-out;
}

.fy-overlay.active {
    display: flex;
}

/* ─── Dialog Panel ────────────────────────────────────────────────────────── */

.fy-dialog {
    background: var(--fy-bg);
    color: var(--fy-text);
    border-radius: var(--fy-radius);
    width: min(500px, 92vw);
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--fy-border);
    box-shadow:
        0 0 0 1px var(--fy-border),
        0 8px 16px -4px var(--fy-shadow),
        0 24px 56px -12px var(--fy-shadow);
    overflow: hidden;
    animation: fy-slide-up var(--fy-spring) forwards;
}

/* ─── Dialog Header ───────────────────────────────────────────────────────── */

.fy-dialog-header {
    display: flex;
    align-items: center;
    padding: 18px 22px;
    gap: 14px;
    border-bottom: 1px solid var(--fy-border);
    background: var(--fy-bg2);
}

.fy-dialog-header .fy-title {
    flex: 1;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--fy-accent), #06b6d4, #8b5cf6);
    background-size: 200% 200%;
    animation: fy-gradient-shift 4s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.fy-dialog-header .fy-close {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--fy-radius-xs);
    border: 1px solid transparent;
    background: transparent;
    color: var(--fy-text2);
    font-size: 16px;
    cursor: pointer;
    transition: all var(--fy-transition);
}

.fy-dialog-header .fy-close:hover {
    background: var(--fy-bg);
    border-color: var(--fy-border);
    color: var(--fy-text);
    transform: scale(1.05);
}

.fy-dialog-header .fy-close:active {
    transform: scale(0.92);
}

/* ─── Dialog Body ─────────────────────────────────────────────────────────── */

.fy-dialog-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 22px;
    scroll-behavior: smooth;
}

.fy-dialog-body::-webkit-scrollbar {
    width: 6px;
}

.fy-dialog-body::-webkit-scrollbar-track {
    background: transparent;
}

.fy-dialog-body::-webkit-scrollbar-thumb {
    background: var(--fy-border);
    border-radius: 3px;
}

.fy-dialog-body::-webkit-scrollbar-thumb:hover {
    background: var(--fy-text2);
}

.fy-section {
    margin-bottom: 24px;
}

.fy-section:last-child {
    margin-bottom: 0;
}

.fy-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fy-text2);
    margin-bottom: 12px;
    padding-left: 2px;
}

.fy-field {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-border) 50%, transparent);
}

.fy-field:last-child {
    border-bottom: none;
}

.fy-field > label:first-child {
    flex: 0 0 130px;
    font-size: 13px;
    font-weight: 500;
    color: var(--fy-text);
}

.fy-field input[type="text"],
.fy-field input[type="password"],
.fy-field select,
.fy-field textarea {
    flex: 1;
    padding: 10px 14px;
    font-size: 13px;
    border: 1.5px solid var(--fy-border);
    border-radius: var(--fy-radius-sm);
    background: var(--fy-bg);
    color: var(--fy-text);
    outline: none;
    transition: all var(--fy-transition);
    font-family: var(--fy-font);
}

.fy-field input:focus,
.fy-field select:focus,
.fy-field textarea:focus {
    border-color: var(--fy-accent);
    box-shadow: var(--fy-glow);
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
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
}

/* ─── Toggle Switch ───────────────────────────────────────────────────────── */

.fy-toggle {
    position: relative;
    width: 44px;
    height: 24px;
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
    border-radius: 12px;
    transition: all var(--fy-transition);
    border: 1.5px solid transparent;
}

.fy-toggle .fy-slider::before {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    left: 2px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    border-radius: 50%;
    transition: all var(--fy-spring);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.fy-toggle input:checked + .fy-slider {
    background: var(--fy-accent);
}

.fy-toggle input:checked + .fy-slider::before {
    transform: translateY(-50%) translateX(20px);
}

.fy-toggle input:focus-visible + .fy-slider {
    box-shadow: var(--fy-glow);
}

/* ─── Dialog Footer ───────────────────────────────────────────────────────── */

.fy-dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 22px;
    border-top: 1px solid var(--fy-border);
    background: var(--fy-bg2);
    font-size: 12px;
    color: var(--fy-text2);
}

.fy-dialog-footer a {
    color: var(--fy-accent);
    text-decoration: none;
    font-weight: 600;
    transition: opacity var(--fy-transition);
}

.fy-dialog-footer a:hover {
    opacity: 0.75;
}

.fy-kbd {
    display: inline-flex;
    align-items: center;
    padding: 3px 7px;
    font-size: 10px;
    font-family: var(--fy-mono);
    font-weight: 600;
    background: var(--fy-bg);
    border: 1px solid var(--fy-border);
    border-radius: 5px;
    color: var(--fy-text2);
    box-shadow: 0 1px 0 var(--fy-border);
}

/* ─── Answer Card ─────────────────────────────────────────────────────────── */

.fy-answer {
    margin: 14px 0;
    border-radius: var(--fy-radius-sm);
    border: 1px solid var(--fy-border);
    overflow: hidden;
    box-shadow: 0 2px 12px -2px var(--fy-shadow);
    font-family: var(--fy-font);
    background: var(--fy-bg);
    color: var(--fy-text);
    animation: fy-slide-up 0.35s ease-out forwards;
    transition: all var(--fy-transition);
}

.fy-answer:hover {
    box-shadow: 0 4px 20px -4px var(--fy-shadow);
    border-color: color-mix(in srgb, var(--fy-accent) 30%, var(--fy-border));
}

.fy-answer.hidden {
    display: none;
}

.fy-answer-header {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    gap: 10px;
    background: var(--fy-bg2);
    border-bottom: 1px solid var(--fy-border);
}

.fy-answer-header .fy-model-badge {
    font-size: 11px;
    font-weight: 700;
    font-family: var(--fy-mono);
    color: var(--fy-accent);
    background: color-mix(in srgb, var(--fy-accent) 10%, transparent);
    padding: 3px 8px;
    border-radius: var(--fy-radius-xs);
    flex: 1;
    letter-spacing: -0.01em;
}

.fy-answer-header .fy-actions {
    display: flex;
    gap: 2px;
}

.fy-answer-header .fy-actions button {
    border: none;
    background: transparent;
    color: var(--fy-text2);
    font-size: 12px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: var(--fy-radius-xs);
    cursor: pointer;
    transition: all var(--fy-transition);
    font-family: var(--fy-font);
    white-space: nowrap;
}

.fy-answer-header .fy-actions button:hover {
    background: var(--fy-border);
    color: var(--fy-text);
    transform: translateY(-1px);
}

.fy-answer-header .fy-actions button:active {
    transform: translateY(0) scale(0.95);
}

.fy-answer-body {
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
}

/* ─── Answer Loading State ────────────────────────────────────────────────── */

.fy-answer-body.loading {
    color: var(--fy-text2);
    font-style: italic;
}

.fy-answer-body.loading::after {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-left: 8px;
    border: 2px solid var(--fy-border);
    border-top-color: var(--fy-accent);
    border-radius: 50%;
    animation: fy-spin 0.6s linear infinite;
    vertical-align: middle;
}

/* ─── Answer Error State ──────────────────────────────────────────────────── */

.fy-answer-body.error {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
    border-radius: 0 0 var(--fy-radius-sm) var(--fy-radius-sm);
}

/* ─── Chat Panel ──────────────────────────────────────────────────────────── */

.fy-chat {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 360px;
    height: 480px;
    background: var(--fy-bg);
    border: 1px solid var(--fy-border);
    border-radius: var(--fy-radius);
    box-shadow:
        0 0 0 1px var(--fy-border),
        0 20px 60px -12px var(--fy-shadow);
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
    padding: 14px 18px;
    border-bottom: 1px solid var(--fy-border);
    background: var(--fy-bg2);
    cursor: move;
    user-select: none;
}

.fy-chat-header span {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    color: var(--fy-text);
    letter-spacing: -0.01em;
}

.fy-chat-header button {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    font-size: 16px;
    color: var(--fy-text2);
    cursor: pointer;
    border-radius: var(--fy-radius-xs);
    transition: all var(--fy-transition);
}

.fy-chat-header button:hover {
    background: var(--fy-bg);
    color: var(--fy-text);
}

.fy-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    scroll-behavior: smooth;
}

.fy-chat-messages::-webkit-scrollbar {
    width: 4px;
}

.fy-chat-messages::-webkit-scrollbar-thumb {
    background: var(--fy-border);
    border-radius: 2px;
}

.fy-chat-msg {
    margin-bottom: 10px;
    padding: 10px 14px;
    border-radius: var(--fy-radius-sm);
    font-size: 13px;
    line-height: 1.5;
    max-width: 82%;
    animation: fy-slide-up 0.25s ease-out forwards;
    word-break: break-word;
}

.fy-chat-msg.user {
    background: linear-gradient(135deg, var(--fy-accent), color-mix(in srgb, var(--fy-accent) 80%, #8b5cf6));
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--fy-accent) 25%, transparent);
}

.fy-chat-msg.ai {
    background: var(--fy-bg2);
    color: var(--fy-text);
    border-bottom-left-radius: 4px;
    border: 1px solid var(--fy-border);
}

.fy-chat-msg.error {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.fy-chat-input {
    display: flex;
    padding: 14px;
    border-top: 1px solid var(--fy-border);
    gap: 8px;
    background: var(--fy-bg2);
}

.fy-chat-input input {
    flex: 1;
    padding: 10px 14px;
    border: 1.5px solid var(--fy-border);
    border-radius: var(--fy-radius-sm);
    background: var(--fy-bg);
    color: var(--fy-text);
    font-size: 13px;
    outline: none;
    font-family: var(--fy-font);
    transition: all var(--fy-transition);
}

.fy-chat-input input:focus {
    border-color: var(--fy-accent);
    box-shadow: var(--fy-glow);
}

.fy-chat-input button {
    padding: 10px 16px;
    border: none;
    border-radius: var(--fy-radius-sm);
    background: var(--fy-accent);
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--fy-transition);
    font-family: var(--fy-font);
}

.fy-chat-input button:hover {
    background: var(--fy-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--fy-accent) 30%, transparent);
}

.fy-chat-input button:active {
    transform: translateY(0) scale(0.96);
}

.fy-chat-input button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */

.fy-toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--fy-text);
    color: var(--fy-bg);
    padding: 12px 22px;
    border-radius: var(--fy-radius-sm);
    font-size: 13px;
    font-weight: 500;
    font-family: var(--fy-font);
    z-index: 999999;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fy-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.fy-toast.error {
    background: #dc2626;
    color: white;
}

.fy-toast.success {
    background: #16a34a;
    color: white;
}

/* ─── Skeleton Loading ────────────────────────────────────────────────────── */

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

/* ─── Responsive ──────────────────────────────────────────────────────────── */

@media (max-width: 640px) {
    .fy-dialog {
        width: 96vw;
        max-height: 90vh;
        border-radius: var(--fy-radius-sm);
    }

    .fy-chat {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 12px;
        height: 60vh;
    }

    .fy-field {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
    }

    .fy-field > label:first-child {
        flex: none;
    }
}
`;
};
