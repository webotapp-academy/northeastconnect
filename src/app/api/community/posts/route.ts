import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp, getRankFromXp } from "@/lib/gamification";
import { MASTER_ADDAS } from "@/lib/addas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, friends
    const state = searchParams.get("state");
    const adda = searchParams.get("adda");
    const hashtag = searchParams.get("hashtag");

    const currentUser = await getCurrentUser();

    let userIdsFilter: number[] | undefined = undefined;

    if (filter === "friends" && currentUser) {
      const friendships = await db.friendship.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, status: "ACCEPTED" },
            { receiverId: currentUser.id, status: "ACCEPTED" },
          ],
        },
      });

      const friendIds = friendships.map((f) => (f.senderId === currentUser.id ? f.receiverId : f.senderId));
      userIdsFilter = [currentUser.id, ...friendIds];
    }

    const whereClause: any = { status: "Active" };
    if (userIdsFilter) whereClause.userId = { in: userIdsFilter };
    if (state && state !== "All States") whereClause.user = { state };
    if (hashtag) {
      const cleanTag = hashtag.replace(/^#/, "").toLowerCase();
      whereClause.content = { contains: `#${cleanTag}`, mode: "insensitive" };
    }
    if (adda) {
      const cleanAdda = adda.replace(/^n:/, "");
      whereClause.OR = [
        { taggedLocation: { contains: cleanAdda, mode: "insensitive" } },
        { taggedLocation: { contains: adda, mode: "insensitive" } },
        { content: { contains: adda, mode: "insensitive" } },
        { content: { contains: cleanAdda, mode: "insensitive" } },
      ];
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      db.communityPost.findMany({
        where: whereClause,
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
      db.communityPost.count({ where: whereClause }),
    ]);

    const postIds = posts.map((p) => p.id);
    const commentCounts = postIds.length > 0
      ? await db.universalComment.groupBy({
          by: ["entityId"],
          where: {
            entityType: "post",
            entityId: { in: postIds },
            status: "Active",
          },
          _count: {
            _all: true,
          },
        })
      : [];

    const countMap: Record<number, number> = {};
    commentCounts.forEach((c) => {
      countMap[c.entityId] = c._count._all;
    });

    const formatted = posts.map((p) => ({
      ...p,
      commentsCount: countMap[p.id] || 0,
      _count: {
        comments: countMap[p.id] || 0,
      },
      user: {
        ...p.user,
        rankInfo: getRankFromXp(p.user.xpPoints || 0),
      },
    }));

    // Fetch matching news and directory listings for this adda wall
    let relatedNews: any[] = [];
    let relatedDirectory: any[] = [];

    if (adda) {
      const clean = adda.replace(/^n:/, "").toLowerCase();
      const addaDef = MASTER_ADDAS.find(
        (a) => a.name.toLowerCase() === adda.toLowerCase() || a.id === clean
      );
      const keywords = addaDef ? addaDef.keywords : [clean, adda];

      relatedNews = await db.news.findMany({
        where: {
          status: "Published",
          OR: [
            { tags: { contains: adda, mode: "insensitive" } },
            { tags: { contains: clean, mode: "insensitive" } },
            { title: { contains: clean, mode: "insensitive" } },
            { content: { contains: clean, mode: "insensitive" } },
          ],
        },
        orderBy: { publishedDate: "desc" },
        take: 3,
      });

      relatedDirectory = await db.directory.findMany({
        where: {
          status: "Active",
          OR: [
            { city: { contains: clean, mode: "insensitive" } },
            { district: { contains: clean, mode: "insensitive" } },
            { address: { contains: clean, mode: "insensitive" } },
            { businessName: { contains: clean, mode: "insensitive" } },
          ],
        },
        take: 3,
      });
    }

    return NextResponse.json({
      status: "success",
      posts: formatted,
      hasMore: skip + posts.length < totalCount,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore: skip + posts.length < totalCount,
      },
      relatedNews,
      relatedDirectory,
    });
  } catch (error: any) {
    console.error("Community posts GET error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to share a post." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, mediaUrls, taggedLocation, taggedEntityType, taggedEntityId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { status: "error", message: "Post content cannot be empty." },
        { status: 400 }
      );
    }

    // Auto-detect n:addaname in post content if not explicitly tagged
    let finalLocation = taggedLocation?.trim() || null;
    if (!finalLocation) {
      const match = content.match(/(?:^|\s)(n:[a-z0-9_-]+)/i);
      if (match) {
        finalLocation = match[1].toLowerCase();
      }
    }

    const post = await db.communityPost.create({
      data: {
        userId: currentUser.id,
        content: content.trim(),
        mediaUrls: mediaUrls?.trim() || null,
        taggedLocation: finalLocation,
        taggedEntityType: taggedEntityType || null,
        taggedEntityId: taggedEntityId ? parseInt(taggedEntityId, 10) : null,
        status: "Active",
      },
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
    });

    // Extract hashtags (#tag) and upsert into database with usage counts
    const hashtagMatches = content.match(/#([a-zA-Z0-9_]+)/g);
    if (hashtagMatches && hashtagMatches.length > 0) {
      const tagsArray: string[] = hashtagMatches.map((t: string) => t.replace(/^#/, "").toLowerCase().trim());
      const uniqueTags: string[] = Array.from(new Set(tagsArray)).filter((t: string) => t.length > 0 && t.length <= 40);

      for (const tag of uniqueTags) {
        try {
          await db.hashtag.upsert({
            where: { tag },
            update: { count: { increment: 1 } },
            create: { tag, count: 1 },
          });
        } catch (e) {
          console.warn("Hashtag upsert error for tag:", tag, e);
        }
      }
    }

    // Extract mentions (@handle) and send notifications to mentioned users & directory owners
    const mentionMatches = content.match(/@([a-zA-Z0-9_]+)/g);
    if (mentionMatches && mentionMatches.length > 0) {
      const handles: string[] = Array.from(
        new Set(mentionMatches.map((m: string) => m.replace(/^@/, "").toLowerCase().trim()))
      );

      for (const handle of handles) {
        try {
          // 1. Check if handle matches a user
          const mentionedUser = await db.user.findUnique({
            where: { username: handle },
            select: { id: true },
          });

          if (mentionedUser && mentionedUser.id !== currentUser.id) {
            await db.notification.create({
              data: {
                userId: mentionedUser.id,
                actorId: currentUser.id,
                type: "MENTION",
                title: "You were mentioned in a post! 💬",
                message: `@${currentUser.username} mentioned you in a community post.`,
                linkUrl: `/community#post-${post.id}`,
              },
            });
          }

          // 2. Check if handle matches a directory business
          const matchingBusinesses = await db.directory.findMany({
            where: {
              userId: { not: null },
              status: "Active",
            },
            select: {
              id: true,
              businessName: true,
              userId: true,
            },
          });

          for (const biz of matchingBusinesses) {
            const cleanBizHandle = biz.businessName
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "_")
              .replace(/^_+|_+$/g, "")
              .slice(0, 24);

            if (
              (cleanBizHandle === handle || `biz_${biz.id}` === handle) &&
              biz.userId &&
              biz.userId !== currentUser.id
            ) {
              await db.notification.create({
                data: {
                  userId: biz.userId,
                  actorId: currentUser.id,
                  type: "BUSINESS_MENTION",
                  title: `Your business "${biz.businessName}" was mentioned! 🏢`,
                  message: `@${currentUser.username} mentioned your business "${biz.businessName}" in a community post.`,
                  linkUrl: `/community#post-${post.id}`,
                },
              });
            }
          }
        } catch (e) {
          console.warn("Mention notification error for:", handle, e);
        }
      }
    }

    // Award +20 XP
    await awardUserXp(currentUser.id, "POST", 20, "Shared a community post");

    return NextResponse.json({
      status: "success",
      message: "Post published! (+20 XP)",
      post: {
        ...post,
        user: {
          ...post.user,
          rankInfo: getRankFromXp(post.user.xpPoints || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("Community post create error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
