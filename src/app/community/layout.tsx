import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export const metadata: Metadata = {
  title: "Assam & Northeast India Community — Discover People, Addas & Local Events",
  description:
    "Discover local explorers, community threads, regional Adda hubs, verified businesses, and marketplace ads across Assam and Northeast India. Search by city, state, or interest.",
  keywords: [
    "assam community",
    "guwahati events",
    "northeast india community",
    "discover people guwahati",
    "assam local groups",
  ],
  openGraph: {
    title: "Assam & Northeast India Community — North East Connect",
    description:
      "Discover local explorers, community threads, regional Adda hubs, verified businesses, and marketplace ads across Assam and Northeast India.",
    type: "website",
    url: `${siteUrl}/community`,
  },
  alternates: {
    canonical: `${siteUrl}/community`,
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
