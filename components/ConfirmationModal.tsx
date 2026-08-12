import { makeStyles } from "@/constants/theme/makeStyles";
import { Pressable, Text, View } from "react-native";

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
  const styles = useStyles();
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

const useStyles = makeStyles((t) => ({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.colors.background,
  },
  modalTitle: {
    fontSize: t.typography.header.fontSize,
    fontWeight: t.typography.header.fontWeight,
    marginBottom: t.spacing.md,
    color: t.colors.text,
  },
  modalMessage: {
    fontSize: t.typography.body.fontSize,
    marginBottom: t.spacing.xl,
    color: t.colors.text,
  },
  buttonPair: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    gap: t.spacing.xxl,
  },
  buttonText: {
    fontSize: t.typography.title.fontSize,
    fontWeight: t.typography.title.fontWeight,
    color: t.colors.text,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: t.colors.delete,
    padding: t.spacing.md,
    borderRadius: t.radius.sm,
  },
  confirmButton: {
    backgroundColor: t.colors.interactLight,
    padding: t.spacing.md,
    borderRadius: t.radius.sm,
  },
}));
