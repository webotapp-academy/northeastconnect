import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

function formatImageSrc(imgStr: string): string {
  if (!imgStr) return "";
  const trimmed = imgStr.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/assets/images/${trimmed}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let culture = null;
  if (!isNaN(numericId)) {
    culture = await db.culture.findUnique({
      where: { id: numericId },
    });
  }

  if (!culture) {
    return { title: "Cultural Heritage Not Found" };
  }

  const desc = culture.description?.slice(0, 160) || `Experience ${culture.name} in ${culture.district || "Assam"}. Festival dates, history, and cultural heritage on North East Connect.`;
  const canonicalUrl = `${siteUrl}/culture/${id}`;

  return {
    title: `${culture.name} - ${culture.district || "Assam"} | Cultural Heritage`,
    description: desc,
    keywords: [culture.name, culture.type, culture.district, "Assam Culture", "Bihu Festival", "Northeast Heritage"].filter(Boolean) as string[],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${culture.name} - ${culture.district || "Assam"} | North East Connect`,
      description: desc,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${culture.name} - ${culture.district || "Assam"}`,
      description: desc,
    },
  };
}

export default async function CultureDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Extract numeric ID from slug like bihu-festival-1 or 1
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let culture = null;
  if (!isNaN(numericId)) {
    culture = await db.culture.findUnique({
      where: { id: numericId },
    });
  }

  if (!culture) {
    notFound();
  }

  // Similar culture items
  const similarCulture = await db.culture.findMany({
    where: {
      id: { not: culture.id },
    },
    take: 3,
  });

  const rawImages = culture.imageUrls ? culture.imageUrls.split(",") : [];
  const imageList = rawImages.map(formatImageSrc).filter(Boolean);
  const mainImage = imageList[0] || "https://images.unsplash.com/photo-1698515959329-878121b965aa?w=900&auto=format&fit=crop&q=60";

  return (
    <main className="w-full bg-gray-50 text-gray-900 font-sans min-h-screen">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[50vh] flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-900 opacity-85 z-10" />
          <img
            src={mainImage}
            alt={culture.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-purple-200 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            {culture.type || "Cultural Heritage"}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {culture.name}
          </h1>
          {culture.district && (
            <p className="text-xl text-purple-200 mb-8 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {culture.district}, Assam
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/culture" className="inline-flex items-center text-sm font-semibold text-purple-700 hover:underline mb-8">
            &larr; Back to Cultural Heritage
          </Link>

          {/* 2-Column Details Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Main Card */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">
                  About {culture.name}
                </h2>
                <div className="text-gray-700 leading-relaxed text-base whitespace-pre-line space-y-4">
                  <p>{culture.description || "Explore the rich cultural traditions and heritage of Assam."}</p>
                </div>
              </div>

              {/* Image Gallery */}
              {imageList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Photo Gallery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageList.map((img, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden shadow border border-gray-100">
                        <img
                          src={img}
                          alt={`${culture.name} photo ${idx + 1}`}
                          className="w-full h-56 object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar Info Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
                  Heritage Highlights
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Type</span>
                    <p className="font-semibold text-gray-800">{culture.type || "Traditional Festival"}</p>
                  </div>

                  {culture.district && (
                    <div>
                      <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider">District / Region</span>
                      <p className="font-semibold text-gray-800">{culture.district}, Assam</p>
                    </div>
                  )}

                  {culture.startDate && (
                    <div>
                      <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider">Festival Dates</span>
                      <p className="font-semibold text-gray-800">
                        {new Date(culture.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {culture.endDate && ` - ${new Date(culture.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Link
                    href="/contact"
                    className="w-full bg-purple-700 text-white py-3 px-4 rounded-xl hover:bg-purple-800 transition font-bold text-center block shadow"
                  >
                    Inquire About Experience
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Heritage Grid */}
          {similarCulture.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                More Cultural Traditions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarCulture.map((item) => {
                  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col justify-between p-6">
                      <div>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                          {item.type || "Heritage"}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 mt-2 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <Link
                        href={`/culture/${slug}-${item.id}`}
                        className="text-purple-700 font-bold text-xs hover:underline mt-4 block"
                      >
                        Explore &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
