# Release Hardening Module

## Scope

This module owns production configuration, security headers, realtime publication setup, environment documentation, deployment guidance, and post-deploy verification.

## Phases

- `docs/Phase-6.md`
- `docs/Phase-7.md`

## Key Paths

- `next.config.ts`
- `vercel.json`
- `.env.production.example`
- `DEPLOYMENT.md`
- `supabase/realtime_setup.sql`

## AI Assistance

Use `$cyberguard-release-hardening` when preparing the repo for deployment, tightening headers, documenting Supabase/Vercel setup, or finalizing release checks.

## Exit Criteria

- Production configuration files exist and match the deployment flow.
- Security headers are defined in one place and not duplicated accidentally.
- Deployment steps are explicit enough to run without reverse engineering the phase docs.

