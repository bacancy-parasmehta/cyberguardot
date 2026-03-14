# CyberGuard OT AI Assistance

This repository now has project-owned skills and module guides so work can be done module by module instead of treating the full product as one prompt.

## Module Map

| Module | Skill | Phases | Primary Paths | Main Outcome |
| --- | --- | --- | --- | --- |
| Foundation | `$cyberguard-foundation` | 1, 6 | `src/app`, `src/components/layout`, `src/lib/supabase`, `src/middleware.ts` | App shell, route tree, shared config |
| Supabase Schema | `$cyberguard-supabase-schema` | 2, 4 | `supabase/migrations`, `src/types`, `src/lib/validations.ts` | Database schema, RLS, shared types |
| Auth & Access | `$cyberguard-auth-routing` | 3, 6 | `src/app/auth`, `src/lib/auth.ts`, `src/middleware.ts` | Login flow, protected routing, role checks |
| Asset Operations | `$cyberguard-asset-vulnerability` | 4, 5B | `src/app/(dashboard)/assets`, `src/app/(dashboard)/vulnerabilities`, `src/lib/data/assets.ts`, `src/lib/data/vulnerabilities.ts` | Asset inventory and vulnerability workflows |
| Monitoring & Response | `$cyberguard-threat-incident-alerts` | 4, 5A, 5C, 6 | `src/app/(dashboard)/dashboard`, `alerts`, `threats`, `incidents`, `src/lib/data/dashboard.ts` | Live dashboards, alerts, threats, incidents |
| Governance | `$cyberguard-compliance-reports-settings` | 5C, 5D, 6 | `src/app/(dashboard)/compliance`, `reports`, `settings`, `src/lib/data/compliance.ts` | Compliance, reports, user settings, audit log |
| Release | `$cyberguard-release-hardening` | 6, 7 | `next.config.ts`, `vercel.json`, `supabase/realtime_setup.sql`, `DEPLOYMENT.md` | Realtime setup, hardening, production rollout |

## Recommended Delivery Order

1. Foundation
2. Supabase Schema
3. Auth & Access
4. Asset Operations
5. Monitoring & Response
6. Governance
7. Release

## Prompt Starters

- `Use $cyberguard-foundation to scaffold Phase 1 in this repo.`
- `Use $cyberguard-supabase-schema to generate the first migration and typed models.`
- `Use $cyberguard-auth-routing to wire Supabase login and dashboard protection.`
- `Use $cyberguard-threat-incident-alerts to implement dashboard and alerts first.`

## Working Rule

Each feature change should point back to the phase docs in `docs/` and the matching module guide in `docs/modules/`.

