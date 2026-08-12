import { makeStyles } from "@/constants/theme/makeStyles";
import { Pressable, Text, View } from "react-native";

type SaveCancelButtonsProps = {
  onSave: () => void;
  onCancel: () => void;
};

export default function SaveCancelButtons({
  onSave,
  onCancel,
}: SaveCancelButtonsProps) {
  const styles = useStyles();
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

const useStyles = makeStyles((t) => ({
  buttonPair: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: t.colors.interact,
    padding: t.spacing.md,
    borderRadius: t.radius.sm,
  },
  cancelButton: {
    backgroundColor: t.colors.delete,
    padding: t.spacing.md,
    borderRadius: t.radius.sm,
  },
  buttonText: {
    fontSize: t.typography.button.fontSize,
    fontWeight: t.typography.button.fontWeight,
    color: t.colors.text,
    textAlign: "center",
  },
}));
