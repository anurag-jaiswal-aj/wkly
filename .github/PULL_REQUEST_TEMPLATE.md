## Summary

Describe the change and why it was needed. Include links to relevant issues.

## What I changed
- Added Playwright E2E tests and helpers (`tests/e2e/*`)
- Added seeding helper using Supabase service role for deterministic tests
- Added GitHub Actions workflow: `.github/workflows/e2e.yml`
- Updated `DEPLOY.md` with CI/secret instructions

## Checklist
- [ ] Tests pass locally: `npm run build && npx http-server ./dist -p 5176 & npx playwright test`
- [ ] Secrets configured in repo Settings → Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] (Optional) Vercel env configured for staging preview

## CI notes for reviewers
- The workflow will upload `tests/e2e/artifacts` as build artifacts on failure — review those to debug flakes.
- If you need to re-run CI after adding secrets, re-run the workflow from the Actions tab.

--
If this PR touches infrastructure or CI, add a brief note to the team and include any steps for rotating keys.
## Summary

This PR adds Playwright E2E tests and CI integration.

- Playwright scaffold and tests: `tests/e2e/*`
- CI workflow: `.github/workflows/e2e.yml` (runs Playwright with RUN_E2E=1)
- Helpers for test user creation and UI helpers: `tests/e2e/utils.ts`

## Key notes for reviewers

- Database migrations: ensure migrations are applied in order. Run `scripts/run-migrations.sh` if needed.
- Tests require Supabase env vars in CI: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Local run:

```bash
npm ci
npm run test:e2e:install
npm run build
npm run preview -- --port=5174
```

Then, in another shell run:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5174 RUN_E2E=1 \
VITE_SUPABASE_URL="$VITE_SUPABASE_URL" VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
npm run test:e2e
```

## Checklist
- [ ] E2E tests run in CI (staging secrets configured)
- [ ] Migration order verified (`002_add_task_columns.sql` before `003_tags.sql`)
- [ ] Review test artifacts / screenshots for flakes

## Follow-ups (optional)
- Add Playwright reporter upload to CI for artifact retention
- Add scheduled nightlies for flaky test detection
