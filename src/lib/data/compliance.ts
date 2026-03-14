import type {
  ActionResult,
  ComplianceControl,
  ComplianceFramework,
  ComplianceStatus,
  ComplianceSummary,
} from "@/types";
import { getDataContext } from "@/lib/data/context";

function mutationError(message: string): ActionResult<never> {
  return {
    success: false,
    error: message,
  };
}

function canManageCompliance(role: string): boolean {
  return role === "admin" || role === "engineer";
}

async function fetchComplianceControls(
  framework?: ComplianceFramework,
): Promise<ComplianceControl[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  let query = context.supabase
    .from("compliance_controls")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("framework", { ascending: true })
    .order("control_id", { ascending: true });

  if (framework) {
    query = query.eq("framework", framework);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return data ?? [];
}

export async function getComplianceControls(
  framework?: ComplianceFramework,
): Promise<ComplianceControl[]> {
  return fetchComplianceControls(framework);
}

export async function getComplianceSummary(): Promise<ComplianceSummary[]> {
  const controls = await fetchComplianceControls();
  const groupedControls = new Map<ComplianceFramework, ComplianceControl[]>();

  controls.forEach((control) => {
    const group = groupedControls.get(control.framework) ?? [];
    group.push(control);
    groupedControls.set(control.framework, group);
  });

  return Array.from(groupedControls.entries()).map(([framework, frameworkControls]) => {
    const total = frameworkControls.length;
    const compliant = frameworkControls.filter((control) => control.status === "compliant").length;
    const nonCompliant = frameworkControls.filter(
      (control) => control.status === "non_compliant",
    ).length;
    const partial = frameworkControls.filter((control) => control.status === "partial").length;
    const notApplicable = frameworkControls.filter(
      (control) => control.status === "not_applicable",
    ).length;
    const scorable = total - notApplicable;
    const weightedScore = compliant + partial * 0.5;

    return {
      framework,
      total,
      compliant,
      non_compliant: nonCompliant,
      partial,
      not_applicable: notApplicable,
      score_percent:
        scorable > 0 ? Math.round((weightedScore / scorable) * 100) : 0,
    };
  });
}

export async function updateControlStatus(
  id: string,
  status: ComplianceStatus,
  evidence?: string,
): Promise<ActionResult<ComplianceControl>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update compliance controls.");
  }

  if (!canManageCompliance(context.profile.role)) {
    return mutationError("Your role does not have permission to update compliance controls.");
  }

  const { data, error } = await context.supabase
    .from("compliance_controls")
    .update({
      status,
      evidence: evidence || null,
      last_assessed_at: new Date().toISOString(),
      assessed_by: context.userId,
    } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return mutationError(error?.message ?? "Unable to update compliance control.");
  }

  return {
    success: true,
    data,
  };
}
