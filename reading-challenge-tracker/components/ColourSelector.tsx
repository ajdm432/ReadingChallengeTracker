import { Pressable, View, StyleSheet } from "react-native";
import { useState } from "react";

type ColourSelectorProps = {
  selectedColor: string;
  onPress: (color: string) => void;
};

export default function ColourSelector({
  selectedColor,
  onPress,
}: ColourSelectorProps) {
  const [currColour, setCurrColour] = useState(selectedColor || "#00ffc8ff");

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
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  colourSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedColour: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  colourOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
});
