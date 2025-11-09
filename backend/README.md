# Backend — SQLite persistence & migration

This document explains how to enable SQLite-backed persistence for the backend and how to seed/export the DB using the included migration utility.

## Overview

The backend ships with two storage implementations:

- In-memory (default) — used in development and by tests. No on-disk DB is created.
- SQLite (optional) — uses `better-sqlite3` and stores data in `data/app.db` by default.

To switch to SQLite-based persistence set the environment variable `USE_SQLITE=1` when starting the server.

## DB path

By default the SQLite DB path is:

data/app.db

You can override it using `SQLITE_DB_PATH`.

## Migration utility

A small migration/seed/export utility is provided at `backend/scripts/migrate_to_sqlite.js`.

It supports:

- Seeding the DB from a JSON file: `--seed=path/to/seed.json`
- Exporting the DB contents to JSON: `--export=path/to/export.json`

## Examples

Run the migration script directly (recommended when doing a local demo):

```zsh
# Seed the DB from the included example
USE_SQLITE=1 node backend/scripts/migrate_to_sqlite.js --seed=backend/scripts/seed.example.json

# Export the DB to a file
USE_SQLITE=1 node backend/scripts/migrate_to_sqlite.js --export=backend/scripts/export.json
```

Or via npm script from the backend directory:

```zsh
cd backend
# pass args after `--`
USE_SQLITE=1 npm run migrate -- --seed=./scripts/seed.example.json
```

## Starting the backend with SQLite enabled

When `USE_SQLITE=1` the backend will use the SQLite implementations for posts and layout services.

```zsh
# start the backend with SQLite persistence
USE_SQLITE=1 node backend/src/index.js
```

## Seed file format

The seed file is a JSON object with two top-level keys: `posts` (array) and `layouts` (object keyed by space).

Simplified example:

```json
{
  "posts": [
    {
      "id": "id-example-1",
      "content_text": "Hello world from seed",
      "status": "DRAFT",
      "created_at": "2025-11-08T00:00:00.000Z",
      "updated_at": "2025-11-08T00:00:00.000Z"
    }
  ],
  "layouts": {
    "default": [
      { "id": "tile-1", "order": 0 },
      { "id": "tile-2", "order": 1 }
    ]
  }
}
```

## Notes

- Tests and local development use the in-memory stores by default. Do not enable `USE_SQLITE` in CI unless you intend to run the migration first and isolate DB files per job.
- The migration script will create the `data/` directory if missing.
- For containers or demo deployments, mount a volume to persist `data/app.db` across restarts.

## Recommended Node version

Building native modules like `better-sqlite3` can require a modern C++ toolchain (C++20) that isn't available in all environments — especially when running Node 24 on macOS ARM. To avoid native build issues we recommend using Node 20 for local development and demos. A `.nvmrc` file is included at the repo root with the recommended version.

Quick setup using nvm (zsh):

```zsh
# install nvm if you don't have it (follow instructions at https://github.com/nvm-sh/nvm)
# then from repo root:
nvm install 20
nvm use 20
cd backend
rm -rf node_modules package-lock.json
npm install
```

If you prefer to keep Node 24, you will need a C++ toolchain that supports C++20 (Xcode 15 / Command Line Tools with an appropriate clang). Installing full Xcode from the App Store and accepting the license typically resolves the `xcodebuild` errors:

```zsh
# Install Xcode from the App Store, then:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
cd backend
rm -rf node_modules package-lock.json
npm install
```

Either approach will allow `better-sqlite3` to be installed (or let `npm` fall back to optional if not available). If you just want to run tests without native modules, the repo already treats `better-sqlite3` as optional and falls back to in-memory stores.

## File-backed persistence (simple demo mode)

If you'd like to avoid native modules entirely, there's a simple file-backed persistence option. It stores posts and layouts as JSON under `data/`.

To enable file-backed demo persistence set:

```zsh
USE_FILE_DB=1 node backend/src/index.js
```

This is suitable for demos and local persistence without installing native dependencies. The data files are:

- `data/posts.json` — posts keyed by id
- `data/layouts.json` — layout arrays per space

The server will still support the SQLite path if you explicitly enable `USE_SQLITE=1` and have `better-sqlite3` installed.

If you want, I can add a small smoke-test that starts the server with `USE_SQLITE=1`, runs the migration, and verifies persistence — would you like that next?
