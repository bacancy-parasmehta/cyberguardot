---
name: cyberguard-threat-incident-alerts
description: Use when implementing CyberGuard OT dashboard summaries, alerts, threats, incidents, realtime badges, optimistic monitoring updates, incident timelines, or SOC-style monitoring workflows.
---

# CyberGuard Threat Incident Alerts

## Overview

Use this skill for the monitoring and response surface: dashboard KPIs, alerts, threats, incidents, and realtime behavior.

## Workflow

1. Read `../../docs/Phase-5A.md`, `../../docs/Phase-5C.md`, `../../docs/Phase-6.md`, and `../../docs/modules/monitoring-response.md`.
2. Start with shared stats and data aggregation in `src/lib/data/dashboard.ts`.
3. Implement alert, threat, and incident mutations with the same return contract.
4. Add optimistic or realtime client behavior only after the server path is stable.

## Constraints

- Prefer one dashboard summary aggregator over scattered page-specific queries.
- Keep realtime subscriptions inside client components.
- Use explicit status transition rules for incidents and threats.

## References

- Phase requirements: `../../docs/Phase-5A.md`
- Module guide: `../../docs/modules/monitoring-response.md`
- Quick checklist: `references/checklist.md`

