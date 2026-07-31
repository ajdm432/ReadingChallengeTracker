import { type SQLiteDatabase } from "expo-sqlite";
import type {
  Book,
  BookNoIds,
  BookStatusForCategory,
  Category,
  CategoryNoIds,
  CategoryProgress,
  CategoryStatusForBook,
  Challenge,
  ChallengeNoIds,
  ChallengeSummary,
  Subcategory,
} from "../types/model";
import { ReadStatus } from "../types/model";

/*========
 * BOOKS
 *========*/

/** Insert a book, return a new id.
 * Pattern: runAsync + result.lastInsertRowId */
export async function addBook(
  db: SQLiteDatabase,
  book: BookNoIds,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO book (
      challenge_id,
      title,
      author,
      cover_uri,
      source,
      read_status
    ) VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )`,
    [
      book.challengeId,
      book.title,
      book.author ?? null,
      book.coverUri ?? null,
      book.source ?? null,
      ReadStatus.NOT_READ,
    ],
  );

  return result.lastInsertRowId;
}

export async function deleteBook(
  db: SQLiteDatabase,
  bookId: number,
): Promise<void> {
  await db.runAsync(`DELETE FROM book WHERE id = ?`, [bookId]);
}

/** Pattern: getAllAsync, ORDER BY title */
export async function getBooksForChallenge(
  db: SQLiteDatabase,
  challenge_id: number,
): Promise<Book[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM book WHERE challenge_id = ? ORDER BY title`,
    [challenge_id],
  );

  if (!rows || rows.length === 0) {
    return [];
  }

  const books: Book[] = rows.map((r: any) => ({
    id: r.id,
    challengeId: r.challenge_id,
    title: r.title,
    author: r.author,
    coverUri: r.cover_uri,
    source: r.source,
    readStatus: r.read_status,
  }));

  return books;
}

/** Pattern: getFirstAsync — returns Book */
export async function getBook(
  db: SQLiteDatabase,
  bookId: number,
): Promise<Book> {
  const result: any = await db.getFirstAsync(
    `SELECT * FROM book WHERE id = ?`,
    [bookId],
  );

  if (!result) {
    throw new Error(`Book ${bookId} not found`);
  }

  return {
    id: result.id,
    challengeId: result.challenge_id,
    title: result.title,
    author: result.author,
    coverUri: result.cover_uri,
    source: result.source,
    readStatus: result.read_status,
  };
}

/** Pattern: simple UPDATE */
export async function setReadStatus(
  db: SQLiteDatabase,
  bookId: number,
  newStatus: ReadStatus,
): Promise<void> {
  const result = await db.runAsync(
    `UPDATE book SET read_status = ? WHERE id = ?`,
    [newStatus, bookId],
  );
  if (result.changes === 0) {
    throw new Error(`Book ${bookId} not found`);
  }
}

/*========================
 * CHALLENGE & CATEGORIES
 *========================*/

/** Insert challenge + its categories + subcategories in ONE transaction —
 *  this is where JSON import lands later. Pattern: withTransactionAsync
 *  wrapping multiple inserts, using lastInsertRowId to link children. */
export async function createChallenge(
  db: SQLiteDatabase,
  challenge: ChallengeNoIds,
): Promise<number> {
  // extract categories and subcategories from challenge object
  let challengeId: number = 0;
  await db.withTransactionAsync(async () => {
    // insert challenge, keeping track of its id
    const result = await db.runAsync(
      `INSERT INTO challenge (
        name,
        start_date,
        end_date,
        max_assignments_per_book
      ) VALUES (
        ?,
        ?,
        ?,
        ?
      )`,
      [
        challenge.name,
        challenge.startDate ?? null,
        challenge.endDate ?? null,
        challenge.maxAssignmentsPerBook,
      ],
    );
    challengeId = result.lastInsertRowId;
    // insert categories
    for (const cat of challenge.categories) {
      const categoryId = await createCategory(db, challengeId, cat);
      // insert subcategories for this category
      for (const sub of cat.subcategories) {
        await db.runAsync(
          `INSERT INTO subcategory (
            name,
            color,
            category_id
          ) VALUES (
            ?,
            ?,
            ?
          )`,
          [sub.name, sub.color, categoryId],
        );
      }
    }
  });
  return challengeId;
}

