import { View, Text, Pressable, StyleSheet } from "react-native";

type SaveCancelButtonsProps = {
  onSave: () => void;
  onCancel: () => void;
};

export default function SaveCancelButtons({
  onSave,
  onCancel,
}: SaveCancelButtonsProps) {
  return (
    <View style={styles.buttonPair}>
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.buttonText}>Cancel</Text>
      </Pressable>
      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonPair: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#5ff2ffff",
    padding: 12,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "#fb3838ff",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffffff",
    textAlign: "center",
  },
});
