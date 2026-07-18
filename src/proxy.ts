import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (replaces deprecated middleware in Next.js 16).
 * Protects /dashboard and /api/streak routes — redirects unauthenticated users to login.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth session cookie (next-auth uses various cookie names)
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect API missions routes (return 401 instead of redirect)
  if (pathname.startsWith("/api/missions") && !hasSession) {
    return NextResponse.json(
      { status: "error", code: "UNAUTHORIZED", message: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/missions/:path*"],
};
