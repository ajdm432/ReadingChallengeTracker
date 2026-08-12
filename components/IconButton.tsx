import { makeStyles } from "@/constants/theme/makeStyles";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type IconButtonProps = {
  icon?: IoniconName;
  color?: string | undefined;
  size?: number;
  borderSize?: number | undefined;
  backgroundColor?: string;
  disabled?: boolean;
  onPress: () => void;
};

export default function IconButton({
  icon = "chevron-forward",
  color,
  size = 24,
  borderSize,
  backgroundColor = "transparent",
  disabled = false,
  onPress,
}: IconButtonProps) {
  const styles = useStyles();
  const buttonColor = color || styles.buttonBackground;
  let borderStyle = {};
  if (borderSize) {
    borderStyle = {
      width: borderSize,
      height: borderSize,
    };
    if (borderSize < size) borderStyle = {};
  }
  return (
    <Pressable
      style={({ pressed }) => [
        pressed && styles.pressed,
        {
          backgroundColor: backgroundColor,
        },
        styles.button,
        borderStyle,
      ]}
      onPress={onPress}
      hitSlop={10}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={size}
        color={buttonColor}
        backGroundColor="transparent"
      />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  pressed: t.button.pressed,
  buttonBackground: t.colors.button1,
  button: {
    borderRadius: t.radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
}));
