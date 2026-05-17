// ==UserScript==
// @name         Formify
// @version      5.0
// @description  Let AI solve your Google Forms
// @author       Aman524524
// @license      MIT
// @grant        GM_addStyle
// @grant        unsafeWindow
// @namespace    https://docs.google.com/
// @match        https://docs.google.com/forms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=docs.google.com
// @run-at       document-idle
// ==/UserScript==

// src/config/defaults.ts
var MODELS = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite", provider: "gemini" },
  { id: "gemini-2.0-pro-exp-02-05", name: "Gemini 2.0 Pro (Exp)", provider: "gemini" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "gemini" }
];
var SEARCH_ENGINES = [
  { id: "google", name: "Google", urlTemplate: "https://www.google.com/search?q=" },
  { id: "chatgpt", name: "ChatGPT", urlTemplate: "https://chatgpt.com/?q=" },
  { id: "bing", name: "Bing", urlTemplate: "https://www.bing.com/search?q=" },
  { id: "duckduckgo", name: "DuckDuckGo", urlTemplate: "https://duckduckgo.com/?q=" },
  { id: "brave", name: "Brave", urlTemplate: "https://search.brave.com/search?q=" },
  { id: "startpage", name: "Startpage", urlTemplate: "https://www.startpage.com/do/search?q=" }
];
var DEFAULT_SELECTORS = {
  form: "form#mG61Hd",
  contentContainer: ".lrKTG",
  headerContainer: ".m7w29c.O8VmIc.tIvQIf",
  titleContainer: ".ahS2Le",
  descriptionContainer: ".cBGGJ.OIC90c",
  questionList: ".o3Dpx[role='list']",
  questionItem: ".Qr7Oae[role='listitem']",
  questionDataDiv: "div[jsmodel='CP1oW']",
  optionLabel: "label"
};
var DEFAULT_PROMPT = "Answer the following question concisely in plain text. " + "If options are provided, your answer MUST include one of the given options exactly. " + "No markdown, no bullet points, no extra formatting. Keep it short.";
var THEMES = {
  light: {
    bg: "#ffffff",
    bgSecondary: "#f7f8fa",
    text: "#1a1a2e",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    accent: "#6366f1",
    accentHover: "#4f46e5",
    shadow: "rgba(0, 0, 0, 0.08)"
  },
  dark: {
    bg: "#1e1e2e",
    bgSecondary: "#282840",
    text: "#e2e8f0",
    textSecondary: "#94a3b8",
    border: "#334155",
    accent: "#818cf8",
    accentHover: "#a5b4fc",
    shadow: "rgba(0, 0, 0, 0.3)"
  }
};
var DEFAULT_SETTINGS = {
  apiKey: "",
  model: "gemini-2.0-flash",
  customPrompt: DEFAULT_PROMPT,
  searchEngine: "https://www.google.com/search?q=",
  theme: "light",
  selectors: DEFAULT_SELECTORS,
  autoFill: true,
  showAnswers: true
};

// src/core/Storage.ts
var STORAGE_KEY = "formify";
var readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};
var writeAll = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
var get = (key) => {
  const data = readAll();
  return data[key] ?? DEFAULT_SETTINGS[key];
};
var set = (key, value) => {
  const data = readAll();
  data[key] = value;
  writeAll(data);
};
var getAll = () => {
  return { ...DEFAULT_SETTINGS, ...readAll() };
};
var getSelectors = () => {
  return get("selectors");
};

// src/utils/Logger.ts
var PREFIX = "[Formify]";
var log = (...args) => {
  console.log(PREFIX, ...args);
};
var warn = (...args) => {
  console.warn(PREFIX, ...args);
};
var error = (...args) => {
  console.error(PREFIX, ...args);
};
var group = (title, ...args) => {
  console.groupCollapsed(`${PREFIX} ${title}`);
  args.forEach((arg) => console.log(arg));
  console.groupEnd();
};

// src/core/Network.ts
var request = async (url, options = { method: "GET" }) => {
  if (options.method === "GET" && options.body) {
    delete options.body;
  }
  try {
    const response = await fetch(url, options);
    const body = await response.text();
    if (response.status !== 200) {
      group(`Response ${response.status}`, url, body);
    }
    return {
      success: response.status === 200,
      response: body,
      statusText: response.statusText
    };
  } catch (err) {
    group("Request failed", url, err);
    return {
      success: false,
      response: err instanceof Error ? err.message : String(err),
      statusText: "ERROR"
    };
  }
};

