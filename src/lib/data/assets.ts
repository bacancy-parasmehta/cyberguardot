import type { ActionResult, Alert, Asset, AssetDetail, AssetStats } from "@/types";
import { createAssetSchema, updateAssetSchema, type CreateAssetInput, type UpdateAssetInput } from "@/lib/validations";

function validationError(message: string): ActionResult<never> {
  return { success: false, error: message };
}

export async function getAssets(): Promise<Asset[]> {
  return [];
}

export async function getAssetById(_id: string): Promise<AssetDetail | null> {
  return null;
}

export async function getAssetStats(): Promise<AssetStats> {
  return {
    total: 0,
    online: 0,
    offline: 0,
    degraded: 0,
    critical_risk: 0,
    high_risk: 0,
  };
}

export async function createAsset(data: CreateAssetInput): Promise<ActionResult<Asset>> {
  const parsed = createAssetSchema.safeParse(data);

  if (!parsed.success) {
    return validationError("Invalid asset payload.");
  }

  return {
    success: false,
    error: "createAsset is not implemented yet.",
  };
}

export async function updateAsset(
  _id: string,
  data: UpdateAssetInput,
): Promise<ActionResult<Asset>> {
  const parsed = updateAssetSchema.safeParse(data);

  if (!parsed.success) {
    return validationError("Invalid asset update payload.");
  }

  return {
    success: false,
    error: "updateAsset is not implemented yet.",
  };
}

export async function deleteAsset(_id: string): Promise<ActionResult<Asset>> {
  return {
    success: false,
    error: "deleteAsset is not implemented yet.",
  };
}

export type AssetWithAlerts = Asset & {
  recent_alerts: Alert[];
};

