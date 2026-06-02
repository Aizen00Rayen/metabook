import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, rowToUserProfile, rowToBook, rowToStore, ADMIN_EMAIL } from './db.js';

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'metabook-dz-secret-key-change-me';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); // large limit for base64 cover/banner uploads

// ---------- Auth helpers ----------
function signToken(user) {
  return jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}
app.use(authMiddleware);

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator privileges required' });
  }
  next();
}

// ---------- Auth routes ----------
app.post('/api/auth/register', (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const normEmail = String(email).trim().toLowerCase();
  if (normEmail === ADMIN_EMAIL) {
    return res.status(403).json({ error: 'This email is reserved for the platform administrator' });
  }

  const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(normEmail);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const actualRole = role === 'partner' ? 'partner' : 'reader';
  const approved = actualRole === 'partner' ? 0 : 1;
  const uid = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO users (uid, email, password, role, approved, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(uid, normEmail, bcrypt.hashSync(password, 10), actualRole, approved, createdAt);

  const profile = rowToUserProfile(db.prepare('SELECT * FROM users WHERE uid = ?').get(uid));
  res.json({ token: signToken(profile), profile });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const normEmail = String(email).trim().toLowerCase();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(normEmail);
  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const profile = rowToUserProfile(row);
  res.json({ token: signToken(profile), profile });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE uid = ?').get(req.user.uid);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ profile: rowToUserProfile(row) });
});

app.patch('/api/auth/role', requireAuth, (req, res) => {
  const { role } = req.body || {};
  const newRole = role === 'partner' ? 'partner' : 'reader';
  const row = db.prepare('SELECT * FROM users WHERE uid = ?').get(req.user.uid);
  if (!row) return res.status(404).json({ error: 'User not found' });
  if (row.role === 'admin') return res.status(403).json({ error: 'Administrator role cannot be changed' });
  const approved = newRole === 'partner' ? 0 : 1;
  db.prepare('UPDATE users SET role = ?, approved = ? WHERE uid = ?').run(newRole, approved, req.user.uid);
  res.json({ profile: rowToUserProfile(db.prepare('SELECT * FROM users WHERE uid = ?').get(req.user.uid)) });
});

// ---------- Users (admin) ----------
app.get('/api/users', requireAuth, requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM users WHERE email != ? ORDER BY createdAt').all(ADMIN_EMAIL);
  res.json(rows.map(rowToUserProfile));
});

app.patch('/api/users/:uid/approve', requireAuth, requireAdmin, (req, res) => {
  const approved = req.body?.approved ? 1 : 0;
  db.prepare('UPDATE users SET approved = ? WHERE uid = ?').run(approved, req.params.uid);
  res.json({ ok: true });
});

app.delete('/api/users/:uid', requireAuth, requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE uid = ?').get(req.params.uid);
  if (row && row.email === ADMIN_EMAIL) {
    return res.status(403).json({ error: 'The administrator account cannot be deleted' });
  }
  // Cascade: remove the partner's boutiques (and their books) along with the account.
  const stores = db.prepare('SELECT id FROM stores WHERE ownerUid = ?').all(req.params.uid);
  for (const s of stores) {
    db.prepare('DELETE FROM books WHERE storeId = ?').run(s.id);
    db.prepare('DELETE FROM stores WHERE id = ?').run(s.id);
  }
  db.prepare('DELETE FROM favorites WHERE userId = ?').run(req.params.uid);
  db.prepare('DELETE FROM users WHERE uid = ?').run(req.params.uid);
  res.json({ ok: true });
});

// ---------- Books ----------
app.get('/api/books', (_req, res) => {
  res.json(db.prepare('SELECT * FROM books').all().map(rowToBook));
});

