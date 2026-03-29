import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { deleteAdminSession } from "@/lib/session-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.split("=")[1];
  if (sessionId) {
    await deleteAdminSession(sessionId);
  }
  const response = NextResponse.redirect(new URL("/admin/login", url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
