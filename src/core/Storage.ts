import { DEFAULT_SETTINGS } from "../config/defaults";
import type { Settings, FormSelectors } from "../config/types";

const STORAGE_KEY = "formify";

const readAll = (): Partial<Settings> => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
};

const writeAll = (data: Partial<Settings>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// ─── Public API ─────────────────────────────────────────────────────────────

export const get = <K extends keyof Settings>(key: K): Settings[K] => {
    const data = readAll();
    return (data[key] ?? DEFAULT_SETTINGS[key]) as Settings[K];
};

export const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const data = readAll();
    data[key] = value;
    writeAll(data);
};

export const getAll = (): Settings => {
    return { ...DEFAULT_SETTINGS, ...readAll() };
};

export const reset = () => {
    writeAll({});
};

export const getSelectors = (): FormSelectors => {
    return get("selectors");
};