app.post('/api/books', requireAuth, (req, res) => {
  const b = req.body || {};
  const id = b.id || `book_${Date.now()}`;
  db.prepare(
    `INSERT OR REPLACE INTO books (id, title, author, price, coverImage, storeId, isOriginal, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, b.title, b.author, Number(b.price) || 0, b.coverImage, b.storeId, b.isOriginal ? 1 : 0, b.featured ? 1 : 0);
  res.json(rowToBook(db.prepare('SELECT * FROM books WHERE id = ?').get(id)));
});

app.put('/api/books/:id', requireAuth, (req, res) => {
  const b = req.body || {};
  const id = req.params.id;
  db.prepare(
    `INSERT OR REPLACE INTO books (id, title, author, price, coverImage, storeId, isOriginal, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, b.title, b.author, Number(b.price) || 0, b.coverImage, b.storeId, b.isOriginal ? 1 : 0, b.featured ? 1 : 0);
  res.json(rowToBook(db.prepare('SELECT * FROM books WHERE id = ?').get(id)));
});

app.delete('/api/books/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- Stores ----------
app.get('/api/stores', (_req, res) => {
  res.json(db.prepare('SELECT * FROM stores').all().map(rowToStore));
});

app.post('/api/stores', requireAuth, (req, res) => {
  const s = req.body || {};
  const id = s.id || `store_${req.user.uid}`;
  const ownerUid = s.ownerUid || req.user.uid;
  db.prepare(
    `INSERT OR REPLACE INTO stores (id, ownerUid, name, description, bannerImage)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, ownerUid, s.name, s.description, s.bannerImage);
  res.json(rowToStore(db.prepare('SELECT * FROM stores WHERE id = ?').get(id)));
});

app.put('/api/stores/:id', requireAuth, (req, res) => {
  const s = req.body || {};
  const id = req.params.id;
  const existing = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
  const ownerUid = s.ownerUid || existing?.ownerUid || req.user.uid;
  db.prepare(
    `INSERT OR REPLACE INTO stores (id, ownerUid, name, description, bannerImage)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, ownerUid, s.name, s.description, s.bannerImage);
  res.json(rowToStore(db.prepare('SELECT * FROM stores WHERE id = ?').get(id)));
});

app.delete('/api/stores/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
  if (!store) return res.status(404).json({ error: 'Boutique not found' });
  // Only an admin or the boutique owner may remove it.
  if (req.user.role !== 'admin' && store.ownerUid !== req.user.uid) {
    return res.status(403).json({ error: 'Not authorized to remove this boutique' });
  }
  db.prepare('DELETE FROM books WHERE storeId = ?').run(id);
  db.prepare('DELETE FROM stores WHERE id = ?').run(id);
  res.json({ ok: true });
});

// ---------- Orders ----------
app.get('/api/orders', requireAuth, (req, res) => {
  const rows = req.user.role === 'admin'
    ? db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all()
    : db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(req.user.uid);
  res.json(rows);
});

app.post('/api/orders', requireAuth, (req, res) => {
  const o = req.body || {};
  const id = o.id || `order_${Date.now()}`;
  db.prepare(
    `INSERT INTO orders (id, userId, userEmail, bookId, bookTitle, bookAuthor, bookPrice, coverImage, storeId, createdAt, fullName, phone, wilayaId, wilayaName, commune, deliveryType, fullAddress, shippingFee, status)
     VALUES (@id, @userId, @userEmail, @bookId, @bookTitle, @bookAuthor, @bookPrice, @coverImage, @storeId, @createdAt, @fullName, @phone, @wilayaId, @wilayaName, @commune, @deliveryType, @fullAddress, @shippingFee, 'pending')`
  ).run({
    id,
    userId: req.user.uid,
    userEmail: o.userEmail || req.user.email,
    bookId: o.bookId,
    bookTitle: o.bookTitle,
    bookAuthor: o.bookAuthor,
    bookPrice: o.bookPrice,
    coverImage: o.coverImage,
    storeId: o.storeId,
    createdAt: o.createdAt || new Date().toISOString(),
    fullName: o.fullName ?? null,
    phone: o.phone ?? null,
    wilayaId: o.wilayaId ?? null,
    wilayaName: o.wilayaName ?? null,
    commune: o.commune ?? null,
    deliveryType: o.deliveryType ?? null,
    fullAddress: o.fullAddress ?? null,
    shippingFee: o.shippingFee ?? null,
  });
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
});

// Admin: update order status + optional note
app.patch('/api/orders/:id/status', requireAuth, requireAdmin, (req, res) => {
  const { status, adminNote } = req.body || {};
  const allowed = ['pending','confirmed','processing','shipped','delivered','on_hold','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE orders SET status = ?, adminNote = ? WHERE id = ?')
    .run(status, adminNote ?? null, req.params.id);
  res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
});

// ---------- Favorites ----------
app.get('/api/favorites', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM favorites WHERE userId = ?').all(req.user.uid));
});

