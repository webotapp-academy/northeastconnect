import { db } from "../src/lib/db";
import { uploadRemoteImageToR2 } from "../src/lib/storage";

async function migrateNewsImages() {
  console.log("🚀 Starting News Images Migration to Cloudflare R2...");
  const r2Domain = process.env.R2_PUBLIC_DOMAIN || "";
  console.log(`📡 Target R2 Public Domain: ${r2Domain}`);

  const allNews = await db.news.findMany({
    where: {
      imageUrls: { not: null },
    },
    select: {
      id: true,
      title: true,
      imageUrls: true,
    },
    orderBy: { id: "desc" },
  });

  console.log(`Found ${allNews.length} news articles with image records.`);

  let migratedCount = 0;
  let alreadyR2Count = 0;
  let failedCount = 0;

  for (let i = 0; i < allNews.length; i++) {
    const item = allNews[i];
    const originalUrl = item.imageUrls?.trim();

    if (!originalUrl) continue;

    // Check if already on R2
    if (r2Domain && originalUrl.includes(r2Domain)) {
      alreadyR2Count++;
      continue;
    }

    try {
      const urls = originalUrl.split(",").map((u) => u.trim()).filter(Boolean);
      const uploadedUrls: string[] = [];

      for (const u of urls) {
        if (r2Domain && u.includes(r2Domain)) {
          uploadedUrls.push(u);
        } else {
          const r2Url = await uploadRemoteImageToR2(u, { folder: "news" });
          uploadedUrls.push(r2Url);
        }
      }

      const updatedString = uploadedUrls.join(",");

      if (updatedString !== originalUrl) {
        await db.news.update({
          where: { id: item.id },
          data: { imageUrls: updatedString },
        });
        migratedCount++;
        if (migratedCount % 25 === 0 || migratedCount <= 5) {
          console.log(`[${i + 1}/${allNews.length}] ✅ Migrated News #${item.id}: ${item.title.substring(0, 35)}... -> ${uploadedUrls[0]}`);
        }
      }
    } catch (err: any) {
      failedCount++;
      console.error(`❌ Failed on news #${item.id}:`, err?.message || err);
    }
  }

  console.log(`\n🎉 News Images Migration Complete!`);
  console.log(`- Migrated to R2: ${migratedCount}`);
  console.log(`- Already on R2: ${alreadyR2Count}`);
  console.log(`- Failed: ${failedCount}`);
}

migrateNewsImages()
  .catch((err) => {
    console.error("Migration error:", err);
  })
  .finally(() => process.exit(0));
