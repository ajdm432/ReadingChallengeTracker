import ThemeProvider from "@/constants/theme/ThemeProvider";
import { migrateDb } from "@/db/schema";
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
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Challenges" }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
