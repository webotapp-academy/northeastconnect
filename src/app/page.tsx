import { db } from "@/lib/db";
import { getRankFromXp } from "@/lib/gamification";
import SocialHomeFeed from "@/components/home/SocialHomeFeed";

export const revalidate = 30;

export default async function Home() {
  const [rawPosts, latestNews, featuredDirectory, topExplorers, marketplaceDeals] =
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
        },
        orderBy: { createdAt: "desc" },
        take: 20,
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
      db.user.findMany({
        where: { status: "Active" },
        orderBy: { xpPoints: "desc" },
        take: 12,
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
        },
      }),
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

  const initialPosts = rawPosts.map((p) => ({
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

  return (
    <SocialHomeFeed
      initialPosts={initialPosts}
      latestNews={latestNews}
      featuredDirectory={featuredDirectory}
      topExplorers={topExplorers}
      marketplaceDeals={marketplaceDeals}
    />
  );
}
