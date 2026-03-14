# CyberGuard OT Deployment

## Supabase Production Setup

1. Create a new Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql`.
3. Run `supabase/migrations/002_rls_helpers.sql`.
4. Run `supabase/realtime_setup.sql`.
5. In Authentication settings, set the Site URL to the deployed app URL.
6. Disable email confirmation for the MVP only if that matches your rollout policy.
7. Create the test user with the service role key after the schema is live.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add every variable from `.env.production.example`.
4. Set the runtime to Node.js 20.x.
5. Deploy and verify login, dashboard access, and protected routing.

## Post Deployment Checks

- Login succeeds at `/auth/login`.
- Dashboard routes reject anonymous requests.
- Realtime setup is active for alerts, incidents, and threats.
- CRUD mutations respect facility-scoped access.
- Reports can export JSON and CSV.
- Profile updates and password changes complete successfully.

## Current Progress Snapshot

This repository can be published now as a stakeholder preview of the current implementation stage.

- Completed areas: foundation setup, Supabase schema and RLS, auth wiring, protected routing, dashboard shell, deployment configuration.
- Partially completed areas: page-level UI, seeded data visibility, stakeholder preview flow.
- Still pending: most backend CRUD actions, API routes, realtime badge wiring, reports/settings completion, full production hardening verification.

Recommended preview framing:

- Share the public landing page as the progress overview.
- Use the authenticated dashboard as a technical preview of the current shell.
- Do not position the current deployment as feature-complete MVP.

## Backup Note

Supabase Pro includes managed backups. On a free-tier MVP, schedule a manual weekly database export from the Supabase dashboard until an automated backup plan is in place.
