import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/comments/CommentSection";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let park = null;
  if (!isNaN(numericId)) {
    park = await db.wildlife.findUnique({
      where: { id: numericId },
    });
  }

  if (!park) {
    return { title: "Wildlife Sanctuary Not Found" };
  }

  const desc = park.description?.slice(0, 160) || `Explore ${park.name} in ${park.district || "Assam"}. Wildlife safari, biodiversity, best time to visit on North East Connect.`;
  const canonicalUrl = `${siteUrl}/wildlife/${id}`;

  return {
    title: `${park.name} - ${park.district || "Assam"} | Wildlife Sanctuaries`,
    description: desc,
    keywords: [park.name, park.district, "Assam Wildlife", "National Parks Assam", "Northeast Wildlife"].filter(Boolean) as string[],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${park.name} - ${park.district || "Assam"} | North East Connect`,
      description: desc,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${park.name} - ${park.district || "Assam"}`,
      description: desc,
    },
  };
}

export default async function WildlifeDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Extract ID from slug like kaziranga-national-park-1 or 1
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let park = null;
  if (!isNaN(numericId)) {
    park = await db.wildlife.findUnique({
      where: { id: numericId },
    });
  }

  if (!park) {
    notFound();
  }

  let images: string[] = ["/assets/images/hero.jpg"];
  if (park.imageUrls) {
    try {
      const parsed = JSON.parse(park.imageUrls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed.map((img: string) =>
          img.startsWith("http") || img.startsWith("/") ? img : `/assets/images/${img}`
        );
      } else if (typeof parsed === "string") {
        images = [parsed.startsWith("http") || parsed.startsWith("/") ? parsed : `/assets/images/${parsed}`];
      }
    } catch {
      const split = park.imageUrls.replace(/[\[\]'"]/g, "").split(",");
      if (split.length > 0 && split[0].trim()) {
        images = split
          .map((s) => s.trim())
          .filter(Boolean)
          .map((img) => (img.startsWith("http") || img.startsWith("/") ? img : `/assets/images/${img}`));
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 font-sans pt-4 sm:pt-6 pb-16">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/wildlife"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Wildlife Sanctuaries</span>
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 text-xs font-bold rounded-full border border-emerald-800/60 uppercase tracking-wider">
              National Park &amp; Wildlife
            </span>
            {park.district && (
              <span className="text-xs text-slate-400 font-medium">
                📍 {park.district}, Assam
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 leading-tight tracking-tight">
            {park.name}
          </h1>
        </div>

        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-slate-800 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4 border-b border-slate-800 pb-4">
              About {park.name}
            </h2>
            <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">
              {park.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Location</h3>
              <p className="text-slate-400 text-sm">{park.location || `${park.district}, Assam`}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">District</h3>
              <p className="text-slate-400 text-sm">{park.district}</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Photo Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden shadow-sm border border-slate-800 bg-slate-950">
                    <img
                      src={img}
                      alt={`${park.name} photo ${idx + 1}`}
                      className="w-full h-60 object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <Link
              href="/contact"
              className="bg-emerald-600 text-white px-7 py-3 rounded-2xl hover:bg-emerald-500 transition font-bold text-sm shadow-sm"
            >
              Plan Your Safari
            </Link>
          </div>
        </div>

        {/* Universal Community Comments */}
        <CommentSection
          entityType="wildlife"
          entityId={park.id}
          entityTitle={park.name}
          entityUrl={`/wildlife/${id}`}
        />
      </div>
    </main>
  );
}
