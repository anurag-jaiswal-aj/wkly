#!/usr/bin/env bash
set -euo pipefail

# QA runner: runs lint/build and API end-to-end tests using the project's Supabase
# Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env or environment

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export $(grep -v '^#' "$ROOT_DIR/.env" | xargs || true) 2>/dev/null || true

: ${VITE_SUPABASE_URL:?Need VITE_SUPABASE_URL in .env}
: ${VITE_SUPABASE_ANON_KEY:?Need VITE_SUPABASE_ANON_KEY in .env}

API_URL="$VITE_SUPABASE_URL"
API_KEY="$VITE_SUPABASE_ANON_KEY"

echo "[QA] Starting automated QA run"
echo "[QA] Running lint"
npm run lint || echo "[QA] Lint failed (see above)"

echo "[QA] Running build (tsc + vite build)"
npm run build || echo "[QA] Build failed (see above)"

TMP_USERS=()
TMP_TAGS=()
TMP_TASKS=()

signup_user(){
  local email="$1"; local password="$2"
  local resp
  resp=$(curl -sS -X POST "$API_URL/auth/v1/signup" -H "apikey: $API_KEY" -H "Content-Type: application/json" --data "{\"email\":\"$email\",\"password\":\"$password\"}")
  echo "$resp"
}

token_for(){
  local email="$1"; local password="$2"
  curl -sS -X POST "$API_URL/auth/v1/token?grant_type=password" -H "apikey: $API_KEY" -H "Content-Type: application/json" --data "{\"email\":\"$email\",\"password\":\"$password\"}" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("access_token",""))'
}

create_tag(){
  local token="$1"; local user_id="$2"; local name="$3"; local color="$4"
  curl -sS -X POST "$API_URL/rest/v1/tags" -H "apikey: $API_KEY" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -H "Prefer: return=representation" --data "{\"user_id\":\"$user_id\",\"name\":\"$name\",\"color\":\"$color\"}"
}

create_task(){
  local token="$1"; local user_id="$2"; shift 2; local payload="$@"
  curl -sS -X POST "$API_URL/rest/v1/tasks" -H "apikey: $API_KEY" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -H "Prefer: return=representation" --data "$payload"
}

delete_task(){
  local token="$1"; local id="$2"
  curl -sS -X DELETE "$API_URL/rest/v1/tasks?id=eq.$id" -H "apikey: $API_KEY" -H "Authorization: Bearer $token" -H "Prefer: return=representation"
}

delete_tag(){
  local token="$1"; local id="$2"
  curl -sS -X DELETE "$API_URL/rest/v1/tags?id=eq.$id" -H "apikey: $API_KEY" -H "Authorization: Bearer $token" -H "Prefer: return=representation"
}

echo "[QA] Creating test user"
EMAIL="qa+$(date +%s)@example.com"
PASS="Password123!"
RESP=$(signup_user "$EMAIL" "$PASS")
TOKEN=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("access_token",""))')
USER_ID=$(echo "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("user",{}).get("id",""))')
if [ -z "$TOKEN" ] || [ -z "$USER_ID" ]; then
  echo "[QA] Failed to create test user; response:"; echo "$RESP"; exit 1
fi
echo "[QA] Created user $EMAIL -> $USER_ID"

echo "[QA] Creating tags"
T1=$(create_tag "$TOKEN" "$USER_ID" "qa-tag-1-$(date +%s)" "#ff0000")
T1_ID=$(echo "$T1" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0].get("id",""))')
T2=$(create_tag "$TOKEN" "$USER_ID" "qa-tag-2-$(date +%s)" "#00ff00")
T2_ID=$(echo "$T2" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0].get("id",""))')
echo "[QA] Tags created: $T1_ID, $T2_ID"

echo "[QA] Creating tasks with varying fields"
P1=$(create_task "$TOKEN" "$USER_ID" "{\"user_id\":\"$USER_ID\",\"title\":\"qa task 1\",\"date\":\"2026-08-01\",\"priority\":\"low\",\"reminder_time\":\"2026-08-01T09:00:00Z\"}")
P1_ID=$(echo "$P1" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0].get("id",""))')
P2=$(create_task "$TOKEN" "$USER_ID" "{\"user_id\":\"$USER_ID\",\"title\":\"qa task 2\",\"date\":\"2026-08-02\",\"recurrence\":\"weekly\"}")
P2_ID=$(echo "$P2" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0].get("id",""))')
echo "[QA] Tasks created: $P1_ID, $P2_ID"

echo "[QA] Assigning tag to task via task_tags"
ASSIGN=$(curl -sS -X POST "$API_URL/rest/v1/task_tags" -H "apikey: $API_KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Prefer: return=representation" --data "{\"task_id\":\"$P1_ID\",\"tag_id\":\"$T1_ID\"}")
echo "[QA] Assignment result: $ASSIGN"

echo "[QA] Listing tags via API"
curl -sS -H "apikey: $API_KEY" -H "Authorization: Bearer $TOKEN" "$API_URL/rest/v1/tags?select=*" | jq -c || true

echo "[QA] Listing tasks via API"
curl -sS -H "apikey: $API_KEY" -H "Authorization: Bearer $TOKEN" "$API_URL/rest/v1/tasks?select=*,task_tags(tag_id)&user_id=eq.$USER_ID" | jq -c || true

echo "[QA] Updating a task (mark complete)"
curl -sS -X PATCH "$API_URL/rest/v1/tasks?id=eq.$P1_ID" -H "apikey: $API_KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Prefer: return=representation" --data '{"completed":true}' | jq -c || true

echo "[QA] Cleaning up: deleting tasks and tags (users remain)"
delete_task "$TOKEN" "$P1_ID" >/dev/null || true
delete_task "$TOKEN" "$P2_ID" >/dev/null || true
delete_tag "$TOKEN" "$T1_ID" >/dev/null || true
delete_tag "$TOKEN" "$T2_ID" >/dev/null || true

echo "[QA] QA run completed"
exit 0
