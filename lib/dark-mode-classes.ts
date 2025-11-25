/**
 * Dark Mode Color Classes
 * Consistent dark blue theme that's easy on the eyes
 */

export const darkColors = {
  // Backgrounds
  bgPrimary: "dark:bg-slate-900", // #0f172a - Main background
  bgSecondary: "dark:bg-slate-800", // #1e293b - Cards, secondary areas
  bgTertiary: "dark:bg-slate-700", // #334155 - Hover states, tertiary areas

  // Text
  textPrimary: "dark:text-slate-100", // #e2e8f0 - Main text
  textSecondary: "dark:text-slate-300", // #cbd5e1 - Secondary text
  textMuted: "dark:text-slate-400", // #94a3b8 - Muted text

  // Borders
  border: "dark:border-slate-700", // #334155 - Borders
  borderHover: "dark:border-slate-600", // #475569 - Border hover states

  // Accents
  accent: "dark:text-blue-400", // #60a5fa - Links, accents
  accentHover: "dark:text-blue-300", // #93c5fd - Accent hover

  // Buttons
  btnPrimary: "dark:bg-blue-600 dark:hover:bg-blue-500",
  btnSecondary: "dark:bg-slate-700 dark:hover:bg-slate-600",

  // Input fields
  input: "dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100",
  inputFocus: "dark:focus:border-blue-500 dark:focus:ring-blue-500",
} as const;

// Helper function to combine classes
export function dm(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
