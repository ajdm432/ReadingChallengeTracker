CREATE TABLE challenge (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    max_assignments_per_book INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE category (
    id INTEGER PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenge(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    quota INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE subcategory (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

CREATE TABLE book (
    id INTEGER PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenge(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    cover_uri TEXT,
    source TEXT,
    read_status TEXT NOT NULL DEFAULT 'to_read' CHECK (read_status IN ('to_read', 'read', 'dnf'))
);

CREATE TABLE book_category (
    book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    subcategory_id INTEGER REFERENCES subcategory(id) ON DELETE SET NULL,
    is_assigned INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (book_id, category_id)
);