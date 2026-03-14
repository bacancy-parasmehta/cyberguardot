import { AssetsPageClient } from "@/components/assets/AssetsPageClient";
import { getAssets, getAssetStats } from "@/lib/data/assets";

export default async function AssetsPage() {
  const [assets, stats] = await Promise.all([getAssets(), getAssetStats()]);

  return <AssetsPageClient initialAssets={assets} stats={stats} />;
}
