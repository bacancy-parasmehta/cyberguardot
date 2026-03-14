# Module Skill Matrix

## Purpose

The original phase markdown files describe the build order. This matrix translates them into reusable modules and project skills so implementation can be chunked cleanly.

## Matrix

| Module | Related Phase Docs | Skill | Core Directories |
| --- | --- | --- | --- |
| Foundation | `docs/phase-1.md`, `docs/Phase-6.md` | `cyberguard-foundation` | `src/app`, `src/components/layout`, `src/lib/supabase`, `src/middleware.ts` |
| Supabase Schema | `docs/phase-2.md`, `docs/phase-4.md` | `cyberguard-supabase-schema` | `supabase/migrations`, `src/types`, `src/lib/validations.ts` |
| Auth & Access | `docs/phase-3.md`, `docs/Phase-6.md` | `cyberguard-auth-routing` | `src/app/auth`, `src/lib/auth.ts`, `src/middleware.ts` |
| Asset & Vulnerability | `docs/phase-4.md`, `docs/Phase-5B.md` | `cyberguard-asset-vulnerability` | `src/app/(dashboard)/assets`, `src/app/(dashboard)/vulnerabilities`, `src/lib/data/assets.ts`, `src/lib/data/vulnerabilities.ts` |
| Monitoring & Response | `docs/phase-4.md`, `docs/Phase-5A.md`, `docs/Phase-5C.md`, `docs/Phase-6.md` | `cyberguard-threat-incident-alerts` | `src/app/(dashboard)/dashboard`, `alerts`, `threats`, `incidents`, `src/components/alerts`, `src/components/dashboard` |
| Governance & Reporting | `docs/Phase-5C.md`, `docs/Phase-5D.md`, `docs/Phase-6.md` | `cyberguard-compliance-reports-settings` | `src/app/(dashboard)/compliance`, `reports`, `settings`, `src/lib/data/compliance.ts`, `src/lib/data/profile.ts`, `src/lib/data/audit.ts` |
| Release & Hardening | `docs/Phase-6.md`, `docs/Phase-7.md` | `cyberguard-release-hardening` | `next.config.ts`, `vercel.json`, `DEPLOYMENT.md`, `supabase/realtime_setup.sql` |

## Implementation Rule

- Start with the phase doc for requirements.
- Use the module doc for boundaries and handoff points.
- Use the skill for execution workflow and prompt shaping.

