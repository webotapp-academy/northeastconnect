import "dotenv/config";
import { db } from "../src/lib/db";

async function seedMarketplace() {
  console.log("Seeding Northeast Marketplace items...");

  // Find or use user paban or first user
  let user = await db.user.findFirst({
    where: { username: "paban" },
  });

  if (!user) {
    user = await db.user.findFirst();
  }

  if (!user) {
    console.log("No user found in DB to attach listings to.");
    return;
  }

  const sampleListings = [
    {
      title: "Royal Enfield Himalayan 411cc (2022 Model) - Excellent Condition",
      description: "Well maintained Royal Enfield Himalayan 411cc Gravel Grey. Single owner, driven 12,500 kms across Meghalaya and Arunachal. Comes with original pannier mounts, touring seat, and fresh Michelin tyres. Serviced on schedule at Royal Enfield Guwahati. Price slightly negotiable for genuine bikers.",
      price: 185000,
      isNegotiable: true,
      category: "Vehicles & Bikes",
      condition: "Like New",
      state: "Assam",
      city: "Guwahati",
      locality: "GS Road, Christian Basti",
      imageUrls: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80",
      contactPhone: "9864012345",
      contactWhatsApp: "9864012345",
      contactEmail: "explorer@northeastconnect.in",
      viewsCount: 142,
      featured: true,
      userId: user.id,
    },
    {
      title: "Authentic Sualkuchi Pure Muga Silk Mekhela Sador with Traditional Kingkhap Motif",
      description: "Direct from master weavers of Sualkuchi, Assam. 100% pure golden Muga Silk with intricate red and black Guna Kingkhap embroidery work. Natural golden sheen that enhances with every wash. Perfect for Bihu celebrations, traditional weddings, and cultural festivals.",
      price: 24500,
      isNegotiable: true,
      category: "Handlooms & Crafts",
      condition: "Brand New",
      state: "Assam",
      city: "Sualkuchi",
      locality: "Main Silk Weaver Colony",
      imageUrls: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
      contactPhone: "9435012890",
      contactWhatsApp: "9435012890",
      viewsCount: 289,
      featured: true,
      userId: user.id,
    },
    {
      title: "First Flush Organic Assam Orthodox Golden Tips Tea (500g Pack) - Dibrugarh Estate",
      description: "Freshly harvested First Flush Hand-Rolled Golden Tips Orthodox Tea from an organic single estate in Dibrugarh, Upper Assam. Rich malty aroma with subtle honey undertones. Vacuum sealed directly at the estate garden for maximum freshness.",
      price: 1200,
      isNegotiable: false,
      category: "Tea & Agro Products",
      condition: "Brand New",
      state: "Assam",
      city: "Dibrugarh",
      locality: "Heritage Tea Estate",
      imageUrls: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80",
      contactPhone: "9706011223",
      contactWhatsApp: "9706011223",
      viewsCount: 95,
      featured: false,
      userId: user.id,
    },
    {
      title: "Handcrafted Traditional Cane & Bamboo 5-Seater Sofa Set with Coffee Table",
      description: "Eco-friendly, highly durable Assamese Bhaluka bamboo & cane sofa set (3-seater + 2 single armchairs + 1 center coffee table with glass top). Treated against termites and polished with natural gloss lacquer. Made by artisan woodcrafters in Barpeta.",
      price: 18000,
      isNegotiable: true,
      category: "Furniture & Decor",
      condition: "Brand New",
      state: "Assam",
      city: "Barpeta",
      locality: "Cane Craft Village",
      imageUrls: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
      contactPhone: "9954088776",
      contactWhatsApp: "9954088776",
      viewsCount: 168,
      featured: true,
      userId: user.id,
    },
    {
      title: "Apple iPhone 14 (128GB, Midnight Black) - 92% Battery Health",
      description: "Selling my iPhone 14 128GB Midnight. Used with screen protector and case since day 1. Flawless condition, zero scratches or dents. Indian unit with bill and original box and Braided Type-C cable. Selling due to upgrade.",
      price: 46000,
      isNegotiable: true,
      category: "Mobiles & Electronics",
      condition: "Like New",
      state: "Meghalaya",
      city: "Shillong",
      locality: "Police Bazar, Ward Lake Road",
      imageUrls: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
      contactPhone: "9856033445",
      contactWhatsApp: "9856033445",
      viewsCount: 310,
      featured: false,
      userId: user.id,
    },
    {
      title: "Spacious 2 BHK Furnished Apartment for Rent near Zoo Road, Guwahati",
      description: "Ready to move in 2 BHK flat on 3rd floor with lift, dedicated covered car parking, 24/7 running water and power backup. Semi-furnished with modular kitchen, geysers, wardrobes, and balcony facing scenic hills. Family or working professionals preferred.",
      price: 19500,
      isNegotiable: false,
      category: "Properties & Rent",
      condition: "Good",
      state: "Assam",
      city: "Guwahati",
      locality: "Zoo Road Tiniali, RG Baruah Road",
      imageUrls: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
      contactPhone: "9435099887",
      contactWhatsApp: "9435099887",
      viewsCount: 420,
      featured: true,
      userId: user.id,
    },
  ];

  for (const item of sampleListings) {
    const existing = await db.marketplaceListing.findFirst({
      where: { title: item.title },
    });
    if (!existing) {
      await db.marketplaceListing.create({ data: item });
      console.log(`Created: ${item.title}`);
    }
  }

  console.log("Marketplace seed finished successfully!");
}

seedMarketplace().catch(console.error).finally(() => process.exit(0));
