import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createAsset, getAssets } from "@/lib/data/assets";

function errorStatus(message: string): number {
  if (message.includes("signed in")) {
    return 401;
  }

  if (message.includes("permission")) {
    return 403;
  }

  return 400;
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
  const status = url.searchParams.get("status");
  const assetType = url.searchParams.get("type");
  const limit = Number(url.searchParams.get("limit") ?? "0");
  const assets = await getAssets();
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      search.length === 0 ||
      [asset.name, asset.ip_address, asset.manufacturer, asset.model]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    const matchesStatus = !status || asset.status === status;
    const matchesType = !assetType || asset.asset_type === assetType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return NextResponse.json({
    data: limit > 0 ? filteredAssets.slice(0, limit) : filteredAssets,
  });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = await createAsset(body as never);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Asset creation failed." },
      { status: errorStatus(result.error ?? "") },
    );
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}