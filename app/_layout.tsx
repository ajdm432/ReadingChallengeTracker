import RootStack from "@/components/RootStack";
import ThemeProvider from "@/constants/theme/ThemeProvider";
import { migrateDb } from "@/db/schema";
import { SQLiteProvider } from "expo-sqlite";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="reading-challenge-tracker.db"
      onInit={migrateDb}
    >
      <ThemeProvider>
        <RootStack name="index" title="Challenges" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
