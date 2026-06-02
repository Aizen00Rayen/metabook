# Metabook

Premium multi-vendor digital book marketplace. **Firebase has been fully removed** and replaced
with a self-hosted Node.js backend backed by a local SQLite database.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** Node.js + Express (`server/`)
- **Database:** SQLite via `better-sqlite3` — file stored at `server/metabook.db`
- **Auth:** Email/password with bcrypt-hashed passwords and JWT tokens

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```
2. Start the backend **and** frontend together:
   ```
   npm start
   ```
   - Web app: http://localhost:3000
   - API server: http://localhost:4000 (proxied under `/api` by Vite)

   Or run them separately:
   ```
   npm run server   # Express API on :4000
   npm run dev      # Vite dev server on :3000
   ```

## Permanent Administrator

A permanent admin account is created automatically on first launch and re-verified on every
server start:

- **Email:** `admin@metabook-dz.com`
- **Password:** `adminmetabook-dz2026`

Log in via the secure admin portal at `/admin/login`.

## Database

The SQLite file `server/metabook.db` is created and seeded automatically on first run
(sample stores, books, news, and demo users). Delete the file to reset to a clean seeded state.

Seed/sample logic lives in `server/seed.js`; schema and the admin bootstrap live in `server/db.js`.
