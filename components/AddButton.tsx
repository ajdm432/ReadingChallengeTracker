import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet } from "react-native";

type AddButtonProps = {
  positionAbsolute?: boolean;
  size?: number;
  onPress: () => void;
};

export default function AddButton({
  positionAbsolute = true,
  size = 56,
  onPress,
}: AddButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        positionAbsolute && styles.absPos,
        styles.fab,
        pressed && styles.pressed,
        { width: size, height: size },
      ]}
      onPress={() => onPress()}
      accessibilityLabel="Create new reading challenge"
    >
      <Ionicons
        name="add"
        color="#fff"
        backgroundColor="transparent"
        size={32}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  absPos: {
    position: "absolute",
    right: 20,
    bottom: 50,
  },
  fab: {
    borderRadius: 28,
    backgroundColor: "#1eef5dff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  pressed: {
    opacity: 0.7,
  },
});
