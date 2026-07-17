"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial: Theme = stored === "dark" ? "dark" : "light";
    setThemeState(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem("theme", next);
    applyThemeClass(next);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      applyThemeClass(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
