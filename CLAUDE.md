# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Changes 

1. Always confirm before making any changes to the existing code and files. 
2. Wait for instructions if none are provided.
3. Do not write any code without confirmation.

---

## Commands

All scripts run from the repo root unless noted.

```bash
npm run dev       # Vite dev server — http://localhost:5101
npm run server    # Express backend — http://localhost:8000 (nodemon)
npm run mock      # JSON Server mock API — http://localhost:5100
npm run build     # TypeScript compile + Vite production bundle
npm run lint      # ESLint across src/**/*.{ts,tsx}
npm run preview   # Serve production build locally
```

There is no single "start all" command. Run `dev`, `server`, and (optionally) `mock` in separate terminals.

Backend deps are in `server/package.json`; run `npm install` inside `server/` if adding backend packages.

## Environment Variables

No `.env` file is committed. Create one in the repo root with:

```
MONGO_URI=<your MongoDB connection string>
PORT=8000
VITE_CLIENT_ENV=<backend URL, e.g. http://localhost:8000>
VITE_CLERK_PUBLISHABLE_KEY=<pk_test_... from Clerk dashboard>
CLERK_PUBLISHABLE_KEY=<same pk_test_... value, no VITE_ prefix>
CLERK_SECRET_KEY=<sk_test_... from Clerk dashboard>
```

The root `.env` is shared by both halves: Vite reads it for `VITE_*` vars, and `server/server.js` calls `dotenv.config()` from `process.cwd()` (the repo root, since `npm run server` runs from there). A separate `server/.env` is not required.

The publishable key is duplicated by design: Vite only inlines `VITE_*` vars into the browser bundle, while `@clerk/express` reads `process.env.CLERK_PUBLISHABLE_KEY` (no prefix) at request time. Both are required.

Without `MONGO_URI`, the backend will fail to connect to MongoDB. Without `CLERK_SECRET_KEY` or `CLERK_PUBLISHABLE_KEY`, `@clerk/express` throws when it tries to authenticate a request. Without `VITE_CLERK_PUBLISHABLE_KEY`, the app throws on startup (see `src/main.tsx`).

## Architecture

**Frontend** (`src/`) — React 19 + TypeScript + Vite + Tailwind CSS  
**Backend** (`server/`) — Express 5 + Mongoose + Clerk (`@clerk/express`)  
**Database** — MongoDB (production) / JSON Server on `db.json` (mock)  
**Auth** — Clerk on both halves (`@clerk/express` on the backend, `@clerk/clerk-react` on the frontend). Frontend gets a Clerk session token via `getToken()` and sends it as `Authorization: Bearer <token>` on protected calls.

### Frontend routing (`src/main.tsx`)

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `ReviewsPage` | Main browse page with category filter, search, pagination |
| `/browse` | `ReviewsPage` | Alias |
| `/write-review` | `WriteReview` | Protected — requires login |
| `/login` | `LoginPage` | |
| `/signup` | `SignUpPage` | |
| `/old-home` | `App` | Legacy demo, not linked from UI |

Authentication state comes from Clerk. `useUser()` and `useAuth()` from `@clerk/clerk-react` are consumed directly in components. `ProtectedRoute` (`src/components/ProtectedRoute.tsx`) uses Clerk's `useAuth()` (`isLoaded` + `isSignedIn`) to gate any route that needs a logged-in user.

`src/main.tsx` wraps the entire app in `<ClerkProvider>` (outermost, after `<StrictMode>`), then `<BrowserRouter>`. Sign-in/sign-up are rendered via Clerk's prebuilt `<SignIn />` / `<SignUp />` inside `LoginPage` / `SignUpPage` (with `fallbackRedirectUrl="/browse"`).

`WriteReview` calls `getToken()` from Clerk's `useAuth()` and posts to a relative `/api/reviews` (routed through the Vite proxy) with `Authorization: Bearer <token>`. Using a relative URL is required in Codespaces dev — an absolute `localhost:8000` would resolve to the user's machine, not the Codespace.

### API proxy (Vite → Express)

`vite.config.ts` proxies `/api/*` to `http://localhost:8000` (matches the backend's default `PORT=8000`).

`/users/*` and `/reviews/*` are proxied to the JSON Server on port 5100 (mock data only).

### Backend routes

```
GET  /api/reviews          — all reviews, sorted newest first
POST /api/reviews          — create review (requireAuth middleware)
GET  /api/reviews/category-suggestion — fuzzy-match category input
```

Auth endpoints (`/api/auth/*`) were removed in Step 2 — Clerk handles signup/login/logout on the frontend.

`server/middleware/requireAuth.js` calls `getAuth(req)` from `@clerk/express` to validate the Clerk session, 401s on missing session, and attaches `req.user = { clerkUserId }`. All protected endpoints use this middleware.

### Fuzzy category matching

`server/utils/fuzzyMatch.js` uses Fuse.js to normalize free-text category input against a fixed list (e.g. "technlgy" → "Tech"). It runs on both `POST /api/reviews` and the `category-suggestion` endpoint used by the frontend autocomplete.

### Data models (`server/models/`)

- **Review** — `product`, `clerkUserId`, `username`, `review`, `category`, `rating` (1–5), timestamps

User identity is owned by Clerk; there is no local `User` model.

## Clerk Migration (Complete locally — pending Render cutover)

The custom JWT/bcrypt auth has been fully replaced by Clerk. Users sign up via Clerk's prebuilt UI; reviews are tied to `clerkUserId`.

### Status

- ✅ **Step 1 — Provider scaffolding** — `@clerk/clerk-react` + `<ClerkProvider>` in `src/main.tsx`.
- ✅ **Step 2 — Backend swap** — `@clerk/express` `clerkMiddleware()` + `getAuth()`-based `requireAuth`; `/api/auth/*` routes deleted.
- ✅ **Step 3 — Review model `clerkUserId`** — required field on `Review`; persisted on every `POST /api/reviews`.
- ✅ **Step 4 — Frontend swap** — `<SignIn />` / `<SignUp />`, `useUser()` + `useClerk().signOut()`, Clerk-based `ProtectedRoute`, Bearer-token POST in `WriteReview`. `AuthContext.tsx` deleted.
- ✅ **Step 5 — Cleanup** — `bcryptjs` / `jsonwebtoken` / `cookie-parser` uninstalled; `cookie-parser` removed from `server.js`; `server/models/User.js` deleted.

### Render cutover (still pending)

Local dev runs entirely on Clerk; the deployed Render backend at `https://reviewradar-ab0d.onrender.com` is still on the old JWT code. Cutover steps:

1. Add Render's prod URLs to **Domains** in the Clerk dashboard.
2. On the Render backend service, set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` env vars **before** deploying.
3. On the Render frontend service (if separate), set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_CLIENT_ENV`.
4. Deploy both halves together (backend first if separate). A partial deploy will 401 every authenticated request in prod.
5. Smoke test: sign up via Clerk on prod, post a review, confirm it lands in MongoDB with a `clerkUserId`.

Existing prod reviews lack `clerkUserId` — reads are unaffected; resaving legacy docs would fail validation. Backfill is a separate task if needed.

## Key Known Issues

- **No test suite**: `npm test` is not configured. There are no unit or integration tests.
