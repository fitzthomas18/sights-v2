import { useState, useEffect } from "react";

type ThemeMode = "light" | "dark" | "system";

export const useTheme = () => {
  // Get initial theme from localStorage or default to 'system'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme-mode");
    return (stored as ThemeMode) || "system";
  });

  // Calculate if dark mode should be active
  const [isDark, setIsDark] = useState(false);

  // Function to apply theme to document
  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;

    if (mode === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemPrefersDark) {
        root.classList.add("dark");
        root.setAttribute("data-color-mode", "dark");
        setIsDark(true);
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-color-mode", "light");
        setIsDark(false);
      }
    } else if (mode === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-color-mode", "dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-color-mode", "light");
      setIsDark(false);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(themeMode);
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [themeMode]);

  // Listen for manual theme changes (to catch external changes to the DOM)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDarkClass = document.documentElement.classList.contains("dark");
      setIsDark(isDarkClass);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Function to cycle through themes: system -> light -> dark -> system
  const toggleTheme = () => {
    let newMode: ThemeMode;

    if (themeMode === "system") {
      newMode = "light";
    } else if (themeMode === "light") {
      newMode = "dark";
    } else {
      newMode = "system";
    }

    setThemeMode(newMode);
    localStorage.setItem("theme-mode", newMode);
    applyTheme(newMode);
  };

  // Function to set specific theme
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("theme-mode", mode);
    applyTheme(mode);
  };

  return {
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
  };
};
