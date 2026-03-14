import { z } from "zod";

import {
  assetStatusValues,
  assetTypeValues,
  complianceStatusValues,
  incidentSeverityValues,
  incidentStatusValues,
  protocolTypeValues,
  riskLevelValues,
  threatStatusValues,
  vulnStatusValues,
} from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const createAssetSchema = z.object({
  name: z.string().min(1, "Asset name is required."),
  asset_type: z.enum(assetTypeValues),
  status: z.enum(assetStatusValues).default("unknown"),
  ip_address: z.string().optional(),
  mac_address: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  firmware_version: z.string().optional(),
  os_version: z.string().optional(),
  protocols: z.array(z.enum(protocolTypeValues)).default([]),
  risk_level: z.enum(riskLevelValues).default("low"),
  risk_score: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
});

export const updateAssetSchema = createAssetSchema.partial();

export const createThreatSchema = z.object({
  title: z.string().min(1, "Threat title is required."),
  description: z.string().optional(),
  threat_type: z.string().optional(),
  status: z.enum(threatStatusValues).default("active"),
  severity: z.enum(riskLevelValues),
  source_ip: z.string().optional(),
  destination_ip: z.string().optional(),
  affected_asset_ids: z.array(z.string()).default([]),
  protocol: z.enum(protocolTypeValues).optional(),
  mitre_tactic: z.string().optional(),
  mitre_technique: z.string().optional(),
});

export const createIncidentSchema = z.object({
  title: z.string().min(1, "Incident title is required."),
  description: z.string().optional(),
  severity: z.enum(incidentSeverityValues).default("medium"),
  status: z.enum(incidentStatusValues).default("open"),
  assigned_to: z.string().uuid().optional(),
  related_threat_ids: z.array(z.string()).default([]),
  related_asset_ids: z.array(z.string()).default([]),
});

export const updateVulnerabilityStatusSchema = z.object({
  status: z.enum(vulnStatusValues),
  notes: z.string().optional(),
});

export const updateControlStatusSchema = z.object({
  status: z.enum(complianceStatusValues),
  evidence: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type CreateThreatInput = z.infer<typeof createThreatSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
