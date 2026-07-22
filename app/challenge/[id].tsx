import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import ChallengeCategoryList from "@/components/challenge/ChallengeCategoryList";
import ChallengeBookList from "@/components/challenge/ChallengeBookList";

export default function ChallengeScreen() {
  const { id, challengeTitle } = useLocalSearchParams();
  const title: string = Array.isArray(challengeTitle)
    ? challengeTitle[0]
    : (challengeTitle ?? "Challenge");
  const [activeTab, setActiveTab] = useState("first");
  const challengeId = Number(id);

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

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "first" ? (
          <ChallengeCategoryList challengeId={challengeId} />
        ) : (
          <ChallengeBookList challengeId={challengeId} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd" },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTab: { borderColor: "#007AFF" },
  tabText: { fontSize: 16, color: "#888" },
  activeText: { color: "#007AFF", fontWeight: "600" },
  content: { flex: 1, padding: 16 },
  contentText: { fontSize: 16, color: "#fff" },
});
