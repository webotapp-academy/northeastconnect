export const MIN_ACTIVITY_FOR_INDEX = 3;

export function isProfileIndexable(user: {
  bio?: string | null;
  profileImageUrl?: string | null;
  _count: { communityPosts: number; comments: number };
}): boolean {
  const activityCount = user._count.communityPosts + user._count.comments;
  const hasCompletedProfile = Boolean(user.bio && user.profileImageUrl);
  return activityCount >= MIN_ACTIVITY_FOR_INDEX || hasCompletedProfile;
}
