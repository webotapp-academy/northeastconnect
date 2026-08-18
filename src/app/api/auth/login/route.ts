import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginId, password } = body; // loginId can be email or username

    if (!loginId || !password) {
      return NextResponse.json(
        { status: "error", message: "Email/Username and password are required." },
        { status: 400 }
      );
    }

    const cleanLoginId = loginId.trim().toLowerCase();

    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanLoginId },
          { username: cleanLoginId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { status: "error", message: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Update lastLogin
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Set auth cookie
    await setAuthCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      status: "success",
      message: "Logged in successfully!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profileImageUrl: user.profileImageUrl,
        rankTier: user.rankTier,
        xpPoints: user.xpPoints,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