// src/core/AIService.ts
var getResponse = async ({ prompt: prompt2 }) => {
  const model = get("model");
  const apiKey = get("apiKey");
  if (!apiKey) {
    return "⚠️ API key not set. Open settings (Alt+K) to configure.";
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await request(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt2 }] }]
    })
  });
  if (!res.success) {
    return "❌ API error: " + res.statusText;
  }
  try {
    const json = JSON.parse(res.response);
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from model.";
  } catch {
    return "❌ Failed to parse API response.";
  }
};

// src/core/FormParser.ts
var mapQuestion = (question) => {
  if (!question) {
    return { title: "", moreInfo: null, type: -1, id: 0, required: false, options: [] };
  }
  const options = question[4]?.[0]?.[1]?.map((opt) => ({
    value: opt[0],
    moreInfo: opt[5] || null
  })) ?? [];
  return {
    title: question[1],
    moreInfo: question[9] || null,
    type: question[3],
    id: question[4][0][0],
    required: !!question[4][0][2],
    options
  };
};
var parseFromGlobalVar = (data) => {
  const formTitle = data[1][8];
  const formDescription = data[1][0];
  const questions = data[1][1].map(mapQuestion);
  return { title: formTitle, description: formDescription, questions };
};
var parseHeader = (form, sel) => {
  const content = form.querySelector(sel.contentContainer);
  if (!content)
    throw new Error("Form content container not found");
  const header = content.querySelector(sel.headerContainer);
  return {
    title: header?.querySelector(sel.titleContainer)?.textContent || document.title,
    description: header?.querySelector(sel.descriptionContainer)?.textContent || ""
  };
};
var parseQuestions = (form, sel) => {
  const list = form.querySelector(sel.questionList);
  if (!list)
    throw new Error("Question list container not found");
  const items = list.querySelectorAll(sel.questionItem);
  if (!items.length)
    warn("No questions found on the page");
  return [...items].map((el) => {
    const dataDiv = el.querySelector(sel.questionDataDiv);
    const raw = dataDiv?.getAttribute("data-params");
    const cleaned = raw?.replace("%.@.", "[").replace(/&quot;/g, "'");
    const arr = JSON.parse(cleaned || "[]")[0];
    return mapQuestion(arr);
  });
};
var parseFromDOM = (sel) => {
  const form = document.querySelector(sel.form);
  if (!form)
    throw new Error("Form element not found — are you on a Google Form?");
  const { title, description } = parseHeader(form, sel);
  const questions = parseQuestions(form, sel);
  return { title, description, questions };
};
var parse = () => {
  try {
    const globalData = unsafeWindow?.FB_PUBLIC_LOAD_DATA_;
    if (globalData) {
      log("Using global variable parser");
      return parseFromGlobalVar(globalData);
    }
  } catch {}
  log("Using DOM parser");
  const selectors = getSelectors();
  return parseFromDOM(selectors);
};

// src/ui/Toast.ts
var toastEl = null;
var toastTimer = null;
var show = (message, duration = 2500) => {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "fy-toast formify-root";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add("show");
  if (toastTimer)
    clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl?.classList.remove("show");
  }, duration);
};

