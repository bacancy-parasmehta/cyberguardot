import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { acknowledgeAlert } from "@/lib/data/alerts";

function errorStatus(message: string): number {
  if (message.includes("signed in")) {
    return 401;
  }

  if (message.includes("permission")) {
    return 403;
  }

  if (message.includes("not found")) {
    return 404;
  }

  return 400;
}

export async function PATCH(
  _request: Request,
  context: { params: { id: string } },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const result = await acknowledgeAlert(context.params.id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Alert acknowledgement failed." },
      { status: errorStatus(result.error ?? "") },
    );
  }

  return NextResponse.json({ data: result.data });
}