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
        orderBy: { rating: "desc" },
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
        take: 5,
        select: {
          id: true,
          username: true,
          fullName: true,
          profileImageUrl: true,
          rankTier: true,
          xpPoints: true,
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

  const initialPosts = rawPosts.map((p) => ({
    ...p,
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
