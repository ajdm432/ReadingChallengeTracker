import AddButton from "@/components/AddButton";
import IconButton from "@/components/IconButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import SearchBar from "@/components/SearchBar";
import { makeStyles } from "@/constants/theme/makeStyles";
import { getAllChallengeSummaries } from "@/db/queries";
import { type ChallengeSummary } from "@/types/model";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";

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

  const styles = useStyles();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <SearchBar
          style={styles.search}
          placeholder="Search challenges..."
          searchValue={search}
          onChangeText={setSearch}
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
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack} />
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.overallPercent}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.cardButtons}>
                <IconButton
                  icon="create"
                  color={styles.buttonColor}
                  onPress={() =>
                    router.push({
                      pathname: `/challenge/new`,
                      params: { id: item.id },
                    })
                  }
                />
                <IconButton
                  color={styles.buttonColor}
                  onPress={() =>
                    router.push({
                      pathname: `/challenge/[id]`,
                      params: { id: item.id, challengeTitle: item.name },
                    })
                  }
                />
              </View>
            </View>
          )}
        />
        <AddButton onPress={() => router.push("/challenge/new")} />
      </View>
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    padding: t.spacing.md,
  },
  search: {
    marginBottom: t.spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: t.spacing.md,
    borderRadius: t.spacing.md,
    backgroundColor: t.colors.offBackground,
    marginBottom: t.spacing.sm,
  },
  pressed: t.button.pressed,
  cardText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: t.typography.header.fontSize,
    fontWeight: t.typography.header.fontWeight,
  },
  cardButtons: {
    flexDirection: "row",
    gap: t.spacing.sm,
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: t.spacing.sm,
  },
  progressContainer: {
    height: 6,
    flex: 1,
    borderRadius: t.radius.pill,
    marginHorizontal: t.spacing.sm,
  },
  progressTrack: {
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.progressBackground,
    height: "100%",
    width: "100%",
  },
  progressFill: {
    position: "absolute",
    height: "100%",
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.progressBar,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: t.colors.faintText,
    fontSize: t.typography.body.fontSize,
  },
  buttonColor: t.colors.button0,
}));
