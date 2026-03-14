## Skills
A skill is a project-owned workflow guide stored in a `SKILL.md` file. Use these skills when the task matches the module, phase, or feature area.

### Available project skills
- `cyberguard-foundation`: Bootstrap or refactor the shared Next.js App Router foundation, route tree, layouts, shared config, and Supabase client setup. File: `skills/cyberguard-foundation/SKILL.md`
- `cyberguard-supabase-schema`: Design or change Supabase SQL migrations, enums, relationships, RLS policies, helper SQL, and typed database models. File: `skills/cyberguard-supabase-schema/SKILL.md`
- `cyberguard-auth-routing`: Implement authentication, session refresh, protected routes, role-aware layouts, and auth helpers. File: `skills/cyberguard-auth-routing/SKILL.md`
- `cyberguard-asset-vulnerability`: Build asset inventory, vulnerability workflows, asset detail pages, related data access, and supporting forms. File: `skills/cyberguard-asset-vulnerability/SKILL.md`
- `cyberguard-threat-incident-alerts`: Build dashboard, alerts, threats, incidents, realtime monitoring, and response workflows. File: `skills/cyberguard-threat-incident-alerts/SKILL.md`
- `cyberguard-compliance-reports-settings`: Build compliance tracking, reporting, profile/security settings, audit views, and CSV/JSON export helpers. File: `skills/cyberguard-compliance-reports-settings/SKILL.md`
- `cyberguard-release-hardening`: Handle deployment setup, security headers, realtime publication setup, environment docs, and production hardening. File: `skills/cyberguard-release-hardening/SKILL.md`

### How to use project skills
- Open the matching `SKILL.md` first, then load only the referenced phase or module docs needed for the task.
- Use the smallest skill set that covers the request. Default sequence is foundation -> schema -> auth -> feature modules -> release.
- When a task spans modules, start with the shared dependency skill before the feature skill.
- Keep implementations aligned with the existing phase docs in `docs/`.

