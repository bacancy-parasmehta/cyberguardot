Phase 4: Core Backend Logic — API Routes & Server Actions
Goal: Build all server-side data access functions, server actions, and API routes that power the MVP features.
Codex CLI Prompt:
We are building CyberGuard OT — OT/ICS cybersecurity platform on Next.js 14 App Router + Supabase + Vercel. Build the complete backend data layer. All database access uses the Supabase server client from /src/lib/supabase/server.ts. Use Next.js Server Actions for mutations and Server Components for queries where possible.

TECH CONTEXT:
- Database schema defined in Phase 2 (assets, vulnerabilities, threats, incidents, alerts, compliance_controls, profiles, facilities, networks, audit_logs tables)
- All queries must respect RLS — use the authenticated Supabase client (not service role) unless explicitly stated
- Zod is used for input validation on all mutations
- All server actions use the 'use server' directive

CREATE THE FOLLOWING FILES:

1. /src/lib/data/assets.ts
   Server functions (all async, use server client):
   - getAssets(filters?: { status?, risk_level?, asset_type?, search? }): returns Asset[] for user's facility, supports filtering and search on name/ip_address/manufacturer
   - getAssetById(id: string): returns Asset with related vulnerabilities count and recent alerts
   - getAssetStats(): returns { total, online, offline, critical_risk, high_risk }
   - createAsset(data: CreateAssetInput): server action — validates with zod, inserts asset, logs to audit_logs
   - updateAsset(id: string, data: UpdateAssetInput): server action — validates, updates, logs
   - deleteAsset(id: string): server action — soft delete by setting status='offline', logs

2. /src/lib/data/vulnerabilities.ts
   - getVulnerabilities(filters?: { asset_id?, severity?, status?, search? }): returns Vulnerability[] joined with asset name
   - getVulnerabilityById(id: string): full vulnerability with asset info
   - getVulnerabilityStats(): { total, critical, high, medium, low, open, resolved }
   - updateVulnerabilityStatus(id: string, status: VulnStatus, notes?: string): server action
   - assignVulnerability(id: string, user_id: string): server action

3. /src/lib/data/threats.ts
   - getThreats(filters?: { status?, severity?, search? }): Threat[]
   - getThreatById(id: string): full threat with affected assets
   - getThreatStats(): { total, active, investigating, contained, resolved }
   - updateThreatStatus(id: string, status: ThreatStatus): server action
   - createThreat(data: CreateThreatInput): server action

4. /src/lib/data/incidents.ts
   - getIncidents(filters?: { status?, severity?, assigned_to? }): Incident[] with assignee name
   - getIncidentById(id: string): full incident with timeline
   - getIncidentStats(): { total, open, investigating, resolved, avg_resolution_hours }
   - createIncident(data: CreateIncidentInput): server action
   - updateIncidentStatus(id: string, status: IncidentStatus): server action
   - addIncidentTimelineEntry(id: string, note: string): server action — appends to timeline jsonb array with timestamp + user_id
   - assignIncident(id: string, user_id: string): server action

5. /src/lib/data/alerts.ts
   - getAlerts(filters?: { status?, priority?, asset_id? }): Alert[] ordered by triggered_at desc
   - getAlertStats(): { total, new: number, critical, high, acknowledged_today }
   - acknowledgeAlert(id: string): server action — sets status='acknowledged', acknowledged_by, acknowledged_at
   - resolveAlert(id: string): server action — sets status='resolved', resolved_at
   - suppressAlert(id: string): server action — sets status='suppressed'
   - bulkAcknowledgeAlerts(ids: string[]): server action

6. /src/lib/data/compliance.ts
   - getComplianceControls(framework?: ComplianceFramework): ComplianceControl[]
   - getComplianceSummary(): { framework, total, compliant, non_compliant, partial, score_percent }[] grouped by framework
   - updateControlStatus(id: string, status: ComplianceStatus, evidence?: string): server action

7. /src/lib/data/dashboard.ts
   - getDashboardSummary(): aggregates all stats in one server call:
     Returns { assets: AssetStats, vulnerabilities: VulnStats, threats: ThreatStats, incidents: IncidentStats, alerts: AlertStats, recent_alerts: Alert[5], recent_incidents: Incident[5], risk_trend: { date, score }[30] }
   - getRiskTrend(days: number): returns daily aggregate risk scores (use created_at grouping from vulnerabilities + alerts)

8. /src/app/api/assets/route.ts — REST API endpoint:
   - GET: returns assets list (same filters as getAssets via query params)
   - POST: creates new asset (for future integration use)
   - Use service role client here for API key authenticated external integrations

9. /src/app/api/alerts/route.ts — REST API endpoint:
   - GET: returns recent alerts
   - PATCH /api/alerts/[id]/acknowledge: acknowledges alert

10. Zod schemas — create /src/lib/validations.ts with Zod schemas for:
    - CreateAssetInput, UpdateAssetInput
    - CreateThreatInput
    - CreateIncidentInput
    - All matching the database column constraints from Phase 2

For ALL server actions:
- Import and call requireAuth() at the top
- Wrap in try/catch, return { success: boolean, error?: string, data?: T }
- After mutations, call revalidatePath() for relevant page paths
- Write to audit_logs table for all create/update/delete operations
Done When: Each data function can be imported and called in a Next.js Server Component without TypeScript errors. Server actions return typed results. getAlerts() and getDashboardSummary() return real data from the seeded database when called from a test server component.