export async function updateChallenge(
  db: SQLiteDatabase,
  challenge: Challenge,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const existingChallenge = await getChallenge(db, challenge.id);
    if (!existingChallenge) {
      throw new Error(`Challenge ${challenge.id} not found. Could not update.`);
    }
    const result = await db.runAsync(
      `UPDATE challenge SET name = ?, start_date = ?, end_date = ?, max_assignments_per_book = ? WHERE id = ?`,
      [
        challenge.name,
        challenge.startDate ?? null,
        challenge.endDate ?? null,
        challenge.maxAssignmentsPerBook,
        challenge.id,
      ],
    );
    if (result.changes === 0) {
      throw new Error(`Challenge ${challenge.id} not found. Could not update.`);
    }

    // diff categories. Delete removed categories, add new categories
    const existingCategories = existingChallenge.categories;
    const newCategories = challenge.categories;
    // ensure all categories have unique draftIds
    for (const cat of [...existingCategories, ...newCategories]) {
      if (cat.draftId) continue;
      if (cat.id == null)
        throw new Error("Category id set to null. Could not update.");
      cat.draftId = String(cat.id);
    }
    const removedCategories = existingCategories.filter(
      (c1) => !newCategories.map((c2) => c2.draftId).includes(c1.draftId),
    );
    const addedCategories = newCategories.filter(
      (c1) => !existingCategories.map((c2) => c2.draftId).includes(c1.draftId),
    );
    const persistedCategories = newCategories.filter((c1) =>
      existingCategories.map((c2) => c2.draftId).includes(c1.draftId),
    );

    for (const cat of removedCategories) {
      if (!cat) throw new Error(`Category id set to null. Could not delete`);
      await deleteCategory(db, cat.id!);
    }

    for (const cat of persistedCategories) {
      await updateCategory(db, cat);
    }

    for (const cat of addedCategories) {
      await createCategory(db, challenge.id, cat);
    }
  });
}

/** Needs to delete challenge + its categories + subcategories + books */
export async function deleteChallenge(
  db: SQLiteDatabase,
  challengeId: number,
): Promise<void> {
  const result = await db.runAsync(`DELETE FROM challenge WHERE id = ?`, [
    challengeId,
  ]);
  if (result.changes === 0) {
    throw new Error(`Challenge ${challengeId} not found. Could not delete`);
  }
}

export async function getChallenge(
  db: SQLiteDatabase,
  challengeId: number,
): Promise<Challenge> {
  const challenge_row: any = await db.getFirstAsync(
    `SELECT * FROM challenge WHERE id = ?`,
    [challengeId],
  );

  const category_rows = await getCategories(db, challengeId);

  const categories: Category[] = [];
  for (let i = 0; i < category_rows.length; i++) {
    const cat = category_rows[i];
    const rows = await db.getAllAsync(
      `SELECT id, category_id AS categoryId, name, color FROM subcategory WHERE category_id = ?`,
      [cat.id],
    );
    const subcategories: Subcategory[] = rows.map((r: any) => ({
      ...r,
    }));
    const category: Category = {
      challengeId: challengeId,
      id: cat.id,
      name: cat.name,
      color: cat.color,
      quota: cat.quota,
      assignedCount: cat.assignedCount,
      subcategories: subcategories,
    };
    categories.push(category);
  }

  return {
    id: challenge_row.id,
    name: challenge_row.name,
    startDate: challenge_row.start_date,
    endDate: challenge_row.end_date,
    maxAssignmentsPerBook: challenge_row.max_assignments_per_book,
    categories: categories,
  };
}

/** Categories with their subcategories nested. Two queries + group in JS
 *  is simpler than one query with row-reshaping — fine at this scale. */
