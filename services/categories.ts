import {
  assignBookToCategory,
  removeCandidacy,
  setCandidacy,
  unassignBookFromCategory,
} from "@/db/queries";
import type { Book, Category } from "@/types/model";
import type { SQLiteDatabase } from "expo-sqlite";

export async function setBookCandidacy(
  db: SQLiteDatabase,
  book: Book,
  category: Category,
  isCandidate: boolean,
  isAssigned: boolean,
): Promise<void> {
  if (isAssigned) {
    throw new Error(
      "Cannot change candidacy of a book that is assigned to a category.",
    );
  }
  try {
    if (isCandidate) {
      await removeCandidacy(db, book.id, category.id!);
    } else {
      await setCandidacy(db, book.id, category.id!);
    }
  } catch (e) {
    throw e;
  }
}

export async function setBookAssignment(
  db: SQLiteDatabase,
  book: Book,
  category: Category,
  isCandidate: boolean,
  isAssigned: boolean,
): Promise<void> {
  if (!isCandidate) {
    throw new Error(
      "Cannot assign a book to a category that is not a candidate.",
    );
  }
  try {
    if (isAssigned) {
      await unassignBookFromCategory(db, book.id, category.id!);
    } else {
      if (category.assignedCount >= category.quota) {
        throw new Error(
          "This category is already full. Cannot assign more books.",
        );
      }
      await assignBookToCategory(db, book.id, category.id!);
    }
  } catch (e) {
    throw e;
  }
}
