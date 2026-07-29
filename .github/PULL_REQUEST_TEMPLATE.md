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
