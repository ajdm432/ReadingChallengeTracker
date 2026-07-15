import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Pressable,
} from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { type Challenge } from "@/types/model";
import { getChallenge } from "@/db/queries";
import DateTimePicker from "@react-native-community/datetimepicker";
import { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

const Separator = () => <View style={styles.separator} />;

export default function NewChallengeScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams();
  const challengeId = id ? Number(id) : null;
  const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState(new Date());
  const [show, setDateShow] = useState(false);
  const [challenge, setChallenge] = useState<Challenge>({
    id: 0,
    name: "",
    startDate: null,
    endDate: null,
    categories: [],
    maxAssignmentsPerBook: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (challengeId) {
        (async () => {
          try {
            const data = await getChallenge(db, challengeId);
            if (!cancelled) setChallenge(data);
          } catch (e) {
            console.error("Failed to load categories", e);
          } finally {
            if (!cancelled) setLoading(false);
          }
        })();
      } else {
        setLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }, [challengeId, db]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: challengeId ? "Edit Challenge" : "New Challenge" }}
      />
      <Text style={styles.header}>Challenge Title</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="My Challenge"
        value={challenge.name}
        onChangeText={(text) => setChallenge({ ...challenge, name: text })}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <Separator />
      <Text style={styles.header}>Max Category Assignments</Text>
      <Text style={styles.subtitle}>
        The number of different categories for which a single book can be used
        (0 means no limit)
      </Text>
      <TextInput
        style={styles.titleInput}
        placeholder="0"
        value={challenge.maxAssignmentsPerBook.toString()}
        onChangeText={(text) =>
          setChallenge({ ...challenge, maxAssignmentsPerBook: Number(text) })
        }
        autoCorrect={false}
        clearButtonMode="while-editing"
        keyboardType="numeric"
      />
      <Separator />
      <Text style={styles.header}>End Date</Text>
      <Text style={styles.subtitle}>
        The date by which you have to cross the finish line
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.dateButton,
          pressed && styles.dateButtonPressed,
        ]}
        onPress={() => {
          setDateShow(true);
        }}
      >
        <Text style={styles.dateButtonText}>
          {challenge.endDate
            ? new Date(challenge.endDate).toLocaleDateString()
            : "Select a date"}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setDateShow(false);
            if (event.type === "set" && selectedDate) {
              setEndDate(selectedDate);
              setChallenge({
                ...challenge,
                endDate: selectedDate.toLocaleDateString(),
              });
            }
          }}
        />
      )}
      <Separator />
      <Text style={styles.header}>Start Challenge?</Text>
      <Text style={styles.subtitle}>You can also do this later</Text>
      <View style={styles.switchContainer}>
        <Switch
          trackColor={{ false: "#d62323ff", true: "#81f7ffff" }}
          value={challenge.startDate !== null}
          onValueChange={(value) => {
            if (value) {
              setChallenge({ ...challenge, startDate: String(new Date()) });
            } else {
              setChallenge({ ...challenge, startDate: null });
            }
          }}
        />
        <Text style={styles.switchText}>
          {challenge.startDate ? "Yes" : "No"}
        </Text>
      </View>
      <Separator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#fff",
    marginBottom: 6,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 200,
    color: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  switchText: {
    fontSize: 16,
    color: "#fff",
  },
  dateButton: {
    color: "#1eef5dff",
    borderWidth: 1,
    borderColor: "#1eef5dff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  dateButtonPressed: {
    opacity: 0.7,
  },
  dateButtonText: {
    fontSize: 24,
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: "#ffffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
