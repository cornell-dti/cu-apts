# AGENTS.md

Guidance for AI coding agents working in the CU Apartments (CUApts) repo. CUApts is a Cornell DTI
project where the Cornell community reviews apartments and landlords around Ithaca.

See also: [frontend/AGENTS.md](frontend/AGENTS.md) and [backend/AGENTS.md](backend/AGENTS.md).

## Repo layout

Yarn v1 workspaces monorepo (Node **18.x**, pinned in `engines`).

| Path                                                | What it is                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `frontend/`                                         | React 17 + TypeScript app (Create React App 4, Material-UI v4)                        |
| `backend/`                                          | Express + TypeScript API server backed by Firestore (`firebase-admin`)                |
| `common/`                                           | Shared code, **not** a workspace: `types/db-types.ts` (Firestore shapes), `constants/` |
| `firebase.json`, `firestore.rules`, `firestore.indexes.json` | Firebase Hosting, security rules, and emulator config                        |
| `Procfile`                                          | Heroku entry point (`yarn workspace backend start`)                                   |
| `.github/workflows/`                                | CI, branch policy, and Firebase Hosting deploys                                       |

`common/` is imported as `@common/...` in the backend (tsconfig path alias) but by **relative path**
in the frontend (`../../../common/types/db-types`), because CRA doesn't support path aliases.

## Commands (run from repo root)

```sh
yarn install          # installs all workspaces; frontend postinstall applies patch-package
yarn start            # frontend (:3000) + backend (:8080) in parallel, using .env.dev
yarn frontend-dev     # frontend only
yarn backend-dev      # backend only
yarn lint             # eslint in every workspace
yarn lint:fix
yarn format           # prettier --write
yarn format:check
yarn tsc --noEmit     # typecheck every workspace
yarn test             # backend tests only (needs Firebase CLI + Firestore emulator, see backend/AGENTS.md)
```

The frontend dev server proxies `/api/*` to `http://localhost:8080`, so both halves must be running
for most pages to work.

## Before you call a change done

CI (`.github/workflows/ci.yml`) runs on every push, in this order:

1. `yarn format:check`
2. `yarn lint`
3. `yarn tsc --noEmit`

Run the same three locally. The husky pre-commit hook runs `lint-staged` (prettier + eslint --fix)
and `yarn tsc --noEmit`.

## Code style

- Prettier: 100-char lines, single quotes, `es5` trailing commas, LF endings.
- TypeScript `strict` in both workspaces.
- Match the surrounding file. Existing backend routes and frontend utils carry JSDoc blocks with
  `@remarks`, `@param`, `@route`, `@status`, so write the same kind of block for new ones.

## Environment and secrets

- `.env.dev` and `.env.prod` live at the **repo root** and are gitignored. Scripts load them with
  `env-cmd -f ../.env.dev`. Both workspaces read the same file, which is why backend variables also
  carry the `REACT_APP_` prefix (e.g. `REACT_APP_FIREBASE_PRIVATE_KEY`, `REACT_APP_PROJECT_ID`).
- Never commit, print, or copy values from these files into code, logs, or PR text.
- `yarn *-prod` scripts and several backend scripts point at the **production** Firestore. Don't run
  them unless the user explicitly asks.

## Data model

Firestore is the only datastore. Shared shapes live in `common/types/db-types.ts`. The main
collections are `buildings` (type `Apartment`), `landlords`, `reviews`, `likes`, `users`, `folders`,
`blogposts`, `pendingBuildings`, `contactQuestions`, `travelTimes`, `faqs`, and `adminWhitelist`.

- A `Review` has a `status` lifecycle (`PENDING` → `APPROVED` / `DECLINED` / `DELETED` /
  `REPORTED`). New reviews start as `PENDING`, and admins moderate them. Public pages request
  `APPROVED` explicitly (e.g. `/api/review/aptId/:id/APPROVED`). The server does not filter
  unapproved reviews on its own.
- Apartment pricing is stored in `roomTypes: RoomType[]`, not top-level price/bed fields.
- Changing a type in `db-types.ts` affects both workspaces and the stored data. Flag it as a
  **Breaking Change: database schema change** in the PR, as the PR template asks.

## Auth model (shared by both halves)

- Google sign-in through Firebase Auth. Only `@cornell.edu` accounts are allowed, and this is
  enforced on both client and server.
- The client sends `Authorization: Bearer <Firebase ID token>`. The backend `authenticate`
  middleware verifies it and sets `req.user`.
- Admins come from two sources: the hardcoded `admins` list in
  `frontend/src/constants/HomeConsts.ts` (the backend imports this file directly), and the Firestore
  `adminWhitelist` collection. See backend/AGENTS.md for how inconsistently routes check this.

## Branches and deploys

- Feature branches → PR into `main` (staging). A PR from `main` may only target `release`
  (enforced by `ci-policies.yml`).
- Every PR gets a Firebase Hosting preview on the `cu-apts-staging` project.
- Pushing to `release` deploys the frontend to Firebase Hosting (`cuapts-prod`).
- The backend runs on Heroku: `heroku-postbuild` builds all workspaces, then `Procfile` starts the
  compiled server, which also serves `frontend/build`.
- Fill in the PR template (`.github/PULL_REQUEST_TEMPLATE.md`); Summary and Test Plan are required.

## Gotchas

- There are two `firestore.rules` files. The **root** one is what `firebase.json` uses (deny-all
  except public `faqs` reads). `backend/firebase/firestore.rules` is a looser, separate copy.
- `frontend/patches/react-scripts+4.0.0.patch` fixes a CRA crash with frozen tsconfig objects, and
  `NODE_OPTIONS=--openssl-legacy-provider` is required for CRA 4 on Node 18. Keep both.
- Don't upgrade React, MUI, react-router, firebase, or react-scripts as a side effect of another
  change. The code relies on v17 / v4 / v5 / v8-namespaced / 4.0.0 APIs.
