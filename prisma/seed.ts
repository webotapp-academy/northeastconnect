import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Starting seed...");

  // Seed Searches
  await db.search.createMany({
    data: [
      { searchTerm: "Kaziranga", searchCategory: "Wildlife", searchLocation: "Golaghat", searchCount: 45 },
      { searchTerm: "Bihu Festival", searchCategory: "Culture", searchLocation: "Guwahati", searchCount: 78 },
      { searchTerm: "Tea Gardens", searchCategory: "Tourism", searchLocation: "Jorhat", searchCount: 62 },
      { searchTerm: "Majuli Island", searchCategory: "Culture", searchLocation: "Majuli", searchCount: 53 },
      { searchTerm: "Software Jobs", searchCategory: "Jobs", searchLocation: "Guwahati", searchCount: 37 },
      { searchTerm: "River Rafting", searchCategory: "Adventure", searchLocation: "Dibru-Saikhowa", searchCount: 29 },
    ],
  });

  // Seed Wildlife
  await db.wildlife.createMany({
    data: [
      {
        name: "Kaziranga National Park",
        description: "Home to the one-horned rhinoceros and UNESCO World Heritage site",
        location: "Golaghat",
        district: "Golaghat",
        bestSeason: "November-April",
        entryFee: 50.0,
        openingHours: "7:00 AM - 5:00 PM",
        animalSpecies: "One-horned Rhinoceros, Bengal Tiger, Asian Elephant",
        conservationStatus: "UNESCO World Heritage Site",
        contactInfo: "+91 3776 262421",
      },
      {
        name: "Manas National Park",
        description: "Biodiversity hotspot and tiger reserve",
        location: "Baksa",
        district: "Baksa",
        bestSeason: "November-April",
        entryFee: 40.0,
        openingHours: "6:30 AM - 4:30 PM",
        animalSpecies: "Royal Bengal Tiger, Golden Langur, Pygmy Hog",
        conservationStatus: "UNESCO World Heritage Site",
        contactInfo: "+91 3666 274037",
      },
      {
        name: "Pobitora Wildlife Sanctuary",
        description: "High density of one-horned rhinos",
        location: "Morigaon",
        district: "Morigaon",
        bestSeason: "November-April",
        entryFee: 20.0,
        openingHours: "6:00 AM - 4:00 PM",
        animalSpecies: "One-horned Rhinoceros, Wild Buffalo",
        conservationStatus: "Wildlife Sanctuary",
        contactInfo: "+91 3678 225240",
      },
    ],
  });

  // Seed Culture
  await db.culture.createMany({
    data: [
      {
        name: "Bihu Festival",
        type: "Festival",
        description: "Traditional Assamese harvest festival celebrating nature and culture",
        location: "Guwahati",
        district: "Kamrup",
        historicalSignificance: "Celebrated since ancient times",
        culturalImportance: "Marks Assamese New Year",
        contactInfo: "+91 361 2547890",
      },
      {
        name: "Majuli Raas Leela",
        type: "Dance",
        description: "Traditional Krishna dance drama on the river island of Majuli",
        location: "Majuli",
        district: "Majuli",
        historicalSignificance: "Centuries-old Vaishnavite tradition",
        culturalImportance: "Preserves cultural heritage",
        contactInfo: "+91 3775 262421",
      },
    ],
  });

  // Seed Packages
  await db.package.createMany({
    data: [
      {
        title: "Kaziranga Wildlife Safari & Tea Tour",
        type: "Wildlife",
        description: "Experience 4 days in Kaziranga National Park and historic Jorhat tea estates",
        duration: "4 Days / 3 Nights",
        originalPrice: 18000.0,
        discountedPrice: 14999.0,
        discountPercentage: 16,
        locationsCovered: "Kaziranga, Jorhat",
        bestTimeToVisit: "November - April",
        groupSize: "2 - 6 Persons",
      },
      {
        title: "Majuli Cultural Heritage & River Cruise",
        type: "Cultural",
        description: "Explore the world's largest river island, Satras, and local pottery craft",
        duration: "3 Days / 2 Nights",
        originalPrice: 12000.0,
        discountedPrice: 9999.0,
        discountPercentage: 17,
        locationsCovered: "Majuli, Jorhat",
        bestTimeToVisit: "October - March",
        groupSize: "1 - 8 Persons",
      },
    ],
  });

  // Seed Directory
  await db.directory.createMany({
    data: [
      {
        businessName: "Assam Heritage Tea Lodge",
        category: "Hospitality",
        subcategory: "Resort & Hotel",
        description: "Luxury eco-resort nestled near tea plantations in Jorhat",
        address: "Tea Estate Road, Jorhat",
        district: "Jorhat",
        contactNumber: "+91 9876543210",
        email: "contact@assamheritagelodge.com",
        rating: 4.8,
        reviewsCount: 42,
      },
      {
        businessName: "Brahmaputra Adventure Rafting Co.",
        category: "Travel",
        subcategory: "Tour Operator",
        description: "Guided river rafting and camping expeditions along the Brahmaputra",
        address: "Riverside Drive, Guwahati",
        district: "Kamrup",
        contactNumber: "+91 9812345678",
        email: "info@brahmaputraadventures.com",
        rating: 4.9,
        reviewsCount: 56,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
