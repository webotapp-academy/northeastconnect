import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { awardUserXp } from "@/lib/gamification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, fullName, state, city } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { status: "error", message: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { status: "error", message: "Username must be at least 3 alphanumeric characters." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { status: "error", message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user or email already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: email.trim().toLowerCase() }, { username: cleanUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.trim().toLowerCase()) {
        return NextResponse.json(
          { status: "error", message: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { status: "error", message: "Username is already taken. Please pick another." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Default avatar based on initials/dicebear
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    const newUser = await db.user.create({
      data: {
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        passwordHash,
        fullName: fullName?.trim() || cleanUsername,
        profileImageUrl: defaultAvatar,
        state: state?.trim() || null,
        city: city?.trim() || null,
        role: "User",
        xpPoints: 20, // Welcome bonus
        rankTier: "Explorer Novice",
      },
    });

    // Create a welcome notification
    await db.notification.create({
      data: {
        userId: newUser.id,
        type: "RANK_UP",
        title: "Welcome to North East Connect! 🌿",
        message: "You've earned 20 Explorer XP for joining. Start commenting, connecting with friends, and discovering the Northeast!",
        linkUrl: `/profile/${newUser.username}`,
      },
    });

    // Set auth cookie
    await setAuthCookie({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    return NextResponse.json({
      status: "success",
      message: "Account created successfully!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        profileImageUrl: newUser.profileImageUrl,
        rankTier: newUser.rankTier,
        xpPoints: newUser.xpPoints,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
