import { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { type Category } from "@/types/model";
import QuotaStepper from "@/components/QuotaStepper";
import ColourSelector from "@/components/ColourSelector";
import SaveCancelButtons from "@/components/SaveCancelButtons";
import * as Crypto from "expo-crypto";

type CreateCategoryProps = {
  challengeId: number;
  category: Category | null;
  onSave: (cat: Category, isNew: boolean) => void;
  onCancel: () => void;
};

const Separator = () => <View style={styles.separator} />;

export default function CategoryModal({
  challengeId,
  category,
  onSave,
  onCancel,
}: CreateCategoryProps) {
  const isNew = category === null;
  const [cat, setCategory] = useState<Category>(() => {
    if (category) {
      return category;
    } else {
      return {
        challengeId,
        id: 0,
        draftId: Crypto.randomUUID(),
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
        onChangeText={(text) =>
          setCategory((prev) => ({ ...prev, name: text }))
        }
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
        value={cat.quota}
        min={1}
        max={100}
        onChange={(next) => setCategory((prev) => ({ ...prev, quota: next }))}
      />
      <Separator />
      <Text style={styles.header}>Colour</Text>
      <ColourSelector
        selectedColor={cat.color}
        onPress={(c) => setCategory((prev) => ({ ...prev, color: c }))}
      />
      <Separator />
      <SaveCancelButtons
        onSave={() => onSave(cat, isNew)}
        onCancel={onCancel}
      />
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
