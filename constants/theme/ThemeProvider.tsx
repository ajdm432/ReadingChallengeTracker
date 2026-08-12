import { Themes, type Theme } from "@/constants/theme/theme";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext<Theme | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  log?: boolean;
  flipped?: boolean;
};

export default function ThemeProvider({
  children,
  log = false,
  flipped = false,
}: ThemeProviderProps) {
  const scheme = useColorScheme();
  const inhereted = useContext(ThemeContext);
  const theme = useMemo(() => {
    if (flipped) {
      return Themes[scheme === "dark" ? "light" : "dark"];
    }
    if (inhereted) return inhereted;
    return Themes[scheme === "dark" ? "dark" : "light"];
  }, [flipped, inhereted, scheme]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return theme;
}
