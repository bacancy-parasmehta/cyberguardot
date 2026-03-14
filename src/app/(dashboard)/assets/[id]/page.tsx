import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAssetById } from "@/lib/data/assets";
import { getVulnerabilities } from "@/lib/data/vulnerabilities";

function formatValue(value: string | null | undefined): string {
  return value && value.length > 0 ? value : "-";
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const [asset, vulnerabilities] = await Promise.all([
    getAssetById(params.id),
    getVulnerabilities(),
  ]);

  if (!asset) {
    notFound();
  }

  const assetVulnerabilities = vulnerabilities.filter(
    (vulnerability) => vulnerability.asset_id === asset.id,
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title={asset.name}
        subtitle="Detailed asset inventory, risk posture, and linked findings."
        actions={
          <Link className="text-sm text-sky-400 hover:text-sky-300" href="/assets">
            Back to assets
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <RiskBadge level={asset.risk_level} />
              <StatusBadge status={asset.status} />
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                {asset.asset_type.replaceAll("_", " ")}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">IP Address</p>
                <p className="mt-2 font-mono text-white">{formatValue(asset.ip_address)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">MAC Address</p>
                <p className="mt-2 font-mono text-white">{formatValue(asset.mac_address)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Manufacturer</p>
                <p className="mt-2 text-white">{formatValue(asset.manufacturer)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Model</p>
                <p className="mt-2 text-white">{formatValue(asset.model)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Firmware Version</p>
                <p className="mt-2 text-white">{formatValue(asset.firmware_version)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">OS Version</p>
                <p className="mt-2 text-white">{formatValue(asset.os_version)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">First Discovered</p>
                <p className="mt-2 text-white">{formatDate(asset.first_discovered)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Last Seen</p>
                <p className="mt-2 text-white">{formatDate(asset.last_seen)}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Protocols</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {asset.protocols.length > 0 ? (
                    asset.protocols.map((protocol) => (
                      <span
                        key={protocol}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                      >
                        {protocol.replaceAll("_", " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {asset.tags.length > 0 ? (
                    asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Vulnerabilities</h2>
            {assetVulnerabilities.length > 0 ? (
              <div className="mt-4 space-y-3">
                {assetVulnerabilities.map((vulnerability) => (
                  <div
                    key={vulnerability.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <RiskBadge level={vulnerability.severity} />
                      <StatusBadge status={vulnerability.status} />
                    </div>
                    <p className="mt-3 font-medium text-white">{vulnerability.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{vulnerability.cve_id ?? "No CVE"}</p>
                    <p className="mt-3 text-sm text-slate-400">
                      Discovered {new Date(vulnerability.discovered_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No vulnerabilities are linked to this asset.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
            {asset.recent_alerts.length > 0 ? (
              <div className="mt-4 space-y-3">
                {asset.recent_alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <RiskBadge level={alert.priority} />
                      <StatusBadge status={alert.status} />
                    </div>
                    <p className="mt-3 font-medium text-white">{alert.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{alert.description ?? "No description provided."}</p>
                    <p className="mt-3 text-sm text-slate-500">Triggered {formatDate(alert.triggered_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No alerts are linked to this asset.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Risk Assessment</h2>
            <p className="mt-4 text-5xl font-bold text-white">{asset.risk_score}</p>
            <div className="mt-4">
              <RiskBadge level={asset.risk_level} />
            </div>
            <p className="mt-4 text-sm text-slate-400">
              This score reflects the current exposure level from device posture, linked findings, and recent alert activity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Network Info</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Network</p>
                <p className="mt-2 text-white">{formatValue(asset.network_id)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Zone</p>
                <p className="mt-2 text-white">{formatValue(String(asset.metadata.zone ?? ""))}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Criticality</p>
                <p className="mt-2 text-white">{formatValue(String(asset.metadata.criticality ?? ""))}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Metadata</h2>
            {Object.keys(asset.metadata).length > 0 ? (
              <div className="mt-4 space-y-3 text-sm">
                {Object.entries(asset.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <p className="text-slate-500">{key}</p>
                    <p className="text-right text-slate-200">{String(value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No structured metadata is available for this asset.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
