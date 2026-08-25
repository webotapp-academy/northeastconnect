import { db } from "@/lib/db";
import { getRankFromXp } from "@/lib/gamification";
import SocialHomeFeed from "@/components/home/SocialHomeFeed";

export const revalidate = 30;

export default async function Home() {
  const [rawPosts, latestNews, featuredDirectory, rawExplorers, marketplaceDeals] =
    await Promise.all([
      db.communityPost.findMany({
        where: { status: "Active" },
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
          originalPost: {
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
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.news.findMany({
        where: { status: "Published" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          publishedDate: true,
          createdAt: true,
        },
      }),
      db.directory.findMany({
        where: { status: "Active" },
        orderBy: [{ viewsCount: "desc" }, { rating: "desc" }],
        take: 5,
        select: {
          id: true,
          businessName: true,
          category: true,
          district: true,
          rating: true,
        },
      }),
      Promise.all([
        db.user.findMany({
          where: { status: "Active" },
          orderBy: { createdAt: "desc" },
          take: 15,
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            city: true,
            state: true,
            bio: true,
            createdAt: true,
          },
        }),
        db.user.findMany({
          where: { status: "Active" },
          orderBy: { xpPoints: "desc" },
          take: 15,
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            city: true,
            state: true,
            bio: true,
            createdAt: true,
          },
        }),
      ]),
      db.marketplaceListing.findMany({
        where: { status: "Active" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          price: true,
          state: true,
          city: true,
          createdAt: true,
        },
      }),
    ]);

  // Combine: Recently joined profiles on top (randomly shuffled for fresh discovery), followed by top explorers
  const [recentUsers, topXpUsers] = rawExplorers;
  const shuffledRecent = [...recentUsers].sort(() => Math.random() - 0.5);

  const seenIds = new Set<number>();
  const topExplorers: any[] = [];

  for (const u of shuffledRecent) {
    if (!seenIds.has(u.id)) {
      seenIds.add(u.id);
      topExplorers.push(u);
    }
  }

  for (const u of topXpUsers) {
    if (!seenIds.has(u.id)) {
      seenIds.add(u.id);
      topExplorers.push(u);
    }
  }

  const postIds = rawPosts.map((p) => p.id);
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

  const initialPosts = rawPosts.map((p) => {
    const actualCommentCount = countMap[p.id] !== undefined ? countMap[p.id] : (p.commentsCount || 0);
    return {
      ...p,
      commentsCount: actualCommentCount,
      _count: {
        comments: actualCommentCount,
      },
      likesCount: p.likesCount || 0,
      user: {
        ...p.user,
        rankInfo: getRankFromXp(p.user.xpPoints || 0),
      },
    };
  });

  return (
    <>
      {/* Visually hidden — the feed below is entirely client-rendered widgets with no
          marketing hero, so this is the page's only real <h1>. */}
      <h1 className="sr-only">
        Northeast India Community, News &amp; Business Directory — North East Connect
      </h1>
      <SocialHomeFeed
        initialPosts={initialPosts}
        latestNews={latestNews}
        featuredDirectory={featuredDirectory}
        topExplorers={topExplorers}
        marketplaceDeals={marketplaceDeals}
      />
    </>
  );
}
