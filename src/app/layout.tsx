import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "North East Connect - Discover Assam & Northeast India",
    template: "%s | North East Connect",
  },
  description:
    "Your comprehensive guide to exploring wildlife sanctuaries, rich cultural heritage, adventure experiences, news, and verified business directory in Assam and Northeast India.",
  keywords: [
    "Assam Tourism",
    "Kaziranga National Park",
    "Northeast India Travel",
    "Bihu Festival",
    "Guwahati Business Directory",
    "Assam News",
    "Majuli Island",
  ],
  authors: [{ name: "North East Connect Editorial Team" }],
  creator: "North East Connect",
  publisher: "North East Connect",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "North East Connect - Discover Assam & Northeast India",
    description:
      "Explore wildlife sanctuaries, rich cultural heritage, adventure experiences, news, and verified business directory across Assam and North East India.",
    siteName: "North East Connect",
    images: [
      {
        url: `${siteUrl}/assets/images/hero.jpg`,
        width: 1200,
        height: 630,
        alt: "North East Connect - Discover Assam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "North East Connect - Discover Assam & Northeast India",
    description:
      "Explore wildlife sanctuaries, rich cultural heritage, adventure experiences, news, and verified business directory across Assam.",
    images: [`${siteUrl}/assets/images/hero.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "googlea178dbe5c5be924d",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "North East Connect",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?term={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "North East Connect",
    url: siteUrl,
    logo: `${siteUrl}/assets/images/logo.png`,
    sameAs: [
      "https://facebook.com/northeastconnect",
      "https://twitter.com/northeastconnect",
      "https://instagram.com/northeastconnect",
    ],
  };

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans antialiased">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
