---
name: cyberguard-compliance-reports-settings
description: Use when implementing CyberGuard OT compliance tracking, reports, CSV and JSON exports, profile settings, password changes, notification preferences, or audit-log views.
---

# CyberGuard Compliance Reports Settings

## Overview

Use this skill for governance workflows: compliance controls, reports, user settings, and audit visibility.

## Workflow

1. Read `../../docs/Phase-5C.md`, `../../docs/Phase-5D.md`, and `../../docs/modules/governance-reporting.md`.
2. Keep compliance mutations in `src/lib/data/compliance.ts`.
3. Keep settings-specific actions in dedicated files such as `src/lib/data/profile.ts`.
4. Treat JSON and CSV export as first-class deliverables before considering PDF follow-up.

## Constraints

- Reports should consume existing data functions instead of duplicating queries.
- Settings tabs must keep profile, security, notifications, and audit concerns separate.
- Audit log viewing is read-only.

## References

- Phase requirements: `../../docs/Phase-5D.md`
- Module guide: `../../docs/modules/governance-reporting.md`
- Quick checklist: `references/checklist.md`

