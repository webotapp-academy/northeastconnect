import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRankFromXp } from "@/lib/gamification";
import { MASTER_ADDAS } from "@/lib/addas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "users").toLowerCase();
    const q = (searchParams.get("q") || "").trim();
    const state = searchParams.get("state") || "All";
    const category = searchParams.get("category") || "All";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "16", 10)));
    const skip = (page - 1) * limit;

    const currentUser = await getCurrentUser();

    const userSort = (searchParams.get("userSort") || "recent").toLowerCase();

    // 1. USERS / EXPLORERS TAB
    if (type === "users") {
      const where: any = {};

      if (q) {
        where.OR = [
          { username: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { state: { contains: q, mode: "insensitive" } },
          { rankTier: { contains: q, mode: "insensitive" } },
        ];
      }

      if (state && state !== "All" && state !== "All States") {
        where.state = { contains: state, mode: "insensitive" };
      }

      let rawUsers: any[] = [];
      let total = 0;

      const orderBy =
        userSort === "active"
          ? [{ xpPoints: "desc" as const }, { createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }];

      const [usersList, count] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            state: true,
            city: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                communityPosts: true,
                sentFriendships: true,
                receivedFriendships: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        db.user.count({ where }),
      ]);

      rawUsers = usersList;
      total = count;

      // Check friend request status if logged in
      let sentRequestsSet = new Set<number>();
      let friendsSet = new Set<number>();

      if (currentUser) {
        const friendships = await db.friendship.findMany({
          where: {
            OR: [
              { senderId: currentUser.id },
              { receiverId: currentUser.id },
            ],
          },
        });

        friendships.forEach((f) => {
          const otherId = f.senderId === currentUser.id ? f.receiverId : f.senderId;
          if (f.status === "ACCEPTED") {
            friendsSet.add(otherId);
          } else if (f.status === "PENDING" && f.senderId === currentUser.id) {
            sentRequestsSet.add(otherId);
          }
        });
      }

      const users = rawUsers.map((u) => ({
        ...u,
        rankInfo: getRankFromXp(u.xpPoints || 0),
        isMe: currentUser?.id === u.id,
        isFriend: friendsSet.has(u.id),
        hasSentRequest: sentRequestsSet.has(u.id),
      }));

      return NextResponse.json({
        status: "success",
        type: "users",
        total,
        page,
        hasMore: skip + users.length < total,
        data: users,
      });
    }

    // 2. BUSINESSES (DIRECTORY) TAB
    if (type === "directory" || type === "business") {
      const where: any = {
        status: "Active",
      };

      if (q) {
        where.OR = [
          { businessName: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { district: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ];
      }

      if (state && state !== "All" && state !== "All States") {
        where.OR = [
          ...(where.OR || []),
          { district: { contains: state, mode: "insensitive" } },
          { address: { contains: state, mode: "insensitive" } },
          { city: { contains: state, mode: "insensitive" } },
        ];
      }

      if (category && category !== "All") {
        where.category = { contains: category, mode: "insensitive" };
      }

      const [businesses, total] = await Promise.all([
        db.directory.findMany({
          where,
          select: {
            id: true,
            businessName: true,
            category: true,
            address: true,
            district: true,
            city: true,
            contactNumber: true,
            website: true,
            rating: true,
            reviewsCount: true,
            imageUrls: true,
            isClaimed: true,
            createdAt: true,
          },
          orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
          skip,
          take: limit,
        }),
        db.directory.count({ where }),
      ]);

      const formatted = businesses.map((b) => {
        const slug = b.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const firstImg = b.imageUrls ? b.imageUrls.split(",")[0] : null;
        return {
          ...b,
          phone: b.contactNumber,
          image: firstImg,
          state: b.district || b.city || "Northeast India",
          url: `/listing/${slug}-${b.id}`,
        };
      });

      return NextResponse.json({
        status: "success",
        type: "directory",
        total,
        page,
        hasMore: skip + formatted.length < total,
        data: formatted,
      });
    }

    // 3. MARKETPLACE TAB
    if (type === "marketplace") {
      const where: any = {
        status: "Active",
      };

      if (q) {
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { locality: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ];
      }

      if (state && state !== "All" && state !== "All States") {
        where.state = { contains: state, mode: "insensitive" };
      }

      if (category && category !== "All") {
        where.category = category;
      }

      const [items, total] = await Promise.all([
        db.marketplaceListing.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImageUrl: true,
                rankTier: true,
                xpPoints: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        db.marketplaceListing.count({ where }),
      ]);

      return NextResponse.json({
        status: "success",
        type: "marketplace",
        total,
        page,
        hasMore: skip + items.length < total,
        data: items,
      });
    }

    // 4. ADDAS / REGIONAL HUBS TAB
    if (type === "addas" || type === "hubs") {
      let filtered = [...MASTER_ADDAS];

      if (q) {
        const queryClean = q.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.name.toLowerCase().includes(queryClean) ||
            a.title.toLowerCase().includes(queryClean) ||
            a.desc.toLowerCase().includes(queryClean) ||
            a.state.toLowerCase().includes(queryClean)
        );
      }

      if (state && state !== "All" && state !== "All States") {
        filtered = filtered.filter(
          (a) => a.state.toLowerCase().includes(state.toLowerCase())
        );
      }

      return NextResponse.json({
        status: "success",
        type: "addas",
        total: filtered.length,
        page: 1,
        hasMore: false,
        data: filtered,
      });
    }

    // 5. POSTS / DISCUSSIONS TAB
    if (type === "posts") {
      const where: any = {
        status: "Active",
      };

      if (q) {
        where.OR = [
          { content: { contains: q, mode: "insensitive" } },
          { taggedLocation: { contains: q, mode: "insensitive" } },
        ];
      }

      if (state && state !== "All" && state !== "All States") {
        where.taggedLocation = { contains: state, mode: "insensitive" };
      }

      const [posts, total] = await Promise.all([
        db.communityPost.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImageUrl: true,
                rankTier: true,
                xpPoints: true,
                state: true,
                city: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        db.communityPost.count({ where }),
      ]);

      const formatted = posts.map((p) => ({
        ...p,
        user: {
          ...p.user,
          rankInfo: getRankFromXp(p.user.xpPoints || 0),
        },
      }));

      return NextResponse.json({
        status: "success",
        type: "posts",
        total,
        page,
        hasMore: skip + formatted.length < total,
        data: formatted,
      });
    }

    return NextResponse.json({ status: "error", message: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Community discover error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load discovery results" },
      { status: 500 }
    );
  }
}
