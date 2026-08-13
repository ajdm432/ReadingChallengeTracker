import ColourSelector from "@/components/ColourSelector";
import ConfirmationModal from "@/components/ConfirmationModal";
import IconButton from "@/components/IconButton";
import QuotaStepper from "@/components/QuotaStepper";
import SaveCancelButtons from "@/components/SaveCancelButtons";
import SearchBar from "@/components/SearchBar";
import Separator from "@/components/Separator";
import { makeStyles } from "@/constants/theme/makeStyles";
import { type Category } from "@/types/model";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Modal, Text, TextInput, View } from "react-native";

type CreateCategoryProps = {
  challengeId: number;
  category: Category | null;
  onDelete: (cat: Category, isNew: boolean) => void;
  onSave: (cat: Category, isNew: boolean) => void;
  onCancel: () => void;
};

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
        notes: null,
      };
    } else {
      return category as Category;
    }
  });

  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Category Name</Text>
        <IconButton
          icon="trash"
          color={styles.buttonRed}
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
      <Text style={styles.subHeader}>Notes</Text>
      <TextInput
        editable
        multiline
        numberOfLines={6}
        placeholder="My Notes"
        placeholderTextColor={styles.notesInput.color}
        onChangeText={(text: string) =>
          setCategory((prev) => ({ ...prev, notes: text === "" ? null : text }))
        }
        value={cat.notes || ""}
        style={styles.notesInput}
      />
      <Separator />
      <Text style={styles.subHeader}>Quota</Text>
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

const useStyles = makeStyles((t) => ({
  container: {
    backgroundColor: t.colors.background,
    padding: t.spacing.md,
    height: "100%",
  },
  header: {
    fontSize: t.typography.title.fontSize,
    fontWeight: t.typography.title.fontWeight,
    color: t.colors.text,
  },
  subHeader: {
    fontSize: t.typography.header.fontSize,
    fontWeight: t.typography.header.fontWeight,
    color: t.colors.text,
    marginBottom: t.spacing.sm,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: t.spacing.sm,
  },
  subtitle: {
    fontSize: t.typography.caption.fontSize,
    fontStyle: t.typography.caption.fontStyle,
    color: t.colors.text,
    marginBottom: t.spacing.sm,
  },
  titleInput: {
    marginBottom: t.spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    fontSize: t.typography.body.fontSize,
    borderColor: t.colors.searchBorder,
    color: t.colors.text,
    marginBottom: t.spacing.md,
    height: 100,
    textAlignVertical: "top",
  },
  buttonText: {
    fontSize: t.typography.button.fontSize,
    fontWeight: t.typography.button.fontWeight,
    color: t.colors.text,
    textAlign: "center",
  },
  buttonRed: t.colors.buttonDelete,
}));
