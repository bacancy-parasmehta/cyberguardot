Phase 3: Authentication Flows
Goal: Implement complete Supabase Auth integration with login, logout, session handling, and role-aware protected routing.
Codex CLI Prompt:
We are building CyberGuard OT — an OT/ICS cybersecurity SaaS on Next.js 14 App Router + Supabase + Vercel. Implement the complete authentication system as follows:

TECH CONTEXT:
- Supabase SSR auth via @supabase/ssr (createBrowserClient / createServerClient)
- /src/lib/supabase/client.ts exports browser client
- /src/lib/supabase/server.ts exports server client using next/headers cookies()
- Middleware at /src/middleware.ts handles session refresh and route protection
- All dashboard routes are under /src/app/(dashboard)/

TASKS:

1. /src/app/auth/login/page.tsx
   - Full-page dark login screen matching the cybersecurity theme (dark slate background)
   - Logo/brand area: shield icon (lucide-react) + "CyberGuard OT" in white
   - Subtitle: "Operational Technology Security Platform"
   - Email + Password fields with custom dark styling (not Auth UI React component — build custom form)
   - Submit button labeled "Secure Login" with loading spinner state
   - Error display for invalid credentials
   - Use react-hook-form + zod for validation (email required valid format, password min 8 chars)
   - On success: redirect to /dashboard
   - On error: display "Invalid credentials. Please try again."
   - No "Sign up" link — this is an invite-only enterprise product

2. /src/app/auth/callback/route.ts
   - Handle Supabase OAuth callback code exchange
   - Exchange code for session using supabase.auth.exchangeCodeForSession()
   - Redirect to /dashboard on success, /auth/login on error

3. /src/middleware.ts (update existing)
   - Refresh session on every request using @supabase/ssr updateSession pattern
   - If no session and path starts with /dashboard → redirect to /auth/login
   - If session exists and path is /auth/login → redirect to /dashboard
   - Allow all /auth/* and /api/* paths publicly
   - Set x-user-role header from session user metadata for downstream use

4. /src/lib/auth.ts (new file)
   - Export getCurrentUser() — server function returning { user, profile } or null, fetches profile from Supabase DB using user id
   - Export getUserRole() — returns role string from profile
   - Export requireAuth() — throws redirect to /auth/login if no session (for use in server components)
   - Export signOut() — server action that calls supabase.auth.signOut() and redirects to /auth/login

5. /src/app/(dashboard)/layout.tsx
   - Server component that calls requireAuth()
   - Renders a persistent sidebar navigation + top header
   - Sidebar items (with lucide-react icons):
     * Dashboard (LayoutDashboard icon) → /dashboard
     * Assets (Server icon) → /assets
     * Vulnerabilities (ShieldAlert icon) → /vulnerabilities
     * Threats (AlertTriangle icon) → /threats
     * Incidents (Flame icon) → /incidents
     * Alerts (Bell icon) → /alerts
     * Compliance (ClipboardCheck icon) → /compliance
     * Reports (FileText icon) → /reports
     * Settings (Settings icon) → /settings
   - Each sidebar item: dark bg-slate-900, hover bg-slate-800, active item has left border accent in sky-500
   - Top header: shows current user's full_name and role badge, Logout button (calls signOut server action)
   - Role badge colors: admin=purple, engineer=sky, analyst=green, operator=yellow, executive=slate
   - Sidebar is collapsible on mobile (hamburger toggle)
   - Sidebar fixed width 240px on desktop, full overlay on mobile

6. /src/types/index.ts — populate with TypeScript interfaces matching ALL Supabase tables from Phase 2:
   - Asset, Vulnerability, Threat, Incident, Alert, ComplianceControl, Profile, Facility, Network, AuditLog, AssetRelationship
   - Include all enums as TypeScript union types matching the Supabase enums exactly
   - Export a Database type compatible with Supabase generated types pattern

7. Create /src/components/layout/Sidebar.tsx (client component for mobile toggle state)
   Create /src/components/layout/Header.tsx (server component, receives user prop)
   Create /src/components/layout/RoleBadge.tsx

8. Create a test account creation script at /scripts/create-test-user.ts that uses Supabase admin client (service role) to create a user: admin@cyberguard.test / CyberGuard2024! with role='admin' linked to the seed facility from Phase 2.
Done When: Navigating to /dashboard without a session redirects to /auth/login. Logging in with the test credentials redirects to /dashboard. The sidebar renders with all navigation items. Clicking logout returns to login page. Session persists on page refresh.