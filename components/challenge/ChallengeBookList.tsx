import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getBooksForChallenge } from "@/db/queries";
import { useSQLiteContext } from "expo-sqlite";
import type { Book } from "@/types/model";
import AddButton from "../AddButton";
import ChallengeAddBook from "@/components/challenge/ChallengeAddBook";
import BookRow from "@/components/challenge/BookRow";

type ChallengeBookListProps = {
  challengeId: number;
};

export default function ChallengeBookList({
  challengeId,
}: ChallengeBookListProps) {
  const db = useSQLiteContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const loadBooks = useCallback(async () => {
    try {
      const data = await getBooksForChallenge(db, challengeId);
      setBooks(data);
    } catch (e) {
      console.error("Failed to load books", e);
    } finally {
      setLoading(false);
    }
  }, [db, challengeId]);

  const handleRemoveBook = async (bookId: number) => {
    try {
      await db.runAsync(`DELETE FROM book WHERE id = ?`, [bookId]);
      setBooks((books) => books.filter((b) => b.id !== bookId));
    } catch (e) {
      console.error("Failed to remove book", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks]),
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
        renderItem={({ item }) => (
          <BookRow
            book={item}
            mode="list"
            onPress={() =>
              router.push({
                pathname: `/challenge/book/[id]`,
                params: { id: item.id, challengeId: challengeId },
              })
            }
            OnPressRemove={() => handleRemoveBook(item.id)}
          />
        )}
      />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
