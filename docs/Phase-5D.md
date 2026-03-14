Phase 5D: Frontend — Reports & Settings Pages
Goal: Build the reports generation page and user settings page.
Codex CLI Prompt:
We are building CyberGuard OT — Next.js 14 App Router + Supabase + Vercel. Build the Reports and Settings pages.

---

/src/app/(dashboard)/reports/page.tsx — CLIENT COMPONENT (mark 'use client'):

REPORTS PAGE LAYOUT:

SECTION 1 — "Generate Report" card:
Form with:
- Report Type (select): 
  * "Executive Summary" — overall risk posture
  * "Vulnerability Report" — all open vulns with severity breakdown
  * "Incident Report" — all incidents with timeline stats
  * "Compliance Report" — compliance status per framework
  * "Asset Inventory" — full asset list with risk scores
- Date Range: From date + To date (date inputs)
- Format (radio): PDF | CSV | JSON (show as pill toggle buttons, dark style)
- "Generate Report" button

On submit: This is MVP so do not implement real PDF generation. Instead:
- For JSON format: call the appropriate data function client-side, JSON.stringify the result, create a Blob, trigger browser download with filename like "cyberguard-vulnerability-report-2024-01-15.json"
- For CSV format: convert the JSON data to CSV string (write a utility function at /src/lib/utils/csv.ts), download as .csv
- For PDF format: show a toast "PDF export coming soon — download as JSON or CSV for now"
- Show a loading spinner for 1.5 seconds (simulated) before triggering download

SECTION 2 — "Saved Reports" list (static for MVP):
Show a table with columns: Report Name | Type | Generated | Format | Download. Populate with 3 hardcoded placeholder rows showing example reports. Download button is disabled with tooltip "Regenerate to download".

SECTION 3 — "Scheduled Reports" card:
Static UI showing a toggle for "Weekly Executive Summary" and "Monthly Compliance Report" — both toggles non-functional but render correctly with descriptive text below each. Show a note: "Scheduling available in Enterprise plan."

---

/src/app/(dashboard)/settings/page.tsx — SERVER COMPONENT:
Calls getCurrentUser() to get profile.
Render tabs layout with 3 tabs: "Profile", "Security", "Notifications"

Create /src/components/settings/SettingsTabs.tsx — CLIENT COMPONENT (for tab switching):

PROFILE TAB:
Form with: Full Name (text input pre-filled), Email (disabled, read-only), Role (disabled badge display)
Save button → calls a new server action updateProfile(fullName: string) in /src/lib/data/profile.ts:
  - Updates profiles.full_name in DB
  - Revalidates path
  - Returns success/error

SECURITY TAB:
Change Password form:
- Current Password, New Password, Confirm New Password
- Submit calls a server action changePassword(currentPw, newPw):
  - Calls supabase.auth.updateUser({ password: newPw })
  - Returns success message or error
- Validation: new password min 8 chars, must match confirm
- Success: shows toast + clears form

"Active Sessions" section below: static UI showing "1 active session — Current Device" with a "Sign out all other devices" button (calls supabase.auth.signOut({ scope: 'others' }), shows toast).

NOTIFICATIONS TAB:
Static toggle list (non-functional for MVP but rendered):
- Critical Alerts: email notification (toggle on by default)
- High Severity Incidents: email notification (toggle on)
- Weekly Summary Report: email notification (toggle on)
- New Vulnerabilities: in-app notification (toggle on)
All toggles are uncontrolled UI only with a note: "Notification preferences available in upcoming release."

---

UTILITY: /src/lib/utils/csv.ts
Export function jsonToCSV(data: object[]): string
- Takes array of objects, extracts headers from first object keys
- Returns CSV string with header row + data rows
- Handles values that contain commas by wrapping in quotes
- Handles null/undefined as empty string
Done When: Reports page renders all 3 sections, JSON download works and produces a valid downloadable file, CSV download works. Settings page loads with current user data pre-filled, name update works and persists, password change submits without errors.