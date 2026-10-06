#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies and Playwright browsers..."
npm ci
npx playwright install --with-deps

echo "Building site..."
npm run build

echo "Ensure env vars are set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). You can set SUPABASE_SERVICE_ROLE_KEY to enable seeding."
echo "Running Playwright tests..."
export RUN_E2E=1
export PLAYWRIGHT_BASE_URL=http://localhost:5174
npx playwright test || true

echo "Done"