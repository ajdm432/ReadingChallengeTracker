import CategoryList from "@/components/CategoryList";
import ConfirmationModal from "@/components/ConfirmationModal";
import CreateCategory from "@/components/CreateCategory";
import IconButton from "@/components/IconButton";
import ScreenWrapper from "@/components/ScreenWrapper";
import SearchBar from "@/components/SearchBar";
import Separator from "@/components/Separator";
import { makeStyles } from "@/constants/theme/makeStyles";
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
  Switch,
  Text,
  View,
} from "react-native";

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

  const styles = useStyles();

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
    let index = -1;
    if (cat.draftId) {
      index = challenge.categories.findIndex((c) => c.draftId === cat.draftId);
    } else {
      index = challenge.categories.findIndex((c) => c.id === cat.id);
    }

    if (index === -1) {
      alert("Category not found.");
      return;
    }
    const newCategories = challenge.categories.map((c, i) => {
      if (i === index) {
        return cat;
      }
      return c;
    });
    setChallenge((prev) => ({ ...prev, categories: newCategories }));
    setCategoryShow(false);
  };

  const deleteCategory = (cat: Category, isNew: boolean) => {
    if (isNew) {
      // same as cancel
      setCategoryShow(false);
      return;
    }
    const newCategories = challenge.categories.filter((c) => c.id !== cat.id);
    setChallenge((prev) => ({ ...prev, categories: newCategories }));
    setCategoryShow(false);
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
    <ScreenWrapper>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: challengeId ? "Edit Challenge" : "New Challenge",
            headerRight: () => (
              <View style={styles.headerButtonPair}>
                <IconButton
                  icon="trash"
                  color={styles.buttonRed}
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
        <SearchBar
          style={styles.titleInput}
          placeholder="My Challenge"
          searchValue={challenge.name}
          onChangeText={(text: string) =>
            setChallenge((prev) => ({ ...prev, name: text }))
          }
        />
        <Separator />
        <Text style={styles.header}>Max Category Assignments</Text>
        <Text style={styles.subtitle}>
          The number of different categories for which a single book can be used
          (0 means no limit)
        </Text>

        <SearchBar
          style={styles.titleInput}
          placeholder="0"
          searchValue={challenge.maxAssignmentsPerBook.toString()}
          onChangeText={(text) =>
            setChallenge((prev) => ({
              ...prev,
              maxAssignmentsPerBook: Number(text),
            }))
          }
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
          <IconButton
            icon="add"
            size={24}
            borderSize={40}
            color={styles.buttonText.color}
            backgroundColor={styles.dateButton.backgroundColor}
            onPress={() => showForCategory(null)}
          />
        </View>
        <Modal
          visible={categoryShow}
          onRequestClose={() => setCategoryShow(false)}
        >
          <CreateCategory
            challengeId={challenge.id}
            category={showCategory}
            onDelete={(cat: Category, isNew: boolean) =>
              deleteCategory(cat, isNew)
            }
            onSave={(cat: Category, isNew: boolean) =>
              createCategory(cat, isNew)
            }
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
              trackColor={{ false: styles.buttonRed, true: styles.switchOn }}
              thumbColor={styles.dateButton.backgroundColor}
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
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    padding: t.spacing.md,
  },
  saveButton: {
    color: t.colors.button1,
    fontSize: t.typography.button.fontSize,
    fontWeight: t.typography.button.fontWeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: t.typography.title.fontSize,
    fontWeight: t.typography.title.fontWeight,
    color: t.colors.text,
  },
  subtitle: {
    fontSize: t.typography.caption.fontSize,
    fontStyle: t.typography.caption.fontStyle,
    color: t.colors.text,
    marginBottom: t.spacing.sm,
  },
  titleInput: {
    marginBottom: t.spacing.md,
  },
  headerButtonPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.lg,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: t.spacing.md,
  },
  categoryButton: {
    width: 28,
    height: 28,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.create,
    alignItems: "center",
    justifyContent: "center",
  },
  switchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: t.spacing.xxl,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: t.spacing.md,
    gap: t.spacing.md,
  },
  switchText: {
    fontSize: t.typography.body.fontSize,
    color: t.colors.text,
  },
  dateButton: {
    borderWidth: 1,
    backgroundColor: t.colors.button0,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    marginBottom: t.spacing.md,
    fontSize: t.typography.button.fontSize,
  },
  buttonPressed: t.button.pressed,
  buttonText: {
    fontSize: t.typography.button.fontSize,
    color: t.colors.text,
    lineHeight: t.spacing.lg,
    fontWeight: t.typography.title.fontWeight,
    textAlign: "center",
  },
  buttonRed: t.colors.buttonDelete,
  switchOn: t.colors.button1,
}));
