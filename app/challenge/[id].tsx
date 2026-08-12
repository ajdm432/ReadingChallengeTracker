import ChallengeBookList from "@/components/challenge/ChallengeBookList";
import ChallengeCategoryList from "@/components/challenge/ChallengeCategoryList";
import { makeStyles } from "@/constants/theme/makeStyles";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function ChallengeScreen() {
  const { id, challengeTitle } = useLocalSearchParams();
  const title: string = Array.isArray(challengeTitle)
    ? challengeTitle[0]
    : (challengeTitle ?? "Challenge");
  const [activeTab, setActiveTab] = useState("first");
  const challengeId = Number(id);

  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: title,
        }}
      />
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "first" && styles.activeTab]}
          onPress={() => setActiveTab("first")}
        >
          <Text
            style={[styles.tabText, activeTab === "first" && styles.activeText]}
          >
            Categories
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "second" && styles.activeTab]}
          onPress={() => setActiveTab("second")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "second" && styles.activeText,
            ]}
          >
            Books
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {activeTab === "first" ? (
          <ChallengeCategoryList challengeId={challengeId} />
        ) : (
          <ChallengeBookList mode="list" challengeId={challengeId} />
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1 },
  bookTabContainer: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: t.colors.offBackground,
  },
  suggestionButton: {
    backgroundColor: t.colors.button1,
    padding: t.spacing.md,
    marginTop: t.spacing.md,
    marginHorizontal: t.spacing.md,
    marginBottom: t.spacing.xl,
    borderRadius: t.radius.sm,
    alignItems: "center",
  },
  buttonText: {
    fontSize: t.typography.button.fontSize,
    color: t.colors.text,
    fontWeight: t.typography.button.fontWeight,
  },
  pressed: t.button.pressed,
  tab: {
    flex: 1,
    paddingVertical: t.spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTab: { borderColor: t.colors.button1 },
  tabText: {
    fontSize: t.typography.body.fontSize,
    color: t.colors.tabIconDefault,
  },
  activeText: {
    color: t.colors.button1,
    fontWeight: t.typography.header.fontWeight,
  },
  content: { flex: 1 },
  contentText: { fontSize: t.typography.body.fontSize, color: t.colors.text },
}));
