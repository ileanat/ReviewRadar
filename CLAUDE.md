# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

No `.env` file is committed. Create one with:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<secret key>
PORT=8000
```

Without `MONGO_URI`, the backend will fail to connect to MongoDB. The JWT fallback (`"ballz"`) is not suitable for real use.

## Architecture

**Frontend** (`src/`) — React 19 + TypeScript + Vite + Tailwind CSS  
**Backend** (`server/`) — Express 5 + Mongoose + JWT (httpOnly cookies)  
**Database** — MongoDB (production) / JSON Server on `db.json` (mock)

### Frontend routing (`src/main.tsx`)

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `ReviewsPage` | Main browse page with category filter, search, pagination |
| `/browse` | `ReviewsPage` | Alias |
| `/write-review` | `WriteReview` | Protected — requires login |
| `/login` | `LoginPage` | |
| `/signup` | `SignUpPage` | |
| `/old-home` | `App` | Legacy demo, not linked from UI |

Authentication state lives in `src/context/AuthContext.tsx` and is consumed via `useAuth()`. `ProtectedRoute` wraps any route that needs a logged-in user.

### API proxy (Vite → Express)

`vite.config.ts` proxies `/api/*` to `http://localhost:5000`. The backend `PORT` env defaults to `8000`, so **the proxy target and the server port are mismatched** — set `PORT=5000` in your `.env` or update the proxy target to `5000` to match.

`/users/*` and `/reviews/*` are proxied to the JSON Server on port 5100 (mock data only).

### Backend routes

```
POST /api/auth/register    — create user (bcrypt password)
POST /api/auth/login       — verify password, set JWT cookie
GET  /api/auth/me          — validate token, return user
POST /api/auth/logout      — clear token cookie
GET  /api/reviews          — all reviews, sorted newest first
POST /api/reviews          — create review (requireAuth middleware)
GET  /api/reviews/category-suggestion — fuzzy-match category input
```

`server/middleware/requireAuth.js` validates the JWT cookie and attaches the user to `req.user`. All protected endpoints use this middleware.

### Fuzzy category matching

`server/utils/fuzzyMatch.js` uses Fuse.js to normalize free-text category input against a fixed list (e.g. "technlgy" → "Tech"). It runs on both `POST /api/reviews` and the `category-suggestion` endpoint used by the frontend autocomplete.

### Data models (`server/models/`)

- **User** — `username`, `email`, `passwordHash`
- **Review** — `product`, `username`, `review`, `category`, `rating` (1–5), timestamps

## Key Known Issues

- **Port mismatch**: Vite proxy targets port 5000, backend defaults to 8000. Set `PORT=5000` or fix `vite.config.ts`.
- **No test suite**: `npm test` is not configured. There are no unit or integration tests.
