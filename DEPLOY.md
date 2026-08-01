# Staging & Production Deploy

This file explains quick steps to deploy a staging environment and sync environment variables.

Staging (Vercel)

1. Create a new project on Vercel and connect the GitHub repo.
2. Set the following Environment Variables in Vercel (Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL` – your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` – your Supabase anon/public anon key
4. For E2E (Playwright) CI, set these GitHub Secrets in the repository (Settings → Secrets → Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key; required if you want tests to seed data)
   - Optionally: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` for automated Vercel deploys from CI
3. Vercel will run `npm run build` and serve the `dist` directory. The included `vercel.json` configures a static build.

Containerized deploy (Docker)

Build locally:

```bash
docker build -t wkly:latest .
docker run -p 8080:80 -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" wkly:latest
```

Notes
- Ensure migrations are applied to the Supabase DB before promoting to staging/production. Use `scripts/run-migrations.sh`.
- Store secrets securely (Vercel env, GitHub Secrets, or your hosting provider).

CI notes
- The repository includes a GitHub Actions workflow at `.github/workflows/e2e.yml` that builds the app, serves `./dist` locally, runs Playwright tests, and uploads `tests/e2e/artifacts`.
- The workflow will only run meaningful E2E tests when the Supabase secrets are configured in GitHub Secrets.
