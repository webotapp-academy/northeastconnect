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

function stripHtml(htmlStr: string | null | undefined): string {
  if (!htmlStr) return "";
  return htmlStr
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let business = null;
  if (!isNaN(numericId)) {
    business = await db.directory.findUnique({
      where: { id: numericId },
    });
  }

  if (!business) {
    return {
      title: "Business Listing Not Found",
    };
  }

  const cleanDesc =
    stripHtml(business.description).slice(0, 160) ||
    `${business.businessName} located in ${business.district || "Guwahati"}, Assam. Verified business info, address, working hours, and contact details on North East Connect.`;

  const rawImages = business.imageUrls ? business.imageUrls.split(",") : [];
  const mainImage = rawImages[0] ? formatImageSrc(rawImages[0]) : `${siteUrl}/assets/images/hero.jpg`;
  const canonicalUrl = `${siteUrl}/listing/${id}`;

  return {
    title: `${business.businessName} - ${business.district || "Guwahati"}, Assam`,
    description: cleanDesc,
    keywords: [
      business.businessName,
      business.category,
      business.district,
      "Assam Business Directory",
      "Guwahati Businesses",
      "North East Connect",
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${business.businessName} - ${business.district || "Guwahati"}, Assam | North East Connect`,
      description: cleanDesc,
      siteName: "North East Connect",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: business.businessName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${business.businessName} - ${business.district || "Guwahati"}, Assam`,
      description: cleanDesc,
      images: [mainImage],
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Extract numeric ID from slug like dr-op-gupta-ayurvedic-clinic-987 or 987
  const idMatch = id.match(/-(\d+)$/) || [null, id];
  const numericId = parseInt(idMatch[1], 10);

  let business = null;
  if (!isNaN(numericId)) {
    business = await db.directory.findUnique({
      where: { id: numericId },
    });
  }

  if (!business) {
    notFound();
  }

  // Similar businesses in the same category and district matching legacy business-details.php
  const similarBusinesses = await db.directory.findMany({
    where: {
      category: business.category,
      id: { not: business.id },
    },
    take: 3,
  });

  const latitude = business.latitude ? Number(business.latitude) : 26.1445;
  const longitude = business.longitude ? Number(business.longitude) : 91.7362;

  const jsonLdBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.businessName,
    category: business.category,
    telephone: business.contactNumber || undefined,
    email: business.email || undefined,
    url: business.website || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address || undefined,
      addressLocality: business.city || business.district || "Assam",
      addressRegion: "Assam",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    },
  };

  return (
    <main className="w-full bg-gray-50 text-gray-900 font-sans min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBusiness) }}
      />
      {/* Full-screen Hero Section matching legacy business-details.php */}
      <header className="relative min-h-[50vh] flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-600 opacity-80 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Business Details"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {business.businessName}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            {business.category || "Discover Local Businesses"}
          </p>
        </div>
      </header>

      {/* Main Container */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-green-700 hover:underline mb-8">
            &larr; Back to Business Directory
          </Link>

          {/* 1. Main 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Card: Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                Business Information
              </h2>

              <div className="space-y-6">
                {/* Business Name */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <span className="text-xs text-gray-500 block font-medium">Business Name</span>
                    <h3 className="text-xl font-bold text-gray-800">{business.businessName}</h3>
                  </div>
                </div>

                {/* Business Category */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <span className="text-xs text-gray-500 block font-medium">Business Category</span>
                    <p className="text-lg font-semibold text-gray-800">{business.category || "Services"}</p>
                  </div>
                </div>

                {/* District */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="text-xs text-gray-500 block font-medium">District</span>
                    <p className="text-lg font-semibold text-gray-800">{business.district || "Kamrup Metro"}</p>
                  </div>
                </div>

                {/* Full Address */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="text-xs text-gray-500 block font-medium">Full Address</span>
                    <p className="text-lg font-semibold text-gray-800">{business.address || `${business.city || business.district}, Assam`}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {/* Phone Number */}
                  {business.contactNumber && (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <span className="text-xs text-gray-500 block font-medium">Phone Number</span>
                        <p className="text-lg font-semibold text-gray-800">
                          <a href={`tel:${business.contactNumber}`} className="hover:underline text-blue-600">
                            {business.contactNumber}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {business.email && (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span className="text-xs text-gray-500 block font-medium">Email Address</span>
                        <p className="text-lg font-semibold text-gray-800">
                          <a href={`mailto:${business.email}`} className="hover:underline text-green-700">
                            {business.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {business.website && (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 005.656-5.656l-1.1 1.1" />
                      </svg>
                      <div>
                        <span className="text-xs text-gray-500 block font-medium">Website</span>
                        <p className="text-lg font-semibold text-gray-800">
                          <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline">
                            {business.website.replace(/^https?:\/\//, "")}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  {business.workingHours && (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <span className="text-xs text-gray-500 block font-medium">Working Hours</span>
                        <p className="text-lg font-semibold text-gray-800">{business.workingHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Animated CTA Button matching legacy business-details.php */}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-full hover:bg-blue-700 active:bg-blue-800 transition duration-300 flex items-center justify-center font-bold text-lg relative shadow-lg group overflow-hidden"
                >
                  <span className="absolute top-1.5 right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow">
                    Get Offer
                  </span>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* 2. Location Section matching legacy business-details.php */}
          {business.address && (
            <div className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 p-8 pb-4">
                Location
              </h2>
              <div className="w-full relative">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14326.51!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1754830090901`}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="relative z-10"
                />
                <div className="flex flex-wrap justify-center gap-6 py-4 bg-white border-t border-gray-100 text-sm font-semibold">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open in Google Maps
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 13l-6-3" />
                    </svg>
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 3. Similar Businesses Section matching legacy business-details.php */}
          {similarBusinesses.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Similar Businesses
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarBusinesses.map((sim) => {
                  const slug = sim.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  return (
                    <div key={sim.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        <img
                          src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?fit=crop&w=600&h=400&q=80"
                          alt={sim.businessName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-xl font-bold mb-1">
                            {sim.businessName}
                          </h3>
                          <p className="text-white/90 text-sm flex items-center">
                            <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {sim.district || "Assam"}
                          </p>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {sim.category}
                        </span>
                        <Link
                          href={`/listing/${slug}-${sim.id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. About the Business Section matching legacy business-details.php */}
          {business.description && (
            <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                About the Business
              </h2>

              <div className="text-gray-600 leading-relaxed text-base whitespace-pre-line space-y-4">
                <p>{business.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
