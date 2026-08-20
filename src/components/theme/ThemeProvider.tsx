"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored preference or default to system
    const saved = localStorage.getItem("nec-theme") as Theme | null;
    const initialTheme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    // Listen for OS system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentSaved = localStorage.getItem("nec-theme") as Theme | null;
      if (!currentSaved || currentSaved === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function applyTheme(targetTheme: Theme) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = targetTheme === "dark" || (targetTheme === "system" && systemDark);

    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.add("dark");
        document.body.classList.remove("light");
      }
      setResolvedTheme("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
      setResolvedTheme("light");
    }
  }

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    localStorage.setItem("nec-theme", newTheme);
    applyTheme(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
