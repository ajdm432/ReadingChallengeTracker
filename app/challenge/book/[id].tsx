import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useState, useCallback } from "react";
import type { Book, Category, CategoryStatusForBook } from "@/types/model";
import { ReadStatus, getStatusColor } from "@/types/model";
import {
  getBook,
  getCategories,
  getCategoryStatusesForBook,
  setReadStatus,
  setCandidacy,
  removeCandidacy,
  assignBookToCategory,
  unassignBookFromCategory,
} from "@/db/queries";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, useFocusEffect, Stack } from "expo-router";
import CategoryList from "@/components/CategoryList";

export default function BookScreen() {
  const db = useSQLiteContext();
  const { id, challengeId } = useLocalSearchParams();
  const bookId: string = Array.isArray(id) ? id[0] : id;
  const challengeIdInt: number = Array.isArray(challengeId)
    ? Number(challengeId[0])
    : Number(challengeId);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<Book | null>(null);
  const [categoryStatuses, setCategoryStatuses] = useState<
    CategoryStatusForBook[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const getNextStatus = (bookStatus: ReadStatus): ReadStatus => {
    switch (bookStatus) {
      case ReadStatus.NOT_READ:
        return ReadStatus.READ;
      case ReadStatus.READ:
        return ReadStatus.DNF;
      case ReadStatus.DNF:
        return ReadStatus.NOT_READ;
      default:
        return bookStatus;
    }
  };

  const cycleBookStatus = async () => {
    if (!book) return;
    const newStatus = getNextStatus(book.readStatus);
    await setReadStatus(db, book.id, newStatus);
    setBook((prev: Book | null) => ({ ...prev!, readStatus: newStatus }));
  };

  const handleSetCandidacy = async (category: Category) => {
    if (!book) return;
    const catStatus = categoryStatuses.find(
      (cs) => cs.categoryId === category.id,
    );
    const isAssigned = catStatus?.isAssigned;
    if (isAssigned) {
      alert(
        "Cannot change candidacy of a book that is assigned to a category.",
      );
      return;
    }
    const isCandidate = catStatus?.isCandidate;
    try {
      if (isCandidate) {
        await removeCandidacy(db, book.id, category.id!);
      } else {
        await setCandidacy(db, book.id, category.id!);
      }
    } catch (e) {
      alert(e);
      return;
    }

    setCategoryStatuses((prev) => {
      return prev.map((cs) => {
        if (cs.categoryId === category.id) {
          return { ...cs, isCandidate: !cs.isCandidate };
        }
        return cs;
      });
    });
  };

  const handleSetAssignment = async (category: Category) => {
    if (!book) return;
    const catStatus = categoryStatuses.find(
      (cs) => cs.categoryId === category.id,
    );
    const isCandidate = catStatus?.isCandidate;
    const isAssigned = catStatus?.isAssigned;
    if (!isCandidate) {
      alert("Cannot assign a book to a category that is not a candidate.");
      return;
    }
    try {
      if (isAssigned) {
        await unassignBookFromCategory(db, book.id, category.id!);
        setCategories((prev) => {
          return prev.map((c) => {
            if (c.id === category.id) {
              return { ...c, assignedCount: c.assignedCount - 1 };
            }
            return c;
          });
        });
      } else {
        if (category.assignedCount >= category.quota) {
          alert("This category is already full. Cannot assign more books.");
          return;
        }
        await assignBookToCategory(db, book.id, category.id!);
        setCategories((prev) => {
          return prev.map((c) => {
            if (c.id === category.id) {
              return { ...c, assignedCount: c.assignedCount + 1 };
            }
            return c;
          });
        });
      }
    } catch (e) {
      alert(e);
      return;
    }

    setCategoryStatuses((prev) => {
      return prev.map((cs) => {
        if (cs.categoryId === category.id) {
          return { ...cs, isAssigned: !cs.isAssigned };
        }
        return cs;
      });
    });
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      (async () => {
        try {
          const bookData = await getBook(db, Number(bookId));
          if (!cancelled) setBook(bookData);
          const catData = await getCategories(db, challengeIdInt);
          if (!cancelled) setCategories(catData);
          const statData = await getCategoryStatusesForBook(db, Number(bookId));
          if (!cancelled) setCategoryStatuses(statData);
        } catch (e) {
          console.error("Failed to load book and category statuses", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [db, bookId, challengeIdInt]),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: book ? "Book: " + book.title : "Book",
        }}
      />
      <View style={styles.bookData}>
        <Image
          style={styles.coverImage}
          source={{ uri: book?.coverUri ?? "" }}
        />
        <View style={styles.bookInfo}>
          <Text style={styles.dataHeader}>{book?.title}</Text>
          <Text style={styles.subData}>{book?.author}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.statusButton,
              { backgroundColor: getStatusColor(book?.readStatus!) },
              pressed && styles.pressed,
            ]}
            onPress={() => cycleBookStatus()}
            hitSlop={10}
            accessibilityLabel="Cycle book status"
          >
            <Text style={styles.baseText}>Status: {book?.readStatus}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.categoryManagement}>
        <CategoryList
          categories={categories}
          catStatusForBook={categoryStatuses}
          mode="assign"
          onCategoryPress={(category: Category) => {
            handleSetCandidacy(category);
          }}
          onAssignPress={(category: Category) => {
            handleSetAssignment(category);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bookData: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  coverImage: {
    width: 100,
    height: 150,
  },
  dataHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  subData: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
  },
  categoryManagement: {
    flex: 1,
    padding: 16,
    marginBottom: 32,
  },
  statusButton: {
    borderRadius: 10,
    marginVertical: 12,
    padding: 12,
  },
  baseText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
