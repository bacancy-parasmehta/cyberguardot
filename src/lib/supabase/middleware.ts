import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config";

const protectedPrefixes = [
  "/dashboard",
  "/assets",
  "/vulnerabilities",
  "/threats",
  "/incidents",
  "/alerts",
  "/compliance",
  "/reports",
  "/settings",
];

type MiddlewareCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function isProtectedPath(pathname: string): boolean {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPlaceholderEnv(value: string): boolean {
  return value.startsWith("your_");
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });

  return to;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (pathname.startsWith("/api")) {
    return response;
  }

  let supabaseUrl: string;
  let supabaseAnonKey: string;

  try {
    supabaseUrl = getSupabaseUrl();
    supabaseAnonKey = getSupabaseAnonKey();
  } catch {
    return response;
  }

  if (isPlaceholderEnv(supabaseUrl) || isPlaceholderEnv(supabaseAnonKey)) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: MiddlewareCookie[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (typeof user?.user_metadata?.role === "string") {
      requestHeaders.set("x-user-role", user.user_metadata.role);
      response.headers.set("x-user-role", user.user_metadata.role);
    }

    if (!user && isProtectedPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return copyCookies(response, NextResponse.redirect(loginUrl));
    }

    if (user && pathname === "/auth/login") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return copyCookies(response, NextResponse.redirect(dashboardUrl));
    }

    return response;
  } catch {
    return response;
  }
}
