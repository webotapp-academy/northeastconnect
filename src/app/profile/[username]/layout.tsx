import { Metadata } from "next";
import { db } from "@/lib/db";
import { isProfileIndexable } from "@/lib/profileIndexing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

interface LayoutProps {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username },
    select: {
      username: true,
      fullName: true,
      bio: true,
      state: true,
      city: true,
      profileImageUrl: true,
      _count: { select: { communityPosts: true, comments: true } },
    },
  });

  if (!user) {
    return { title: "Profile Not Found", robots: { index: false, follow: false } };
  }

  const displayName = user.fullName || `@${user.username}`;
  const location = [user.city, user.state].filter(Boolean).join(", ");
  const shouldIndex = isProfileIndexable(user);

  const description = user.bio
    ? user.bio.slice(0, 155)
    : `${displayName}'s profile on North East Connect${location ? ` — ${location}` : ""}. Follow their posts and activity in the Assam & Northeast India community.`;

  return {
    title: `${displayName} (@${user.username})`,
    description,
    openGraph: {
      title: `${displayName} on North East Connect`,
      description,
      type: "profile",
      url: `${siteUrl}/profile/${user.username}`,
      images: user.profileImageUrl ? [user.profileImageUrl] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/profile/${user.username}`,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default function ProfileUsernameLayout({ children }: LayoutProps) {
  return children;
}
