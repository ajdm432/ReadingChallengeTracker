import { migrateDb } from "@/db/schema";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import "react-native-reanimated";

export default function RootLayout() {
  // const colorScheme = useColorScheme();

  return (
    <SQLiteProvider
      databaseName="reading-challenge-tracker.db"
      onInit={migrateDb}
    >
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Challenges" }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
