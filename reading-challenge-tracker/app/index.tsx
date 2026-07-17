import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { getAllChallengeSummaries } from "@/db/queries";
import { type ChallengeSummary } from "@/types/model";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ChallengeListScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  //Reload every time the screen gains focus. Returning from create challenge or a detail page always shows fresh data.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const data = await getAllChallengeSummaries(db);
          if (!cancelled) setChallenges(data);
        } catch (e) {
          console.error("Failed to load challenges", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  // Filter data by search
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter((c) => c.name.toLowerCase().includes(q));
  }, [challenges, search]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search challenges..."
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
                ? "No challenges match your search"
                : "No challenges yet. Tap '+' to create your first challenge."}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                {item.name}: {item.overallPercent}%
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.overallPercent}%` },
                  ]}
                />
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                { marginHorizontal: 10 },
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: `/challenge/new`,
                  params: { id: item.id },
                })
              }
              hitSlop={10}
            >
              <Ionicons
                name="create"
                size={24}
                color="#007AFF"
                backgroundColor="#f2f2f7"
              />
            </Pressable>
            <Pressable
              style={({ pressed }) => [pressed && styles.pressed]}
              onPress={() => router.push(`/challenge/${item.id}`)}
              hitSlop={10}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#007AFF"
                backgroundColor="#f2f2f7"
              />
            </Pressable>
          </View>
        )}
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/challenge/new")}
        accessibilityLabel="Create new reading challenge"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#25e4feff",
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 50,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1eef5dff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  fabIcon: {
    fontSize: 28,
    color: "#fff",
    lineHeight: 30,
    fontWeight: "bold",
  },
  editIcon: {
    color: "#1eef5dff",
    lineHeight: 30,
    fontWeight: "bold",
  },
});
