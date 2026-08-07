import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 60;

export default async function Home() {
  const [packages, latestNews] = await Promise.all([
    db.package.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    db.news.findMany({
      where: { status: "Published" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const defaultDeals = [
    {
      id: 1,
      title: "Kaziranga Safari Package",
      description: "3 Days of wildlife adventure with luxury stay",
      originalPrice: 15000,
      discountedPrice: 10500,
      discountPercentage: 30,
      image: "https://plus.unsplash.com/premium_photo-1661811791855-532fdea19159?w=900&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Cultural Heritage Tour",
      description: "5 Days exploring Majuli and local traditions",
      originalPrice: 20000,
      discountedPrice: 15000,
      discountPercentage: 25,
      image: "https://images.unsplash.com/photo-1698515959329-878121b965aa?w=900&auto=format&fit=crop&q=60",
    },
    {
      id: 3,
      title: "Tea Garden Experience",
      description: "2 Days luxury stay in tea gardens",
      originalPrice: 12000,
      discountedPrice: 7200,
      discountPercentage: 40,
      image: "https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?w=900&auto=format&fit=crop&q=60",
    },
  ];

  const businessCategories = [
    {
      category: "Hospitality & Tourism",
      icon: "🏨",
      subcategories: ["Hotels", "Resorts", "Homestays", "Travel Agencies", "Tour Operators", "Restaurants", "Cafes", "Bars", "Tourist Information Centers"],
    },
    {
      category: "Healthcare",
      icon: "🏥",
      subcategories: ["Hospitals", "Clinics", "Dental Clinics", "Diagnostic Centers", "Pharmacies", "Ayurvedic Centers", "Physiotherapy Clinics", "Mental Health Services"],
    },
    {
      category: "Education",
      icon: "🎓",
      subcategories: ["Schools", "Colleges", "Universities", "Coaching Center", "Language Schools", "Technical Training Institutes", "Online Learning Platforms"],
    },
    {
      category: "Professional Services",
      icon: "💼",
      subcategories: ["Law Firms", "Chartered Accountants", "Consultants", "Digital Marketing Agencies", "IT Services", "Graphic Design", "Wedding Planners", "Event Management"],
    },
    {
      category: "Retail & Shopping",
      icon: "🛍️",
      subcategories: ["Shopping Malls", "Clothing Stores", "Electronics Shops", "Handicraft Stores", "Bookstores", "Supermarkets", "Local Markets", "Jewelry Stores"],
    },
    {
      category: "Arts & Culture",
      icon: "🎨",
      subcategories: ["Art Galleries", "Museums", "Cultural Centers", "Theaters", "Music Schools", "Dance Studios", "Craft Workshops"],
    },
    {
      category: "Agriculture & Local Produce",
      icon: "🌿",
      subcategories: ["Tea Gardens", "Organic Farms", "Agricultural Cooperatives", "Spice Traders", "Local Produce Markets", "Agricultural Equipment Dealers"],
    },
    {
      category: "Technology & Startups",
      icon: "💻",
      subcategories: ["Tech Startups", "Software Companies", "IT Parks", "Coworking Spaces", "Innovation Hubs", "Digital Agencies"],
    },
    {
      category: "Beauty & Fitness",
      icon: "💅",
      subcategories: ["Yoga Studio", "Gym", "Fitness Center", "Beauty Parlors", "Spas", "Wellness Centers", "Hair Salons", "Massage Therapy", "Makeup Artists"],
    },
  ];

  return (
    <main className="w-full">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Assam Landscape"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Discover the Magic of North East India
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            Your gateway to Northeast India&apos;s most enchanting experiences
          </p>

          <HeroSearch />

          {/* Quick Links */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/wildlife" className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
              Popular Destinations
            </Link>
            <Link href="/culture" className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
              Top Experiences
            </Link>
            <Link href="/adventure" className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-300">
              Best Deals
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Featured Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Assam</h2>
            <p className="text-xl text-gray-600">Discover the best of what Assam has to offer</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition duration-500">
              <div className="relative overflow-hidden">
                <img src="/assets/images/1.jpg" alt="Wildlife" className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Wildlife</h3>
                  <p className="text-gray-200 mb-4">Experience the majestic wildlife of Kaziranga</p>
                  <Link href="/wildlife" className="inline-flex items-center text-white font-medium hover:underline">
                    Explore More
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition duration-500">
              <div className="relative overflow-hidden">
                <img src="/assets/images/2.jpg" alt="Culture" className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Culture</h3>
                  <p className="text-gray-200 mb-4">Immerse in rich traditions and festivals</p>
                  <Link href="/culture" className="inline-flex items-center text-white font-medium hover:underline">
                    Explore More
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition duration-500">
              <div className="relative overflow-hidden">
                <img src="/assets/images/3.jpg" alt="Adventure" className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Adventure</h3>
                  <p className="text-gray-200 mb-4">Explore thrilling outdoor activities</p>
                  <Link href="/adventure" className="inline-flex items-center text-white font-medium hover:underline">
                    Explore More
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-semibold text-lg">Limited Time Offers</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Exclusive Deals &amp; Packages</h2>
            <p className="text-xl text-gray-600">Discover incredible savings on your next Assam adventure</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.length > 0
              ? packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition duration-500">
                    <div className="relative">
                      <img src="https://plus.unsplash.com/premium_photo-1661811791855-532fdea19159?w=900&auto=format&fit=crop&q=60" alt={pkg.title} className="w-full h-48 object-cover" />
                      {pkg.discountPercentage && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-xs">
                          {pkg.discountPercentage}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">{pkg.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{pkg.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {pkg.originalPrice && <span className="text-gray-400 line-through text-base mr-2">₹{Number(pkg.originalPrice).toLocaleString()}</span>}
                          <span className="text-2xl font-bold text-emerald-700">
                            ₹{pkg.discountedPrice ? Number(pkg.discountedPrice).toLocaleString() : "Contact"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Per person</span>
                      </div>
                      <Link href="/contact" className="block w-full text-center bg-emerald-700 text-white py-3 rounded-lg hover:bg-emerald-800 transition font-medium">
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))
              : defaultDeals.map((deal) => (
                  <div key={deal.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition duration-500">
                    <div className="relative">
                      <img src={deal.image} alt={deal.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-xs">
                        {deal.discountPercentage}% OFF
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">{deal.title}</h3>
                      <p className="text-gray-600 text-sm">{deal.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-gray-400 line-through text-base mr-2">₹{deal.originalPrice.toLocaleString()}</span>
                          <span className="text-2xl font-bold text-emerald-700">₹{deal.discountedPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-gray-500">Per person</span>
                      </div>
                      <Link href="/contact" className="block w-full text-center bg-emerald-700 text-white py-3 rounded-lg hover:bg-emerald-800 transition font-medium">
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Latest News & Stories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-semibold text-lg uppercase tracking-wider">Exclusive Updates</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Latest News &amp; Stories</h2>
            <p className="text-xl text-gray-600">Discover what’s happening across Assam right now</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {latestNews.map((news) => (
              <article key={news.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col justify-between">
                <div>
                  <img
                    src={news.imageUrls?.split(",")[0] || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60"}
                    alt={news.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6 space-y-3">
                    <div className="text-xs text-gray-500 font-medium">
                      {news.category} &bull; {news.publishedDate ? new Date(news.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-2">{news.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{news.content}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link href={`/news/${news.id}`} className="text-blue-600 font-bold hover:underline inline-flex items-center text-sm">
                    Read more &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Business Directory Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-700 font-semibold text-lg">Discover Local Businesses</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Business Directory of North East India</h2>
            <p className="text-xl text-gray-600">Find the best local businesses across multiple categories</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {businessCategories.map((cat, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition duration-500">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{cat.icon}</span>
                    <h3 className="text-2xl font-bold text-emerald-950">{cat.category}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.subcategories.map((sub, sIdx) => (
                      <Link key={sIdx} href="/directory" className="flex items-center text-gray-700 hover:text-emerald-700 transition">
                        <svg className="w-4 h-4 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{sub}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
