---
name: cyberguard-foundation
description: Use when bootstrapping or restructuring the CyberGuard OT Next.js App Router foundation, shared layout shell, route tree, Supabase client helpers, environment placeholders, or other Phase 1 foundation work.
---

# CyberGuard Foundation

## Overview

Use this skill for the shared application shell. It covers the route scaffold, common layout primitives, Supabase helper placement, and baseline app configuration.

## Workflow

1. Read `../../docs/phase-1.md` and `../../docs/modules/foundation.md`.
2. Create or update the shared route tree under `src/app/auth` and `src/app/(dashboard)` before adding feature logic.
3. Keep shared config and cross-cutting helpers in `src/lib`, not inside feature folders.
4. Add shell pages and layouts first, then layer auth protection and feature wiring.

## Constraints

- Keep App Router entry points thin.
- Isolate Supabase helper creation under `src/lib/supabase`.
- Keep feature modules from leaking into root layout concerns.

## References

- Phase requirements: `../../docs/phase-1.md`
- Module guide: `../../docs/modules/foundation.md`
- Quick checklist: `references/checklist.md`

