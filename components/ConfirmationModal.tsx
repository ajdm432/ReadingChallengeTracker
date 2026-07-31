import { Pressable, StyleSheet, Text, View } from "react-native";

type ConfirmationModalProps = {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConrimationModal({
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>{title}</Text>
      <Text style={styles.modalMessage}>{message}</Text>
      <View style={styles.buttonPair}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 32,
    color: "#fff",
  },
  buttonPair: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    gap: 48,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffffff",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#fb3838ff",
    padding: 12,
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: "#59dde9ff",
    padding: 12,
    borderRadius: 10,
  },
});
