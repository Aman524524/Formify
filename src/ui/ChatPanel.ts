import * as AI from "../core/AIService";

let chatEl: HTMLDivElement | null = null;
let messagesEl: HTMLDivElement;
let inputEl: HTMLInputElement;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// ─── Build chat DOM ─────────────────────────────────────────────────────────

const build = (): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "fy-chat formify-root";

    const header = document.createElement("div");
    header.className = "fy-chat-header";
    const title = document.createElement("span");
    title.textContent = "Formify Chat";
    const closeBtn = document.createElement("button");
    closeBtn.title = "Close";
    closeBtn.textContent = "✕";
    header.appendChild(title);
    header.appendChild(closeBtn);

    messagesEl = document.createElement("div");
    messagesEl.className = "fy-chat-messages";

    const inputWrap = document.createElement("div");
    inputWrap.className = "fy-chat-input";
    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.placeholder = "Ask anything...";
    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";
    inputWrap.appendChild(inputEl);
    inputWrap.appendChild(sendBtn);

    el.appendChild(header);
    el.appendChild(messagesEl);
    el.appendChild(inputWrap);

    closeBtn.addEventListener("click", () => toggle(false));

    sendBtn.addEventListener("click", () => send());
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") send();
    });

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
    });

    document.addEventListener("mouseup", () => { isDragging = false; });
    document.addEventListener("mousemove", (e) => {
        if (!isDragging || !chatEl) return;
        const x = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - chatEl.offsetWidth));
        const y = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - chatEl.offsetHeight));
        chatEl.style.left = x + "px";
        chatEl.style.top = y + "px";
        chatEl.style.right = "auto";
        chatEl.style.bottom = "auto";
    });

    return el;
};

// ─── Message helpers ────────────────────────────────────────────────────────

const addMessage = (text: string, isUser: boolean, isError = false) => {
    const msg = document.createElement("div");
    msg.className = `fy-chat-msg ${isUser ? "user" : isError ? "error" : "ai"}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
};

const send = async (prefill?: string) => {
    const text = prefill || inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    inputEl.disabled = true;
    addMessage(text, true);

    try {
        const res = await AI.getResponse({ prompt: text });
        if (res.startsWith("❌") || res.startsWith("⚠️")) {
            addMessage(res, false, true);
        } else {
            addMessage(res, false);
        }
    } catch (err) {
        addMessage("Error: " + (err instanceof Error ? err.message : "Could not get response"), false, true);
    } finally {
        inputEl.disabled = false;
        inputEl.focus();
    }
};

// ─── Public API ─────────────────────────────────────────────────────────────

export const init = () => {
    chatEl = build();
    document.body.appendChild(chatEl);

    // Listen for open-chat events from answer cards
    document.addEventListener("formify:open-chat", ((e: CustomEvent) => {
        toggle(true);
        send(e.detail.message);
    }) as EventListener);
};

export const toggle = (force?: boolean) => {
    if (!chatEl) return;
    if (force === true) chatEl.classList.add("active");
    else if (force === false) chatEl.classList.remove("active");
    else chatEl.classList.toggle("active");
};
