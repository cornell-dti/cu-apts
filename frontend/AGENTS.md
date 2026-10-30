# frontend/AGENTS.md

This file covers the React client. Read the [root AGENTS.md](../AGENTS.md) first for monorepo
commands, env files, branches, and the shared data and auth model.

## Stack

React 17, TypeScript ~4.9, Create React App (`react-scripts` **4.0.0**, patched), Material-UI
**v4** (`@material-ui/core`, `/icons`, `/lab`), react-router-dom **v5**, Firebase JS SDK **v8**
(namespaced `firebase.auth()`, not modular v9), axios, Sass. Maps use `google-map-react` and
`@vis.gl/react-google-maps`, and blog editing uses TinyMCE.

Write code against these major versions: v5 `<Switch>` / `useHistory` / `useParams`, MUI v4
`makeStyles`, Firebase v8 APIs. Don't upgrade them as part of other work.

## Layout

```
src/
  App.tsx           # MUI theme, top-level routes (react-router v5 <Switch>), user + admin state
  index.tsx         # BrowserRouter + render
  colors.js         # color palette. Use `colors.red1` etc. instead of hardcoded hex values
  pages/            # one component per route (HomePage, ApartmentPage, LandlordPage, AdminPage, ...)
  components/       # grouped by feature: Apartment/, ApartmentCard/, Review/, LeaveReview/,
                    #   Search/, Folder/, Bookmarks/, Admin/, ..., plus utils/ (NavBar, Footer, Toast, DropDown, ...)
  utils/            # firebase.ts, call.ts, sorting/filter helpers, adminTool.ts, useTitle
  constants/        # HomeConsts.ts (also holds the `admins` list, imported by the backend), hotjar
  assets/           # svg/png imported directly into components
public/             # static index.html, icons, manifest
patches/            # patch-package fix for react-scripts 4 (applied on postinstall). Keep it.
```

## Commands

```sh
yarn workspace frontend start     # CRA dev server on :3000 with ../.env.dev, proxies /api → :8080
yarn workspace frontend build     # production build to frontend/build (served by backend + Firebase Hosting)
yarn workspace frontend lint      # eslint (react-app config)
yarn workspace frontend tsc       # typecheck
```

Scripts set `NODE_OPTIONS=--openssl-legacy-provider`, which CRA 4 needs on Node 18. There are no
frontend tests yet (`yarn test` at the root runs only the backend). Most pages need the backend
running to show data.

## Conventions

- **Shared types**: import Firestore shapes from `common/types/db-types` by relative path, e.g.
  `import { ReviewWithId } from '../../../common/types/db-types';`. The `@common` alias only works in
  the backend.
- **Styling**: mostly MUI v4 `makeStyles` hooks declared at the top of the component file
  (`const useStyles = makeStyles((theme) => ({ ... }))`). A few components use `*.module.scss`.
  Pull colors from `colors.js` or the theme palette (`primary` = `colors.red1`). Typography is
  "Work Sans".
- **Pages and routes**: add the page under `pages/` and register it in `App.tsx`. Pages that need
  auth take `user` and `setUser` props from `App`. Set the tab title with `useTitle('...')` from
  `utils`.
- **Components**: function components typed `(): ReactElement` with a local `Props` type. Put a new
  component in the matching feature folder under `components/`, or in `components/utils/` if it's
  generic.
- **Data fetching**:
  - For unauthenticated GETs, use `get<T>(route, { callback, errorHandler })` from `utils/call.ts`.
  - For authenticated calls, get the user and token, then pass `createAuthHeaders(token)`:
    ```ts
    const user = await getUser(true); // true = prompt Google sign-in if signed out
    if (!user) return;
    const token = await user.getIdToken(true);
    await axios.post('/api/add-like', { reviewId }, createAuthHeaders(token));
    ```
  - Always use relative `/api/...` URLs, never `localhost:8080` or an absolute host.
- **Auth**: `utils/firebase.ts` owns Firebase init, Google sign-in (`getUser`), `signOut`, and
  Storage uploads (`uploadFile`, `uploadBlogCoverAndSave`). `getUser` signs out any non
  `@cornell.edu` account. Don't create a second Firebase app instance.
- **Reviews**: request `APPROVED` reviews for public views (`/api/review/aptId/:id/APPROVED`).
  Check user-written text with `includesProfanity` from `utils/profanity.ts`. The review character
  limit (2000) is defined in two places, `common/constants` and a local copy in
  `LeaveReview/ReviewModal.tsx`, so update both if it changes.
- **Admin UI**: `/admin` is only registered when `isAdmin(user)` (hardcoded list) or
  `/api/is-admin` returns true. Hiding the route is only a UX measure. Every admin action must also
  be enforced by the backend.
- **Feedback to users**: prefer `components/utils/Toast` for success and error messages. A few
  older spots use `alert()`, but don't add more.

## Env vars

Only `REACT_APP_*` variables reach the browser bundle. Firebase client config and
`REACT_APP_MAPS_API_KEY` are read from `process.env`. The root `.env.dev` also contains
server-only secrets, such as the Firebase admin private key and email password. Never reference
those from frontend code, because CRA would inline them into the public bundle.
