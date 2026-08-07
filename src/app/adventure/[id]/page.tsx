import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
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
            {activity.district || activity.location} District, Assam
          </p>
        </div>
      </header>

      {/* Adventure Details Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/adventure" className="inline-flex items-center text-sm font-semibold text-orange-600 hover:underline mb-8">
            &larr; Back to Adventure Activities
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Activity Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {activity.name}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 mr-2">Category:</span>
                  <span className="text-gray-600">{activity.type || "Outdoor Adventure"}</span>
                </div>

                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 mr-2">Difficulty:</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                    {activity.difficultyLevel || "Moderate"}
                  </span>
                </div>

                {activity.price && (
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 mr-2">Price per Person:</span>
                    <span className="text-xl font-bold text-green-700">₹{Number(activity.price).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 mr-2">Duration:</span>
                  <span className="text-gray-600">{activity.duration || "Full Day"}</span>
                </div>

                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 mr-2">Best Season:</span>
                  <span className="text-gray-600">{activity.bestSeason || "October - May"}</span>
                </div>

                {activity.includes && (
                  <div className="flex items-start text-sm">
                    <span className="font-semibold text-gray-700 mr-2 min-w-[70px]">Includes:</span>
                    <span className="text-gray-600">{activity.includes}</span>
                  </div>
                )}

                {activity.contactInfo && (
                  <div className="flex items-center text-sm pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-700 mr-2">Contact:</span>
                    <span className="text-gray-600">{activity.contactInfo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Images Grid and Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col">
              {images.length > 0 && (
                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={activity.name}
                      className="w-full h-40 object-cover rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Description</h3>
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                {activity.description}
              </p>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <Link href="/contact" className="bg-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700 transition font-semibold text-sm shadow-md">
                  Book Expedition &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
