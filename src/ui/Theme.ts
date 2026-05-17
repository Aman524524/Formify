import { THEMES } from "../config/defaults";
import type { ThemeMode, ThemeColors } from "../config/types";
import * as Storage from "../core/Storage";

const getEffectiveTheme = (): "light" | "dark" => {
    const mode = Storage.get("theme");
    if (mode === "auto") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
};

export const getColors = (): ThemeColors => {
    return THEMES[getEffectiveTheme()];
};

export const getCSSVariables = (): string => {
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
