import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEME_KEY = "school-mgmt-theme";

export type Theme = "emerald" | "sapphire" | "rose" | "amber" | "violet";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "emerald";
  return (localStorage.getItem(THEME_KEY) as Theme) ?? "emerald";
}

export function setStoredTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("theme-sapphire", "theme-rose", "theme-amber", "theme-violet");
  if (theme !== "emerald") {
    document.documentElement.classList.add(`theme-${theme}`);
  }
}
