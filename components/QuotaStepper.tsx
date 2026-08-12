import { makeStyles } from "@/constants/theme/makeStyles";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

type QuotaStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
};

export default function QuotaStepper({
  value,
  min = 0,
  max = 99,
  onChange,
}: QuotaStepperProps) {
  if (value < min) value = min;
  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const styles = useStyles();

  return (
    <View style={styles.row}>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={decrement}
          disabled={value <= min}
        >
          <Text style={styles.buttonText}>&#8722;</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={increment}
          disabled={value >= max}
        >
          <Text style={styles.buttonText}>&#43;</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: t.spacing.sm,
  },
  controls: { flexDirection: "row", alignItems: "center", gap: t.spacing.md },
  button: {
    width: 32,
    height: 32,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.offBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: t.button.disabled,
  buttonText: {
    fontSize: t.typography.button.fontSize,
    fontWeight: t.typography.button.fontWeight,
  },
  value: {
    fontSize: t.typography.body.fontSize,
    fontWeight: t.typography.header.fontWeight,
    minWidth: 24,
    textAlign: "center",
    color: t.colors.text,
  },
}));
