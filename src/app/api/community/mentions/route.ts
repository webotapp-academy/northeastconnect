import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export interface MentionItem {
  type: "user" | "business";
  id: number;
  handle: string; // e.g. "paban_bhuyan" or "assam_silk_house"
  name: string;
  avatar: string | null;
  badge: string; // e.g. "Explorer Novice" or "Handlooms • Guwahati"
  linkUrl: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").toLowerCase().replace(/^@/, "").trim();

    // 1. Search Users
    const users = await db.user.findMany({
      where: query
        ? {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { fullName: { contains: query, mode: "insensitive" } },
            ],
            status: "Active",
          }
        : { status: "Active" },
      select: {
        id: true,
        username: true,
        fullName: true,
        profileImageUrl: true,
        rankTier: true,
        state: true,
      },
      take: 6,
      orderBy: { xpPoints: "desc" },
    });

    // 2. Search Businesses / Directory Listings
    const businesses = await db.directory.findMany({
      where: query
        ? {
            OR: [
              { businessName: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
            ],
            status: "Active",
          }
        : { status: "Active" },
      select: {
        id: true,
        businessName: true,
        category: true,
        city: true,
        district: true,
        imageUrls: true,
      },
      take: 6,
    });

    const userResults: MentionItem[] = users.map((u) => ({
      type: "user",
      id: u.id,
      handle: u.username,
      name: u.fullName || `@${u.username}`,
      avatar:
        u.profileImageUrl ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}&backgroundColor=b6e3f4,c0aede`,
      badge: u.rankTier || "Explorer",
      linkUrl: `/profile/${u.username}`,
    }));

    const businessResults: MentionItem[] = businesses.map((b) => {
      // Clean business handle for @mention
      const cleanHandle = b.businessName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 24);

      let firstImg: string | null = null;
      if (b.imageUrls) {
        try {
          if (b.imageUrls.startsWith("[")) {
            const parsed = JSON.parse(b.imageUrls);
            firstImg = parsed[0] || null;
          } else {
            firstImg = b.imageUrls.split(",")[0]?.trim() || null;
          }
        } catch {
          firstImg = b.imageUrls;
        }
      }

      return {
        type: "business",
        id: b.id,
        handle: cleanHandle || `biz_${b.id}`,
        name: b.businessName,
        avatar: firstImg,
        badge: `${b.category || "Business"}${b.city ? ` • ${b.city}` : ""}`,
        linkUrl: `/directory/${b.id}`,
      };
    });

    return NextResponse.json({
      status: "success",
      results: [...userResults, ...businessResults],
    });
  } catch (error: any) {
    console.error("Mention search error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to search mentions" },
      { status: 500 }
    );
  }
}
