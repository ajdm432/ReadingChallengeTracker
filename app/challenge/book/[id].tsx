import CategoryList from "@/components/CategoryList";
import ScreenWrapper from "@/components/ScreenWrapper";
import { makeStyles } from "@/constants/theme/makeStyles";
import {
  getBook,
  getCategories,
  getCategoryStatusesForBook,
  setReadStatus,
} from "@/db/queries";
import { setBookAssignment, setBookCandidacy } from "@/services/categories";
import type { Book, Category, CategoryStatusForBook } from "@/types/model";
import { ReadStatus, getStatusColor } from "@/types/model";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function BookScreen() {
  const db = useSQLiteContext();
  const { id, challengeId } = useLocalSearchParams();
  const bookId: string = Array.isArray(id) ? id[0] : id;
  const challengeIdInt: number = Array.isArray(challengeId)
    ? Number(challengeId[0])
    : Number(challengeId);
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
    const isCandidate = catStatus?.isCandidate;
    try {
      await setBookCandidacy(db, book, category, isCandidate!, isAssigned!);
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

    try {
      await setBookAssignment(db, book, category, isCandidate!, isAssigned!);
    } catch (e) {
      alert(e);
      return;
    }

    if (isAssigned) {
      setCategories((prev) => {
        return prev.map((c) => {
          if (c.id === category.id) {
            return { ...c, assignedCount: c.assignedCount - 1 };
          }
          return c;
        });
      });
    } else {
      setCategories((prev) => {
        return prev.map((c) => {
          if (c.id === category.id) {
            return { ...c, assignedCount: c.assignedCount + 1 };
          }
          return c;
        });
      });
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
          if (cancelled) return;
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [db, bookId, challengeIdInt]),
  );

  const styles = useStyles();

  return (
    <ScreenWrapper>
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
            <View>
              <Text style={styles.dataHeader}>{book?.title}</Text>
              <Text style={styles.subData}>{book?.author}</Text>
            </View>
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
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
  },
  bookData: {
    flexDirection: "row",
    padding: t.spacing.md,
  },
  bookInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: t.spacing.md,
    height: t.image.cover.height,
  },
  coverImage: {
    width: t.image.cover.width,
    height: t.image.cover.height,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.colors.coverBorder,
  },
  dataHeader: {
    color: t.colors.text,
    fontSize: t.typography.header.fontSize,
    fontWeight: t.typography.header.fontWeight,
    marginTop: t.spacing.md,
  },
  subData: {
    color: t.colors.text,
    fontSize: t.typography.body.fontSize,
    fontStyle: t.typography.caption.fontStyle,
  },
  categoryManagement: {
    flex: 1,
    padding: t.spacing.md,
    marginBottom: t.spacing.xl,
  },
  statusButton: {
    borderRadius: t.radius.sm,
    padding: t.spacing.md,
  },
  baseText: {
    color: t.colors.text,
    fontSize: t.typography.body.fontSize,
    textAlign: "center",
  },
  pressed: t.button.pressed,
}));
