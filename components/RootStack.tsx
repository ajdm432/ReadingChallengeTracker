import { makeStyles } from "@/constants/theme/makeStyles";
import { Stack } from "expo-router";

type RootStackParamList = {
  name: string;
  title: string;
};

export default function RootStack({ name, title }: RootStackParamList) {
  const s = useStyles();
  return (
    <Stack
      screenOptions={{
        headerStyle: s.headerStyle,
        headerTintColor: s.headerTintColor,
        headerTitleStyle: s.headerTitleStyle,
        contentStyle: s.contentStyle,
      }}
    >
      <Stack.Screen name={name} options={{ title: title }} />
    </Stack>
  );
}

const useStyles = makeStyles((t) => ({
  headerStyle: {
    backgroundColor: t.colors.headerBackground,
  },
  headerTintColor: t.colors.headerTint,
  headerTitleStyle: {
    color: t.colors.headerText,
    fontWeight: t.typography.header.fontWeight,
  },
  contentStyle: {
    backgroundColor: t.colors.background,
  },
}));
