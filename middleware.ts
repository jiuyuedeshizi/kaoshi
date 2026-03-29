import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth";

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
}

function isAdminPage(pathname: string) {
  return pathname.startsWith("/admin") && pathname !== "/admin/login" && pathname !== "/admin/logout";
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isAdminApi(pathname) && !isAdminPage(pathname)) {
    return NextResponse.next();
  }

  const session = getAdminSessionFromRequest(request);
  if (session) {
    return NextResponse.next();
  }

  if (isAdminApi(pathname)) {
    return NextResponse.json({ ok: false, error: "后台接口需要管理员登录" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
