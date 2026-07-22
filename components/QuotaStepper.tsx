import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";

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
  }, []);

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <View style={styles.row}>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={decrement}
          disabled={value <= min}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={increment}
          disabled={value >= max}
        >
          <Text style={styles.buttonText}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  controls: { flexDirection: "row", alignItems: "center", gap: 12 },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e5ea",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: "600" },
  value: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
    color: "#fff",
  },
});
