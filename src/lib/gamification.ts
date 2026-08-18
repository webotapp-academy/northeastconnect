import { db } from "@/lib/db";
import { getRankFromXp, ACTION_XP_MAP, ActionType } from "@/lib/ranks";

export * from "@/lib/ranks";

export async function awardUserXp(
  userId: number,
  actionType: ActionType,
  customXp?: number,
  metadata?: string,
  actorId?: number
) {
  try {
    const xpToAdd = customXp !== undefined ? customXp : (ACTION_XP_MAP[actionType] || 10);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, xpPoints: true, rankTier: true },
    });

    if (!user) return null;

    const newXp = (user.xpPoints || 0) + xpToAdd;
    const newRank = getRankFromXp(newXp);
    const oldRankTier = user.rankTier || "Explorer Novice";
    const didRankUp = newRank.tier !== oldRankTier;

    // Log the activity
    await db.userActivityLog.create({
      data: {
        userId,
        actionType,
        xpEarned: xpToAdd,
        metadata: metadata || null,
      },
    });

    // Update user record
    await db.user.update({
      where: { id: userId },
      data: {
        xpPoints: newXp,
        rankTier: newRank.tier,
      },
    });

    // If ranked up, send a notification
    if (didRankUp) {
      await db.notification.create({
        data: {
          userId,
          actorId: actorId || null,
          type: "RANK_UP",
          title: `Rank Promoted: ${newRank.tier}! 🎉`,
          message: `Congratulations! You've reached Level ${newRank.level} (${newRank.tier}). Keep exploring and sharing!`,
          linkUrl: `/leaderboard`,
        },
      });
    }

    return {
      newXp,
      rank: newRank,
      didRankUp,
    };
  } catch (error) {
    console.error("Failed to award XP:", error);
    return null;
  }
}
