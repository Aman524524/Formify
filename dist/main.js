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
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (Preview)", provider: "gemini" },
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)", provider: "gemini" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite", provider: "gemini" },
  { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash-Lite (Preview)", provider: "gemini" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "gemini" },
  { id: "gemini-flash-latest", name: "Gemini Flash (Latest)", provider: "gemini" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "openai" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "openai" },
  { id: "o4-mini", name: "o4-mini", provider: "openai" }
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
var DEFAULT_PROMPT = "Answer the following question. Respond ONLY with a valid JSON object: " + '{"answer": "your answer", "explanation": "brief reason"}. ' + "If options are listed, 'answer' MUST be exactly one of the given options as written. " + "'explanation' should be one concise sentence. No markdown, no extra text outside the JSON.";
var THEMES = {
  light: {
    bg: "#ffffff",
    bgSecondary: "#f2f5f3",
    text: "#1f1f1f",
    textSecondary: "#5f6368",
    border: "#dadce0",
    accent: "#1a7f4b",
    accentHover: "#146b3e",
    shadow: "rgba(0, 0, 0, 0.06)"
  },
  dark: {
    bg: "#1f1f1f",
    bgSecondary: "#2d2d2d",
    text: "#e3e3e3",
    textSecondary: "#9aa0a6",
    border: "#3c4043",
    accent: "#81c995",
    accentHover: "#a8dab5",
    shadow: "rgba(0, 0, 0, 0.28)"
  }
};
var DEFAULT_SETTINGS = {
  apiKey: "",
  model: "gemini-2.5-flash",
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
var getProvider = (modelId) => {
  return MODELS.find((m) => m.id === modelId)?.provider ?? (modelId.startsWith("gemini") ? "gemini" : "openai");
};
var callGemini = async (model, apiKey, prompt2) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await request(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    }),
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt2 }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });
  if (!res.success)
    return "❌ Gemini API error: " + res.statusText;
  try {
    const json = JSON.parse(res.response);
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from model.";
  } catch {
    return "❌ Failed to parse Gemini response.";
  }
};
var callOpenAI = async (model, apiKey, prompt2) => {
  const url = "https://api.openai.com/v1/chat/completions";
  const res = await request(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    }),
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt2 }],
      response_format: { type: "json_object" }
    })
  });
  if (!res.success)
    return "❌ OpenAI API error: " + res.statusText;
  try {
    const json = JSON.parse(res.response);
    return json?.choices?.[0]?.message?.content || "No response from model.";
  } catch {
    return "❌ Failed to parse OpenAI response.";
  }
};
var parseResponse = (raw) => {
  try {
    const json = JSON.parse(raw);
    if (json.answer)
      return { answer: json.answer, explanation: json.explanation || "" };
  } catch {
    const match = raw.match(/\{[\s\S]*?"answer"[\s\S]*?\}/);
    if (match) {
      try {
        const json = JSON.parse(match[0]);
        if (json.answer)
          return { answer: json.answer, explanation: json.explanation || "" };
      } catch {}
    }
  }
  return { answer: raw, explanation: "" };
};
var getResponse = async ({ prompt: prompt2 }) => {
  const model = get("model");
  const apiKey = get("apiKey");
  if (!apiKey) {
    return "⚠️ API key not set. Open settings (Alt+K) to configure.";
  }
  const provider = getProvider(model);
  return provider === "openai" ? callOpenAI(model, apiKey, prompt2) : callGemini(model, apiKey, prompt2);
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
  return [...items].filter((el) => el.querySelector(sel.questionDataDiv)).map((el) => {
    const dataDiv = el.querySelector(sel.questionDataDiv);
    const raw = dataDiv.getAttribute("data-params");
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
  const selectors = getSelectors();
  try {
    log("Using DOM parser");
    return parseFromDOM(selectors);
  } catch {}
  try {
    const globalData = unsafeWindow?.FB_PUBLIC_LOAD_DATA_;
    if (globalData) {
      log("Falling back to global variable parser");
      return parseFromGlobalVar(globalData);
    }
  } catch {}
  throw new Error("Could not parse form");
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
  const section = (title) => {
    const sec = document.createElement("div");
    sec.className = "fy-section";
    const t = document.createElement("div");
    t.className = "fy-section-title";
    t.textContent = title;
    sec.appendChild(t);
    return sec;
  };
  const field = (labelText, control) => {
    const f = document.createElement("div");
    f.className = "fy-field";
    const lbl = document.createElement("label");
    lbl.textContent = labelText;
    f.appendChild(lbl);
    f.appendChild(control);
    return f;
  };
  const makeSelect = (id, options) => {
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
  const makeInput = (id, type, placeholder) => {
    const inp = document.createElement("input");
    inp.type = type;
    inp.id = id;
    if (placeholder)
      inp.placeholder = placeholder;
    return inp;
  };
  const makePasswordInput = (id, placeholder) => {
    const wrap = document.createElement("div");
    wrap.className = "fy-password-wrap";
    const inp = document.createElement("input");
    inp.type = "password";
    inp.id = id;
    if (placeholder)
      inp.placeholder = placeholder;
    const eyeBtn = document.createElement("button");
    eyeBtn.type = "button";
    eyeBtn.className = "fy-eye-btn";
    eyeBtn.title = "Toggle visibility";
    eyeBtn.textContent = "\uD83D\uDC41";
    eyeBtn.addEventListener("click", () => {
      const isPassword = inp.type === "password";
      inp.type = isPassword ? "text" : "password";
      eyeBtn.textContent = isPassword ? "\uD83D\uDE48" : "\uD83D\uDC41";
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
  const makeToggle = (id) => {
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
    { label: "System", value: "auto" }
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
  shortcuts.append(" toggle   ");
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
var refresh = () => syncToUI();

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
  closeBtn.addEventListener("click", () => toggle2(false));
  sendBtn.addEventListener("click", () => send());
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
      send();
  });
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
var create = ({ question, options, answer, explanation, isError }) => {
  const model = get("model");
  const showAnswers = get("showAnswers");
  const optionsStr = options?.map((o) => o.value).join(", ") || "";
  const card = document.createElement("div");
  card.className = `fy-answer formify-root${showAnswers ? "" : " hidden"}`;
  const header = document.createElement("div");
  header.className = "fy-answer-header";
  const badge = document.createElement("span");
  badge.className = "fy-model-badge";
  badge.textContent = "\uD83E\uDD95 " + model;
  const actions = document.createElement("span");
  actions.className = "fy-actions";
  const buttonDefs = [
    ["copy", "Copy to clipboard", "Copy"],
    ["regen", "Re-generate", "Retry"],
    ["search", "Search this question", "Search"],
    ["chat", "Open in chat", "Chat"]
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
  if (!explanation)
    explEl.style.display = "none";
  body.appendChild(explEl);
  card.appendChild(header);
  card.appendChild(body);
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
      answerEl.textContent = "Thinking...";
      explEl.textContent = "";
      explEl.style.display = "none";
      body.classList.add("loading");
      body.classList.remove("error");
      btn.setAttribute("disabled", "");
      try {
        const prompt2 = buildPrompt(question, optionsStr);
        const res = await getResponse({ prompt: prompt2 });
        const reParsed = parseResponse(res);
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
      const url = get("searchEngine") + encodeURIComponent(query);
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
  const header = document.createElement("div");
  header.className = "fy-answer-header";
  const badge = document.createElement("span");
  badge.className = "fy-model-badge";
  badge.textContent = "\uD83E\uDD95 " + get("model");
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

// src/main.ts
(async function() {
  GM_addStyle(getStyles());
  init();
  init2();
  if (!get("apiKey")) {
    const key = prompt(`Formify: Paste your Gemini API key.

` + "Get a free key at: https://aistudio.google.com/api-keys");
    if (key) {
      set("apiKey", key);
      refresh();
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
  const questionEls = [...document.querySelectorAll(selectors.questionItem)].filter((el) => el.querySelector(selectors.questionDataDiv));
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
    const parsed = isError ? { answer: aiAnswer, explanation: "" } : parseResponse(aiAnswer);
    skeleton.remove();
    if (!isError && get("autoFill")) {
      const labelSel = selectors.optionLabel;
      const labels = container.querySelectorAll(labelSel);
      for (const label of labels) {
        const text = label.textContent?.trim();
        if (text && parsed.answer.trim().includes(text)) {
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
      answer: parsed.answer,
      explanation: parsed.explanation,
      isError
    });
    container.appendChild(card);
  }
  log("Done processing all questions");
  show("Formify finished ✓", 3000, "success");
})();
