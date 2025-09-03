// scr/components/theme-provider.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({
  defaultTheme = "system",
  storageKey = "theme",
  children,
}: {
  defaultTheme?: Theme;
  storageKey?: string;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") return getSystemTheme();
    return theme;
  }, [theme]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey) as Theme | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeState(saved);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    applyTheme(resolvedTheme);
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {}
  }, [theme, resolvedTheme, storageKey]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const value: ThemeContextValue = { theme, setTheme, resolvedTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider />");
  return ctx;
}

