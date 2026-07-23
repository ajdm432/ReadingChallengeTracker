import type { BookSearchResult } from "@/api/openLibrary";
import IconButton from "@/components/IconButton";
import type { Book, BookStatusForCategory } from "@/types/model";
import { getStatusColor } from "@/types/model";
import { Image, StyleSheet, Text, View } from "react-native";

type BookRowProps = {
  book: Book | BookSearchResult;
  bookStatusForCat?: BookStatusForCategory;
  added?: boolean;
  mode: "list" | "search" | "assign";
  onPress: (book?: Book) => void;
  OnPressSecondary: (book?: Book) => void;
};

export default function BookRow({
  book,
  bookStatusForCat,
  mode,
  added = false,
  onPress,
  OnPressSecondary,
}: BookRowProps) {
  const isCandidate = function (
    bookStatusForCat: BookStatusForCategory | undefined,
  ) {
    if (!bookStatusForCat) return false;
    return mode === "assign" && bookStatusForCat.isCandidate;
  };

  const isAssigned = function (
    bookStatusForCat: BookStatusForCategory | undefined,
  ) {
    if (!bookStatusForCat) return false;
    return mode === "assign" && bookStatusForCat.isAssigned;
  };

  if (mode === "list") {
    return (
      <View style={styles.card}>
        <View style={styles.basicInfo}>
          <Image
            style={styles.coverImage}
            source={{ uri: book.coverUri ?? "" }}
          />
          <View>
            <Text style={styles.statusText}>Status:</Text>
            <Text style={styles.statusText}>{(book as Book).readStatus}</Text>
            <View
              style={[
                styles.statusCircle,
                { backgroundColor: getStatusColor((book as Book).readStatus) },
              ]}
            />
          </View>
        </View>
        <View>
          <Text>{book.title}</Text>
          <Text style={{ fontStyle: "italic" }}>{book.author}</Text>
        </View>
        <IconButton onPress={() => onPress()} />
        <IconButton
          icon="trash"
          color="red"
          onPress={() => OnPressSecondary()}
        />
      </View>
    );
  } else if (mode === "search") {
    return (
      <View style={styles.card}>
        <Image
          style={styles.coverImage}
          source={{ uri: book.coverUri ?? "" }}
        />
        <View>
          <Text>{book.title}</Text>
          <Text style={{ fontStyle: "italic" }}>{book.author}</Text>
        </View>
        <IconButton
          icon={added ? "checkmark" : "add"}
          color={added ? "green" : "#007AFF"}
          disabled={added}
          onPress={() => onPress()}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.card}>
        <View style={styles.basicInfo}>
          <Image
            style={styles.coverImage}
            source={{ uri: book.coverUri ?? "" }}
          />
          <View>
            <Text style={styles.statusText}>Status:</Text>
            <Text style={styles.statusText}>{(book as Book).readStatus}</Text>
            <View
              style={[
                styles.statusCircle,
                { backgroundColor: getStatusColor((book as Book).readStatus) },
              ]}
            />
          </View>
        </View>
        <View>
          <Text>{book.title}</Text>
          <Text style={{ fontStyle: "italic" }}>{book.author}</Text>
        </View>
        <IconButton
          icon={isCandidate(bookStatusForCat) ? "checkmark" : "square"}
          color={isCandidate(bookStatusForCat) ? "green" : "black"}
          backgroundColor="#f2f2f7"
          size={32}
          onPress={() => onPress(book as Book)}
        />
        <IconButton
          icon={isAssigned(bookStatusForCat) ? "lock-closed" : "lock-open"}
          color="blue"
          backgroundColor="#f2f2f7"
          size={32}
          onPress={() => OnPressSecondary(book as Book)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
    marginBottom: 10,
  },
  coverImage: {
    width: 50,
    height: 75,
  },
  basicInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
  },
  statusCircle: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
});
