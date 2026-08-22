import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/comments/CommentSection";
import { findAddasForContent } from "@/lib/addas";
import RelatedAddasLinks from "@/components/common/RelatedAddasLinks";
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

  const relatedAddas = findAddasForContent({
    title: culture.name,
    tags: culture.type,
    location: culture.location,
    district: culture.district,
  }).slice(0, 2);

  const rawImages = culture.imageUrls ? culture.imageUrls.split(",") : [];
  const imageList = rawImages.map(formatImageSrc).filter(Boolean);
  const mainImage = imageList[0] || "https://images.unsplash.com/photo-1698515959329-878121b965aa?w=900&auto=format&fit=crop&q=60";

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 font-sans pt-4 sm:pt-6 pb-16">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/culture"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Cultural Heritage</span>
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 text-xs font-bold rounded-full border border-emerald-800/60 uppercase tracking-wider">
              {culture.type || "Cultural Heritage"}
            </span>
            {culture.district && (
              <span className="text-xs text-slate-400 font-medium">
                📍 {culture.district}, Assam
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 leading-tight tracking-tight">
            {culture.name}
          </h1>
          <RelatedAddasLinks addas={relatedAddas} />
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Main Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-800 space-y-4">
              <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-3">
                About {culture.name}
              </h2>
              <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line space-y-3">
                <p>{culture.description || "Explore the rich cultural traditions and heritage of Assam."}</p>
              </div>
            </div>

            {/* Image Gallery */}
            {imageList.length > 0 && (
              <div className="bg-slate-900 rounded-2xl shadow-sm p-6 sm:p-8 border border-slate-800">
                <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-800 pb-3">
                  Photo Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageList.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden shadow-sm border border-slate-800 bg-slate-950">
                      <img
                        src={img}
                        alt={`${culture.name} photo ${idx + 1}`}
                        className="w-full h-52 object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Info Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-800 space-y-5 sticky top-24">
              <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">
                Heritage Highlights
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Type</span>
                  <p className="font-semibold text-slate-200">{culture.type || "Traditional Festival"}</p>
                </div>

                {culture.district && (
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">District / Region</span>
                    <p className="font-semibold text-slate-200">{culture.district}, Assam</p>
                  </div>
                )}

                {culture.startDate && (
                  <div>
                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Festival Dates</span>
                    <p className="font-semibold text-slate-200">
                      {new Date(culture.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {culture.endDate && ` - ${new Date(culture.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Link
                  href="/contact"
                  className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-xl hover:bg-emerald-500 transition font-bold text-center block text-sm shadow-sm"
                >
                  Inquire About Experience
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Universal Community Comments */}
        <CommentSection
          entityType="culture"
          entityId={culture.id}
          entityTitle={culture.name}
          entityUrl={`/culture/${id}`}
        />

        {/* Similar Heritage Grid */}
        {similarCulture.length > 0 && (
          <div className="mt-12 pt-10 border-t border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 text-center">
              More Cultural Traditions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {similarCulture.map((item) => {
                const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                return (
                  <div key={item.id} className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden flex flex-col justify-between p-5 hover:border-slate-700/80 transition">
                    <div>
                      <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-md text-xs font-semibold">
                        {item.type || "Heritage"}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 mt-2 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    </div>
                    <Link
                      href={`/culture/${slug}-${item.id}`}
                      className="text-emerald-400 font-semibold text-xs hover:text-emerald-300 mt-3 block"
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
    </main>
  );
}
