Phase 2: Database Schema & Supabase Migrations
Goal: Define and apply all PostgreSQL tables, relationships, enums, RLS policies, and seed data in Supabase.
Codex CLI Prompt:
We are building CyberGuard OT — an OT/ICS cybersecurity platform on Next.js 14 App Router + Supabase + Vercel. Generate a complete Supabase SQL migration file at /supabase/migrations/001_initial_schema.sql that creates the following schema exactly.

ENUMS (create all before tables):
- asset_type: 'plc', 'hmi', 'scada', 'sensor', 'actuator', 'historian', 'firewall', 'switch', 'router', 'workstation', 'server', 'iot_device', 'other'
- asset_status: 'online', 'offline', 'degraded', 'unknown'
- risk_level: 'critical', 'high', 'medium', 'low', 'informational'
- vuln_status: 'open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive'
- threat_status: 'active', 'investigating', 'contained', 'resolved'
- incident_status: 'open', 'investigating', 'contained', 'resolved', 'closed'
- incident_severity: 'critical', 'high', 'medium', 'low'
- alert_status: 'new', 'acknowledged', 'resolved', 'suppressed'
- alert_priority: 'critical', 'high', 'medium', 'low'
- protocol_type: 'modbus', 'dnp3', 'opc_ua', 'profinet', 'ethernet_ip', 'bacnet', 'iec_61850', 'other'
- compliance_framework: 'nerc_cip', 'nist_csf', 'iec_62443', 'iso_27001', 'other'
- compliance_status: 'compliant', 'non_compliant', 'partial', 'not_applicable'

TABLES:

1. profiles (extends Supabase auth.users)
   - id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
   - email text NOT NULL
   - full_name text
   - role text NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'engineer', 'analyst', 'operator', 'executive'))
   - facility_id uuid (FK to facilities, nullable initially)
   - avatar_url text
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

2. facilities
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - name text NOT NULL
   - location text
   - industry text
   - description text
   - created_by uuid REFERENCES profiles(id)
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

3. networks
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE
   - name text NOT NULL
   - cidr_range text
   - zone text (e.g. 'purdue_level_0', 'purdue_level_1', 'dmz', 'enterprise')
   - description text
   - created_at timestamptz DEFAULT now()

4. assets
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE
   - network_id uuid REFERENCES networks(id)
   - name text NOT NULL
   - asset_type asset_type NOT NULL DEFAULT 'other'
   - status asset_status NOT NULL DEFAULT 'unknown'
   - ip_address text
   - mac_address text
   - manufacturer text
   - model text
   - firmware_version text
   - os_version text
   - protocols protocol_type[] DEFAULT '{}'
   - risk_level risk_level DEFAULT 'low'
   - risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100)
   - last_seen timestamptz
   - first_discovered timestamptz DEFAULT now()
   - tags text[] DEFAULT '{}'
   - metadata jsonb DEFAULT '{}'
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

5. vulnerabilities
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE
   - facility_id uuid NOT NULL REFERENCES facilities(id)
   - cve_id text
   - title text NOT NULL
   - description text
   - severity risk_level NOT NULL
   - cvss_score numeric(4,1)
   - status vuln_status NOT NULL DEFAULT 'open'
   - remediation text
   - assigned_to uuid REFERENCES profiles(id)
   - discovered_at timestamptz DEFAULT now()
   - resolved_at timestamptz
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

6. threats
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE
   - title text NOT NULL
   - description text
   - threat_type text
   - status threat_status NOT NULL DEFAULT 'active'
   - severity risk_level NOT NULL
   - source_ip text
   - destination_ip text
   - affected_asset_ids uuid[] DEFAULT '{}'
   - protocol protocol_type
   - mitre_tactic text
   - mitre_technique text
   - raw_evidence jsonb DEFAULT '{}'
   - detected_at timestamptz DEFAULT now()
   - resolved_at timestamptz
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

