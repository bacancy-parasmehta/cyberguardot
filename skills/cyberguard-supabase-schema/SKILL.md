---
name: cyberguard-supabase-schema
description: Use when implementing or changing CyberGuard OT Supabase enums, tables, relationships, RLS policies, helper SQL functions, seed data, typed database models, or validation contracts.
---

# CyberGuard Supabase Schema

## Overview

Use this skill for database-first work. It covers SQL migrations, RLS, shared TypeScript models, and schema-driven validation.

## Workflow

1. Read `../../docs/phase-2.md`, `../../docs/phase-4.md`, and `../../docs/modules/data-platform.md`.
2. Update SQL first under `supabase/migrations`.
3. Reflect schema changes in `src/types/index.ts`.
4. Update validation contracts used by server actions only after the schema is stable.

## Constraints

- Keep RLS logic explicit in SQL files.
- Match enum labels exactly between SQL and TypeScript.
- Avoid service-role access outside approved integration endpoints.

## References

- Phase requirements: `../../docs/phase-2.md`
- Module guide: `../../docs/modules/data-platform.md`
- Quick checklist: `references/checklist.md`

