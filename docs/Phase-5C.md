Phase 5C: Frontend — Threats, Incidents & Compliance Pages
Goal: Build the threats monitoring, incident response, and compliance tracking pages.
Codex CLI Prompt:
We are building CyberGuard OT — Next.js 14 App Router + Supabase + Vercel. Build the Threats, Incidents, and Compliance pages. Follow the same dark slate design system. Reuse all UI components from /src/components/ui/.

---

/src/app/(dashboard)/threats/page.tsx — SERVER COMPONENT:
Calls getThreats() and getThreatStats().
Render <ThreatsPageClient initialThreats={threats} stats={stats} />

/src/components/threats/ThreatsPageClient.tsx — CLIENT COMPONENT:

TOP STATS: Total | Active | Investigating | Contained | Resolved (5 StatCards)

FILTER BAR: SearchInput + status FilterSelect + severity FilterSelect

THREATS TABLE columns:
- Severity: RiskBadge
- Title
- Type: text badge (pill with slate bg)
- Source IP → Destination IP (monospace, arrow between)
- Protocol: badge if set
- MITRE Tactic: text if set, else "—"
- Detected: relative time
- Status: StatusBadge
- Actions: "Investigate" (sets status=investigating) | "Contain" (sets status=contained) | "Resolve"

Clicking row opens an inline expanded panel:
- Full description
- Raw evidence rendered as formatted JSON block (dark bg, monospace)
- Affected assets: list of asset names from affected_asset_ids (do a local lookup if assets are available, else show UUIDs)
- MITRE Technique if set

Status update calls updateThreatStatus() server action + router.refresh() + toast.

---

/src/app/(dashboard)/incidents/page.tsx — SERVER COMPONENT:
Calls getIncidents() and getIncidentStats().
Render <IncidentsPageClient initialIncidents={incidents} stats={stats} />

/src/components/incidents/IncidentsPageClient.tsx — CLIENT COMPONENT:

TOP STATS: Total | Open | Investigating | Contained | Resolved (5 StatCards)

FILTER BAR: SearchInput + status FilterSelect + severity FilterSelect

INCIDENTS TABLE columns:
- Severity: RiskBadge (use incident_severity)
- Title
- Status: StatusBadge
- Assigned To: name or "Unassigned"
- Opened: relative time
- Actions: "View" button → /incidents/[id]

---

/src/app/(dashboard)/incidents/[id]/page.tsx — INCIDENT DETAIL — SERVER COMPONENT:
Calls getIncidentById(id). If not found → notFound().

Layout: Two column (2/3 + 1/3)

MAIN COLUMN:
- PageHeader: incident title + severity badge + status badge + back link
- "Update Status" row: buttons for each status transition. Only show valid next statuses:
  open → investigating, contained
  investigating → contained, resolved
  contained → resolved
  resolved → closed
  Each button calls updateIncidentStatus() server action. Revalidates page.
- "Timeline" section: vertical timeline feed. Each entry shows: timestamp (formatted), user name, note text. Newest at top. Empty state: "No timeline entries yet."
- "Add Timeline Entry" — text area + "Add Note" button. Calls addIncidentTimelineEntry() server action. Clears textarea on success.
- "Description" card: full description text
- "Root Cause & Resolution" card: shows root_cause and resolution text (or "Not determined yet" if null)

SIDEBAR COLUMN:
- "Incident Details" card: severity, status, created_by name, opened_at, resolved_at if set
- "Assigned To" card: current assignee with avatar placeholder. "Assign to Me" button calls assignIncident(). 
- "Related" card: lists related_threat_ids count and related_asset_ids count (clickable links if populated)

---

/src/app/(dashboard)/compliance/page.tsx — SERVER COMPONENT:
Calls getComplianceControls() and getComplianceSummary().
Render <CompliancePageClient controls={controls} summary={summary} />

/src/components/compliance/CompliancePageClient.tsx — CLIENT COMPONENT:

TOP SECTION — Framework Summary Cards:
For each framework in summary array, show a card:
- Framework name (e.g. "NERC CIP")
- Compliance score: large percentage (compliant / total * 100)
- Mini horizontal bar showing: green=compliant, amber=partial, red=non_compliant, slate=not_applicable
- Counts for each status

FILTER BAR:
- FilterSelect: framework (all/nerc_cip/nist_csf/iec_62443/iso_27001/other)
- FilterSelect: status (all/compliant/non_compliant/partial/not_applicable)
- SearchInput: filters on control_id, control_name

CONTROLS TABLE columns:
- Control ID: monospace (e.g. CIP-002-5.1)
- Control Name
- Framework: badge
- Status: StatusBadge (compliant=green, non_compliant=red, partial=amber, not_applicable=slate)
- Last Assessed: date or "Never"
- Due Date: date with red highlight if past due
- Actions: "Update Status" → opens inline form

INLINE UPDATE FORM (appears below row on click):
- Status select (compliant/non_compliant/partial/not_applicable)
- Evidence textarea
- Save button → calls updateControlStatus() server action + router.refresh() + toast
Done When: Threats page loads and status update buttons work. Incident detail page shows timeline, adding a note appends to timeline on refresh. Status transitions update correctly. Compliance page shows framework score cards and control table with inline status update.