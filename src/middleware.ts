import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "northeastconnect-secure-jwt-secret-key-2026-xyz"
);

const SESSION_COOKIE_NAME = "nec_session_token";

interface UserSessionPayload {
  userId: number;
  email: string;
  username: string;
  role: string;
}

async function verifySession(req: NextRequest): Promise<UserSessionPayload | null> {
  try {
    const token =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const session = await verifySession(request);

    if (!session) {
      if (isAdminApi) {
        return NextResponse.json(
          { status: "error", message: "Unauthorized. Admin authentication required." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
      loginUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (session.role || "").toLowerCase();
    if (userRole !== "admin" && userRole !== "superadmin") {
      if (isAdminApi) {
        return NextResponse.json(
          { status: "error", message: "Forbidden. Admin privileges required." },
          { status: 403 }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized_role");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
