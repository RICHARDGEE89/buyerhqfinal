import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_KEY;

const adminAllowList = new Set(["richardgoodwin@live.com", "cam.dirtymack@gmail.com"]);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAgentPortalPath = pathname.startsWith("/agent-portal");
  const isAdminPath = pathname.startsWith("/admin");
  const isBuyerDashboardPath = pathname.startsWith("/dashboard");
  const isAgentLoginPath = pathname === "/agent-portal/login";
  const isAdminLoginPath = pathname === "/admin-login";
  const isBuyerLoginPath = pathname === "/login";

  if (isAgentPortalPath && !isAgentLoginPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/agent-portal/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isBuyerDashboardPath && !isBuyerLoginPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminPath && !isAdminLoginPath) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const email = user.email?.toLowerCase() ?? "";
    if (!adminAllowList.has(email)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
