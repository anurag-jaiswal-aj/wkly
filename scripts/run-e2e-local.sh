#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies and Playwright browsers..."
npm ci
npx playwright install --with-deps

echo "Building site..."
npm run build

echo "Starting static server on http://localhost:5176"
npx http-server ./dist -p 5176 &
SERVER_PID=$!

echo "Ensure env vars are set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). You can set SUPABASE_SERVICE_ROLE_KEY to enable seeding."
echo "Running Playwright tests..."
export RUN_E2E=1
npx playwright test || true

echo "Stopping server"
kill $SERVER_PID || true

echo "Done"