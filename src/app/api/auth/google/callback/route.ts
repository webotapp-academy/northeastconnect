import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setAuthCookie, hashPassword } from "@/lib/auth";
import { awardUserXp } from "@/lib/gamification";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateRaw = searchParams.get("state");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  let targetRedirect = "/";
  if (stateRaw) {
    try {
      const decoded = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf-8"));
      if (decoded.redirect) targetRedirect = decoded.redirect;
    } catch {
      // Ignored
    }
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "Google authorization was cancelled.")}`, siteUrl)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = `${siteUrl}/api/auth/google/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId || "",
      client_secret: clientSecret || "",
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || (!tokenData.id_token && !tokenData.access_token)) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(tokenData.error_description || "Failed to exchange Google token.")}`, siteUrl)
      );
    }

    let googleUser: any = null;

    if (tokenData.id_token) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`
      );
      if (verifyRes.ok) {
        googleUser = await verifyRes.json();
      }
    }

    if (!googleUser && tokenData.access_token) {
      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userinfoRes.ok) {
        googleUser = await userinfoRes.json();
      }
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.redirect(
        new URL("/login?error=Could not fetch Google profile email.", siteUrl)
      );
    }

    const email = googleUser.email.toLowerCase().trim();
    const fullName = googleUser.name || `${googleUser.given_name || ""} ${googleUser.family_name || ""}`.trim() || null;
    const profileImageUrl = googleUser.picture || null;

    let user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
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

      await awardUserXp(user.id, "DAILY_LOGIN", 5, "Daily Google login").catch(() => null);
    } else {
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

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "User",
    });

    return NextResponse.redirect(new URL(targetRedirect, siteUrl));
  } catch (err: any) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message || "An error occurred during Google sign-in.")}`, siteUrl)
    );
  }
}
