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

export enum BookSearchErrorKind {
  TIMEOUT = "timeout",
  NETWORK = "network",
  UNAVAILABLE = "unavailable",
  BAD_REQUEST = "bad-request",
  MALFORMED = "malformed",
}

export type BookSearchError =
  | { kind: BookSearchErrorKind.TIMEOUT }
  | { kind: BookSearchErrorKind.NETWORK }
  | { kind: BookSearchErrorKind.UNAVAILABLE }
  | { kind: BookSearchErrorKind.BAD_REQUEST }
  | { kind: BookSearchErrorKind.MALFORMED };

export class BookSearchFailure extends Error {
  constructor(readonly info: BookSearchError) {
    super(`Book search failed: ${info.kind}`);
  }
}

type Timed = {
  signal: AbortSignal;
  cleanup: () => void;
  timedOut: () => boolean;
};

function withTimeout(ms: number, external?: AbortSignal): Timed {
  const controller = new AbortController();
  let didTimeOut = false;

  const timer = setTimeout(() => {
    didTimeOut = true;
    controller.abort();
  }, ms);

  const onExternalAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", onExternalAbort);
  }

  return {
    signal: controller.signal,
    timedOut: () => didTimeOut,
    cleanup: () => {
      clearTimeout(timer);
      external?.removeEventListener("abort", onExternalAbort);
    },
  };
}

const BASE = "https://openlibrary.org";
const FIELDS = "key,title,author_name,cover_i,first_publish_year";
const TIMEOUT_MS = 8000;

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

  const t = withTimeout(TIMEOUT_MS, signal);
  let result: Response;
  try {
    result = await fetch(`${BASE}/search.json?${params}`, {
      signal: t.signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    if (t.timedOut())
      throw new BookSearchFailure({ kind: BookSearchErrorKind.TIMEOUT });
    throw new BookSearchFailure({ kind: BookSearchErrorKind.NETWORK });
  }

  if (!result.ok)
    throw new BookSearchFailure(
      result.status >= 500 || result.status === 429
        ? { kind: BookSearchErrorKind.UNAVAILABLE }
        : { kind: BookSearchErrorKind.BAD_REQUEST },
    );

  let data: { docs: OLDoc[] };
  try {
    data = await result.json();
  } catch {
    throw new BookSearchFailure({ kind: BookSearchErrorKind.MALFORMED });
  }
  if (!Array.isArray(data.docs))
    throw new BookSearchFailure({ kind: BookSearchErrorKind.MALFORMED });

  return data.docs.map((d) => ({
    title: d.title,
    author: d.author_name?.[0] ?? null,
    coverUri: d.cover_i
      ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
      : null,
    source: `${BASE}/${d.key}`,
  }));
}
