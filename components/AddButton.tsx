import { makeStyles } from "@/constants/theme/makeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

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
  const styles = useStyles();
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

const useStyles = makeStyles((t) => ({
  absPos: {
    position: "absolute",
    right: 20,
    bottom: 50,
  },
  fab: {
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.create,
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
  pressed: t.button.pressed,
}));
