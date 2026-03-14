import type {
  ActionResult,
  ComplianceControl,
  ComplianceFramework,
  ComplianceStatus,
  ComplianceSummary,
} from "@/types";

export async function getComplianceControls(
  _framework?: ComplianceFramework,
): Promise<ComplianceControl[]> {
  return [];
}

export async function getComplianceSummary(): Promise<ComplianceSummary[]> {
  return [];
}

export async function updateControlStatus(
  _id: string,
  _status: ComplianceStatus,
  _evidence?: string,
): Promise<ActionResult<ComplianceControl>> {
  return {
    success: false,
    error: "updateControlStatus is not implemented yet.",
  };
}

