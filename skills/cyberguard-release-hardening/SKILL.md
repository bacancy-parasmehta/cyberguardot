---
name: cyberguard-release-hardening
description: Use when preparing CyberGuard OT for release, including security headers, realtime publication setup, deployment docs, environment examples, production config, and post-deploy validation.
---

# CyberGuard Release Hardening

## Overview

Use this skill for final integration and production-readiness work: security headers, realtime publication SQL, deployment configuration, and rollout documentation.

## Workflow

1. Read `../../docs/Phase-6.md`, `../../docs/Phase-7.md`, and `../../docs/modules/release-hardening.md`.
2. Keep runtime config centralized in `next.config.ts`, `vercel.json`, and `src/lib/config.ts`.
3. Document every required external step in `DEPLOYMENT.md`.
4. Treat security headers and environment variable validation as required, not optional.

## Constraints

- Do not split security policy logic across multiple unrelated files without reason.
- Keep deployment documentation aligned with the actual repo structure.
- Realtime publication setup belongs in SQL, not prose only.

## References

- Phase requirements: `../../docs/Phase-7.md`
- Module guide: `../../docs/modules/release-hardening.md`
- Quick checklist: `references/checklist.md`

