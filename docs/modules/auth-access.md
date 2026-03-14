# Auth Access Module

## Scope

This module owns login, session refresh, auth callback handling, role-aware route protection, and current-user helpers.

## Phases

- `docs/phase-3.md`
- `docs/Phase-6.md`

## Key Paths

- `src/app/auth`
- `src/lib/auth.ts`
- `src/components/layout/Header.tsx`
- `src/components/layout/RoleBadge.tsx`
- `src/middleware.ts`

## AI Assistance

Use `$cyberguard-auth-routing` for any task involving login, logout, profile lookup, protected dashboard access, or role checks.

## Exit Criteria

- Auth routes are isolated under `src/app/auth`.
- Protected dashboard routes rely on one shared auth gate.
- Middleware and server helpers agree on redirect behavior.

