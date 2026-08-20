import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setAuthCookie, hashPassword } from "@/lib/auth";
import { awardUserXp, getRankFromXp } from "@/lib/gamification";

interface GoogleTokenInfo {
  iss?: string;
  sub?: string;
  azp?: string;
  aud?: string;
  iat?: string;
  exp?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

// Generate unique username from name or email
async function generateUniqueUsername(baseName: string, email: string): Promise<string> {
  const clean = (baseName || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);

  let candidate = clean || "explorer";

  const existing = await db.user.findUnique({
    where: { username: candidate },
  });

  if (!existing) {
    return candidate;
  }

  // Add random number suffix
  for (let i = 0; i < 10; i++) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const suffixed = `${candidate.slice(0, 15)}_${randomSuffix}`;
    const match = await db.user.findUnique({ where: { username: suffixed } });
    if (!match) {
      return suffixed;
    }
  }

  return `${candidate}_${Date.now().toString().slice(-4)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential, accessToken } = body;

    if (!credential && !accessToken) {
      return NextResponse.json(
        { status: "error", message: "Missing Google authorization token." },
        { status: 400 }
      );
    }

    let googleUser: GoogleTokenInfo | null = null;

    if (credential) {
      // 1. Verify Google ID token via Google TokenInfo endpoint
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        return NextResponse.json(
          { status: "error", message: errData.error_description || "Invalid Google ID token." },
          { status: 401 }
        );
      }

      googleUser = await verifyRes.json();
    } else if (accessToken) {
      // 2. Or verify Google UserInfo via Access Token
      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userinfoRes.ok) {
        return NextResponse.json(
          { status: "error", message: "Failed to fetch Google user profile." },
          { status: 401 }
        );
      }

      googleUser = await userinfoRes.json();
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { status: "error", message: "Could not retrieve email from Google." },
        { status: 400 }
      );
    }

    const email = googleUser.email.toLowerCase().trim();
    const fullName = googleUser.name || `${googleUser.given_name || ""} ${googleUser.family_name || ""}`.trim() || null;
    const profileImageUrl = googleUser.picture || null;

    // Check if user exists in database
    let user = await db.user.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (user) {
      // Update missing profile image or verification status
      const updateData: any = {};
      if (!user.profileImageUrl && profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl;
      }
      if (!user.isVerified) {
        updateData.isVerified = true;
      }

      if (Object.keys(updateData).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      // Award daily login XP
      await awardUserXp(user.id, "DAILY_LOGIN", 5, "Daily Google login").catch(() => null);
    } else {
      // Create new user account with +30 welcome bonus XP
      isNewUser = true;
      const username = await generateUniqueUsername(fullName || "", email);
      const dummyPassword = await hashPassword(`google_${Date.now()}_${Math.random()}`);

      user = await db.user.create({
        data: {
          username,
          email,
          fullName,
          profileImageUrl,
          passwordHash: dummyPassword,
          role: "User",
          status: "Active",
          isVerified: true,
          xpPoints: 30,
          rankTier: "Explorer Novice",
        },
      });
    }

    // Set secure authentication session cookie
    await setAuthCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "User",
    });

    return NextResponse.json({
      status: "success",
      message: isNewUser
        ? "Welcome to North East Connect! Your account has been created. (+30 XP)"
        : "Successfully signed in with Google!",
      isNewUser,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        xpPoints: user.xpPoints,
        rankTier: user.rankTier,
        rankInfo: getRankFromXp(user.xpPoints || 0),
      },
    });
  } catch (error: any) {
    console.error("Google Sign-In API error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Internal server error during Google Sign-In" },
      { status: 500 }
    );
  }
}