// src/ui/SettingsDialog.ts
var overlay = null;
var build = () => {
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
var syncToUI = () => {
  if (!overlay)
    return;
  const settings = getAll();
  const q = (sel) => overlay.querySelector(sel);
  const apiKey = q("#fy-apikey");
  if (apiKey)
    apiKey.value = settings.apiKey;
  const model = q("#fy-model");
  if (model)
    model.value = settings.model;
  const search = q("#fy-search");
  if (search)
    search.value = settings.searchEngine;
  const prompt2 = q("#fy-prompt");
  if (prompt2)
    prompt2.value = settings.customPrompt;
  const autofill = q("#fy-autofill");
  if (autofill)
    autofill.checked = settings.autoFill;
  const showAns = q("#fy-showanswers");
  if (showAns)
    showAns.checked = settings.showAnswers;
  const theme = q("#fy-theme");
  if (theme)
    theme.value = settings.theme;
  const selForm = q("#fy-sel-form");
  if (selForm)
    selForm.value = settings.selectors.form;
  const selQI = q("#fy-sel-questionItem");
  if (selQI)
    selQI.value = settings.selectors.questionItem;
  const selQD = q("#fy-sel-questionDataDiv");
  if (selQD)
    selQD.value = settings.selectors.questionDataDiv;
  const selOL = q("#fy-sel-optionLabel");
  if (selOL)
    selOL.value = settings.selectors.optionLabel;
};
var bindEvents = () => {
  if (!overlay)
    return;
  const bind = (sel, handler) => {
    const el = overlay.querySelector(sel);
    if (el) {
      el.addEventListener("input", () => handler(el));
      el.addEventListener("change", () => handler(el));
    }
  };
  bind("#fy-apikey", (el) => set("apiKey", el.value));
  bind("#fy-model", (el) => set("model", el.value));
  bind("#fy-search", (el) => set("searchEngine", el.value));
  bind("#fy-prompt", (el) => set("customPrompt", el.value));
  bind("#fy-autofill", (el) => set("autoFill", el.checked));
  bind("#fy-showanswers", (el) => {
    const show2 = el.checked;
    set("showAnswers", show2);
    document.querySelectorAll(".fy-answer").forEach((card) => {
      card.classList.toggle("hidden", !show2);
    });
  });
  bind("#fy-theme", (el) => {
    set("theme", el.value);
    show("Theme updated — reload page to fully apply");
  });
  bind("#fy-sel-form", (el) => {
    const sel = get("selectors");
    sel.form = el.value;
    set("selectors", sel);
  });
  bind("#fy-sel-questionItem", (el) => {
    const sel = get("selectors");
    sel.questionItem = el.value;
    set("selectors", sel);
  });
  bind("#fy-sel-questionDataDiv", (el) => {
    const sel = get("selectors");
    sel.questionDataDiv = el.value;
    set("selectors", sel);
  });
  bind("#fy-sel-optionLabel", (el) => {
    const sel = get("selectors");
    sel.optionLabel = el.value;
    set("selectors", sel);
  });
  overlay.querySelector(".fy-close")?.addEventListener("click", () => toggle(false));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay)
      toggle(false);
  });
};
var init = () => {
  overlay = build();
  document.body.appendChild(overlay);
  syncToUI();
  bindEvents();
};
var toggle = (force) => {
  if (!overlay)
    return;
  if (force === true)
    overlay.classList.add("active");
  else if (force === false)
    overlay.classList.remove("active");
  else
    overlay.classList.toggle("active");
};
var isOpen = () => {
  return overlay?.classList.contains("active") ?? false;
};

// src/ui/ChatPanel.ts
var chatEl = null;
var messagesEl;
var inputEl;
var isDragging = false;
var offsetX = 0;
var offsetY = 0;
var build2 = () => {
  const el = document.createElement("div");
  el.className = "fy-chat formify-root";
  el.innerHTML = `
        <div class="fy-chat-header">
            <span>Formify Chat</span>
            <button title="Close">✕</button>
        </div>
        <div class="fy-chat-messages"></div>
        <div class="fy-chat-input">
            <input type="text" placeholder="Ask anything..." />
            <button>Send</button>
        </div>
    `;
  messagesEl = el.querySelector(".fy-chat-messages");
  inputEl = el.querySelector(".fy-chat-input input");
  el.querySelector(".fy-chat-header button").addEventListener("click", () => toggle2(false));
  el.querySelector(".fy-chat-input button").addEventListener("click", () => send());
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
      send();
  });
  const header = el.querySelector(".fy-chat-header");
  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !chatEl)
      return;
    const x = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - chatEl.offsetWidth));
    const y = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - chatEl.offsetHeight));
    chatEl.style.left = x + "px";
    chatEl.style.top = y + "px";
    chatEl.style.right = "auto";
    chatEl.style.bottom = "auto";
  });
  return el;
};
var addMessage = (text, isUser) => {
  const msg = document.createElement("div");
  msg.className = `fy-chat-msg ${isUser ? "user" : "ai"}`;
  msg.textContent = text;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};
