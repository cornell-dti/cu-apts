# backend/AGENTS.md

This file covers the Express + Firestore API server. Read the [root AGENTS.md](../AGENTS.md) first
for monorepo commands, env files, branches, and the shared data and auth model.

## Layout

```
src/
  server.ts            # entry: listens on $PORT (default 8080), serves ../frontend/build as SPA fallback
  app.ts               # the whole API: every route, collection handle, and helper (~3,200 lines)
  auth.ts              # `authenticate` middleware: Bearer Firebase ID token + @cornell.edu check → req.user
  authAdmin.ts         # `authenticateAdmin` middleware + `isAdminEmail()` (hardcoded list OR adminWhitelist)
  firebase-config/     # firebase-admin init from env (db, auth, FieldValue, FieldPath); Faq types
  data/*.json          # seed data used by scripts/
  server.test.ts       # jest + supertest + @firebase/testing
scripts/               # one-off data migration / import / export scripts (ts-node)
@types/express/        # augments Express.Request with `user?: DecodedIdToken`
firebase/              # separate firebase.json / rules copy (not the deployed rules, see root)
```

`app.ts` exports the `app` without calling `listen`, so tests can import it. `server.ts` adds the
listener and the static and catch-all routes. Register new routes in `app.ts`, not after the `*`
catch-all in `server.ts`.

## Commands

```sh
yarn workspace backend dev        # ts-node src/server.ts with ../.env.dev
yarn workspace backend lint       # eslint (airbnb + @typescript-eslint + prettier)
yarn workspace backend tsc        # typecheck / build to dist/
yarn workspace backend test       # firebase emulators:exec --only firestore "./test.sh"
npx jest scripts/scripts.test.ts --forceExit   # pure-function tests for scripts, no emulator needed
```

`yarn test` needs the Firebase CLI (`firebase-tools`) installed globally. It isn't a dependency of
this repo. Prod runs the compiled output with `node dist/backend/src/server.js`. The nested path is
there because `rootDirs` includes `../common`.

## Writing routes

Follow the existing route shape:

```ts
/**
 * Short Title – One-line summary.
 *
 * @remarks
 * What it does and any side effects.
 *
 * @route POST /api/thing/:id
 *
 * @input {string} req.params.id – ...
 *
 * @status
 * - 200: ...
 * - 403: ...
 */
app.post('/api/thing/:id', authenticate, async (req, res) => {
  try {
    if (!req.user) throw new Error('Not authenticated');
    // ...
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error doing thing');
  }
});
```

- All routes are under `/api/`. The frontend proxies `/api` to `:8080` in dev.
- Use the collection constants at the top of `app.ts` (`reviewCollection`, `buildingsCollection`
  for apartments, `landlordCollection`, `folderCollection`, ...) instead of new `db.collection()`
  calls.
- Type request bodies and responses with `@common/types/db-types`. When you read documents, convert
  Firestore `Timestamp` fields back to `Date` (`data.date.toDate()`) and attach `id: doc.id`,
  producing the `*WithId` types.
- `return` after every `res.send`/`res.json`. Some older handlers (e.g. `/api/new-review`) don't,
  so don't copy that pattern.
- Older handlers return `401` for general errors. New code should use accurate status codes
  (400 bad input, 401 unauthenticated, 403 not allowed, 404 missing, 500 server error).
- Keep secrets in env vars (`process.env.*`), never inline.

## Auth and admin checks

- `authenticate` for any route that acts as, or reads data for, the signed-in user. It sets
  `req.user` (a `DecodedIdToken` with `uid` and `email`).
- For admin-only routes, use **`authenticateAdmin`** from `authAdmin.ts`. It accepts both hardcoded
  superadmins and Firestore `adminWhitelist` entries.
- Many older admin routes (`update-review-status`, `admin/update-apartment`, `admin/add-apartment`,
  `admin/migrate-all-apartments-schema`, blog-post routes) instead use `authenticate` plus
  `admins.includes(email)`. That check ignores `adminWhitelist`, so whitelisted admins get a 403
  there. Don't add more of these. Migrate a route only when your task calls for it.
- `admins` is imported from `../../frontend/src/constants/HomeConsts`. The backend depends on this
  frontend file, so moving or renaming it breaks the backend build.
- Scope user-owned data (folders, likes, saved items) to `req.user.uid`, and check ownership before
  you update or delete anything.

## Search cache

`/api/search`, `/api/search-results`, and `/api/search-with-query-and-filters` read landlords and
apartments from **in-memory** state (`req.app.get('apts')`, `req.app.get('landlords')`). The
frontend fills that state by calling `POST /api/set-data` when the app loads. After you add or change
apartments or landlords, search results stay stale until `set-data` runs again. Search uses
`fuse.js` fuzzy matching.

## External services

- **Google Maps** (`REACT_APP_MAPS_API_KEY`): the travel-time routes
  (`/api/calculate-travel-times`, `/api/batch-create-travel-times`, ...) call the Distance Matrix
  API, and adding an apartment calls the Geocoding API. Both cost money per request, so don't
  trigger them in bulk casually.
- **Email**: `nodemailer` over Gmail (`CUAPTS_EMAIL`, `CUAPTS_EMAIL_APP_PASSWORD`) for landlord
  messaging and for review-status notification emails inside `update-review-status`.

## Scripts (`scripts/`)

These are one-off data jobs run with `ts-node`, usually via `yarn workspace backend <name>`. Several
(`export_apartments`, `update_apartments`, `init_blogposts`) load **`../.env.prod` and write to
production Firestore**. Don't run a script unless the user explicitly asks, and read it first. When
you write a new script:

- Import `db` from `../src/firebase-config`.
- Keep pure helpers (parsing, formatting) exported and separate from Firestore I/O, so they can be
  unit-tested in `scripts.test.ts` with `firebase-config` mocked.
- Make it idempotent or dry-run-able where you can, and document usage in a header comment.

## Tests

- `src/server.test.ts` uses `@firebase/testing` against the Firestore emulator (project id
  `cuapts-68201`) and `supertest` against the exported `app`. Coverage is thin, so add a test when
  you add non-trivial logic.
- `scripts/scripts.test.ts` covers the CSV helpers without Firebase.
