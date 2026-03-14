# Monitoring Response Module

## Scope

This module covers dashboard KPIs, alert handling, threat workflows, incident response, realtime updates, and optimistic UI for monitoring features.

## Phases

- `docs/phase-4.md`
- `docs/Phase-5A.md`
- `docs/Phase-5C.md`
- `docs/Phase-6.md`

## Key Paths

- `src/app/(dashboard)/dashboard`
- `src/app/(dashboard)/alerts`
- `src/app/(dashboard)/threats`
- `src/app/(dashboard)/incidents`
- `src/components/alerts`
- `src/components/dashboard`
- `src/lib/data/dashboard.ts`
- `src/lib/data/alerts.ts`
- `src/lib/data/threats.ts`
- `src/lib/data/incidents.ts`

## AI Assistance

Use `$cyberguard-threat-incident-alerts` when implementing live stats, alert actions, threat status changes, incident detail timelines, or realtime indicators.

## Exit Criteria

- Dashboard summary data is aggregated in one backend entry point.
- Alert, threat, and incident actions share consistent mutation patterns.
- Realtime and optimistic updates are isolated to monitoring UI components.

