import ColourSelector from "@/components/ColourSelector";
import ConfirmationModal from "@/components/ConfirmationModal";
import IconButton from "@/components/IconButton";
import QuotaStepper from "@/components/QuotaStepper";
import SaveCancelButtons from "@/components/SaveCancelButtons";
import SearchBar from "@/components/SearchBar";
import { type Category } from "@/types/model";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

type CreateCategoryProps = {
  challengeId: number;
  category: Category | null;
  onDelete: (cat: Category, isNew: boolean) => void;
  onSave: (cat: Category, isNew: boolean) => void;
  onCancel: () => void;
};

const Separator = () => <View style={styles.separator} />;

export default function CategoryModal({
  challengeId,
  category,
  onDelete,
  onSave,
  onCancel,
}: CreateCategoryProps) {
  const isNew = category === null;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [cat, setCategory] = useState<Category>(() => {
    if (!category) {
      return {
        challengeId,
        id: null,
        draftId: Crypto.randomUUID(),
        name: "",
        color: "",
        quota: 0,
        assignedCount: 0,
        subcategories: [],
      };
    } else {
      return category as Category;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Category Name</Text>
        <IconButton
          icon="trash"
          color="red"
          backgroundColor="transparent"
          size={24}
          onPress={() => setShowConfirmDelete(true)}
        />
      </View>
      <SearchBar
        style={styles.titleInput}
        placeholder="My Category"
        searchValue={cat.name}
        onChangeText={(text: string) =>
          setCategory((prev) => ({ ...prev, name: text }))
        }
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
      <Modal visible={showConfirmDelete}>
        <ConfirmationModal
          title="Delete Category"
          message="Are you sure you want to delete this category?"
          onCancel={() => setShowConfirmDelete(false)}
          onConfirm={() => onDelete(cat, isNew)}
        />
      </Modal>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#fff",
    marginBottom: 6,
  },
  titleInput: {
    marginBottom: 12,
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
