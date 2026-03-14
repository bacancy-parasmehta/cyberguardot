# Foundation Module

## Scope

This module owns the shared Next.js App Router shell, Supabase client entry points, route scaffolding, common layout structure, and baseline design tokens.

## Phases

- `docs/phase-1.md`
- `docs/Phase-6.md` for shared error, loading, and middleware hardening follow-up

## Key Paths

- `src/app`
- `src/components/layout`
- `src/lib/supabase`
- `src/lib/constants.ts`
- `src/lib/config.ts`
- `src/middleware.ts`

## AI Assistance

Use `$cyberguard-foundation` when creating or reorganizing the app shell, shared route structure, or baseline config.

## Exit Criteria

- App routes exist for auth and dashboard sections.
- Shared layout files exist before feature-specific pages are implemented.
- Supabase helper files are isolated under `src/lib/supabase`.
- Global error, not-found, and loading entry points have placeholders ready for Phase 6 hardening.

