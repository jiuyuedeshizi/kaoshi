import { NextResponse } from "next/server";
import { CANDIDATE_SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", url));
  response.cookies.set(CANDIDATE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
}
