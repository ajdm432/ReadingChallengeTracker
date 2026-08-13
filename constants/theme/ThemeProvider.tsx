import { Themes, type Theme } from "@/constants/theme/theme";
import { createContext, useContext, useMemo, type ReactNode } from "react";

const ThemeContext = createContext<Theme | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  flipped?: boolean;
};

export default function ThemeProvider({
  children,
  flipped = false,
}: ThemeProviderProps) {
  // const scheme = useColorScheme(); TODO add this back once the light mode is ready
  const scheme = "dark"; // TODO remove this once the light mode is ready
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
