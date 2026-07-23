import IconButton from "@/components/IconButton";
import type { Category, CategoryStatusForBook } from "@/types/model";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const Separator = () => <View style={styles.separator} />;

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
                  color={isCandidate(item) ? "green" : "black"}
                  backgroundColor="#fff"
                  size={32}
                  onPress={() => onCategoryPress(item)}
                />
                <IconButton
                  icon={isAssigned(item) ? "lock-closed" : "lock-open"}
                  color="blue"
                  backgroundColor="#fff"
                  size={32}
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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
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
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
  itemRowPressed: {
    opacity: 0.7,
  },
  emptyWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: "#000000",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
