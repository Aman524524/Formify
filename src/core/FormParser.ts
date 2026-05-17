/**
 * Unified Form Parser
 *
 * Strategy: try FB_PUBLIC_LOAD_DATA_ global variable (fast, reliable)
 * then fall back to DOM scraping with configurable selectors.
 */

import type { ParsedResult, ParsedQuestion, ParsedOption, FormSelectors } from "../config/types";
import * as Storage from "./Storage";
import { log, warn } from "../utils/Logger";

declare const unsafeWindow: any;

// ─── Shared: raw array → ParsedQuestion ─────────────────────────────────────

const mapQuestion = (question: any): ParsedQuestion => {
    if (!question) {
        return { title: "", moreInfo: null, type: -1, id: 0, required: false, options: [] };
    }

    const options: ParsedOption[] =
        question[4]?.[0]?.[1]?.map((opt: any) => ({
            value: opt[0] as string,
            moreInfo: opt[5] || null,
        })) ?? [];

    return {
        title: question[1],
        moreInfo: question[9] || null,
        type: question[3],
        id: question[4][0][0],
        required: !!question[4][0][2],
        options,
    };
};

// ─── Global variable parser ─────────────────────────────────────────────────

const parseFromGlobalVar = (data: any[]): ParsedResult => {
    const formTitle = data[1][8];
    const formDescription = data[1][0];
    const questions: ParsedQuestion[] = data[1][1].map(mapQuestion);
    return { title: formTitle, description: formDescription, questions };
};

// ─── DOM parser ─────────────────────────────────────────────────────────────

const parseHeader = (form: HTMLFormElement, sel: FormSelectors) => {
    const content = form.querySelector(sel.contentContainer);
    if (!content) throw new Error("Form content container not found");

    const header = content.querySelector(sel.headerContainer);
    return {
        title: header?.querySelector(sel.titleContainer)?.textContent || document.title,
        description: header?.querySelector(sel.descriptionContainer)?.textContent || "",
    };
};

const parseQuestions = (form: HTMLFormElement, sel: FormSelectors): ParsedQuestion[] => {
    const list = form.querySelector(sel.questionList);
    if (!list) throw new Error("Question list container not found");

    const items = list.querySelectorAll(sel.questionItem);
    if (!items.length) warn("No questions found on the page");

    return [...items].map((el) => {
        const dataDiv = el.querySelector(sel.questionDataDiv);
        const raw = dataDiv?.getAttribute("data-params");
        const cleaned = raw?.replace("%.@.", "[").replace(/&quot;/g, "'");
        const arr = JSON.parse(cleaned || "[]")[0];
        return mapQuestion(arr);
    });
};

const parseFromDOM = (sel: FormSelectors): ParsedResult => {
    const form: HTMLFormElement | null = document.querySelector(sel.form);
    if (!form) throw new Error("Form element not found — are you on a Google Form?");

    const { title, description } = parseHeader(form, sel);
    const questions = parseQuestions(form, sel);
    return { title, description, questions };
};

// ─── Public API ─────────────────────────────────────────────────────────────

export const parse = (): ParsedResult => {
    try {
        const globalData = unsafeWindow?.FB_PUBLIC_LOAD_DATA_;
        if (globalData) {
            log("Using global variable parser");
            return parseFromGlobalVar(globalData);
        }
    } catch {
        // not available
    }

    log("Using DOM parser");
    const selectors = Storage.getSelectors();
    return parseFromDOM(selectors);
};
