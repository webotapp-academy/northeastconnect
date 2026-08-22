import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export const metadata: Metadata = {
  title: "Explore Northeast Addas — Assam & Northeast India Community Groups",
  description:
    "Browse every local Adda on North East Connect — city hubs like Guwahati and Shillong, nature and wildlife circles, culture and heritage groups, and topic-based communities across Assam and the Northeast.",
  keywords: [
    "assam community",
    "northeast india community groups",
    "guwahati adda",
    "assam whatsapp group",
    "northeast india social groups",
  ],
  openGraph: {
    title: "Explore Northeast Addas — North East Connect",
    description:
      "Browse every local Adda on North East Connect — city hubs, nature circles, culture groups, and topic-based communities across Assam and the Northeast.",
    type: "website",
    url: `${siteUrl}/addas`,
  },
  alternates: {
    canonical: `${siteUrl}/addas`,
  },
};

export default function AddasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
