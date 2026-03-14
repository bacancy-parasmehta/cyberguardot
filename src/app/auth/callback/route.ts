import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase/server";

function getRedirectPath(nextPath: string | null): string {
  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }

  return "/dashboard";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  } catch {
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
  }
}
