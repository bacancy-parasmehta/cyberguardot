# Supabase Schema Module

## Scope

This module owns PostgreSQL enums, tables, relationships, helper SQL, RLS policies, seed data, and shared TypeScript models that mirror the schema.

## Phases

- `docs/phase-2.md`
- `docs/phase-4.md`

## Key Paths

- `supabase/migrations`
- `supabase/realtime_setup.sql`
- `src/types/index.ts`
- `src/lib/validations.ts`

## AI Assistance

Use `$cyberguard-supabase-schema` when adding migrations, editing RLS, or updating shared types and validation contracts.

## Exit Criteria

- Schema and RLS live in SQL files under `supabase/migrations`.
- Shared types reflect the Phase 2 tables and enums.
- Validation schemas match the write paths used by server actions.

