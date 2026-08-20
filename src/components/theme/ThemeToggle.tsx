"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
    );
  }

  const isDark = resolvedTheme === "dark";

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  }

  return (
    <button
      onClick={toggleTheme}
      className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs border shrink-0 ${
        isDark
          ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/50"
          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:border-slate-400"
      }`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Current: ${isDark ? "Dark Mode" : "Light Mode"}. Click to switch to ${isDark ? "Light" : "Dark"}.`}
    >
      {isDark ? (
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-12"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 hover:rotate-45"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}
