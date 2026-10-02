# Postman collection

`contribution-tracker.postman_collection.json` tests the backend endpoints and checks the error handling.

## Use it

1. Postman: **Import**, then pick the JSON file.
2. Start the backend (`npm run dev`).
3. **Run collection**. Every request should pass.

## Variables

| Variable | Default | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | Backend address (change for a deployed URL) |
| `cookieName` | `next-auth.session-token` | Use `__Secure-next-auth.session-token` on HTTPS deployments |
| `sessionToken` | empty | Session cookie value, only needed when `MOCK` is not `true` |

## Mock mode vs real data

- **Mock:** set `MOCK=true` in `.env.local`. No login, leave `sessionToken` empty.
- **Real:** sign in at `/api/auth/signin` in a browser, then copy the `next-auth.session-token` cookie value (DevTools > Application > Cookies) into `sessionToken` (Current value).

Never commit a real `sessionToken`; it grants access to the signed-in GitHub account.
