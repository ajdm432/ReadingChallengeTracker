/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import {
  button,
  palette,
  radius,
  spacing,
  typography,
} from "@/constants/theme/tokens";
import { Platform } from "react-native";

export const Themes = {
  light: {
    spacing,
    radius,
    typography,
    button,
    colors: {
      text: palette.darkText,
      background: palette.light0,
      tint: palette.light0,
      icon: palette.neutral,
      tabIconDefault: palette.neutral,
      tabIconSelected: palette.light0,
      interactLight: palette.interact0,
      interact: palette.interact1,
      create: palette.create,
      delete: palette.delete,
      searchBorder: palette.neutral,
    },
  },
  dark: {
    spacing,
    radius,
    typography,
    button,
    colors: {
      text: palette.lightText,
      background: palette.dark0,
      tint: palette.neutral,
      icon: palette.neutral,
      tabIconDefault: palette.neutral,
      tabIconSelected: palette.light3,
      interactLight: palette.interact0,
      interact: palette.interact1,
      create: palette.create,
      delete: palette.delete,
      searchBorder: palette.light3,
    },
  },
};

export type Theme = typeof Themes.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
