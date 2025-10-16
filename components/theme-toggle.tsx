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
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 animate-pulse"></div>
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
      className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
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
