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
  return { ...get("selectors") };
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
    id: question[4]?.[0]?.[0] ?? 0,
    required: !!question[4]?.[0]?.[2],
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
    const cleaned = raw?.replace("%.@.", "[").replace(/&quot;/g, '"');
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
var show = (message, duration = 2500, type = "default") => {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "fy-toast formify-root";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.remove("show", "error", "success");
  if (type !== "default")
    toastEl.classList.add(type);
  toastEl.offsetWidth;
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
var addMessage = (text, isUser, isError = false) => {
  const msg = document.createElement("div");
  msg.className = `fy-chat-msg ${isUser ? "user" : isError ? "error" : "ai"}`;
  msg.textContent = text;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};
var send = async (prefill) => {
  const text = prefill || inputEl.value.trim();
  if (!text)
    return;
  inputEl.value = "";
  inputEl.disabled = true;
  addMessage(text, true);
  try {
    const res = await getResponse({ prompt: text });
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
var create = ({ question, options, answer, isError }) => {
  const model = get("model");
  const showAnswers = get("showAnswers");
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
  const body = card.querySelector(".fy-answer-body");
  let currentAnswer = answer;
  card.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn)
      return;
    const action = btn.dataset["action"];
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(currentAnswer);
        show("Copied to clipboard", 2000, "success");
      } catch {
        selectAndCopy(currentAnswer);
        show("Copied to clipboard", 2000, "success");
      }
    }
    if (action === "regen") {
      body.textContent = "Thinking...";
      body.classList.add("loading");
      body.classList.remove("error");
      btn.setAttribute("disabled", "");
      try {
        const prompt2 = buildPrompt(question, optionsStr);
        const res = await getResponse({ prompt: prompt2 });
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
      const url = get("searchEngine") + encodeURIComponent(question);
      window.open(url, "_blank");
    }
    if (action === "chat") {
      document.dispatchEvent(new CustomEvent("formify:open-chat", {
        detail: { message: buildPrompt(question, optionsStr) }
      }));
    }
  });
  return card;
};
var createSkeleton = () => {
  const card = document.createElement("div");
  card.className = "fy-answer formify-root";
  card.innerHTML = `
        <div class="fy-answer-header">
            <span class="fy-model-badge">${escapeHtml(get("model"))}</span>
            <span class="fy-actions"></span>
        </div>
        <div class="fy-answer-body loading">Thinking...</div>
    `;
  return card;
};
var escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
var buildPrompt = (question, optionsStr) => {
  return get("customPrompt") + `
` + question + (optionsStr ? `
Options: ` + optionsStr : "");
};
var selectAndCopy = (text) => {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
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
      show("API key saved", 2000, "success");
    } else {
      show("API key required — open settings with Alt+K", 4000, "error");
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
    show("Failed to parse form — check console", 4000, "error");
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
    const skeleton = createSkeleton();
    container.appendChild(skeleton);
    let aiAnswer;
    let isError = false;
    try {
      aiAnswer = await getResponse({ prompt: prompt2 });
      if (aiAnswer.startsWith("❌") || aiAnswer.startsWith("⚠️")) {
        isError = true;
      }
    } catch (err) {
      aiAnswer = "Failed: " + (err instanceof Error ? err.message : "Unknown error");
      isError = true;
      error("Question", i + 1, "failed:", err);
    }
    skeleton.remove();
    if (!isError && get("autoFill")) {
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
      answer: aiAnswer,
      isError
    });
    container.appendChild(card);
  }
  log("Done processing all questions");
  show("Formify finished ✓", 3000, "success");
})();
