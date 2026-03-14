"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Server, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { assetTypeValues, riskLevelValues, type Asset, type AssetStats } from "@/types";

const assetTypeLabels = {
  plc: "PLC",
  hmi: "HMI",
  scada: "SCADA",
  sensor: "Sensor",
  actuator: "Actuator",
  historian: "Historian",
  firewall: "Firewall",
  switch: "Switch",
  router: "Router",
  workstation: "Workstation",
  server: "Server",
  iot_device: "IoT Device",
  other: "Other",
} as const;
const protocolLabels = {
  modbus: "Modbus",
  dnp3: "DNP3",
  opc_ua: "OPC UA",
  profinet: "PROFINET",
  ethernet_ip: "EtherNet/IP",
  bacnet: "BACnet",
  iec_61850: "IEC 61850",
  other: "Other",
} as const;
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
  { label: "Degraded", value: "degraded" },
  { label: "Unknown", value: "unknown" },
];
const assetTypeOptions = [
  { label: "All asset types", value: "all" },
  ...assetTypeValues.map((value) => ({ label: assetTypeLabels[value], value })),
];
const riskOptions = [
  { label: "All risk levels", value: "all" },
  ...riskLevelValues.map((value) => ({
    label: value.replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase()),
    value,
  })),
];

function riskBarColor(score: number): string {
  if (score >= 75) {
    return "bg-red-500";
  }

  if (score >= 50) {
    return "bg-amber-500";
  }

  if (score >= 25) {
    return "bg-yellow-500";
  }

  return "bg-green-500";
}

function formatLastSeen(value: string | null): string {
  if (!value) {
    return "Never seen";
  }

  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function AssetsPageClient({
  initialAssets,
  stats,
}: {
  initialAssets: Asset[];
  stats: AssetStats;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [assetType, setAssetType] = useState("all");
  const [riskLevel, setRiskLevel] = useState("all");
  const router = useRouter();

  const filteredAssets = initialAssets.filter((asset) => {
    const haystack = [asset.name, asset.ip_address, asset.manufacturer, asset.model]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = search.trim().length === 0 || haystack.includes(search.toLowerCase());
    const matchesStatus = status === "all" || asset.status === status;
    const matchesType = assetType === "all" || asset.asset_type === assetType;
    const matchesRisk = riskLevel === "all" || asset.risk_level === riskLevel;

    return matchesSearch && matchesStatus && matchesType && matchesRisk;
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assets"
        subtitle="Live facility inventory with search, filters, and risk posture indicators."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} icon={Server} />
        <StatCard title="Online" value={stats.online} color="green" icon={Wifi} />
        <StatCard title="Offline" value={stats.offline} color="red" icon={WifiOff} />
        <StatCard title="Degraded" value={stats.degraded} color="amber" icon={AlertTriangle} />
        <StatCard title="Critical Risk" value={stats.critical_risk} color="red" icon={AlertTriangle} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, IP, manufacturer, or model"
          />
          <FilterSelect value={status} options={statusOptions} onChange={setStatus} />
          <FilterSelect value={assetType} options={assetTypeOptions} onChange={setAssetType} />
          <FilterSelect value={riskLevel} options={riskOptions} onChange={setRiskLevel} />
        </div>
      </div>

      {initialAssets.length === 0 ? (
        <EmptyState
          title="No assets discovered yet"
          description="The inventory is connected, but there are no asset records for this facility yet."
        />
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
          No assets match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Protocols</th>
                <th className="px-4 py-3 font-medium">Last Seen</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredAssets.map((asset) => {
                const protocols = asset.protocols.slice(0, 3).map((protocol) => protocolLabels[protocol]);
                const remainingProtocols = asset.protocols.length - protocols.length;

                return (
                  <tr
                    key={asset.id}
                    className="cursor-pointer hover:bg-slate-800/40"
                    onClick={() => router.push(`/assets/${asset.id}`)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{asset.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{assetTypeLabels[asset.asset_type]}</div>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-slate-300">{asset.ip_address ?? "-"}</td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full ${riskBarColor(asset.risk_score)}`}
                            style={{ width: `${asset.risk_score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-white">{asset.risk_score}</span>
                      </div>
                      <div className="mt-2">
                        <RiskBadge level={asset.risk_level} />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-300">
                      {protocols.length > 0 ? protocols.join(", ") : "-"}
                      {remainingProtocols > 0 ? ` +${remainingProtocols}` : ""}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-400">{formatLastSeen(asset.last_seen)}</td>
                    <td className="px-4 py-3 align-top">
                      <button
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/assets/${asset.id}`);
                        }}
                        type="button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
