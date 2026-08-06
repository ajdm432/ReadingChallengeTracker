import CategoryList from "@/components/CategoryList";
import SearchBar from "@/components/SearchBar";
import { getCategories } from "@/db/queries";
import type { Category } from "@/types/model";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import ChallengeBookList from "./ChallengeBookList";

type ChallengeCategoryListProps = {
  challengeId: number;
};

export default function ChallengeCategoryList({
  challengeId,
}: ChallengeCategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [showBooks, setShowBooks] = useState(false);

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
      <SearchBar
        placeholder="Search challenges..."
        searchValue={search}
        onChangeText={setSearch}
      />
      <Text style={styles.instructionText}>
        Click a category to assign books to it:
      </Text>
      <View style={styles.categories}>
        <CategoryList
          categories={filtered}
          onCategoryPress={(c) => {
            setShowBooks(true);
            setSelectedCategory(c);
          }}
          onAssignPress={() => {}}
        />
      </View>
      <Modal visible={showBooks} onRequestClose={() => setShowBooks(false)}>
        <ChallengeBookList
          challengeId={challengeId}
          mode="assign"
          category={selectedCategory!}
          onClose={() => setShowBooks(false)}
          addCategoryQuota={() => {
            const categoryIdx = categories.findIndex(
              (c) => c.id === selectedCategory?.id,
            );
            const newCategory = {
              ...categories[categoryIdx],
              assignedCount: categories[categoryIdx].assignedCount + 1,
            };
            setCategories((prev) => {
              return [
                ...prev.slice(0, categoryIdx),
                newCategory,
                ...prev.slice(categoryIdx + 1),
              ];
            });
            setSelectedCategory(newCategory);
          }}
          decreaseCategoryQuota={() => {
            const categoryIdx = categories.findIndex(
              (c) => c.id === selectedCategory?.id,
            );
            const newCategory = {
              ...categories[categoryIdx],
              assignedCount: categories[categoryIdx].assignedCount - 1,
            };
            setCategories((prev) => {
              return [
                ...prev.slice(0, categoryIdx),
                newCategory,
                ...prev.slice(categoryIdx + 1),
              ];
            });
            setSelectedCategory(newCategory);
          }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categories: {
    flex: 1,
    marginBottom: 32,
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
    marginVertical: 6,
  },
});
