import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "northeastconnect-secure-jwt-secret-key-2026-xyz"
);

const SESSION_COOKIE_NAME = "nec_session_token";

export interface UserSessionPayload {
  userId: number;
  email: string;
  username: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(payload: UserSessionPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAuthSession(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) return null;

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        mobileNumber: true,
        profileImageUrl: true,
        coverImageUrl: true,
        bio: true,
        state: true,
        city: true,
        role: true,
        xpPoints: true,
        rankTier: true,
        badges: true,
        websiteUrl: true,
        socialLinks: true,
        createdAt: true,
        status: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = (user.role || "").toLowerCase();
  if (role !== "admin" && role !== "superadmin") return null;
  return user;
}
