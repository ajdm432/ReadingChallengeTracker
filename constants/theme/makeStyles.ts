import type { Theme } from "@/constants/theme/theme";
import { useAppTheme } from "@/constants/theme/ThemeProvider";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function makeStyles<T extends Record<string, unknown>>(
  fn: (t: Theme) => T,
) {
  return () => {
    const theme = useAppTheme();
    return useMemo(() => StyleSheet.create(fn(theme) as any), [theme]);
  };
}
