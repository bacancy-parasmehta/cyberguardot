import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    {
      message: "Phase 4 should acknowledge an alert in this route.",
    },
    { status: 501 },
  );
}
