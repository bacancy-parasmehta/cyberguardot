---
name: cyberguard-auth-routing
description: Use when building CyberGuard OT authentication flows, Supabase session handling, protected dashboard routing, role-aware layout behavior, current-user helpers, or middleware auth rules.
---

# CyberGuard Auth Routing

## Overview

Use this skill for login, callback, session refresh, logout, current-user lookup, and dashboard access control.

## Workflow

1. Read `../../docs/phase-3.md` and `../../docs/modules/auth-access.md`.
2. Align middleware behavior with server-side auth helpers before updating page layouts.
3. Keep auth UI under `src/app/auth` and role-aware shared UI under `src/components/layout`.
4. Reuse one current-user path in `src/lib/auth.ts` instead of duplicating profile lookups.

## Constraints

- Public access is limited to auth and explicitly allowed API routes.
- Redirect behavior must be consistent between middleware and server components.
- Role display and role enforcement should not drift apart.

## References

- Phase requirements: `../../docs/phase-3.md`
- Module guide: `../../docs/modules/auth-access.md`
- Quick checklist: `references/checklist.md`

