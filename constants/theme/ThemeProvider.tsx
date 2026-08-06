import { Themes, type Theme } from "@/constants/theme/theme";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext<Theme>(Themes.light);

type ThemeProviderProps = {
  children: ReactNode;
  flipped?: boolean;
};

export default function ThemeProvider({
  children,
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

export const useAppTheme = () => useContext(ThemeContext);
