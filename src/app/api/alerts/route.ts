import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getAlerts, getAlertStats } from "@/lib/data/alerts";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const summaryOnly = url.searchParams.get("summary") === "true";
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const limit = Number(url.searchParams.get("limit") ?? "0");
  const [alerts, stats] = await Promise.all([getAlerts(), getAlertStats()]);

  if (summaryOnly) {
    return NextResponse.json({ stats });
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus = !status || alert.status === status;
    const matchesPriority = !priority || alert.priority === priority;

    return matchesStatus && matchesPriority;
  });

  return NextResponse.json({
    data: limit > 0 ? filteredAlerts.slice(0, limit) : filteredAlerts,
    stats,
  });
}