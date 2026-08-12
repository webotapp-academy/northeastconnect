import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
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

  const rawImages = activity.imageUrls ? activity.imageUrls.split(",") : [];
  const images = rawImages.map((img) => {
    const trimmed = img.trim();
    if (!trimmed || trimmed === "null") return "/assets/images/3.jpg";
    if (trimmed.startsWith("http")) return trimmed;
    return `/assets/images/${trimmed}`;
  });

  return (
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-80 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Adventure Details"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {activity.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            {activity.type || "Adventure Experience"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/adventure" className="inline-flex items-center text-sm font-semibold text-orange-600 hover:underline mb-8">
            &larr; Back to Outdoor Adventures
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b pb-4">
                About {activity.name}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {activity.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Location</h3>
                <p className="text-gray-600">{activity.location}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Difficulty</h3>
                <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {activity.difficultyLevel || "Moderate"}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Best Season</h3>
                <p className="text-gray-600">{activity.bestSeason || "October - April"}</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Photo Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden shadow">
                      <img
                        src={img}
                        alt={`${activity.name} photo ${idx + 1}`}
                        className="w-full h-64 object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t flex justify-end">
              <Link
                href="/contact"
                className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition font-bold"
              >
                Book This Experience
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
