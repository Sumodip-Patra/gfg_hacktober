# GitHub Contribution Tracker (Backend)

A Next.js backend (plain JavaScript) that shows a user's open source contributions: the repos they have sent pull requests to, the status of each PR, and streak and stats. Users sign in with GitHub, and a separate frontend consumes the API.

## Features

- GitHub OAuth login (read-only, public data only)
- List of repos you have contributed to, with PR and merge counts
- PR tracker with `open`, `merged` and `closed` states, filterable by repo
- Stats: totals, current and longest contribution streak, per-repo counts, activity by day
- Mock mode with fixture data, so a frontend can be built without logging in
- No database: data is fetched live from GitHub and cached in memory for 5 minutes

## Tech stack

Next.js (App Router, Route Handlers), Auth.js (`next-auth@4`), GitHub GraphQL API, Node built-in test runner.

## Quick start

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local     # Windows PowerShell: copy .env.example .env.local
```

Edit `.env.local`, then start the server:

```bash
npm run dev
```

### Try it without GitHub login (mock mode)

Set `MOCK=true` in `.env.local` and restart. Open <http://localhost:3000/api/stats>. The endpoints return fixture data and no login is needed.

### Use real GitHub data

1. On GitHub: **Settings > Developer settings > OAuth Apps > New OAuth App**.
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Copy the Client ID and generate a client secret.
3. Generate a session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
4. Fill in `.env.local` (see below), set `MOCK=false`, and restart.
5. Open <http://localhost:3000/api/auth/signin> and click **Sign in with GitHub**. A 404 page afterwards is normal: this backend has no web pages. Then open `/api/me`, `/api/pulls` or `/api/stats` in the same browser.

## Environment variables

| Variable | Description |
|---|---|
| `MOCK` | `true` serves fixture data with no login; `false` uses real GitHub |
| `FRONTEND_URL` | The one frontend origin allowed to call the API (for example `http://localhost:5173`) |
| `NEXTAUTH_URL` | Public address of this backend |
| `NEXTAUTH_SECRET` | Random string used to encrypt sessions |
| `GITHUB_ID` | GitHub OAuth App client ID |
| `GITHUB_SECRET` | GitHub OAuth App client secret |

`.env.local` is git-ignored. Never commit real secrets.

## API

All endpoints return JSON and require a login session (except in mock mode). Optional query parameter `scope=external|all` applies to `repos`, `pulls` and `stats`: `external` (default) excludes repos owned by the signed-in user.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/me` | Signed-in user: `username`, `avatarUrl`, `profileUrl` |
| GET | `/api/repos` | Repos with PRs: `fullName`, `url`, `prCount`, `mergedCount`, `lastActivityAt` |
| GET | `/api/pulls` | PRs. Filters: `state=open\|merged\|closed\|all`, `repo=owner/name` |
| GET | `/api/stats` | `totals`, `streak`, `perRepo`, `activityByDay` |
| GET/POST | `/api/auth/*` | Login and session routes (Auth.js) |

Example `GET /api/stats`:

```json
{
  "totals": { "totalPrs": 20, "open": 3, "merged": 12, "closedUnmerged": 5, "repos": 7 },
  "streak": { "current": 4, "longest": 9 },
  "perRepo": [{ "repo": "owner/name", "merged": 3, "open": 1 }],
  "activityByDay": [{ "date": "2026-09-30", "count": 2 }]
}
```

### Streak definition

A day counts if you opened or merged at least one PR that day (UTC dates). `current` is the run of consecutive days ending today or yesterday; `longest` is the best run in the fetched data. Stats use up to your 300 most recent public PRs.

### Errors

Every error uses one shape:

```json
{ "error": { "code": "UNAUTHENTICATED", "message": "Please sign in." } }
```

| Status | Code | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Invalid query parameter value |
| 401 | `UNAUTHENTICATED` | Not signed in, or the GitHub token was revoked |
| 429 | `RATE_LIMITED` | GitHub rate limit reached |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 502 | `UPSTREAM_ERROR` | GitHub is unavailable |

## Calling the API from a frontend

Send requests with credentials so the session cookie is included:

```js
fetch(`${API_URL}/api/stats`, { credentials: 'include' });
```

To log in, send the user to `${API_URL}/api/auth/signin?callbackUrl=${encodeURIComponent(FRONTEND_URL)}`. The backend only allows the origin in `FRONTEND_URL`.

## Testing

```bash
npm test
```

Unit tests cover the streak, totals and filtering logic in `lib/stats.js`. A Postman collection that exercises every endpoint (including error cases) is in [`postman/`](postman/).

## Project structure

```
app/api/auth/[...nextauth]/route.js   GitHub OAuth handler
app/api/me|repos|pulls|stats/route.js Thin endpoints
lib/auth.js      Auth.js options and getUser(request)
lib/github.js    GitHub GraphQL client and normalization
lib/stats.js     Pure functions: streak, totals, filters, grouping
lib/cache.js     In-memory cache with TTL
lib/errors.js    Error shape and response helper
lib/cors.js      CORS headers for FRONTEND_URL
lib/mock.js      Fixture data for mock mode
docs/superpowers Design spec and implementation plan
postman/         Postman collection
```

## Deployment notes

- Set all environment variables on your host (leave `MOCK` unset or `false`).
- Update the GitHub OAuth App callback URL to `https://<your-host>/api/auth/callback/github` and set `NEXTAUTH_URL` to the same host.
- If the frontend and backend are on different domains in production, set the session cookie to `SameSite=None; Secure` (`cookies.sessionToken.options` in `lib/auth.js`), otherwise login will not persist.
- The cache is in memory, so on serverless hosting it is per instance and may reset. That only affects speed, not correctness.

## Limitations

- Only public GitHub data (OAuth scope `read:user`).
- No database, so no history beyond what GitHub returns, and at most 300 PRs per user.
- GitHub only (no GitLab merge requests).
