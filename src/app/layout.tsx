import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileAppBottomNav from "@/components/layout/MobileAppBottomNav";
import AddToHomeScreenBanner from "@/components/common/AddToHomeScreenBanner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "North East Connect - Northeast India Community & Social Hub",
    template: "%s | North East Connect",
  },
  description:
    "Join the vibrant community of Assam and Northeast India. Share moments, connect with local explorers, discover top regional businesses, wildlife sanctuaries, cultural stories, and live news.",
  keywords: [
    "Northeast India Social Network",
    "Assam Community",
    "Northeast India Travel",
    "Kaziranga National Park",
    "Guwahati Business Directory",
    "Assam News",
    "Majuli Island Culture",
  ],
  authors: [{ name: "North East Connect Community" }],
  creator: "North East Connect",
  publisher: "North East Connect",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "North East Connect - Northeast India Community & Social Hub",
    description:
      "Connect with local explorers, share posts, discover verified businesses, culture, news, and travel gems across Northeast India.",
    siteName: "North East Connect",
    images: [
      {
        url: `${siteUrl}/assets/images/hero.jpg`,
        width: 1200,
        height: 630,
        alt: "North East Connect - Northeast India Community Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "North East Connect - Northeast India Community & Social Hub",
    description:
      "Connect with local explorers, share posts, discover verified businesses, culture, and news across Northeast India.",
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
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Instant Anti-FOUC Theme Script (Loads by default according to computer theme) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('nec-theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || ((!saved || saved === 'system') && systemDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />

        {/* Google AdSense (Strictly manual inline banners only, no auto-ad popups/vignettes) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9957106792444386"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="adsense-disable-auto-ads" strategy="afterInteractive">
          {`
            (window.adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-9957106792444386",
              enable_page_level_ads: false,
              overlays: { bottom: false, top: false }
            });
          `}
        </Script>

        {/* Google Analytics GA4 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-N02BLD55G8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N02BLD55G8');
          `}
        </Script>
      </head>
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <AddToHomeScreenBanner />
          <div className="flex-1 flex flex-col pb-20 lg:pb-0 w-full max-w-full overflow-x-hidden">{children}</div>
          <Footer />
          <MobileAppBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
