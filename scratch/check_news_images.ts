import { db } from "../src/lib/db";

async function main() {
  const news = await db.news.findMany({
    take: 20,
    orderBy: { id: "desc" },
    select: { id: true, title: true, imageUrls: true, status: true, source: true },
  });

  console.log(`Total recent news fetched: ${news.length}`);
  for (const n of news) {
    console.log(`ID: ${n.id} | Title: ${n.title.substring(0, 40)} | Image: ${n.imageUrls}`);
  }

  const allNewsCount = await db.news.count();
  const withImagesCount = await db.news.count({
    where: {
      imageUrls: { not: null },
    },
  });
  console.log(`\nTotal News in DB: ${allNewsCount}, With Images: ${withImagesCount}`);
}

main().catch(console.error).finally(() => process.exit(0));
