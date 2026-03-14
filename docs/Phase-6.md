Phase 6: Integration & End-to-End Wiring
Goal: Connect all frontend pages to live data, add real-time alert polling, fix any broken data flows, and add global error handling.
Codex CLI Prompt:
We are building CyberGuard OT — Next.js 14 App Router + Supabase + Vercel. This phase wires everything together end-to-end, adds real-time features, and hardens the application.

TASKS:

1. REAL-TIME ALERT BADGE in Sidebar:
   In /src/components/layout/Sidebar.tsx (client component):
   - Import createBrowserClient from /src/lib/supabase/client.ts
   - Subscribe to Supabase Realtime on the alerts table: filter on facility_id = current user's facility_id AND status = 'new'
   - Show a red badge with count on the "Alerts" sidebar item
   - Update count in real-time when new alerts arrive
   - Badge disappears when count is 0
   - Initial count fetched on mount via getAlerts({ status: 'new' }) client-side call

2. GLOBAL ERROR BOUNDARY:
   Create /src/app/error.tsx — Next.js error boundary:
   - Dark themed error page with shield-with-X icon
   - "Something went wrong" title, error.message displayed in code block
   - "Try Again" button (calls reset()) and "Go to Dashboard" link

   Create /src/app/not-found.tsx:
   - Dark themed 404 page
   - "Asset Not Found" message with radar icon
   - Link back to dashboard

   Create /src/app/loading.tsx and for each major page route create a loading.tsx:
   - Dark skeleton loader matching the page layout
   - Use animate-pulse on gray boxes representing the content areas

3. SUPABASE REALTIME SETUP:
   In Supabase dashboard (document the SQL to run):
   - Create /supabase/realtime_setup.sql with:
     ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
     ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
     ALTER PUBLICATION supabase_realtime ADD TABLE threats;

4. EMPTY STATES:
   Create /src/components/ui/EmptyState.tsx:
   Props: { icon: LucideIcon, title: string, description: string, action?: ReactNode }
   Dark styled centered empty state card.
   
   Apply to all DataTable components when data.length === 0:
   - Assets: ShieldOff icon, "No assets discovered yet", "Add your first asset to begin monitoring"
   - Alerts: CheckCircle icon, "No alerts", "Your network is clear"
   - Incidents: CheckCircle icon, "No incidents", "No active incidents at this time"
   - Threats: Shield icon, "No active threats detected"
   - Vulnerabilities: ShieldCheck icon, "No vulnerabilities found"
   - Compliance: ClipboardCheck icon, "No controls configured"

5. OPTIMISTIC UPDATES for Alerts page:
   In /src/components/alerts/AlertsTable.tsx:
   - Use React useOptimistic for acknowledgeAlert — immediately update the row's status in UI before server confirms
   - Show a subtle loading indicator on the row being updated
   - If server action fails, revert the optimistic update and show error toast

6. DASHBOARD AUTO-REFRESH:
   In /src/app/(dashboard)/dashboard/page.tsx:
   Wrap the stat cards section in a client component /src/components/dashboard/LiveStats.tsx:
   - Polls getDashboardSummary() every 60 seconds using setInterval + router.refresh()
   - Shows a "Last updated X seconds ago" indicator in top-right of the section
   - Has a manual "Refresh" button with spinning icon during refresh

7. AUDIT LOG VIEWER in Settings:
   Add a 4th tab "Audit Log" to /src/components/settings/SettingsTabs.tsx:
   Create /src/lib/data/audit.ts:
   - getAuditLogs(limit?: number): fetches last 50 audit_log entries for user's facility, joined with user full_name
   
   Render audit logs as a scrollable table:
   Columns: Timestamp | User | Action | Entity Type | Details (old→new values truncated)
   No actions, read-only.

8. MIDDLEWARE HARDENING:
   Update /src/middleware.ts:
   - Add Content-Security-Policy header
   - Add X-Frame-Options: DENY
   - Add X-Content-Type-Options: nosniff
   - Rate limit auth routes: if /auth/login is hit more than 10 times in 60 seconds from same IP, return 429 (implement using a simple in-memory Map — note this resets on serverless cold starts, which is acceptable for MVP)

9. BREADCRUMB NAVIGATION:
   Create /src/components/layout/Breadcrumbs.tsx:
   - Reads pathname using usePathname()
   - Renders breadcrumb trail: Dashboard > Assets > [Asset Name]
   - Include in the (dashboard) layout above the main content area
   - Asset/Incident detail pages pass the entity name via the page title

10. FIX ALL TYPESCRIPT ERRORS:
    Run through the entire codebase and ensure:
    - All Supabase query results are properly typed using the types from /src/types/index.ts
    - No 'any' types used anywhere
    - All server action return types are explicit
    - All page props (params, searchParams) are typed correctly for Next.js 14 App Router
Done When: The entire app navigates without console errors. Real-time alert badge updates when a new alert is inserted directly in Supabase dashboard. Empty states render correctly when tables are empty. Optimistic update on alert acknowledge updates the UI instantly. TypeScript build (npm run build) completes with zero type errors.