7. incidents
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE
   - title text NOT NULL
   - description text
   - severity incident_severity NOT NULL DEFAULT 'medium'
   - status incident_status NOT NULL DEFAULT 'open'
   - assigned_to uuid REFERENCES profiles(id)
   - related_threat_ids uuid[] DEFAULT '{}'
   - related_asset_ids uuid[] DEFAULT '{}'
   - timeline jsonb DEFAULT '[]' (array of {timestamp, action, user_id, note})
   - root_cause text
   - resolution text
   - opened_at timestamptz DEFAULT now()
   - resolved_at timestamptz
   - created_by uuid REFERENCES profiles(id)
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

8. alerts
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE
   - asset_id uuid REFERENCES assets(id)
   - threat_id uuid REFERENCES threats(id)
   - title text NOT NULL
   - description text
   - priority alert_priority NOT NULL DEFAULT 'medium'
   - status alert_status NOT NULL DEFAULT 'new'
   - rule_name text
   - source text (e.g., 'passive_monitor', 'vulnerability_scanner', 'threat_intel')
   - acknowledged_by uuid REFERENCES profiles(id)
   - acknowledged_at timestamptz
   - resolved_at timestamptz
   - triggered_at timestamptz DEFAULT now()
   - created_at timestamptz DEFAULT now()

9. compliance_controls
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE
   - framework compliance_framework NOT NULL
   - control_id text NOT NULL (e.g. 'CIP-002-5.1')
   - control_name text NOT NULL
   - description text
   - status compliance_status NOT NULL DEFAULT 'not_applicable'
   - evidence text
   - last_assessed_at timestamptz
   - assessed_by uuid REFERENCES profiles(id)
   - due_date date
   - created_at timestamptz DEFAULT now()
   - updated_at timestamptz DEFAULT now()

10. asset_relationships
    - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
    - source_asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE
    - target_asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE
    - relationship_type text NOT NULL (e.g. 'communicates_with', 'depends_on', 'controls')
    - created_at timestamptz DEFAULT now()
    - UNIQUE(source_asset_id, target_asset_id, relationship_type)

11. audit_logs
    - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
    - facility_id uuid REFERENCES facilities(id)
    - user_id uuid REFERENCES profiles(id)
    - action text NOT NULL
    - entity_type text
    - entity_id uuid
    - old_values jsonb
    - new_values jsonb
    - ip_address text
    - created_at timestamptz DEFAULT now()

INDEXES:
- assets: facility_id, status, risk_level, asset_type
- vulnerabilities: asset_id, facility_id, status, severity
- threats: facility_id, status, severity, detected_at
- incidents: facility_id, status, severity, opened_at
- alerts: facility_id, status, priority, triggered_at
- audit_logs: facility_id, user_id, created_at

RLS POLICIES:
Enable RLS on all tables. Apply these policies:

For all tables with facility_id:
- SELECT: auth.uid() must exist in profiles and profiles.facility_id matches table.facility_id OR profiles.role = 'admin'
- INSERT/UPDATE/DELETE: same condition AND role must be 'admin' or 'engineer' (except alerts acknowledge: 'analyst' can update alert status only)

For profiles:
- Users can SELECT/UPDATE their own row
- Admins can SELECT all rows in their facility

Create a Supabase DB function: handle_new_user() RETURNS trigger that auto-inserts into profiles on auth.users insert, using the email from NEW record.

Create trigger: on_auth_user_created AFTER INSERT ON auth.users → execute handle_new_user()

Create updated_at auto-update trigger function and apply it to all tables that have updated_at.

SEED DATA (insert after schema):
Insert 1 facility: name='Alpha Manufacturing Plant', location='Detroit, MI', industry='Manufacturing'
Insert sample assets: 5 assets of mixed types for that facility
Insert 3 sample alerts (1 critical, 1 high, 1 medium) linked to assets
Insert 5 sample vulnerabilities across the assets
Insert 2 compliance_controls for NERC CIP framework

Also create /supabase/migrations/002_rls_helpers.sql with helper SQL functions:
- get_user_facility_id() RETURNS uuid — returns current user's facility_id from profiles
- is_admin() RETURNS boolean — returns true if current user's role = 'admin'
Done When: Migration runs cleanly in Supabase SQL editor with zero errors, all tables visible in Table Editor, RLS is enabled on every table, and the auth trigger creates a profile row when a new user signs up.