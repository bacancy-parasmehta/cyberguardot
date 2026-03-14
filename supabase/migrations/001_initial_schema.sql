begin;

create extension if not exists pgcrypto;

-- Enums

do $$ begin
  create type public.asset_type as enum (
    'plc',
    'hmi',
    'scada',
    'sensor',
    'actuator',
    'historian',
    'firewall',
    'switch',
    'router',
    'workstation',
    'server',
    'iot_device',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.asset_status as enum ('online', 'offline', 'degraded', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.risk_level as enum ('critical', 'high', 'medium', 'low', 'informational');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.vuln_status as enum ('open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.threat_status as enum ('active', 'investigating', 'contained', 'resolved');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.incident_status as enum ('open', 'investigating', 'contained', 'resolved', 'closed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.incident_severity as enum ('critical', 'high', 'medium', 'low');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_status as enum ('new', 'acknowledged', 'resolved', 'suppressed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_priority as enum ('critical', 'high', 'medium', 'low');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.protocol_type as enum (
    'modbus',
    'dnp3',
    'opc_ua',
    'profinet',
    'ethernet_ip',
    'bacnet',
    'iec_61850',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.compliance_framework as enum ('nerc_cip', 'nist_csf', 'iec_62443', 'iso_27001', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.compliance_status as enum ('compliant', 'non_compliant', 'partial', 'not_applicable');
exception
  when duplicate_object then null;
end $$;

-- Core tables

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  industry text,
  description text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'analyst' check (role in ('admin', 'engineer', 'analyst', 'operator', 'executive')),
  facility_id uuid references public.facilities(id),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'facilities_created_by_fkey'
  ) then
    alter table public.facilities
      add constraint facilities_created_by_fkey
      foreign key (created_by) references public.profiles(id);
  end if;
end $$;

create table if not exists public.networks (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  name text not null,
  cidr_range text,
  zone text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  network_id uuid references public.networks(id),
  name text not null,
  asset_type public.asset_type not null default 'other',
  status public.asset_status not null default 'unknown',
  ip_address text,
  mac_address text,
  manufacturer text,
  model text,
  firmware_version text,
  os_version text,
  protocols public.protocol_type[] default '{}'::public.protocol_type[],
  risk_level public.risk_level default 'low',
  risk_score integer default 0 check (risk_score >= 0 and risk_score <= 100),
  last_seen timestamptz,
  first_discovered timestamptz default now(),
  tags text[] default '{}'::text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  facility_id uuid not null references public.facilities(id),
  cve_id text,
  title text not null,
  description text,
  severity public.risk_level not null,
  cvss_score numeric(4, 1),
  status public.vuln_status not null default 'open',
  remediation text,
  assigned_to uuid references public.profiles(id),
  discovered_at timestamptz default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.threats (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  title text not null,
  description text,
  threat_type text,
  status public.threat_status not null default 'active',
  severity public.risk_level not null,
  source_ip text,
  destination_ip text,
  affected_asset_ids uuid[] default '{}'::uuid[],
  protocol public.protocol_type,
  mitre_tactic text,
  mitre_technique text,
  raw_evidence jsonb default '{}'::jsonb,
  detected_at timestamptz default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  title text not null,
  description text,
  severity public.incident_severity not null default 'medium',
  status public.incident_status not null default 'open',
  assigned_to uuid references public.profiles(id),
  related_threat_ids uuid[] default '{}'::uuid[],
  related_asset_ids uuid[] default '{}'::uuid[],
  timeline jsonb default '[]'::jsonb,
  root_cause text,
  resolution text,
  opened_at timestamptz default now(),
  resolved_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  asset_id uuid references public.assets(id),
  threat_id uuid references public.threats(id),
  title text not null,
  description text,
  priority public.alert_priority not null default 'medium',
  status public.alert_status not null default 'new',
  rule_name text,
  source text,
  acknowledged_by uuid references public.profiles(id),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  triggered_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_controls (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  framework public.compliance_framework not null,
  control_id text not null,
  control_name text not null,
  description text,
  status public.compliance_status not null default 'not_applicable',
  evidence text,
  last_assessed_at timestamptz,
  assessed_by uuid references public.profiles(id),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_relationships (
  id uuid primary key default gen_random_uuid(),
  source_asset_id uuid not null references public.assets(id) on delete cascade,
  target_asset_id uuid not null references public.assets(id) on delete cascade,
  relationship_type text not null,
  created_at timestamptz not null default now(),
  unique (source_asset_id, target_asset_id, relationship_type)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id),
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Trigger functions

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.enforce_profile_self_service_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
begin
  if auth.uid() = old.id then
    select role
    into current_role
    from public.profiles
    where id = auth.uid()
    limit 1;

    if coalesce(current_role, 'analyst') <> 'admin' then
      if new.role is distinct from old.role
        or new.facility_id is distinct from old.facility_id
        or new.email is distinct from old.email then
        raise exception 'Users may not change protected profile fields.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_alert_analyst_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
begin
  select role
  into current_role
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_role = 'analyst' then
    if new.facility_id is distinct from old.facility_id
      or new.asset_id is distinct from old.asset_id
      or new.threat_id is distinct from old.threat_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.priority is distinct from old.priority
      or new.rule_name is distinct from old.rule_name
      or new.source is distinct from old.source
      or new.triggered_at is distinct from old.triggered_at
      or new.created_at is distinct from old.created_at then
      raise exception 'Analysts may only update alert workflow fields.';
    end if;
  end if;

  return new;
end;
$$;

-- Triggers

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_facilities_updated_at on public.facilities;
create trigger set_facilities_updated_at
before update on public.facilities
for each row execute function public.set_updated_at();

drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

drop trigger if exists set_vulnerabilities_updated_at on public.vulnerabilities;
create trigger set_vulnerabilities_updated_at
before update on public.vulnerabilities
for each row execute function public.set_updated_at();

drop trigger if exists set_threats_updated_at on public.threats;
create trigger set_threats_updated_at
before update on public.threats
for each row execute function public.set_updated_at();

drop trigger if exists set_incidents_updated_at on public.incidents;
create trigger set_incidents_updated_at
before update on public.incidents
for each row execute function public.set_updated_at();

drop trigger if exists set_compliance_controls_updated_at on public.compliance_controls;
create trigger set_compliance_controls_updated_at
before update on public.compliance_controls
for each row execute function public.set_updated_at();

drop trigger if exists protect_profile_self_service_fields on public.profiles;
create trigger protect_profile_self_service_fields
before update on public.profiles
for each row execute function public.enforce_profile_self_service_update();

drop trigger if exists protect_alert_analyst_updates on public.alerts;
create trigger protect_alert_analyst_updates
before update on public.alerts
for each row execute function public.enforce_alert_analyst_update();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Indexes

create index if not exists idx_assets_facility_id on public.assets (facility_id);
create index if not exists idx_assets_status on public.assets (status);
create index if not exists idx_assets_risk_level on public.assets (risk_level);
create index if not exists idx_assets_asset_type on public.assets (asset_type);

create index if not exists idx_vulnerabilities_asset_id on public.vulnerabilities (asset_id);
create index if not exists idx_vulnerabilities_facility_id on public.vulnerabilities (facility_id);
create index if not exists idx_vulnerabilities_status on public.vulnerabilities (status);
create index if not exists idx_vulnerabilities_severity on public.vulnerabilities (severity);

create index if not exists idx_threats_facility_id on public.threats (facility_id);
create index if not exists idx_threats_status on public.threats (status);
create index if not exists idx_threats_severity on public.threats (severity);
create index if not exists idx_threats_detected_at on public.threats (detected_at desc);

create index if not exists idx_incidents_facility_id on public.incidents (facility_id);
create index if not exists idx_incidents_status on public.incidents (status);
create index if not exists idx_incidents_severity on public.incidents (severity);
create index if not exists idx_incidents_opened_at on public.incidents (opened_at desc);

create index if not exists idx_alerts_facility_id on public.alerts (facility_id);
create index if not exists idx_alerts_status on public.alerts (status);
create index if not exists idx_alerts_priority on public.alerts (priority);
create index if not exists idx_alerts_triggered_at on public.alerts (triggered_at desc);

create index if not exists idx_audit_logs_facility_id on public.audit_logs (facility_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs (user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);

-- Seed data

insert into public.facilities (
  id,
  name,
  location,
  industry,
  description
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Alpha Manufacturing Plant',
  'Detroit, MI',
  'Manufacturing',
  'Seed facility for CyberGuard OT development.'
)
on conflict (id) do nothing;

insert into public.assets (
  id,
  facility_id,
  name,
  asset_type,
  status,
  ip_address,
  manufacturer,
  model,
  firmware_version,
  os_version,
  protocols,
  risk_level,
  risk_score,
  last_seen,
  tags,
  metadata
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'Boiler PLC-01',
    'plc',
    'online',
    '10.42.0.11',
    'Siemens',
    'S7-1500',
    '2.9.1',
    null,
    array['modbus']::public.protocol_type[],
    'critical',
    92,
    now() - interval '5 minutes',
    array['boiler', 'production']::text[],
    '{"criticality":"tier_1","zone":"purdue_level_1"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    'Packaging HMI-02',
    'hmi',
    'degraded',
    '10.42.0.21',
    'Rockwell',
    'PanelView Plus 7',
    '10.00.17',
    'Windows Embedded',
    array['opc_ua', 'modbus']::public.protocol_type[],
    'high',
    81,
    now() - interval '12 minutes',
    array['packaging', 'operator_station']::text[],
    '{"criticality":"tier_1","zone":"purdue_level_2"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000001',
    'OT Firewall-01',
    'firewall',
    'online',
    '10.42.255.1',
    'Palo Alto Networks',
    'PA-3220',
    '11.1.2',
    'PAN-OS',
    array['other']::public.protocol_type[],
    'medium',
    48,
    now() - interval '2 minutes',
    array['perimeter', 'dmz']::text[],
    '{"criticality":"tier_2","zone":"dmz"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000001',
    'Process Historian-01',
    'historian',
    'online',
    '10.42.10.5',
    'AVEVA',
    'Historian Server',
    '2024.1',
    'Windows Server 2022',
    array['opc_ua']::public.protocol_type[],
    'low',
    35,
    now() - interval '8 minutes',
    array['historian', 'reporting']::text[],
    '{"criticality":"tier_3","zone":"enterprise"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000105',
    '00000000-0000-4000-8000-000000000001',
    'Tank Sensor-07',
    'sensor',
    'offline',
    '10.42.1.77',
    'Emerson',
    'Rosemount 3051',
    '5.3.0',
    null,
    array['bacnet']::public.protocol_type[],
    'medium',
    67,
    now() - interval '3 hours',
    array['tank_farm', 'telemetry']::text[],
    '{"criticality":"tier_2","zone":"purdue_level_1"}'::jsonb
  )
on conflict (id) do nothing;

insert into public.alerts (
  id,
  facility_id,
  asset_id,
  title,
  description,
  priority,
  status,
  rule_name,
  source,
  acknowledged_at,
  resolved_at,
  triggered_at
)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Unauthorized ladder logic change detected',
    'Boiler PLC-01 reported an unexpected program checksum mismatch.',
    'critical',
    'new',
    'logic_change_monitor',
    'passive_monitor',
    null,
    null,
    now() - interval '18 minutes'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000102',
    'HMI authentication failures exceeded threshold',
    'Packaging HMI-02 generated repeated operator login failures.',
    'high',
    'acknowledged',
    'auth_failure_threshold',
    'passive_monitor',
    now() - interval '47 minutes',
    null,
    now() - interval '58 minutes'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000105',
    'Tank sensor telemetry interruption',
    'Tank Sensor-07 has stopped sending telemetry for more than 30 minutes.',
    'medium',
    'resolved',
    'telemetry_gap_detector',
    'passive_monitor',
    now() - interval '2 hours',
    now() - interval '95 minutes',
    now() - interval '2 hours 10 minutes'
  )
on conflict (id) do nothing;

insert into public.vulnerabilities (
  id,
  asset_id,
  facility_id,
  cve_id,
  title,
  description,
  severity,
  cvss_score,
  status,
  remediation,
  discovered_at,
  resolved_at
)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'CVE-2024-12345',
    'PLC web management exposes weak session handling',
    'The PLC web console does not invalidate sessions after privilege changes.',
    'critical',
    9.8,
    'open',
    'Disable the web console and rotate engineering credentials.',
    now() - interval '4 days',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    'CVE-2025-23456',
    'HMI runtime allows privilege escalation',
    'A local attacker can elevate privileges via the runtime service.',
    'high',
    8.4,
    'in_progress',
    'Apply the latest vendor hotfix and remove local admin rights.',
    now() - interval '3 days',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000001',
    'CVE-2024-34567',
    'Firewall management plane missing rate limits',
    'The management API is susceptible to credential stuffing attacks.',
    'medium',
    6.5,
    'open',
    'Restrict management access to the engineering jump host and enable MFA.',
    now() - interval '6 days',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000304',
    '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000001',
    'CVE-2023-45678',
    'Historian server uses deprecated TLS cipher suites',
    'Legacy cipher suites remain enabled on the historian web endpoint.',
    'low',
    3.7,
    'resolved',
    'Disable deprecated cipher suites and enforce TLS 1.2 or later.',
    now() - interval '9 days',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-4000-8000-000000000305',
    '00000000-0000-4000-8000-000000000105',
    '00000000-0000-4000-8000-000000000001',
    'CVE-2025-34567',
    'Sensor firmware allows unsigned configuration uploads',
    'Unsigned configuration packages can be applied over the maintenance interface.',
    'high',
    7.9,
    'accepted_risk',
    'Segment the maintenance interface and schedule a firmware upgrade window.',
    now() - interval '5 days',
    null
  )
on conflict (id) do nothing;

insert into public.compliance_controls (
  id,
  facility_id,
  framework,
  control_id,
  control_name,
  description,
  status,
  evidence,
  last_assessed_at,
  due_date
)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000001',
    'nerc_cip',
    'CIP-002-5.1',
    'BES Cyber System Categorization',
    'Document and review critical cyber system impact classifications.',
    'partial',
    'Impact assessment workbook stored in the GRC evidence share.',
    now() - interval '14 days',
    current_date + 30
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000001',
    'nerc_cip',
    'CIP-007-6 R2',
    'Security Patch Management',
    'Track, evaluate, and remediate applicable security patches within defined SLAs.',
    'non_compliant',
    'Patch backlog exceeds the documented remediation window for OT assets.',
    now() - interval '10 days',
    current_date + 14
  )
on conflict (id) do nothing;

commit;

