import { type SQLiteDatabase } from "expo-sqlite";
import schema from "./schema.sql";

const CURRENT_VERSION = 2;

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA foreign_keys = ON;");

  // DEV ONLY: clear the database
  // await db.execAsync(`
  //   DROP TABLE IF EXISTS book_category;
  //   DROP TABLE IF EXISTS book;
  //   DROP TABLE IF EXISTS subcategory;
  //   DROP TABLE IF EXISTS category;
  //   DROP TABLE IF EXISTS challenge;
  //   PRAGMA user_version = 0;
  // `);

  let { user_version } = (await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  ))!;

  if (user_version < 1) {
    // new user. Bring the up to current version
    await db.execAsync(schema);
    user_version = CURRENT_VERSION;
  }

  if (user_version < 2) {
    // user has out of date schema. Migrate up to v2.

    try {
      await db.withTransactionAsync(async () => {
        // remove subcategory_id column from book_category then delete subcategory table
        await db.execAsync(`
        PRAGMA foreign_keys = OFF;

        CREATE TABLE temp_book_category (
          book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
          category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
          is_assigned INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (book_id, category_id)
        );
        INSERT INTO temp_book_category SELECT book_id, category_id, is_assigned FROM book_category;
        DROP TABLE book_category;
        ALTER TABLE temp_book_category RENAME TO book_category;

        DROP TABLE subcategory;
      `);

        // add "notes" column to category table
        await db.execAsync(`
        ALTER TABLE category ADD COLUMN notes TEXT DEFAULT NULL;
      `);

        const results = await db.getAllAsync(`
        PRAGMA foreign_key_check;
      `);
        if (results.length > 0) {
          throw new Error(
            `FK violations after migration: ${JSON.stringify(results)}`,
          );
        }
      });
    } finally {
      await db.execAsync(`PRAGMA foreign_keys = ON;`);
    }

    user_version = 2;
  }

  // future: if (user_version < 3) { BRING TABLE UP TO VERSION 3 }
  // Each additional version requires that handling of previous versions is above

  await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION};`);
}
