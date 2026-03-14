import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Phase 4 should implement the assets integration endpoint here.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      message: "Phase 4 should implement asset creation for external integrations here.",
    },
    { status: 501 },
  );
}
