Phase 5A: Frontend — Dashboard & Alerts Pages
Goal: Build the main dashboard with live stats and the alerts management page with full interaction.
Codex CLI Prompt:
We are building CyberGuard OT — OT/ICS cybersecurity platform — Next.js 14 App Router + Supabase + Vercel. Build the Dashboard and Alerts pages with full data wiring to backend functions from Phase 4.

DESIGN SYSTEM:
- Background: bg-slate-950 (page), bg-slate-900 (cards), bg-slate-800 (inputs/hover)
- Borders: border-slate-700
- Text: text-white (primary), text-slate-400 (secondary), text-slate-500 (muted)
- Accent colors: sky-500 (primary action), red-500 (critical), amber-500 (warning/high), green-500 (success/compliant), purple-500 (info)
- All cards have rounded-xl border border-slate-700 bg-slate-900 p-6
- All stat numbers use font-bold text-2xl or text-3xl
- Monospace font for IPs and technical identifiers

REUSABLE COMPONENTS — create these first in /src/components/ui/:

StatCard.tsx:
  Props: { title, value, subtitle?, icon: LucideIcon, trend?: { value: number, direction: 'up'|'down' }, color?: 'default'|'red'|'amber'|'green'|'sky' }
  Renders a metric card with icon, large number, optional trend indicator

RiskBadge.tsx:
  Props: { level: 'critical'|'high'|'medium'|'low'|'informational' }
  Colored pill badge: critical=red, high=amber, medium=yellow, low=green, informational=slate

StatusBadge.tsx:
  Props: { status: string, type: 'alert'|'incident'|'threat'|'vulnerability'|'asset' }
  Maps status to color pill

DataTable.tsx:
  Generic table component: Props: { columns: Column[], data: T[], onRowClick?: (row: T) => void, loading?: boolean, emptyMessage?: string }
  Dark styled table, hover row highlight, loading skeleton state

PageHeader.tsx:
  Props: { title, subtitle?, actions?: ReactNode }
  Page title area with optional action buttons

SearchInput.tsx:
  Controlled search input with debounce (300ms), magnifying glass icon, dark styling

FilterSelect.tsx:
  Dropdown select for filter options, dark styled

ConfirmDialog.tsx:
  Modal dialog for confirming destructive actions

---

/src/app/(dashboard)/dashboard/page.tsx — DASHBOARD PAGE:
This is a server component. Call getDashboardSummary() from /src/lib/data/dashboard.ts.

Layout: responsive grid, 2 columns on tablet, 3 on desktop.

SECTION 1 — Top KPI Row (4 StatCards side by side):
- Total Assets | count | Server icon | color based on online percentage
- Active Threats | count | AlertTriangle icon | color: count > 0 ? red : green
- Open Incidents | count | Flame icon | color based on severity mix
- New Alerts | count | Bell icon | color: critical count > 0 ? red : amber

SECTION 2 — Risk Overview (2 col):
Left: "Vulnerability Breakdown" — horizontal bar chart using recharts BarChart showing count by severity (critical/high/medium/low). Bars colored: red/amber/yellow/green.
Right: "Asset Risk Distribution" — recharts PieChart with 4 slices for risk levels, custom legend below.

SECTION 3 — Two tables side by side:
Left: "Recent Alerts" — show last 5 alerts: columns = Priority (RiskBadge), Title, Asset, Time. Each row clickable → /alerts.
Right: "Recent Incidents" — show last 5 incidents: columns = Severity, Title, Status (StatusBadge), Opened. Each row clickable → /incidents.

SECTION 4 — Full width:
"30-Day Risk Trend" — recharts LineChart showing daily risk score. X-axis dates, Y-axis 0-100. Line in sky-500, area fill with opacity 0.1. If no trend data, show "Insufficient data" placeholder.

All chart containers: bg-slate-900 rounded-xl border border-slate-700 p-6, with title in text-white font-semibold mb-4.

---

/src/app/(dashboard)/alerts/page.tsx — ALERTS PAGE:
Server component that fetches initial alerts via getAlerts(). Pass to client component for interactivity.

Create /src/components/alerts/AlertsTable.tsx (client component):
Props: { initialAlerts: Alert[], initialStats: AlertStats }

Features:
- Top stats row: 4 mini StatCards for New / Critical / High / Acknowledged Today
- Filter bar: SearchInput (filters on title), FilterSelect for status (all/new/acknowledged/resolved/suppressed), FilterSelect for priority (all/critical/high/medium/low)
- DataTable with columns:
  * Priority: colored RiskBadge
  * Title: truncated at 60 chars, monospace source tag in slate-500 below
  * Asset: asset name if linked, else "—"
  * Triggered: relative time (date-fns formatDistanceToNow)
  * Status: StatusBadge
  * Actions: three buttons inline — "Acknowledge" (eye icon), "Resolve" (check icon), "Suppress" (x icon). Buttons shown based on current status (e.g. don't show Acknowledge if already acknowledged)
- Bulk selection: checkbox column, "Acknowledge Selected" bulk action button appears when items selected
- Clicking a row expands an inline detail panel below the row showing: full description, rule name, source, all timestamps

Actions wire to server actions from /src/lib/data/alerts.ts:
- acknowledgeAlert, resolveAlert, suppressAlert, bulkAcknowledgeAlerts
- After each action: call router.refresh() or use optimistic updates with useOptimistic
- Show sonner toast on success/error

Filtering is client-side on the initialAlerts data (no refetch for MVP).
Done When: Dashboard page loads with real data from the seed database, all 4 stat cards show numbers, both charts render, recent alerts/incidents tables show rows. Alerts page loads with the alerts table, acknowledge/resolve/suppress buttons work and update the UI, bulk select works.
