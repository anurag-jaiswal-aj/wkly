# Wkly Staging Supabase Setup

Follow these exact steps to provision a real Supabase staging environment for testing Wkly, without hardcoding or committing any secrets to the repository.

## A. Create a New Supabase Project

1. Log into the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Select your organization and name the project **Wkly Staging**.
4. Set a strong Database Password and note it securely (it will not be committed).
5. Choose a region and click **Create New Project**. Wait for the project to provision.

## B. Obtain Credentials

1. In the Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Locate the **Project URL** and the **anon** public key.

## C. Configure Auth Settings and Redirect URLs

1. Go to **Authentication** -> **URL Configuration**.
2. Set the **Site URL** to `http://localhost:5174` (this is the port Playwright E2E tests use).
3. Under **Redirect URLs**, add the following explicitly:
   - `http://localhost:5174/update-password`
   - `http://localhost:5173/update-password` (if you also test locally with standard Vite dev server)
   - `http://localhost:5174/planner`
   - `http://localhost:5173/planner`
4. Go to **Authentication** -> **Providers** -> **Email**.
5. Disable **Confirm email** (this is strictly required for the E2E test suite to generate valid test sessions without clicking email links).

## D. Apply Database Migrations

The repository's migrations (`supabase/migrations/`) are fully reproducible.

1. Login to the Supabase CLI:
   ```bash
   npx supabase login
   ```
2. Link your new staging project (replace `<REF>` with the string from your Project URL: `https://<REF>.supabase.co`):
   ```bash
   npx supabase link --project-ref <REF>
   ```
3. Push the migrations to create tables, RLS policies, and Realtime publications:
   ```bash
   npx supabase db push
   ```

*(Note: Realtime replication for `tasks`, `subtasks`, `tags`, and `task_tags` is automatically handled by the `004_realtime_publication.sql` migration).*

## E. Deploy the Edge Function

The `delete-account` Edge Function safely orchestrates account deletion without exposing a Service Role key to the frontend.

1. Deploy the function to your staging project:
   ```bash
   npx supabase functions deploy delete-account
   ```
2. (Optional but Recommended) If you are testing across multiple origins, bind the allowed origin secret so the function accepts CORS correctly from your frontend:
   ```bash
   npx supabase secrets set ALLOWED_ORIGIN=http://localhost:5174
   ```

*(Note: `verify_jwt = true` is configured in `supabase/config.toml` natively, so the Edge Function rejects unauthenticated calls out of the box).*

## F. Configure Local Environment

1. Create a `.env.local` file (this is Git-ignored):
   ```bash
   touch .env.local
   ```
2. Add your staging Project URL and anon key:
   ```env
   VITE_SUPABASE_URL=https://<REF>.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
*(Note: Never commit `.env.local` or put a `SUPABASE_SERVICE_ROLE_KEY` in it, the frontend does not need it).*

## G. Running the E2E Suite

Now that you have a real backend, you can run the full suite. 

```bash
npm run test:e2e
```
This automatically boots Vite on port `5174` and targets your Staging Supabase project. The skipped E2E tests will automatically run because the dummy key check will pass.

## H. Resetting Staging Test Data

To completely wipe all E2E test data from your Staging project, you can simply run:
```bash
npx supabase db reset
```
This safely drops the public schema and reruns your `db push` migrations from scratch, giving you a totally clean slate.