app.post('/api/favorites/toggle', requireAuth, (req, res) => {
  const { bookId } = req.body || {};
  if (!bookId) return res.status(400).json({ error: 'bookId is required' });
  const id = `${req.user.uid}_${bookId}`;
  const existing = db.prepare('SELECT 1 FROM favorites WHERE id = ?').get(id);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run(id);
    return res.json({ favorited: false });
  }
  db.prepare('INSERT INTO favorites (id, userId, bookId, createdAt) VALUES (?, ?, ?, ?)')
    .run(id, req.user.uid, bookId, new Date().toISOString());
  res.json({ favorited: true });
});

// ---------- News ----------
app.get('/api/news', (_req, res) => {
  res.json(db.prepare('SELECT * FROM news ORDER BY createdAt DESC').all());
});

app.post('/api/news', requireAuth, requireAdmin, (req, res) => {
  const n = req.body || {};
  const id = `news_${Date.now()}`;
  db.prepare(
    `INSERT INTO news (id, title, content, category, createdAt, authorName)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, n.title, n.content, n.category || 'general', new Date().toISOString(),
    n.authorName || (req.user.email ? req.user.email.split('@')[0] : 'Admin'));
  res.json(db.prepare('SELECT * FROM news WHERE id = ?').get(id));
});

app.delete('/api/news/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- Print Requests ----------
app.get('/api/print-requests', requireAuth, (req, res) => {
  const rows = req.user.role === 'admin'
    ? db.prepare('SELECT * FROM print_requests ORDER BY createdAt DESC').all()
    : db.prepare('SELECT * FROM print_requests WHERE userId = ? ORDER BY createdAt DESC').all(req.user.uid);
  // strip file data from list view to keep payload small
  res.json(rows.map(r => ({ ...r, fileData: r.fileData ? '[attached]' : null })));
});

app.post('/api/print-requests', requireAuth, (req, res) => {
  const p = req.body || {};
  const id = `print_${Date.now()}`;
  db.prepare(
    `INSERT INTO print_requests
       (id, userId, userEmail, fullName, phone, wilayaId, wilayaName, commune, fullAddress,
        fileData, fileName, pageCount, copies, coverType, paperSize, colorMode, bindingType, notes, status, createdAt)
     VALUES (@id,@userId,@userEmail,@fullName,@phone,@wilayaId,@wilayaName,@commune,@fullAddress,
             @fileData,@fileName,@pageCount,@copies,@coverType,@paperSize,@colorMode,@bindingType,@notes,'pending',@createdAt)`
  ).run({
    id,
    userId: req.user.uid,
    userEmail: req.user.email,
    fullName: p.fullName,
    phone: p.phone,
    wilayaId: p.wilayaId ?? null,
    wilayaName: p.wilayaName ?? null,
    commune: p.commune ?? null,
    fullAddress: p.fullAddress ?? null,
    fileData: p.fileData ?? null,
    fileName: p.fileName ?? null,
    pageCount: p.pageCount ?? null,
    copies: p.copies ?? 1,
    coverType: p.coverType ?? 'soft',
    paperSize: p.paperSize ?? 'A4',
    colorMode: p.colorMode ?? 'bw',
    bindingType: p.bindingType ?? 'glue',
    notes: p.notes ?? null,
    createdAt: new Date().toISOString(),
  });
  const row = db.prepare('SELECT * FROM print_requests WHERE id = ?').get(id);
  res.json({ ...row, fileData: row.fileData ? '[attached]' : null });
});

app.patch('/api/print-requests/:id/status', requireAuth, requireAdmin, (req, res) => {
  const { status, adminNote } = req.body || {};
  const allowed = ['pending','reviewing','printing','shipped','delivered','on_hold','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE print_requests SET status = ?, adminNote = ? WHERE id = ?')
    .run(status, adminNote ?? null, req.params.id);
  const row = db.prepare('SELECT * FROM print_requests WHERE id = ?').get(req.params.id);
  res.json({ ...row, fileData: row.fileData ? '[attached]' : null });
});

// Admin: fetch the actual file of a print request
app.get('/api/print-requests/:id/file', requireAuth, requireAdmin, (req, res) => {
  const row = db.prepare('SELECT fileData, fileName FROM print_requests WHERE id = ?').get(req.params.id);
  if (!row || !row.fileData) return res.status(404).json({ error: 'No file attached' });
  res.json({ fileData: row.fileData, fileName: row.fileName });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Metabook API running on http://localhost:${PORT}`);
});