var send = async (prefill) => {
  const text = prefill || inputEl.value.trim();
  if (!text)
    return;
  inputEl.value = "";
  addMessage(text, true);
  const res = await getResponse({ prompt: text });
  addMessage(res, false);
};
var init2 = () => {
  chatEl = build2();
  document.body.appendChild(chatEl);
  document.addEventListener("formify:open-chat", (e) => {
    toggle2(true);
    send(e.detail.message);
  });
};
var toggle2 = (force) => {
  if (!chatEl)
    return;
  if (force === true)
    chatEl.classList.add("active");
  else if (force === false)
    chatEl.classList.remove("active");
  else
    chatEl.classList.toggle("active");
};

// src/ui/AnswerCard.ts
var create = ({ question, options, answer }) => {
  const model = get("model");
  const showAnswers = get("showAnswers");
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
  const body = card.querySelector(".fy-answer-body");
  card.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn)
      return;
    const action = btn.dataset.action;
    if (action === "copy") {
      await navigator.clipboard.writeText(answer);
      show("Copied to clipboard");
    }
    if (action === "regen") {
      body.textContent = "Regenerating...";
      const prompt2 = get("customPrompt") + `
` + question + (optionsStr ? `
Options: ` + optionsStr : "");
      const res = await getResponse({ prompt: prompt2 });
      body.textContent = res;
    }
    if (action === "search") {
      const url = get("searchEngine") + encodeURIComponent(question);
      window.open(url, "_blank");
    }
    if (action === "chat") {
      document.dispatchEvent(new CustomEvent("formify:open-chat", {
        detail: { message: get("customPrompt") + `
` + question + (optionsStr ? `
Options: ` + optionsStr : "") }
      }));
    }
  });
  return card;
};
var escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// src/ui/Theme.ts
var getEffectiveTheme = () => {
  const mode = get("theme");
  if (mode === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
};
var getColors = () => {
  return THEMES[getEffectiveTheme()];
};
var getCSSVariables = () => {
  const c = getColors();
  return `
        --fy-bg: ${c.bg};
        --fy-bg2: ${c.bgSecondary};
        --fy-text: ${c.text};
        --fy-text2: ${c.textSecondary};
        --fy-border: ${c.border};
        --fy-accent: ${c.accent};
        --fy-accent-hover: ${c.accentHover};
        --fy-shadow: ${c.shadow};
    `;
};

// src/ui/Styles.ts
var getStyles = () => {
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

// src/main.ts
(async function() {
  GM_addStyle(getStyles());
  init();
  init2();
  if (!get("apiKey")) {
    const key = prompt(`Formify: Paste your Gemini API key.
` + "Get a free key: https://aistudio.google.com/apikey");
    if (key) {
      set("apiKey", key);
    } else {
      show("API key required — open settings with Alt+K");
    }
  }
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "k") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape" && isOpen()) {
      toggle(false);
    }
    if (e.altKey && e.key === "m") {
      e.preventDefault();
      const current = get("showAnswers");
      set("showAnswers", !current);
      document.querySelectorAll(".fy-answer").forEach((el) => {
        el.classList.toggle("hidden", current);
      });
      show(current ? "Answers hidden" : "Answers visible");
    }
    if (e.altKey && e.key === "j") {
      e.preventDefault();
      toggle2();
    }
  });
  let formData;
  try {
    formData = parse();
    log("Parsed", formData.questions.length, "questions");
  } catch (err) {
    error("Failed to parse form:", err);
    show("Failed to parse form — check console");
    return;
  }
  const selectors = getSelectors();
  const questionEls = document.querySelectorAll(selectors.questionItem);
  for (let i = 0;i < questionEls.length; i++) {
    const container = questionEls[i];
    const question = formData.questions[i];
    if (!question || !question.title)
      continue;
    const optionsStr = question.options?.map((o) => o.value).join(", ") || "";
    const prompt2 = get("customPrompt") + `
` + question.title + (optionsStr ? `
Options: ` + optionsStr : "");
    const aiAnswer = await getResponse({ prompt: prompt2 });
    if (get("autoFill")) {
      const labelSel = selectors.optionLabel;
      const labels = container.querySelectorAll(labelSel);
      for (const label of labels) {
        const text = label.textContent?.trim();
        if (text && aiAnswer.trim().includes(text)) {
          if (question.type === 2 || question.type === 4) {
            label.click();
            if (question.type === 2)
              break;
          }
        }
      }
    }
    const card = create({
      question: question.title,
      options: question.options,
      answer: aiAnswer
    });
    container.appendChild(card);
  }
  log("Done processing all questions");
  show("Formify finished ✓");
})();
