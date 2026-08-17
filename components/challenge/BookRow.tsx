import type { BookSearchResult } from "@/api/openLibrary";
import IconButton from "@/components/IconButton";
import { makeStyles } from "@/constants/theme/makeStyles";
import { limitStringSize } from "@/services/utils";
import type { Book, BookStatusForCategory } from "@/types/model";
import { getStatusColor } from "@/types/model";
import { Image, Text, View } from "react-native";

type BookRowProps = {
  book: Book | BookSearchResult;
  bookStatusForCat?: BookStatusForCategory;
  added?: boolean;
  mode: "list" | "add" | "assign";
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

  const styles = useStyles();

  if (mode === "list") {
    return (
      <View style={styles.card}>
        <View style={styles.basicInfo}>
          <View style={styles.statusCol}>
            <Text style={styles.statusText}>Status:</Text>
            <Text style={styles.statusText}>
              {(book as Book).readStatus.replaceAll("_", " ")}
            </Text>
            <View
              style={[
                styles.statusCircle,
                { backgroundColor: getStatusColor((book as Book).readStatus) },
              ]}
            />
          </View>
          <Image
            style={styles.coverImage}
            source={{ uri: book.coverUri ?? "" }}
          />
        </View>
        <View>
          <Text style={styles.infoText}>{limitStringSize(book.title, 15)}</Text>
          <Text style={[styles.infoText, styles.italic]}>
            {limitStringSize(book.author!, 15)}
          </Text>
        </View>
        <View style={styles.buttonPair}>
          <IconButton color={styles.buttonColor} onPress={() => onPress()} />
          <IconButton
            icon="trash"
            color={styles.buttonRed}
            onPress={() => OnPressSecondary()}
          />
        </View>
      </View>
    );
  } else if (mode === "add") {
    return (
      <View style={styles.card}>
        <Image
          style={styles.coverImage}
          source={{ uri: book.coverUri ?? "" }}
        />
        <View>
          <Text style={styles.infoText}>{limitStringSize(book.title)}</Text>
          <Text style={[styles.infoText, styles.italic]}>
            {limitStringSize(book.author!, 20)}
          </Text>
        </View>
        <IconButton
          icon={added ? "checkmark" : "add"}
          color={styles.buttonText}
          backgroundColor={added ? styles.buttonGreen : styles.buttonColor}
          disabled={added}
          onPress={() => onPress()}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.card}>
        <View style={styles.basicInfo}>
          <View style={styles.statusCol}>
            <Text style={styles.statusText}>Status:</Text>
            <Text style={styles.statusText}>
              {(book as Book).readStatus.replaceAll("_", " ")}
            </Text>
            <View
              style={[
                styles.statusCircle,
                { backgroundColor: getStatusColor((book as Book).readStatus) },
              ]}
            />
          </View>
          <Image
            style={styles.coverImage}
            source={{ uri: book.coverUri ?? "" }}
          />
        </View>
        <View>
          <Text style={styles.infoText}>{limitStringSize(book.title, 15)}</Text>
          <Text style={[styles.infoText, styles.italic]}>
            {limitStringSize(book.author!, 15)}
          </Text>
        </View>
        <IconButton
          icon={isCandidate(bookStatusForCat) ? "checkmark" : "square"}
          color={
            isCandidate(bookStatusForCat)
              ? styles.buttonGreen
              : styles.buttonBlack
          }
          size={32}
          onPress={() => onPress(book as Book)}
        />
        <IconButton
          icon={isAssigned(bookStatusForCat) ? "lock-closed" : "lock-open"}
          color={styles.buttonColor}
          size={32}
          onPress={() => OnPressSecondary(book as Book)}
        />
      </View>
    );
  }
}

const useStyles = makeStyles((t) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.offBackground,
    marginBottom: t.spacing.sm,
  },
  coverImage: {
    width: t.image.cover.widthSmall,
    height: t.image.cover.heightSmall,
    borderRadius: t.radius.sm,
  },
  basicInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: t.spacing.md,
    gap: t.spacing.sm,
  },
  statusCol: {
    flexDirection: "column",
    alignItems: "center",
    gap: t.spacing.xs,
  },
  infoText: {
    fontSize: t.typography.body.fontSize,
    maxWidth: 200,
    flexWrap: "wrap",
  },
  buttonPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
  },
  italic: {
    fontStyle: t.typography.caption.fontStyle,
  },
  statusText: {
    fontSize: t.typography.caption.fontSize,
  },
  statusCircle: {
    width: 16,
    height: 16,
    borderRadius: t.radius.pill,
  },
  buttonColor: t.colors.button0,
  buttonGreen: t.colors.buttonCreate,
  buttonRed: t.colors.buttonDelete,
  buttonBlack: t.colors.buttonVoid,
  buttonText: t.colors.background,
}));
