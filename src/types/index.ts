export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export const userRoleValues = [
  "admin",
  "engineer",
  "analyst",
  "operator",
  "executive",
] as const;
export type UserRole = (typeof userRoleValues)[number];

export const assetTypeValues = [
  "plc",
  "hmi",
  "scada",
  "sensor",
  "actuator",
  "historian",
  "firewall",
  "switch",
  "router",
  "workstation",
  "server",
  "iot_device",
  "other",
] as const;
export type AssetType = (typeof assetTypeValues)[number];

export const assetStatusValues = [
  "online",
  "offline",
  "degraded",
  "unknown",
] as const;
export type AssetStatus = (typeof assetStatusValues)[number];

export const riskLevelValues = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
] as const;
export type RiskLevel = (typeof riskLevelValues)[number];

export const vulnStatusValues = [
  "open",
  "in_progress",
  "resolved",
  "accepted_risk",
  "false_positive",
] as const;
export type VulnStatus = (typeof vulnStatusValues)[number];

export const threatStatusValues = [
  "active",
  "investigating",
  "contained",
  "resolved",
] as const;
export type ThreatStatus = (typeof threatStatusValues)[number];

export const incidentStatusValues = [
  "open",
  "investigating",
  "contained",
  "resolved",
  "closed",
] as const;
export type IncidentStatus = (typeof incidentStatusValues)[number];

export const incidentSeverityValues = [
  "critical",
  "high",
  "medium",
  "low",
] as const;
export type IncidentSeverity = (typeof incidentSeverityValues)[number];

export const alertStatusValues = [
  "new",
  "acknowledged",
  "resolved",
  "suppressed",
] as const;
export type AlertStatus = (typeof alertStatusValues)[number];

export const alertPriorityValues = [
  "critical",
  "high",
  "medium",
  "low",
] as const;
export type AlertPriority = (typeof alertPriorityValues)[number];

export const protocolTypeValues = [
  "modbus",
  "dnp3",
  "opc_ua",
  "profinet",
  "ethernet_ip",
  "bacnet",
  "iec_61850",
  "other",
] as const;
export type ProtocolType = (typeof protocolTypeValues)[number];

export const complianceFrameworkValues = [
  "nerc_cip",
  "nist_csf",
  "iec_62443",
  "iso_27001",
  "other",
] as const;
export type ComplianceFramework = (typeof complianceFrameworkValues)[number];

export const complianceStatusValues = [
  "compliant",
  "non_compliant",
  "partial",
  "not_applicable",
] as const;
export type ComplianceStatus = (typeof complianceStatusValues)[number];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  facility_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  location: string | null;
  industry: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Network {
  id: string;
  facility_id: string;
  name: string;
  cidr_range: string | null;
  zone: string | null;
  description: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  facility_id: string;
  network_id: string | null;
  name: string;
  asset_type: AssetType;
  status: AssetStatus;
  ip_address: string | null;
  mac_address: string | null;
  manufacturer: string | null;
  model: string | null;
  firmware_version: string | null;
  os_version: string | null;
  protocols: ProtocolType[];
  risk_level: RiskLevel;
  risk_score: number;
  last_seen: string | null;
  first_discovered: string;
  tags: string[];
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface Vulnerability {
  id: string;
  asset_id: string;
  facility_id: string;
  cve_id: string | null;
  title: string;
  description: string | null;
  severity: RiskLevel;
  cvss_score: number | null;
  status: VulnStatus;
  remediation: string | null;
  assigned_to: string | null;
  discovered_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  asset_name?: string;
  assignee_name?: string;
}

export interface Threat {
  id: string;
  facility_id: string;
  title: string;
  description: string | null;
  threat_type: string | null;
  status: ThreatStatus;
  severity: RiskLevel;
  source_ip: string | null;
  destination_ip: string | null;
  affected_asset_ids: string[];
  protocol: ProtocolType | null;
  mitre_tactic: string | null;
  mitre_technique: string | null;
  raw_evidence: JsonObject;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentTimelineEntry {
  timestamp: string;
  action: string;
  user_id: string | null;
  note: string;
}

export interface Incident {
  id: string;
  facility_id: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assigned_to: string | null;
  related_threat_ids: string[];
  related_asset_ids: string[];
  timeline: IncidentTimelineEntry[];
  root_cause: string | null;
  resolution: string | null;
  opened_at: string;
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee_name?: string;
  creator_name?: string;
}

export interface Alert {
  id: string;
  facility_id: string;
  asset_id: string | null;
  threat_id: string | null;
  title: string;
  description: string | null;
  priority: AlertPriority;
  status: AlertStatus;
  rule_name: string | null;
  source: string | null;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  triggered_at: string;
  created_at: string;
  asset_name?: string;
}

export interface ComplianceControl {
  id: string;
  facility_id: string;
  framework: ComplianceFramework;
  control_id: string;
  control_name: string;
  description: string | null;
  status: ComplianceStatus;
  evidence: string | null;
  last_assessed_at: string | null;
  assessed_by: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetRelationship {
  id: string;
  source_asset_id: string;
  target_asset_id: string;
  relationship_type: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  facility_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: JsonValue | null;
  new_values: JsonValue | null;
  ip_address: string | null;
  created_at: string;
  user_name?: string;
}

export interface AssetStats {
  total: number;
  online: number;
  offline: number;
  degraded: number;
  critical_risk: number;
  high_risk: number;
}

export interface VulnerabilityStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  resolved: number;
}

export interface ThreatStats {
  total: number;
  active: number;
  investigating: number;
  contained: number;
  resolved: number;
}

export interface IncidentStats {
  total: number;
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  avg_resolution_hours: number;
}

export interface AlertStats {
  total: number;
  new: number;
  critical: number;
  high: number;
  acknowledged_today: number;
}

export interface ComplianceSummary {
  framework: ComplianceFramework;
  total: number;
  compliant: number;
  non_compliant: number;
  partial: number;
  not_applicable: number;
  score_percent: number;
}

export interface AssetDetail extends Asset {
  vulnerabilities_count: number;
  recent_alerts: Alert[];
}

export interface VulnerabilityDetail extends Vulnerability {
  asset?: Asset;
}

export interface ThreatDetail extends Threat {
  affected_assets?: Asset[];
}

export interface IncidentDetail extends Incident {
  related_threats?: Threat[];
  related_assets?: Asset[];
}

export interface DashboardSummary {
  assets: AssetStats;
  vulnerabilities: VulnerabilityStats;
  threats: ThreatStats;
  incidents: IncidentStats;
  alerts: AlertStats;
  vulnerability_breakdown: Array<{ level: RiskLevel; count: number }>;
  asset_risk_distribution: Array<{ level: RiskLevel; count: number }>;
  recent_alerts: Alert[];
  recent_incidents: Incident[];
  risk_trend: Array<{ date: string; score: number }>;
}

export interface ActionResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

type TableDefinition<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDefinition<Profile>;
      facilities: TableDefinition<Facility>;
      networks: TableDefinition<Network>;
      assets: TableDefinition<Asset>;
      vulnerabilities: TableDefinition<Vulnerability>;
      threats: TableDefinition<Threat>;
      incidents: TableDefinition<Incident>;
      alerts: TableDefinition<Alert>;
      compliance_controls: TableDefinition<ComplianceControl>;
      asset_relationships: TableDefinition<AssetRelationship>;
      audit_logs: TableDefinition<AuditLog>;
    };
  };
}


