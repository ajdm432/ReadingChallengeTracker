import { Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type AddButtonProps = {
  onPress: () => void;
};

export default function AddButton({ onPress }: AddButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 50,
    width: 56,
    height: 56,
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
