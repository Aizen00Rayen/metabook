import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_STORES, SEED_BOOKS, SEED_NEWS } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'metabook.db');

// Permanent administrator account.
export const ADMIN_EMAIL = 'admin@metabook-dz.com';
const ADMIN_PASSWORD = 'adminmetabook-dz2026';

export const db = new Database(DB_PATH);
// Durable rollback journal: every committed transaction is flushed to the main
// database file immediately, so data survives abrupt shutdowns.
db.pragma('journal_mode = DELETE');
db.pragma('synchronous = FULL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'reader',
    approved INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    ownerUid TEXT,
    name TEXT NOT NULL,
    description TEXT,
    bannerImage TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    price REAL NOT NULL DEFAULT 0,
    coverImage TEXT,
    storeId TEXT,
    isOriginal INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userEmail TEXT,
    bookId TEXT,
    bookTitle TEXT,
    bookAuthor TEXT,
    bookPrice REAL,
    coverImage TEXT,
    storeId TEXT,
    createdAt TEXT,
    fullName TEXT,
    phone TEXT,
    wilayaId INTEGER,
    wilayaName TEXT,
    commune TEXT,
    deliveryType TEXT,
    fullAddress TEXT,
    shippingFee REAL,
    status TEXT NOT NULL DEFAULT 'pending',
    adminNote TEXT
  );

  CREATE TABLE IF NOT EXISTS print_requests (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userEmail TEXT,
    fullName TEXT NOT NULL,
    phone TEXT NOT NULL,
    wilayaId INTEGER,
    wilayaName TEXT,
    commune TEXT,
    fullAddress TEXT,
    fileData TEXT,
    fileName TEXT,
    pageCount INTEGER,
    copies INTEGER NOT NULL DEFAULT 1,
    coverType TEXT NOT NULL DEFAULT 'soft',
    paperSize TEXT NOT NULL DEFAULT 'A4',
    colorMode TEXT NOT NULL DEFAULT 'bw',
    bindingType TEXT NOT NULL DEFAULT 'glue',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    adminNote TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    bookId TEXT NOT NULL,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    createdAt TEXT,
    authorName TEXT
  );
`);

// ---- Helpers to map rows <-> API shapes ----
export function rowToUserProfile(row) {
  if (!row) return null;
  return {
    uid: row.uid,
    email: row.email,
    role: row.role,
    approved: !!row.approved,
    createdAt: row.createdAt,
  };
}

export function rowToBook(row) {
  return { ...row, isOriginal: !!row.isOriginal, featured: !!row.featured };
}

// ---- Lightweight migrations for databases created before a column existed ----
function migrate() {
  const bookCols = db.prepare('PRAGMA table_info(books)').all();
  if (!bookCols.some((c) => c.name === 'featured')) {
    db.exec('ALTER TABLE books ADD COLUMN featured INTEGER NOT NULL DEFAULT 0');
    db.prepare("UPDATE books SET featured = 1 WHERE id = 'book_Sphinx'").run();
  }
  const orderCols = db.prepare('PRAGMA table_info(orders)').all();
  if (!orderCols.some((c) => c.name === 'status')) {
    db.exec("ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'");
  }
  if (!orderCols.some((c) => c.name === 'adminNote')) {
    db.exec('ALTER TABLE orders ADD COLUMN adminNote TEXT');
  }
}
migrate();

export function rowToStore(row) {
  return { ...row };
}

// ---- Idempotent, per-table seeding ----
// Each table is seeded only when empty, so the catalogue self-heals on restart
// while never clobbering data the admin or partners have created.
function isEmpty(table) {
  return db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c === 0;
}

function seedDatabase() {
  if (isEmpty('stores')) {
    const insertStore = db.prepare(
      `INSERT OR IGNORE INTO stores (id, ownerUid, name, description, bannerImage)
       VALUES (@id, @ownerUid, @name, @description, @bannerImage)`
    );
    for (const s of SEED_STORES) insertStore.run(s);
  }

  if (isEmpty('books')) {
    const insertBook = db.prepare(
      `INSERT OR IGNORE INTO books (id, title, author, price, coverImage, storeId, isOriginal, featured)
       VALUES (@id, @title, @author, @price, @coverImage, @storeId, @isOriginal, @featured)`
    );
    for (const b of SEED_BOOKS) {
      insertBook.run({ ...b, isOriginal: b.isOriginal ? 1 : 0, featured: b.featured ? 1 : 0 });
    }
  }

  if (isEmpty('news')) {
    const insertNews = db.prepare(
      `INSERT OR IGNORE INTO news (id, title, content, category, createdAt, authorName)
       VALUES (@id, @title, @content, @category, @createdAt, @authorName)`
    );
    for (const n of SEED_NEWS) insertNews.run(n);
  }

  // No demo user seeding — real accounts are created through registration only.
}

// Always ensure the permanent admin exists and has the correct credentials/role.
export function ensureAdmin() {
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL);
  const hashed = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  if (existing) {
    db.prepare('UPDATE users SET password = ?, role = ?, approved = 1 WHERE email = ?')
      .run(hashed, 'admin', ADMIN_EMAIL);
  } else {
    db.prepare(
      `INSERT INTO users (uid, email, password, role, approved, createdAt)
       VALUES (?, ?, ?, 'admin', 1, ?)`
    ).run('admin_metabook', ADMIN_EMAIL, hashed, new Date().toISOString());
  }
}

// Per-table seeding (only fills empty tables) + the permanent admin on every boot.
seedDatabase();
ensureAdmin();
