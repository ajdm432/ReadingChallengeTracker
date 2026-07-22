export type BookSearchResult = {
  title: string;
  author: string | null;
  coverUri: string | null;
  source: string | null;
};

type OLDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

const BASE = "https://openlibrary.org";
const FIELDS = "key,title,author_name,cover_i,first_publish_year";

export async function searchBooks(
  query: { title?: string; author?: string },
  limit = 10,
  signal?: AbortSignal,
): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    fields: FIELDS,
    limit: String(limit),
  });
  if (!query.title && !query.author) return [];
  if (query.title) params.set("title", query.title);
  if (query.author) params.set("author", query.author);

  const result = await fetch(`${BASE}/search.json?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ajdm432-reading-challenge-tracker",
    },
    signal,
  });
  if (!result.ok)
    throw new Error(`Open Library search failed: ${result.status}`);

  const data: { docs: OLDoc[] } = await result.json();
  return data.docs.map((d) => ({
    title: d.title,
    author: d.author_name?.[0] ?? null,
    coverUri: d.cover_i
      ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
      : null,
    source: `${BASE}/${d.key}`,
  }));
}

export async function getBook(
  title?: string,
  author?: string,
  signal?: AbortSignal,
): Promise<BookSearchResult> {
  const params = new URLSearchParams({ fields: FIELDS });
  if (!title && !author) throw new Error("Missing title or author");
  if (title) params.set("title", title);
  if (author) params.set("author", author);

  const book = await searchBooks({ title, author }, 1, signal);
  if (book.length === 0) throw new Error("Book not found");
  return book[0];
}
