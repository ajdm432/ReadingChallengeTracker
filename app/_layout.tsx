import { migrateDb } from "@/db/schema";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SQLiteProvider
      databaseName="reading-challenge-tracker.db"
      onInit={migrateDb}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Challenges" }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
