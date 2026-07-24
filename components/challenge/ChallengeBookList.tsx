import AddButton from "@/components/AddButton";
import BookRow from "@/components/challenge/BookRow";
import ChallengeAddBook from "@/components/challenge/ChallengeAddBook";
import IconButton from "@/components/IconButton";
import {
  deleteBook,
  getBooksForChallenge,
  getBookStatusesForCategory,
  getSuggestedNextReads,
} from "@/db/queries";
import { setBookAssignment, setBookCandidacy } from "@/services/categories";
import type { Book, BookStatusForCategory, Category } from "@/types/model";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
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
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [bookStatuses, setBookStatuses] = useState<BookStatusForCategory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);

  if (mode === "assign" && !category) {
    throw new Error("category is required for assign mode");
  }

  const loadBooks = useCallback(async () => {
    try {
      const data = await getBooksForChallenge(db, challengeId);
      setAllBooks(data);
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
      await deleteBook(db, bookId);
      setAllBooks((allBooks) => allBooks.filter((b) => b.id !== bookId));
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

  const toggleShowSuggested = async () => {
    if (!showSuggested) {
      try {
        const data = await getSuggestedNextReads(db, challengeId);
        setSuggestedBooks(data);
      } catch (e) {
        console.error("Failed to load suggested books", e);
      }
    }
    setShowSuggested((prev) => !prev);
  };

  useFocusEffect(
    useCallback(() => {
      setShowSuggested(false);
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
    const books = showSuggested ? suggestedBooks : allBooks;
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.author?.toLowerCase().includes(q),
    );
  }, [allBooks, showSuggested, suggestedBooks, search]);

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 12,
          alignItems: "center",
        }}
      >
        <Pressable
          style={({ pressed }) => [
            styles.suggestionButton,
            pressed && styles.pressed,
            showSuggested && { backgroundColor: "#ff9900ff" },
          ]}
          onPress={toggleShowSuggested}
        >
          <Text style={styles.buttonText}>
            {showSuggested ? "Showing Suggested" : "Showing All"}
          </Text>
        </Pressable>
        <AddButton
          positionAbsolute={false}
          size={44}
          onPress={() => {
            setShowAdd(true);
          }}
        />
      </View>
      <FlatList
        data={visible}
        style={styles.list}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={visible.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading
              ? "Loading..."
              : showSuggested
                ? "No suggested books yet"
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
  },
  suggestionButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  pressed: { opacity: 0.7 },
  list: {
    flex: 1,
    marginBottom: 32,
  },
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
