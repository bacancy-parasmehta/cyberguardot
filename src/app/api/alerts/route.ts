import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Phase 4 should expose recent alerts here.",
  });
}