export async function getCategories(
  db: SQLiteDatabase,
  challengeId: number,
): Promise<Category[]> {
  const rows = await db.getAllAsync(
    `SELECT c.id,
            c.name,
            c.color,
            c.quota,
            COUNT(CASE WHEN bc.is_assigned = 1 THEN 1 END) AS assignedCount
      FROM category c 
      LEFT JOIN book_category bc on bc.category_id = c.id
      WHERE challenge_id = ?
      GROUP BY c.id
      ORDER BY c.name`,
    [challengeId],
  );

  const categories = rows.map((r: any) => ({
    ...r,
    challengeId: challengeId,
    subcategories: [],
  }));

  for (let i = 0; i < categories.length; i++) {
    const catId = categories[i].id;
    const subrows = await db.getAllAsync(
      `SELECT id,
              name,
              color
        FROM subcategory WHERE category_id = ?`,
      [catId],
    );

    categories[i].subcategories = subrows.map((r: any) => ({
      ...r,
      id: catId,
    }));
  }

  return categories;
}

export async function setChallengeStartDate(
  db: SQLiteDatabase,
  challengeId: number,
  startDate: string,
) {
  const result = await db.runAsync(
    `UPDATE challenge SET start_date = ? WHERE id = ?`,
    [startDate, challengeId],
  );

  if (result.changes === 0) {
    throw new Error(
      `Challenge ${challengeId} not found. Could not set start date.`,
    );
  }
}

/* =======================
 * CANDIDACY & ASSIGNMENT
 *========================*/

/** Upsert: mark book as candidate, optionally tagging a subcategory.
 *  Pattern: INSERT ... ON CONFLICT(book_id, category_id) DO UPDATE */
export async function setCandidacy(
  db: SQLiteDatabase,
  bookId: number,
  categoryId: number,
  subcategoryId?: number,
): Promise<void> {
  const match = await db.getFirstAsync<{ ok: number }>(
    `SELECT 1 AS ok
      FROM book b
      JOIN category c ON c.challenge_id = b.challenge_id
    WHERE b.id = ? and c.id = ?`,
    [bookId, categoryId],
  );
  if (!match || !match.ok) {
    throw new Error(
      `Book ${bookId} and category ${categoryId} belong to different challenges.`,
    );
  }
  if (subcategoryId) {
    const match = await db.getFirstAsync<{ ok: number }>(
      `SELECT 1 AS ok
        FROM subcategory s
        JOIN category c ON c.id = s.category_id
      WHERE s.id = ? and c.id = ?`,
      [subcategoryId, categoryId],
    );
    if (!match || !match.ok) {
      throw new Error(
        `Subcategory ${subcategoryId} does not belong to category ${categoryId}.`,
      );
    }
    await db.runAsync(
      `INSERT INTO book_category (
        book_id,
        category_id,
        subcategory_id,
        is_assigned
      ) VALUES (
        ?,
        ?,
        ?,
        0
      ) ON CONFLICT(book_id, category_id) DO UPDATE SET subcategory_id = ?`,
      [bookId, categoryId, subcategoryId, subcategoryId],
    );
  } else {
    await db.runAsync(
      `INSERT INTO book_category (
        book_id,
        category_id,
        is_assigned
      ) VALUES (
        ?,
        ?,
        0
      ) ON CONFLICT(book_id, category_id) DO UPDATE SET subcategory_id = NULL`,
      [bookId, categoryId],
    );
  }
}

/** Remove candidacy entirely (also removes assignment implicitly — one row). */
export async function removeCandidacy(
  db: SQLiteDatabase,
  bookId: number,
  categoryId: number,
): Promise<void> {
  const result = await db.runAsync(
    `DELETE FROM book_category WHERE book_id = ? AND category_id = ?`,
    [bookId, categoryId],
  );

  if (result.changes === 0) {
    throw new Error(
      `Book ${bookId} is not a candidate for category ${categoryId}. Could not remove candidacy.`,
    );
  }
}

/** Assign a read book to a category, enforcing the challenge's
 *  max-assignments-per-book cap. Throws if the cap is hit or the
 *  book isn't a candidate. */
