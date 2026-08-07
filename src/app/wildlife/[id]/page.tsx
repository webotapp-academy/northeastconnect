import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
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

  const rawImages = park.imageUrls ? park.imageUrls.split(",") : [];
  const images = rawImages.map((img) => {
    const trimmed = img.trim();
    if (!trimmed || trimmed === "null") return "/assets/images/1.jpg";
    if (trimmed.startsWith("http")) return trimmed;
    return `/assets/images/${trimmed}`;
  });

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
            {park.district || park.location} District, Assam
          </p>
        </div>
      </header>

      {/* Wildlife Details Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/wildlife" className="inline-flex items-center text-sm font-semibold text-green-700 hover:underline mb-8">
            &larr; Back to Wildlife Sanctuaries
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wildlife Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Wildlife Information
              </h2>
              <div className="space-y-4">
                {/* Wildlife Name */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-800">
                    {park.name}
                  </span>
                </div>

                {/* District */}
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-gray-700 mr-2">Location:</span>
                  <span className="text-gray-600">{park.district || park.location}</span>
                </div>

                {/* Entry Fee */}
                {park.entryFee && (
                  <div className="flex items-center text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                      ₹{Number(park.entryFee).toFixed(2)} Entry Fee
                    </span>
                  </div>
                )}

                {/* Opening Hours */}
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 mr-2">Opening Hours:</span>
                  <span className="text-gray-600">{park.openingHours || "Sunrise to Sunset"}</span>
                </div>

                {/* Best Season */}
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 mr-2">Best Season:</span>
                  <span className="text-gray-600">{park.bestSeason || "November - April"}</span>
                </div>

                {/* Conservation Status */}
                {park.conservationStatus && (
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 mr-2">Conservation Status:</span>
                    <span className="text-gray-600">{park.conservationStatus}</span>
                  </div>
                )}

                {/* Animal Species */}
                {park.animalSpecies && (
                  <div className="flex items-start text-sm">
                    <span className="font-semibold text-gray-700 mr-2 min-w-[70px]">Species:</span>
                    <span className="text-gray-600">{park.animalSpecies}</span>
                  </div>
                )}

                {/* Contact Info */}
                {park.contactInfo && (
                  <div className="flex items-center text-sm pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-700 mr-2">Contact:</span>
                    <span className="text-gray-600">{park.contactInfo}</span>
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
                      alt={park.name}
                      className="w-full h-40 object-cover rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                    />
                  ))}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Description</h3>
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                {park.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
