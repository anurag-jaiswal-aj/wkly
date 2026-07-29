#!/usr/bin/env bash
set -euo pipefail

# Run SQL migration files against a PostgreSQL database using $DATABASE_URL
# Usage:
#   DATABASE_URL="postgres://user:pass@host:5432/db" bash ./scripts/run-migrations.sh

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL environment variable not set."
  echo "Set DATABASE_URL to your Supabase/Postgres connection string and re-run."
  exit 1
fi

echo "Running migration: 002_add_task_columns.sql"
psql "$DATABASE_URL" -f "supabase/migrations/002_add_task_columns.sql"

echo "Running migration: 003_tags.sql"
psql "$DATABASE_URL" -f "supabase/migrations/003_tags.sql"

echo "Migrations applied successfully."
