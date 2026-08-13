import { makeStyles } from "@/constants/theme/makeStyles";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export default function ScreenWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = useStyles();
  return (
    <LinearGradient
      colors={[s.gradient.start, s.gradient.end]}
      locations={[0, 0.3]}
      style={StyleSheet.absoluteFill}
    >
      {children}
    </LinearGradient>
  );
}

const useStyles = makeStyles((t) => ({
  gradient: {
    start: t.colors.headerBackground,
    end: t.colors.background,
  },
}));
