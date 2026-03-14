# Governance Reporting Module

## Scope

This module covers compliance tracking, report generation, profile settings, password changes, notification preferences, and audit-log visibility.

## Phases

- `docs/Phase-5C.md`
- `docs/Phase-5D.md`
- `docs/Phase-6.md`

## Key Paths

- `src/app/(dashboard)/compliance`
- `src/app/(dashboard)/reports`
- `src/app/(dashboard)/settings`
- `src/components/settings`
- `src/lib/data/compliance.ts`
- `src/lib/data/profile.ts`
- `src/lib/data/audit.ts`
- `src/lib/utils/csv.ts`

## AI Assistance

Use `$cyberguard-compliance-reports-settings` for control tracking, report export flows, profile updates, password changes, and audit-log work.

## Exit Criteria

- Compliance status changes are backed by server actions.
- Reports support JSON and CSV export without server-only PDF generation.
- Settings keep profile, security, notifications, and audit log concerns separated.

