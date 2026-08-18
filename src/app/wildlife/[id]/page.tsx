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
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-600 opacity-80 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Wildlife Details"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {park.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            {park.district}, Assam
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/wildlife" className="inline-flex items-center text-sm font-semibold text-green-700 hover:underline mb-8">
            &larr; Back to Wildlife Sanctuaries
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b pb-4">
                About {park.name}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {park.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Location</h3>
                <p className="text-gray-600">{park.location || `${park.district}, Assam`}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">District</h3>
                <p className="text-gray-600">{park.district}</p>
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
                        alt={`${park.name} photo ${idx + 1}`}
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
                className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-bold"
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
      </div>
    </main>
  );
}
