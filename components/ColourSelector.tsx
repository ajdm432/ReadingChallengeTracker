import { makeStyles } from "@/constants/theme/makeStyles";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

type ColourSelectorProps = {
  selectedColor: string;
  onPress: (color: string) => void;
};

export default function ColourSelector({
  selectedColor,
  onPress,
}: ColourSelectorProps) {
  const [currColour, setCurrColour] = useState(selectedColor || "#00ffc8ff");

  useEffect(() => {
    onPress(currColour);
  }, [onPress, currColour]);

  const colourOptions = [
    "#00ffc8ff",
    "#2f2f2fff",
    "#ff9d00ff",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#9500ffff",
    "#FFFF00",
    "#32e6faff",
    "#FF00FF",
  ];

  const styles = useStyles();

  return (
    <View style={styles.colourSelector}>
      {colourOptions.map((c) => (
        <Pressable
          key={c}
          style={[
            styles.colourOption,
            { backgroundColor: c },
            c === currColour && styles.selectedColour,
          ]}
          onPress={() => {
            setCurrColour(c);
            onPress(c);
          }}
          hitSlop={12}
          accessibilityLabel={c}
        />
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  colourSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: t.spacing.lg,
    padding: t.spacing.md,
  },
  selectedColour: {
    borderWidth: 3,
    borderColor: t.colors.text,
  },
  colourOption: {
    width: 30,
    height: 30,
    borderRadius: t.radius.md,
    margin: t.spacing.xs,
  },
}));
