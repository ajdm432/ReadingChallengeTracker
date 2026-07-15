import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { type Category } from "@/types/model";
import QuotaStepper from "@/components/QuotaStepper";
import ColourSelector from "@/components/ColourSelector";

type CreateCategoryProps = {
  challengeId: number;
  category: Category | null;
  onSave: (next: Category) => void;
  onCancel: () => void;
};

const Separator = () => <View style={styles.separator} />;

export default function CategoryModal({
  challengeId,
  category,
  onSave,
  onCancel,
}: CreateCategoryProps) {
  const [cat, setCategory] = useState<Category>(() => {
    if (category) {
      return category;
    } else {
      return {
        challengeId,
        id: 0,
        name: "",
        color: "",
        quota: 0,
        subcategories: [],
      };
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Category Name</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="My Category"
        value={cat.name}
        onChangeText={(text) => setCategory({ ...cat, name: text })}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <Separator />
      <Text style={styles.header}>Quota</Text>
      <Text style={styles.subtitle}>
        How many books need to be assigned to this category before it&apos;s
        completed?
      </Text>
      <QuotaStepper
        label={"Quota"}
        value={cat.quota}
        min={1}
        max={100}
        onChange={(next) => setCategory({ ...cat, quota: next })}
      />
      <Separator />
      <Text style={styles.header}>Colour</Text>
      <ColourSelector
        selectedColor={cat.color}
        onPress={(c) => setCategory({ ...cat, color: c })}
      />
      <Separator />
      <View style={styles.buttonPair}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={() => onSave(cat)}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    padding: 32,
    height: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#fff",
    marginBottom: 6,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
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
  separator: {
    marginVertical: 8,
    borderBottomColor: "#ffffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
