import BookRow from "@/components/challenge/BookRow";
import ChallengeAddBook from "@/components/challenge/ChallengeAddBook";
import ConfirmationModal from "@/components/ConfirmationModal";
import IconButton from "@/components/IconButton";
import SearchBar from "@/components/SearchBar";
import { makeStyles } from "@/constants/theme/makeStyles";
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
import { FlatList, Modal, Pressable, Text, View } from "react-native";

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
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeBookId, setRemoveBookId] = useState<number | null>(null);

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

  const handleRemoveBook = async () => {
    try {
      if (!removeBookId) return;
      await deleteBook(db, removeBookId);
      setAllBooks((allBooks) => allBooks.filter((b) => b.id !== removeBookId));
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

  const styles = useStyles();

  return (
    <View style={[styles.container, mode === "assign" && styles.assign]}>
      {mode === "assign" && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Labelling books with{" "}
            <Text style={{ fontStyle: "italic" }}>{category?.name}</Text>
          </Text>
          <IconButton
            icon="close"
            color={styles.buttonText.color}
            size={32}
            onPress={onClose!}
          />
        </View>
      )}
      <SearchBar
        placeholder="Search books..."
        searchValue={search}
        onChangeText={setSearch}
        style={styles.bar}
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
            showSuggested && { backgroundColor: styles.switchOn },
          ]}
          onPress={toggleShowSuggested}
        >
          <Text style={styles.buttonText}>
            {showSuggested ? "Showing Suggested" : "Showing All"}
          </Text>
        </Pressable>
        <IconButton
          size={32}
          borderSize={54}
          icon="add"
          color={styles.buttonText.color}
          backgroundColor={styles.buttonBackground}
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
                OnPressSecondary={() => {
                  setRemoveBookId(item.id);
                  setShowRemoveModal(true);
                }}
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
          <Modal
            visible={showRemoveModal}
            onRequestClose={() => setShowRemoveModal(false)}
          >
            <ConfirmationModal
              title="Remove Book"
              message="Are you sure you want to remove this book from the challenge?"
              onCancel={() => {
                setRemoveBookId(null);
                setShowRemoveModal(false);
              }}
              onConfirm={() => {
                handleRemoveBook();
                setRemoveBookId(null);
                setShowRemoveModal(false);
              }}
            />
          </Modal>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    padding: t.spacing.md,
  },
  assign: {
    backgroundColor: t.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "start",
    marginVertical: t.spacing.md,
  },
  headerText: {
    fontSize: t.typography.header.fontSize,
    fontWeight: t.typography.header.fontWeight,
    color: t.colors.text,
  },
  suggestionButton: {
    backgroundColor: t.colors.button0,
    padding: t.spacing.md,
    borderRadius: t.radius.sm,
    alignItems: "center",
  },
  emptyText: {
    color: t.colors.text,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: t.typography.button.fontSize,
    color: t.colors.text,
    fontWeight: t.typography.button.fontWeight,
  },
  pressed: t.button.pressed,
  list: {
    flex: 1,
    marginBottom: t.spacing.xl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: t.spacing.md,
    borderRadius: t.spacing.md,
    backgroundColor: t.colors.offBackground,
    marginBottom: t.spacing.sm,
  },
  coverImage: {
    width: t.image.cover.widthSmall,
    height: t.image.cover.heightSmall,
    marginRight: t.spacing.md,
  },
  switchOn: t.colors.button2,
  buttonBackground: t.colors.button0,
  bar: {
    marginBottom: t.spacing.sm,
  },
}));
