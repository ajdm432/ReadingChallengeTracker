import { type SQLiteDatabase } from "expo-sqlite";
import schemaV1 from "./schema.sql";

const CURRENT_VERSION = 1;

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

  const { user_version } = (await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  ))!;

  if (user_version < 1) {
    await db.execAsync(schemaV1);
  }

  // future: if (user_version < 2) { BRING TABLE UP TO VERSION 2 }
  // Each additional version requires that handling of previous versions is above

  await db.execAsync(`PRAGMA user_version = ${CURRENT_VERSION};`);
}
