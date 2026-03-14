import type {
  ActionResult,
  Vulnerability,
  VulnerabilityDetail,
  VulnerabilityStats,
  VulnStatus,
} from "@/types";

export async function getVulnerabilities(): Promise<Vulnerability[]> {
  return [];
}

export async function getVulnerabilityById(
  _id: string,
): Promise<VulnerabilityDetail | null> {
  return null;
}

export async function getVulnerabilityStats(): Promise<VulnerabilityStats> {
  return {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    open: 0,
    resolved: 0,
  };
}

export async function updateVulnerabilityStatus(
  _id: string,
  _status: VulnStatus,
  _notes?: string,
): Promise<ActionResult<Vulnerability>> {
  return {
    success: false,
    error: "updateVulnerabilityStatus is not implemented yet.",
  };
}

export async function assignVulnerability(
  _id: string,
  _userId: string,
): Promise<ActionResult<Vulnerability>> {
  return {
    success: false,
    error: "assignVulnerability is not implemented yet.",
  };
}

