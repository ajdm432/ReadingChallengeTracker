import { View, Text, Image, StyleSheet } from "react-native";
import IconButton from "@/components/IconButton";
import type { Book } from "@/types/model";
import { getStatusColor } from "@/types/model";
import type { BookSearchResult } from "@/api/openLibrary";

type BookRowProps = {
  book: Book | BookSearchResult;
  added?: boolean;
  mode: "list" | "search";
  onPress: () => void;
  OnPressRemove: () => void;
};

export default function BookRow({
  book,
  mode,
  added = false,
  onPress,
  OnPressRemove,
}: BookRowProps) {
  if (mode === "list") {
    return (
      <View style={styles.card}>
        <Image
          style={styles.coverImage}
          source={{ uri: book.coverUri ?? "" }}
        />
        <View
          style={[
            styles.statusCircle,
            { backgroundColor: getStatusColor((book as Book).readStatus) },
          ]}
        ></View>
        <View>
          <Text>{book.title}</Text>
          <Text style={{ fontStyle: "italic" }}>{book.author}</Text>
        </View>
        <IconButton onPress={() => onPress()} />
        <IconButton icon="trash" color="red" onPress={() => OnPressRemove()} />
      </View>
    );
  } else {
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
    marginRight: 12,
  },
  statusCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
});
