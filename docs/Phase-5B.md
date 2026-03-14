Phase 5B: Frontend — Assets & Vulnerabilities Pages
Goal: Build the assets inventory page with detail view and the vulnerabilities management page.
Codex CLI Prompt:
We are building CyberGuard OT — Next.js 14 App Router + Supabase + Vercel. Build the Assets and Vulnerabilities pages. Use the design system from Phase 5A (dark slate theme, same card/table/badge components).

Import and reuse: StatCard, RiskBadge, StatusBadge, DataTable, PageHeader, SearchInput, FilterSelect, ConfirmDialog from /src/components/ui/

---

/src/app/(dashboard)/assets/page.tsx — SERVER COMPONENT
Call getAssets() and getAssetStats() from /src/lib/data/assets.ts.
Render <AssetsPageClient initialAssets={assets} stats={stats} />

/src/components/assets/AssetsPageClient.tsx — CLIENT COMPONENT:

TOP STATS ROW (5 cards):
- Total Assets | count | color: default
- Online | count | color: green
- Offline | count | color: red
- Degraded | count | color: amber
- Critical Risk | count | color: red

FILTER BAR:
- SearchInput: searches name, ip_address, manufacturer, model
- FilterSelect: status (all/online/offline/degraded/unknown)
- FilterSelect: asset_type (all + all enum values formatted nicely e.g. 'plc' → 'PLC')
- FilterSelect: risk_level (all/critical/high/medium/low)
- "Add Asset" button (sky-500) — opens AddAssetModal

ASSETS TABLE columns:
- Name + type badge below in slate-500 (e.g. "Main PLC" / "PLC")
- IP Address: monospace
- Status: StatusBadge (green dot for online, red for offline, amber for degraded)
- Risk Score: progress bar + number (0-100). Bar color: ≥75=red, ≥50=amber, ≥25=yellow, <25=green
- Protocols: comma-separated list, truncated after 3
- Last Seen: relative time
- Actions: View button → navigates to /assets/[id]

Clicking row navigates to /assets/[id].

---

/src/app/(dashboard)/assets/[id]/page.tsx — ASSET DETAIL — SERVER COMPONENT:
Calls getAssetById(id). If not found, call notFound().

Layout: Two columns on desktop (2/3 main + 1/3 sidebar).

MAIN COLUMN:
- PageHeader: asset name + asset_type badge + status badge, back arrow link
- "Asset Information" card: grid of fields: IP Address, MAC Address, Manufacturer, Model, Firmware Version, OS Version, Protocols (badges), First Discovered, Last Seen, Tags
- "Vulnerabilities" section: list of this asset's vulnerabilities with severity badge, title, CVE ID, status badge, discovered date. Each row has "View" link. Show empty state if none.
- "Recent Alerts" section: last 5 alerts for this asset, same as alert table but compact

SIDEBAR COLUMN:
- "Risk Assessment" card: large risk score number with color, risk level badge, description of what the score means
- "Network Info" card: network name, CIDR range, zone (Purdue level if set)
- "Metadata" card: renders metadata jsonb as key-value pairs

---

/src/components/assets/AddAssetModal.tsx — CLIENT COMPONENT:
Modal dialog with form (react-hook-form + zod CreateAssetInput schema):
Fields: Name*, Asset Type* (select), IP Address, MAC Address, Manufacturer, Model, Firmware Version, OS Version, Protocols (multi-select checkboxes), Tags (comma-separated input), Risk Level (select)
Submit calls createAsset() server action, closes modal on success, shows toast, triggers router.refresh()

---

/src/app/(dashboard)/vulnerabilities/page.tsx — SERVER COMPONENT:
Calls getVulnerabilities() and getVulnerabilityStats().
Render <VulnerabilitiesPageClient initialVulns={vulns} stats={stats} />

/src/components/vulnerabilities/VulnerabilitiesPageClient.tsx — CLIENT COMPONENT:

TOP STATS ROW:
- Total | Open | Critical | High | Resolved (5 cards)

FILTER BAR:
- SearchInput: filters on title, CVE ID, asset name
- FilterSelect: severity (all/critical/high/medium/low)
- FilterSelect: status (all/open/in_progress/resolved/accepted_risk/false_positive)

VULNERABILITIES TABLE columns:
- Severity: RiskBadge
- Title + CVE ID below in slate-500
- Asset: asset name
- CVSS Score: numeric with color coding (≥9.0=red, ≥7.0=amber, ≥4.0=yellow, <4.0=green)
- Status: StatusBadge
- Discovered: date
- Actions: dropdown with "Mark In Progress", "Mark Resolved", "Accept Risk", "Mark False Positive", "Assign to me"

Action calls:
- updateVulnerabilityStatus() server action
- assignVulnerability() server action (assigns to current user)
- Shows sonner toast for each action, router.refresh() after

EXPANDABLE ROW DETAIL:
Clicking row expands: full description, remediation guidance, assigned_to user name, resolved_at if applicable.

Filtering is client-side on initialVulns.
Done When: Assets list renders with filter/search working, risk score bars show correct colors, asset detail page shows all fields and linked vulnerabilities, Add Asset modal submits and the new asset appears after refresh. Vulnerabilities page shows stats, table renders with actions working.