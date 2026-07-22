import { View, TextInput, StyleSheet } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { getCategories } from "@/db/queries";
import type { Category } from "@/types/model";
import CategoryList from "@/components/CategoryList";

type ChallengeCategoryListProps = {
  challengeId: number;
};

export default function ChallengeCategoryList({
  challengeId,
}: ChallengeCategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Category[]>([]);

  const db = useSQLiteContext();

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories(db, challengeId);
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }, [db, challengeId]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  useEffect(() => {
    setFiltered(
      categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [categories, search]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search challenges..."
        placeholderTextColor="#fff"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <View style={styles.categories}>
        <CategoryList
          categories={filtered}
          onCategoryPress={(c) => {}}
          onAssignPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categories: {
    flex: 1,
    marginTop: 12,
    marginBottom: 32,
  },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
    marginBottom: 0,
  },
});
