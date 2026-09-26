import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

/** Clears a stale/invalid session cookie (e.g. after a dev database reset) and sends the user to login. */
export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
