import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankFromXp } from "@/lib/gamification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { id: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          xpPoints: true,
          rankTier: true,
          state: true,
          city: true,
          createdAt: true,
          _count: {
            select: { comments: true, communityPosts: true, marketplaceListings: true },
          },
        },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      ...u,
      rankInfo: getRankFromXp(u.xpPoints || 0),
    }));

    return NextResponse.json({
      status: "success",
      items: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
