"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/50 dark:border-slate-700/50"></div>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/50"
      aria-label={`Switch to ${
        theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
      } mode`}
    >
      {theme === "light" && (
        <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
      )}
      {theme === "dark" && (
        <Moon className="h-5 w-5 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
      )}
      {theme === "system" && (
        <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300" />
      )}
    </button>
  );
}
