import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

type CloseButtonProps = {
  targetRoute: Href;
};

export default function CloseButton({ targetRoute }: CloseButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.closeButton}
      onPress={() => {
        void router.push(targetRoute);
      }}
    >
      <Ionicons name="close" size={24} color="#000" backgroundColor="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 50,
  },
});
