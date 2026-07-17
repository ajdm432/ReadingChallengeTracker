import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { type Category } from "@/types/model";

const Separator = () => <View style={styles.separator} />;

type CategoryListProps = {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
};

export default function CategoryList({
  categories,
  onCategoryPress,
}: CategoryListProps) {
  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={categories}
        keyExtractor={(item) => String(item.id ?? item.draftId)}
        contentContainerStyle={categories.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No categories yet. {"\n"}
            Add some with the &apos;+&apos; button!
          </Text>
        }
        renderItem={({ item }) => (
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
              <Text style={styles.itemText}>Quota: {item.quota}</Text>
            </Pressable>
            {categories.indexOf(item) < categories.length - 1 && <Separator />}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
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
