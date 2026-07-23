import { searchBooks, type BookSearchResult } from "@/api/openLibrary";
import BookRow from "@/components/challenge/BookRow";
import IconButton from "@/components/IconButton";
import { addBook, getBooksForChallenge } from "@/db/queries";
import { type BookNoIds } from "@/types/model";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

type ChallengeAddBookProps = {
  challengeId: number;
  show: boolean;
  onClose: () => void;
};

export default function ChallengeAddBook({
  challengeId,
  show,
  onClose,
}: ChallengeAddBookProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [booksAdded, setBooksAdded] = useState<Set<string>>(new Set());

  const db = useSQLiteContext();

  const handleAddBook = async (book: BookSearchResult) => {
    if (!book.source) return;
    if (booksAdded.has(book.source)) return;
    try {
      const bookNoId: BookNoIds = {
        challengeId: challengeId,
        title: book.title,
        author: book.author ?? undefined,
        coverUri: book.coverUri ?? undefined,
        source: book.source,
      };
      await addBook(db, bookNoId);
      setBooksAdded((prev) => new Set(prev).add(book.source!));
    } catch (e) {
      console.error("Failed to add book", e);
    }
  };

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getBooksForChallenge(db, challengeId);
        if (!cancelled) setBooksAdded(new Set(data.map((b) => b.source ?? "")));
      } catch (e) {
        console.error("Failed to load challenges", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show, db, challengeId]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchBooks(
          { title: query },
          10,
          controller.signal,
        );
        setResults(found);
      } catch (e: any) {
        if (e.name !== "AbortError") console.error(e);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.closeButton}>
        <IconButton
          icon="close"
          color="#000"
          backgroundColor="#fff"
          size={32}
          onPress={onClose!}
        />
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a book"
        onChangeText={(text) => setQuery(text)}
      />
      <FlatList
        data={results}
        extraData={booksAdded}
        keyExtractor={(item) => item.source ?? item.title}
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searching ? "Searching..." : "No books match your search"}
          </Text>
        }
        renderItem={({ item }) => (
          <BookRow
            mode="add"
            book={item}
            onPress={() => handleAddBook(item)}
            OnPressSecondary={() => {}}
            added={booksAdded.has(item.source ?? "")}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f2f2f7",
  },
  rowSeparator: {
    height: 1,
    backgroundColor: "#ccc",
  },
  closeButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignContent: "center",
    marginVertical: 12,
  },
});
