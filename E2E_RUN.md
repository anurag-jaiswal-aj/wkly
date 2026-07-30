E2E & CI Run Instructions

Purpose
- Guide to run Playwright E2E locally and set up GitHub Actions secrets required for CI.

Local run (recommended for debugging)
1. Build the app:
```bash
npm ci
npm run build
```
2. Serve the `dist` directory locally on port 5176:
```bash
npx http-server ./dist -p 5176 &
```
3. Export Supabase env vars (use your project values):
```bash
export VITE_SUPABASE_URL="https://...supabase.co"
export VITE_SUPABASE_ANON_KEY="<anon-key>"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" # optional, enables seeding
export PLAYWRIGHT_BASE_URL=http://localhost:5176
export RUN_E2E=1
```
4. Install Playwright browsers and run tests:
```bash
npx playwright install --with-deps
npx playwright test
```

CI setup (GitHub Actions)
- Add the following repository secrets in Settings → Secrets → Actions:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (optional, required to seed DB rows during tests)
- Open a PR or push to a branch to trigger `.github/workflows/e2e.yml`.

Artifacts
- Playwright artifacts (screenshots/HTML) are saved to `tests/e2e/artifacts` and uploaded as workflow artifacts.

Security
- Never commit service role keys to source control. Use repo secrets and rotate keys periodically.