export async function assignBookToCategory(
  db: SQLiteDatabase,
  bookId: number,
  categoryId: number,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    // get the cap for the current challenge (parent of category)
    const cap = await db.getFirstAsync<{ max: number }>(
      `SELECT ch.max_assignments_per_book AS max
        FROM category c
        JOIN challenge ch ON ch.id = c.challenge_id
        WHERE c.id = ?`,
      [categoryId],
    );
    if (!cap) throw new Error(`Category ${categoryId} not found`);
    // cap of 0 means no limit
    if (cap.max > 0) {
      // get the number of books already assigned to this category
      const { count } = (await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count
          FROM book_category
          WHERE book_id = ? AND is_assigned = 1`,
        [bookId],
      ))!;
      // if the cap is hit, throw
      if (count >= cap.max)
        throw new Error(`Book is already assigned to ${count} categories`);
    }

    // assign book to category
    const result = await db.runAsync(
      `UPDATE book_category SET is_assigned = 1
        WHERE book_id = ? AND category_id = ?`,
      [bookId, categoryId],
    );

    if (result.changes === 0) {
      throw new Error("Book is not a candidate for this category");
    }
  });
}

/** Flip is_assigned back to 0. No invariant to check — un-assigning is always legal. */
export async function unassignBookFromCategory(
  db: SQLiteDatabase,
  bookId: number,
  categoryId: number,
): Promise<void> {
  const result = await db.runAsync(
    `UPDATE book_category SET is_assigned = 0
      WHERE book_id = ? AND category_id = ?`,
    [bookId, categoryId],
  );

  if (result.changes === 0) {
    throw new Error(`Book is not a candidate for category ${categoryId}`);
  }
}

/* ====================
 * QUERIES FOR SCREENS
 *=====================*/

/** Progress by category and overall percentage for full challenge. */
export async function getChallengeProgress(
  db: SQLiteDatabase,
  challengeId: number,
): Promise<{ categories: CategoryProgress[]; overallPercent: number }> {
  const rows = await db.getAllAsync<{
    categoryId: number;
    name: string;
    color: string;
    quota: number;
    assignedCount: number;
  }>(
    `SELECT c.id AS id,
            c.name AS name,
            c.color AS color,
            c.quota AS quota,
            COUNT(CASE WHEN bc.is_assigned = 1 AND b.read_status = ? THEN 1 END) AS assignedCount
      FROM category c
      LEFT JOIN book_category bc on bc.category_id = c.id
      LEFT JOIN book b on b.id = bc.book_id
    WHERE c.challenge_id = ?
    GROUP BY c.id
    ORDER BY c.name`,
    [ReadStatus.READ, challengeId],
  );

  const categories: CategoryProgress[] = rows.map((r) => ({
    ...r,
    isComplete: r.assignedCount >= r.quota,
  }));

  const totalQuota = categories.reduce((s, c) => s + c.quota, 0);
  const totalDone = categories.reduce(
    (s, c) => s + Math.min(c.assignedCount, c.quota),
    0,
  );

  return {
    categories,
    overallPercent:
      totalQuota === 0 ? 0 : Math.round((totalDone / totalQuota) * 100),
  };
}

export async function getAllChallengeSummaries(
  db: SQLiteDatabase,
): Promise<ChallengeSummary[]> {
  const rows = await db.getAllAsync(
    `SELECT id, name, start_date AS startDate, end_date AS endDate 
    FROM challenge 
    ORDER BY name`,
  );

  return Promise.all(
    rows.map(async (r: any) => {
      const { overallPercent } = await getChallengeProgress(db, r.id);
      return {
        ...r,
        overallPercent,
      };
    }),
  );
}

/** Books that are candidates for a category, with their subcategory label —
 *  her "which animals are on which covers" view. Pattern: two JOINs + LEFT JOIN. */
export async function getBooksForCategory(
  db: SQLiteDatabase,
  categoryId: number,
): Promise<Book[]> {
  const rows = await db.getAllAsync(
    `SELECT b.id,
            b.challenge_id AS challengeId,
            b.title,
            b.author,
            b.cover_uri AS coverUri,
            b.source,
            b.read_status AS readStatus,
    FROM book b
    INNER JOIN book_category bc ON bc.book_id = b.id AND category_id = ?
    LEFT JOIN subcategory sc ON sc.id = bc.subcategory_id
    ORDER BY b.title`,
    [categoryId],
  );

  return rows.map((r: any) => ({
    ...r,
  }));
}

export async function createCategory(
  db: SQLiteDatabase,
  challengeId: number,
  cat: CategoryNoIds,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO category (
      challenge_id,
      name,
      color,
      quota
    ) VALUES (
      ?,
      ?,
      ?,
      ?
    )`,
    [challengeId, cat.name, cat.color, cat.quota],
  );
  return result.lastInsertRowId;
}

export async function deleteCategory(
  db: SQLiteDatabase,
  categoryId: number,
): Promise<void> {
  const result = await db.runAsync(`DELETE FROM category WHERE id = ?`, [
    categoryId,
  ]);

  if (result.changes === 0) {
    throw new Error(`Category ${categoryId} not found. Could not delete.`);
  }
}

export async function updateCategory(
  db: SQLiteDatabase,
  cat: Category,
): Promise<void> {
  const result = await db.runAsync(
    `UPDATE category SET name = ?, color = ?, quota = ? WHERE id = ?`,
    [cat.name, cat.color, cat.quota, cat.id],
  );

  if (result.changes === 0) {
    throw new Error(`Category ${cat.id} not found. Could not update.`);
  }
}

/** The killer feature: unread books that are candidates for categories
 *  whose quota isn't met yet. "What should I read next?"
 *  Hint: build on the same GROUP BY shape as getChallengeProgress. */
export async function getSuggestedNextReads(
  db: SQLiteDatabase,
  challengeId: number,
): Promise<Book[]> {
  const bookRows = await db.getAllAsync(
    `SELECT DISTINCT b.id AS id,
            b.challenge_id AS challengeId,
            b.title AS title,
            b.author AS author,
            b.cover_uri AS coverUri,
            b.source AS source,
            b.read_status AS readStatus
    FROM book b
    INNER JOIN book_category bc ON bc.book_id = b.id
    INNER JOIN category c ON c.id = bc.category_id
    WHERE b.read_status = ?
    AND b.challenge_id = ?
    AND c.quota > (SELECT COUNT(*) FROM book_category bc2 WHERE bc2.category_id = c.id AND bc2.is_assigned = 1)
    ORDER BY b.title`,
    [ReadStatus.NOT_READ, challengeId],
  );

  return bookRows.map((r: any) => ({
    ...r,
  }));
}

export async function getCategoryStatusesForBook(
  db: SQLiteDatabase,
  bookId: number,
): Promise<CategoryStatusForBook[]> {
  const rows = await db.getAllAsync<any>(
    `SELECT c.id                AS categoryId,
            c.name              AS name,
            c.color             AS color,
            CASE WHEN bc.book_id IS NULL THEN 0 ELSE 1 END AS isCandidate,
            COALESCE(bc.is_assigned, 0) AS isAssigned,
            bc.subcategory_id   AS subcategoryId,
            sc.name             AS subcategoryName
       FROM book b
       JOIN category c  ON c.challenge_id = b.challenge_id
       LEFT JOIN book_category bc
              ON bc.category_id = c.id AND bc.book_id = b.id
       LEFT JOIN subcategory sc ON sc.id = bc.subcategory_id
      WHERE b.id = ?
      ORDER BY c.name`,
    [bookId],
  );

  return rows.map((r) => ({
    categoryId: r.categoryId,
    name: r.name,
    color: r.color,
    isCandidate: !!r.isCandidate, // SQLite has no booleans — 0/1 out
    isAssigned: !!r.isAssigned,
  }));
}

export async function getBookStatusesForCategory(
  db: SQLiteDatabase,
  categoryId: number,
): Promise<BookStatusForCategory[]> {
  const rows = await db.getAllAsync<any>(
    `SELECT b.id, b.title, b.author, b.cover_uri,
            CASE WHEN bc.book_id IS NULL THEN 0 ELSE 1 END AS isCandidate,
            COALESCE(bc.is_assigned, 0) AS isAssigned
        FROM category c
        JOIN book b ON b.challenge_id = c.challenge_id
        LEFT JOIN book_category bc
              ON bc.book_id = b.id AND bc.category_id = c.id
      WHERE c.id = ?
      ORDER BY b.title`,
    [categoryId],
  );

  return rows.map((r) => ({
    title: r.title,
    bookId: r.id,
    author: r.author,
    coverUri: r.coverUri,
    isCandidate: !!r.isCandidate, // SQLite has no booleans — 0/1 out
    isAssigned: !!r.isAssigned,
  }));
}
