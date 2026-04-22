# agents.md

Guidance for AI agents working in this repository. Read `CLAUDE.md` first for commands and architecture — this file covers conventions, patterns, known gotchas, and how to approach common tasks.

---

## Before You Start

1. **Services needed to work end-to-end:** Vite dev server (`npm run dev`, port 5101) + Express backend (`npm run server`, port 8000). JSON Server (`npm run mock`) is only needed for the legacy `/old-home` route.
2. **Environment:** A `.env` file with `MONGO_URI` and `JWT_SECRET` must exist at the repo root and inside `server/`. Without it the backend crashes on startup.
3. **Known port mismatch:** `vite.config.ts` proxies `/api/*` to port 5000, but the backend defaults to port 8000. Either set `PORT=5000` in `.env` or update the proxy target. Until this is fixed, `AuthContext.tsx` hard-codes `http://localhost:8000` directly — so auth calls bypass the proxy and work, but other frontend fetch calls through the proxy will fail.

---
## Changes 

1. Always confirm before making any changes to the existing code and files. 
2. Wait for instructions if none are provided.
3. Do not write any code without confirmation.

---

## Code Conventions

### Frontend

- All frontend code is TypeScript/TSX. `AuthContext.tsx` carries `// @ts-nocheck` — that file uses untyped React context; don't propagate this pattern.
- API calls in the frontend **do not** go through a shared API client — each component/context calls `fetch(...)` directly with `credentials: "include"` (required for the JWT cookie). Keep this pattern consistent.
- Tailwind utility classes only — no CSS modules, no styled-components.
- New pages go in `src/pages/`, reusable UI pieces go in `src/components/`, and the route must be registered in `src/main.tsx`.
- Wrap any route that requires a logged-in user with `<ProtectedRoute>` (see `src/main.tsx`).
- Auth state comes from `useAuth()` (imported from `src/context/AuthContext.tsx`). Never manage auth state locally in a component.

### Backend

- All backend code is ESM (`"type": "module"` in `server/package.json`). Use `import`/`export`, not `require`.
- Route files live in `server/routes/`, Mongoose models in `server/models/`, middleware in `server/middleware/`.
- Protect any write endpoint with the `requireAuth` middleware (see `server/routes/reviewRoutes.js` — `router.post('/', requireAuth, ...)`). It attaches `req.user = { id, username }`.
- The JWT secret is read from `process.env.JWT_SECRET` (with an insecure hardcoded fallback). Always use the env var.

### Review model fields

| Field | Type | Constraints |
|-------|------|-------------|
| `product` | String | required |
| `review` | String | required |
| `category` | String | required — run through fuzzy match before saving |
| `rating` | Number | required, 1–5 |
| `username` | String | optional (defaults to `'Anon'` in the route) |
| `photo` | — | TODO comment in model, not implemented |

---

## Category Fuzzy Matching

Any agent adding category logic must preserve this pipeline:

1. Fetch all existing reviews from MongoDB.
2. Extract unique categories via `getUniqueCategories(reviews)` from `server/utils/fuzzyMatch.js`.
3. Run user input through `findClosestCategory(input, existingCategories, 0.6)`.
4. Save the normalised result, not the raw input.

The frontend calls `GET /api/reviews/category-suggestion?input=<text>` while the user types to show a live preview of the matched category. Any new category-aware UI should use this endpoint rather than reimplementing matching client-side.

---

## Adding Features

### New API endpoint
1. Add the handler to the appropriate file in `server/routes/` (or create a new route file).
2. If it's a new route file, mount it in `server/server.js` with `app.use('/api/<resource>', <routeFile>)`.
3. Add `requireAuth` if the endpoint mutates data or is user-specific.

### New frontend page
1. Create the component in `src/pages/` (page-level) or `src/components/` (reusable).
2. Register the route in `src/main.tsx`.
3. Wrap with `<ProtectedRoute>` if login is required.
4. Fetch from the backend using `fetch('/api/...', { credentials: 'include' })` — the Vite proxy handles the hostname **only if** the port mismatch is fixed; otherwise target `http://localhost:8000` directly as `AuthContext.tsx` does.

### New Mongoose model
1. Create `server/models/<Name>.js` following the pattern in `Review.js` (ESM export, timestamps option).
2. Import and use it directly in the route — no repository layer exists.

---

## No Test Suite

There are no automated tests. To verify changes:

- **Backend:** Use `curl` or a REST client against `http://localhost:8000/api/...`. For auth-protected endpoints, first POST to `/api/auth/login` and capture the cookie.
- **Frontend:** Run `npm run dev` and exercise the UI path manually. Check the browser console and Network tab for errors.
- **Linting:** `npm run lint` catches TypeScript/ESLint errors before committing.

---

## What to Avoid

- Do not add `// @ts-nocheck` to new files — the existing one in `AuthContext.tsx` is a legacy issue.
- Do not bypass `requireAuth` on write endpoints.
- Do not store auth tokens in `localStorage` — the project intentionally uses httpOnly cookies.
- Do not call the JSON Server endpoints (`/users/*`, `/reviews/*`) from new features — those routes exist only for the legacy `/old-home` demo.
- Do not commit a `.env` file.
