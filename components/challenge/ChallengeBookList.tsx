import AddButton from "@/components/AddButton";
import BookRow from "@/components/challenge/BookRow";
import ChallengeAddBook from "@/components/challenge/ChallengeAddBook";
import IconButton from "@/components/IconButton";
import { getBooksForChallenge, getBookStatusesForCategory } from "@/db/queries";
import { setBookAssignment, setBookCandidacy } from "@/services/categories";
import type { Book, BookStatusForCategory, Category } from "@/types/model";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ChallengeBookListProps = {
  mode: "list" | "assign";
  challengeId: number;
  category?: Category;
  onClose?: () => void;
  addCategoryQuota?: () => void;
  decreaseCategoryQuota?: () => void;
};

export default function ChallengeBookList({
  mode,
  challengeId,
  category,
  onClose,
  addCategoryQuota,
  decreaseCategoryQuota,
}: ChallengeBookListProps) {
  const db = useSQLiteContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [bookStatuses, setBookStatuses] = useState<BookStatusForCategory[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  if (mode === "assign" && !category) {
    throw new Error("category is required for assign mode");
  }

  const loadBooks = useCallback(async () => {
    try {
      const data = await getBooksForChallenge(db, challengeId);
      setBooks(data);
    } catch (e) {
      console.error("Failed to load books", e);
    }
  }, [db, challengeId]);

  const loadBookStatuses = useCallback(async () => {
    try {
      const data = await getBookStatusesForCategory(db, category?.id!);
      setBookStatuses(data);
    } catch (e) {
      console.error("Failed to load book statuses", e);
    }
  }, [db, category]);

  const handleRemoveBook = async (bookId: number) => {
    try {
      await db.runAsync(`DELETE FROM book WHERE id = ?`, [bookId]);
      setBooks((books) => books.filter((b) => b.id !== bookId));
    } catch (e) {
      console.error("Failed to remove book", e);
    }
  };

  const handleSetCandidacy = async (
    book: Book,
    status: BookStatusForCategory | undefined,
  ) => {
    if (!status || !category || !book) return;
    try {
      await setBookCandidacy(
        db,
        book,
        category,
        status.isCandidate,
        status.isAssigned,
      );
    } catch (e) {
      alert(e);
      return;
    }

    setBookStatuses((prev) => {
      return prev.map((bs) => {
        if (bs.bookId === book.id) {
          return { ...bs, isCandidate: !bs.isCandidate };
        }
        return bs;
      });
    });
  };

  const handleSetAssignment = async (
    book: Book,
    status: BookStatusForCategory | undefined,
  ) => {
    if (!status || !category || !book) return;
    try {
      await setBookAssignment(
        db,
        book,
        category,
        status.isCandidate,
        status.isAssigned,
      );
    } catch (e) {
      alert(e);
      return;
    }

    // update category quota
    if (status.isAssigned) {
      decreaseCategoryQuota!();
    } else {
      addCategoryQuota!();
    }

    setBookStatuses((prev) => {
      return prev.map((bs) => {
        if (bs.bookId === book.id) {
          return { ...bs, isAssigned: !bs.isAssigned };
        }
        return bs;
      });
    });
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      try {
        loadBooks();
        if (mode === "assign") {
          loadBookStatuses();
        }
      } finally {
        setLoading(false);
      }
    }, [loadBooks, loadBookStatuses, mode]),
  );

  const closeAdd = useCallback(() => {
    setShowAdd(false);
    loadBooks();
  }, [loadBooks]);

  // Filter data by search
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.author?.toLowerCase().includes(q),
    );
  }, [books, search]);

  return (
    <View style={styles.container}>
      {mode === "assign" && (
        <View style={styles.closeButton}>
          <IconButton
            icon="close"
            color="#fff"
            backgroundColor="#000"
            size={32}
            onPress={onClose!}
          />
        </View>
      )}
      <TextInput
        style={styles.search}
        placeholder="Search books..."
        placeholderTextColor="#fff"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={visible.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading
              ? "Loading..."
              : search
                ? "No book titles or authors match your search"
                : "No books yet. Tap '+' to add your first book."}
          </Text>
        }
        renderItem={({ item }) => {
          if (mode === "list") {
            return (
              <BookRow
                book={item}
                mode={mode}
                onPress={() =>
                  router.push({
                    pathname: `/challenge/book/[id]`,
                    params: { id: item.id, challengeId: challengeId },
                  })
                }
                OnPressSecondary={() => handleRemoveBook(item.id)}
              />
            );
          } else {
            const bookStatus = bookStatuses.find((b) => b.bookId === item.id);
            return (
              <BookRow
                book={item}
                bookStatusForCat={bookStatus}
                mode={mode}
                onPress={() => handleSetCandidacy(item, bookStatus)}
                OnPressSecondary={() => handleSetAssignment(item, bookStatus)}
              />
            );
          }
        }}
      />
      {mode === "list" && (
        <View>
          <Modal visible={showAdd} onRequestClose={closeAdd}>
            <ChallengeAddBook
              challengeId={challengeId}
              show={showAdd}
              onClose={closeAdd}
            />
          </Modal>
          <AddButton
            onPress={() => {
              setShowAdd(true);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignContent: "center",
    marginVertical: 12,
  },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
    marginBottom: 12,
  },
  emptyWrap: {},
  emptyText: {},
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
    marginBottom: 10,
  },
  coverImage: {
    width: 50,
    height: 75,
    marginRight: 12,
  },
});
