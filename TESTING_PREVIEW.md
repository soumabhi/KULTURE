**KULTUR — Quick Manual Test Plan for Browser Preview**

Purpose

- Provide a concise, copy-paste checklist to verify the staging/testing build locally (browser preview). Use this when asking QA or a colleague to validate the admin bootstrap, login, and core admin flows. The project is configured to require no additional production configuration for these tests if `.env.local` contains the service role key and bootstrap token.

Prerequisites (local machine)

- Clone repository and ensure dependencies installed: `npm install`.
- Ensure `.env.local` contains at minimum:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by bootstrap scripts)
  - `BOOTSTRAP_TOKEN` (for secret register UI)
- Start local dev server:

```bash
npm run dev
```

How to use this document

- Give this file to the person doing the browser preview. Ask them to follow tests in order and copy the indicated outputs (JSON/network responses/terminal lines) into a short report.

Tests

1. Confirm app is running

- Open: http://localhost:3000 (or the port printed by `npm run dev`)
- Expected: App loads, no server error pages.

2. Login page UI and sign-in

- Open: `/login`
- Verify: static logo is centered, no animated logo, clean modal styling.
- Action: Sign in with the test account (example: the account you created during bootstrap). If you don't have one, use the bootstrap script to create one (step 4).
- Expected: Successful sign-in redirects to app home.

3. Secret bootstrap register (first admin) — optional path

- Open: `/auth/bootstrap-first/register-ui`
- Fill: `email`, `password`, and `token` (the `BOOTSTRAP_TOKEN` value from `.env.local`).
- Submit and observe the network response (POST to `/auth/bootstrap-first/register`).
- Expected response JSON: `{ ok: true, userId: "<uuid>", orgId: "<uuid>" }` OR a clear error message if bootstrap not allowed.

4. CLI bootstrap (recommended for testing)

- Run (reads `.env.local`):

```bash
node scripts/bootstrap-first-register.mjs --email admin@example.com --password 'StrongP@ssw0rd'
# or if user already exists
node scripts/bootstrap-first-register.mjs --user-id <USER_ID>
```

- Expected terminal output: `Bootstrap complete. User: <id> Org: <id>` and `Inserted membership <id>` (or updated membership message).

5. Verify server session & membership (debug route)

- While signed in, open: `/debug/session`
- Copy the JSON response. Expected keys:
  - `session.state` = `authenticated`
  - `session.user.id` = your user id
  - `session.memberships` includes an object with `role: "KULTUR_OWNER"` (or other allowed admin roles)

6. Admin access

- Open: `/app/admin`
- Expected: Page shows admin content; no "Admin Access Required" box. If you still see access denied, paste the `/debug/session` JSON and the bootstrap script output into a bug report.

7. Batch edit / Validation UX

- Open admin production/batches page: `/app/admin/production` (or the production batches list)
- Pick a batch and open edit form (BatchEditForm). Test validation:
  - Try setting `distributed + reserved + redeemed` greater than `quantity`. Expected: client-side validation prevents submit and shows inline error.
  - Try changing `quantity` without entering an audit reason. Expected: client-side block with inline error requiring `audit-reason` field.
  - Enter a valid `audit-reason` and submit; expected: success response and UI update.
- Verification: check network request for the server action (POST) and response status 200/JSON ok. Optionally, verify `organization_members` audit record exists in your Supabase SQL editor.

8. Pagination & Search (admin lists)

- On admin lists (batches, organizations), test pagination controls and use the search box to find entries. Expected: server-side pagination/search works and UI updates correctly.

9. Sign-out and session cleanup

- On success, sign out: `/logout`. Confirm sign-out returns to public view.

Collect these artifacts on failure

- `/debug/session` JSON
- Terminal output from running `node scripts/bootstrap-first-register.mjs` (if used)
- Network response body for failed POSTs (developer tools → Network tab)
- Any console or server log errors

Notes & Security

- The `SUPABASE_SERVICE_ROLE_KEY` is required only for bootstrap scripts and server admin routes — do not commit it. For preview/testing, it's fine to have it in `.env.local` on your machine.
- After QA, consider disabling or deleting the bootstrap UI and scripts, or make the token single-use and short-lived.

Questions? Paste the `/debug/session` JSON and any failing network responses here and I will inspect them.
