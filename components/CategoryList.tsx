import IconButton from "@/components/IconButton";
import Separator from "@/components/Separator";
import { makeStyles } from "@/constants/theme/makeStyles";
import type { Category, CategoryStatusForBook } from "@/types/model";
import { FlatList, Pressable, Text, View } from "react-native";

type CategoryListProps = {
  categories: Category[];
  catStatusForBook?: CategoryStatusForBook[];
  mode?: "edit" | "search" | "assign";
  onCategoryPress: (category: Category) => void;
  onAssignPress: (category: Category) => void;
};

export default function CategoryList({
  categories,
  catStatusForBook = [],
  mode = "edit",
  onCategoryPress,
  onAssignPress,
}: CategoryListProps) {
  const isCandidate = function (category: Category) {
    return (
      mode === "assign" &&
      catStatusForBook.find((s) => s.categoryId === category.id)?.isCandidate
    );
  };

  const isAssigned = function (category: Category) {
    return (
      mode === "assign" &&
      catStatusForBook.find((s) => s.categoryId === category.id)?.isAssigned
    );
  };

  const styles = useStyles();

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={categories}
        keyExtractor={(item) => String(item.draftId ?? item.id)}
        contentContainerStyle={categories.length === 0 && styles.emptyWrap}
        ItemSeparatorComponent={() => <Separator />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {mode === "edit"
              ? "No categories yet"
              : "No categories match search"}
          </Text>
        }
        renderItem={({ item }) => {
          if (mode === "edit") {
            return (
              <View>
                <Pressable
                  style={({ pressed }) => [
                    styles.itemRow,
                    pressed && styles.itemRowPressed,
                  ]}
                  onPress={() => onCategoryPress(item)}
                >
                  <View
                    style={[styles.itemColor, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.itemText}>{item.name}</Text>
                  <Text style={styles.itemText}>
                    Quota: {item.assignedCount}/{item.quota}
                  </Text>
                </Pressable>
              </View>
            );
          } else if (mode === "search") {
            return (
              <View>
                <Pressable
                  style={({ pressed }) => [
                    styles.itemRow,
                    pressed && styles.itemRowPressed,
                  ]}
                  onPress={() => onCategoryPress(item)}
                >
                  <View
                    style={[styles.itemColor, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.itemText}>{item.name}</Text>
                  <Text style={styles.itemText}>
                    Quota: {item.assignedCount}/{item.quota}
                  </Text>
                </Pressable>
              </View>
            );
          } else {
            return (
              <View style={styles.itemRow}>
                <View
                  style={[styles.itemColor, { backgroundColor: item.color }]}
                />
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemText}>
                  Quota: {item.assignedCount}/{item.quota}
                </Text>
                <IconButton
                  icon={isCandidate(item) ? "checkmark" : "square"}
                  color={
                    isCandidate(item) ? styles.buttonGreen : styles.buttonBlack
                  }
                  size={32}
                  onPress={() => onCategoryPress(item)}
                />
                <IconButton
                  icon={isAssigned(item) ? "lock-closed" : "lock-open"}
                  size={32}
                  color={styles.lockColor}
                  onPress={() => onAssignPress(item)}
                />
              </View>
            );
          }
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    padding: t.spacing.md,
    backgroundColor: t.colors.altBackground,
    borderRadius: t.radius.sm,
    flex: 1,
  },
  list: {
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemColor: {
    width: 16,
    height: 16,
    borderRadius: t.radius.sm,
  },
  itemText: {
    fontSize: t.typography.body.fontSize,
  },
  itemRowPressed: t.button.pressed,
  emptyWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: t.typography.body.fontSize,
    fontStyle: "italic",
    textAlign: "center",
  },
  lockColor: t.colors.button1,
  buttonGreen: t.colors.buttonCreate,
  buttonBlack: t.colors.buttonVoid,
}));
