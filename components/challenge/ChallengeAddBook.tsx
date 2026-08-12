import { searchBooks, type BookSearchResult } from "@/api/openLibrary";
import BookRow from "@/components/challenge/BookRow";
import IconButton from "@/components/IconButton";
import SearchBar from "@/components/SearchBar";
import { makeStyles } from "@/constants/theme/makeStyles";
import ThemeProvider from "@/constants/theme/ThemeProvider";
import { addBook, getBooksForChallenge } from "@/db/queries";
import { type BookNoIds } from "@/types/model";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

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

  const styles = useStyles();

  return (
    <ThemeProvider flipped={true}>
      <View style={styles.container}>
        <View style={styles.closeButton}>
          <IconButton
            icon="close"
            color={styles.buttonBlack}
            size={32}
            onPress={onClose!}
          />
        </View>
        <SearchBar
          style={styles.searchBar}
          placeholder="Search for a book"
          searchValue={query}
          onChangeText={(text) => setQuery(text)}
        />

        <FlatList
          data={results}
          extraData={booksAdded}
          keyExtractor={(item) => item.source ?? item.title}
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
    </ThemeProvider>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    padding: t.spacing.md,
    flex: 1,
  },
  searchBar: {
    marginBottom: t.spacing.md,
  },
  emptyText: {
    textAlign: "center",
    padding: t.spacing.md,
  },
  closeButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignContent: "center",
    marginVertical: t.spacing.md,
  },
  buttonBlack: t.colors.buttonVoid,
}));
