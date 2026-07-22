import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type IconButtonProps = {
  icon?: IoniconName;
  color?: string;
  size?: number;
  backgroundColor?: string;
  disabled?: boolean;
  onPress: () => void;
};

export default function GoButton({
  icon = "chevron-forward",
  color = "#007AFF",
  size = 24,
  backgroundColor = "#f2f2f7",
  disabled = false,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={10}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={size}
        color={color}
        style={{ backgroundColor }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
