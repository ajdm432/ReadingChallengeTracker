import CategoryList from "@/components/CategoryList";
import ConfirmationModal from "@/components/ConfirmationModal";
import CreateCategory from "@/components/CreateCategory";
import IconButton from "@/components/IconButton";
import {
  createChallenge,
  deleteChallenge,
  getChallenge,
  updateChallenge,
} from "@/db/queries";
import type { Category, Challenge, ChallengeNoIds } from "@/types/model";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const Separator = () => <View style={styles.separator} />;

export default function NewChallengeScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams();
  const challengeId = id ? Number(id) : null;
  const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState(new Date());
  const [dateShow, setDateShow] = useState(false);
  const [showCategory, setShowCategory] = useState<Category | null>(null);
  const [categoryShow, setCategoryShow] = useState(false);
  const [deleteConfirmShow, setDeleteConfirmShow] = useState(false);
  const [challenge, setChallenge] = useState<Challenge>({
    id: 0,
    name: "",
    startDate: null,
    endDate: null,
    categories: [],
    maxAssignmentsPerBook: 0,
  });

  const showForCategory = (category: Category | null) => {
    setShowCategory(category);
    setCategoryShow(true);
  };

  const createCategory = (cat: Category, isNew: boolean) => {
    const existingCategory = challenge.categories.find(
      (c) => c.name === cat.name && c.draftId !== cat.draftId,
    );
    if (existingCategory) {
      alert("A category with the same name already exists.");
      return;
    }
    if (isNew) {
      setChallenge((prev) => ({
        ...prev,
        categories: [...prev.categories, cat],
      }));
      setCategoryShow(false);
      return;
    }
    const index = challenge.categories.findIndex(
      (c) => c.draftId === cat.draftId,
    );
    if (index !== -1) {
      const newCategories = challenge.categories.map((c, i) => {
        if (i === index) {
          return cat;
        }
        return c;
      });
      setChallenge((prev) => ({ ...prev, categories: newCategories }));
      setCategoryShow(false);
    }
  };

  const handleSave = async () => {
    if (!challenge.name) {
      alert("Please enter a name for the challenge before saving.");
      return;
    }

    try {
      if (challengeId) {
        // Update challenge
        await updateChallenge(db, challenge);
      } else {
        // Create challenge
        const challengeNoIds: ChallengeNoIds = {
          name: challenge.name,
          startDate: challenge.startDate ?? undefined,
          endDate: challenge.endDate ?? undefined,
          maxAssignmentsPerBook: challenge.maxAssignmentsPerBook,
          categories: challenge.categories,
        };
        await createChallenge(db, challengeNoIds);
      }
    } catch (e) {
      console.error("Failed to save challenge", e);
      alert("Failed to save challenge: " + e);
      return;
    }

    router.back();
  };

  const handleDelete = async () => {
    if (challengeId) {
      try {
        await deleteChallenge(db, challengeId);
      } catch (e) {
        console.error("Failed to delete challenge", e);
        alert("Failed to delete challenge: " + e);
        return;
      }
    }
    router.back();
  };

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
        options={{
          title: challengeId ? "Edit Challenge" : "New Challenge",
          headerRight: () => (
            <View style={styles.headerButtonPair}>
              <IconButton
                icon="trash"
                color="red"
                backgroundColor="transparent"
                size={24}
                onPress={() => setDeleteConfirmShow(true)}
              />
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [pressed && styles.buttonPressed]}
              >
                <Text style={styles.saveButton}>Save</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <Text style={styles.header}>Challenge Title</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="My Challenge"
        value={challenge.name}
        onChangeText={(text) =>
          setChallenge((prev) => ({ ...prev, name: text }))
        }
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
          setChallenge((prev) => ({
            ...prev,
            maxAssignmentsPerBook: Number(text),
          }))
        }
        autoCorrect={false}
        clearButtonMode="while-editing"
        keyboardType="numeric"
      />
      <Separator />
      <Text style={styles.header}>Deadline</Text>
      <Text style={styles.subtitle}>
        The date by which you have to cross the finish line
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.dateButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {
          setDateShow(true);
        }}
      >
        <Text style={styles.buttonText}>
          {challenge.endDate
            ? new Date(challenge.endDate).toLocaleDateString()
            : "Select Date"}
        </Text>
      </Pressable>
      {dateShow && (
        <DateTimePicker
          testID="dateTimePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setDateShow(false);
            if (event.type === "set" && selectedDate) {
              setEndDate(selectedDate);
              setChallenge((prev) => ({
                ...prev,
                endDate: selectedDate.toLocaleDateString(),
              }));
            }
          }}
        />
      )}
      <Separator />
      <View style={styles.categoryHeader}>
        <Text style={styles.header}>Categories</Text>
        <Pressable
          style={({ pressed }) => [
            styles.categoryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => showForCategory(null)}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
      <Modal
        visible={categoryShow}
        onRequestClose={() => setCategoryShow(false)}
      >
        <CreateCategory
          challengeId={challenge.id}
          category={showCategory}
          onSave={(cat: Category, isNew: boolean) => createCategory(cat, isNew)}
          onCancel={() => setCategoryShow(false)}
        />
      </Modal>
      <Modal
        visible={deleteConfirmShow}
        onRequestClose={() => setDeleteConfirmShow(false)}
      >
        <ConfirmationModal
          title="Delete Challenge"
          message="Are you sure you want to delete this challenge?"
          onCancel={() => setDeleteConfirmShow(false)}
          onConfirm={handleDelete}
        />
      </Modal>
      <CategoryList
        categories={challenge.categories}
        onCategoryPress={(c) => {
          showForCategory(c);
        }}
        onAssignPress={() => {}}
      />
      <Separator />
      <View style={styles.switchHeader}>
        <Text style={styles.header}>Start Challenge?</Text>
        <View style={styles.switchContainer}>
          <Switch
            trackColor={{ false: "#d62323ff", true: "#81f7ffff" }}
            value={challenge.startDate !== null}
            onValueChange={(value) => {
              if (value) {
                setChallenge((prev) => ({
                  ...prev,
                  startDate: String(new Date()),
                }));
              } else {
                setChallenge((prev) => ({ ...prev, startDate: null }));
              }
            }}
          />
          <Text style={styles.switchText}>
            {challenge.startDate ? "Yes" : "No"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  saveButton: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "bold",
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
  headerButtonPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryButton: {
    width: 28,
    height: 28,
    borderRadius: 50,
    backgroundColor: "#1eef5dff",
    alignItems: "center",
    justifyContent: "center",
  },
  switchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 48,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    gap: 12,
  },
  switchText: {
    fontSize: 16,
    color: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    backgroundColor: "#1eef5dff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 24,
    color: "#ffffffff",
    lineHeight: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: "#ffffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
