export const appMeta = {
  name: "CyberGuard OT",
  subtitle: "Operational Technology Security Platform",
};

export const dashboardNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Assets", href: "/assets", icon: "Server" },
  { label: "Vulnerabilities", href: "/vulnerabilities", icon: "ShieldAlert" },
  { label: "Threats", href: "/threats", icon: "AlertTriangle" },
  { label: "Incidents", href: "/incidents", icon: "Flame" },
  { label: "Alerts", href: "/alerts", icon: "Bell" },
  { label: "Compliance", href: "/compliance", icon: "ClipboardCheck" },
  { label: "Reports", href: "/reports", icon: "FileText" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const moduleSequence = [
  "foundation",
  "supabase-schema",
  "auth-routing",
  "asset-vulnerability",
  "threat-incident-alerts",
  "compliance-reports-settings",
  "release-hardening",
] as const;

