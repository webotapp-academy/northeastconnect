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

  let activity = null;
  if (!isNaN(numericId)) {
    activity = await db.adventure.findUnique({
      where: { id: numericId },
    });
  }

  if (!activity) {
    return { title: "Adventure Activity Not Found" };
  }

  const desc = activity.description?.slice(0, 160) || `Experience ${activity.name} in ${activity.location || "Assam"}. Difficulty level, best season, and booking on North East Connect.`;
  const canonicalUrl = `${siteUrl}/adventure/${id}`;

  return {
    title: `${activity.name} - ${activity.location || "Assam"} | Adventure`,
    description: desc,
    keywords: [activity.name, activity.type, activity.location, "Assam Adventure", "Northeast Trekking"].filter(Boolean) as string[],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${activity.name} - ${activity.location || "Assam"} | North East Connect`,
      description: desc,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${activity.name} - ${activity.location || "Assam"}`,
      description: desc,
    },
  };
}

export default async function AdventureDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Extract ID from slug like tawang-trek-1 or 1
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let activity = null;
  if (!isNaN(numericId)) {
    activity = await db.adventure.findUnique({
      where: { id: numericId },
    });
  }

  if (!activity) {
    notFound();
  }

  let images: string[] = ["https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=1200&q=85&auto=format&fit=crop"];
  if (activity.imageUrls) {
    try {
      const parsed = JSON.parse(activity.imageUrls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed.map((img: string) =>
          img.startsWith("http") || img.startsWith("/") ? img : `/assets/images/${img}`
        );
      } else if (typeof parsed === "string") {
        images = [parsed.startsWith("http") || parsed.startsWith("/") ? parsed : `/assets/images/${parsed}`];
      }
    } catch {
      const split = activity.imageUrls.replace(/[\[\]'"]/g, "").split(",");
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
            href="/adventure"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Outdoor Adventures</span>
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 text-xs font-bold rounded-full border border-emerald-800/60 uppercase tracking-wider">
              {activity.type || "Adventure Experience"}
            </span>
            {activity.district && (
              <span className="text-xs text-slate-400 font-medium">
                📍 {activity.district}, Assam
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 leading-tight tracking-tight">
            {activity.name}
          </h1>
        </div>

        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-slate-800 space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4 border-b border-slate-800 pb-4">
              About {activity.name}
            </h2>
            <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">
              {activity.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Location</h3>
              <p className="text-slate-400 text-sm">{activity.location}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Difficulty</h3>
              <span className="inline-block bg-amber-950/80 text-amber-400 border border-amber-800/60 px-3 py-1 rounded-full text-xs font-semibold">
                {activity.difficultyLevel || "Moderate"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Best Season</h3>
              <p className="text-slate-400 text-sm">{activity.bestSeason || "October - April"}</p>
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
                      alt={`${activity.name} photo ${idx + 1}`}
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
              Book This Experience
            </Link>
          </div>
        </div>

        {/* Universal Community Comments */}
        <CommentSection
          entityType="adventure"
          entityId={activity.id}
          entityTitle={activity.name}
          entityUrl={`/adventure/${id}`}
        />
      </div>
    </main>
  );
}
