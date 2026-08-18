import { db } from "../src/lib/db";

const adventureImages: Record<number, string[]> = {
  1: ["https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=1200&q=85&auto=format&fit=crop"],
  2: ["/assets/images/wildlife/kaziranga-national-park.jpg"],
  3: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85&auto=format&fit=crop"],
  4: ["/assets/images/wildlife/nameri-national-park.jpg"],
  5: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=85&auto=format&fit=crop"],
  6: ["https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=85&auto=format&fit=crop"],
  7: ["https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=1200&q=85&auto=format&fit=crop"],
  8: ["/assets/images/wildlife/dibru-saikhowa-national-park.jpg"],
  9: ["https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&q=85&auto=format&fit=crop"],
  10: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=85&auto=format&fit=crop"],
  11: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85&auto=format&fit=crop"],
  12: ["https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&q=85&auto=format&fit=crop"],
  13: ["/assets/images/wildlife/laokhowa-burhachapori-wildlife-sanctuary.jpg"],
  14: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85&auto=format&fit=crop"],
  15: ["https://images.unsplash.com/photo-1599561046251-bfb9465b4c44?w=1200&q=85&auto=format&fit=crop"],
  16: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop"],
  17: ["/assets/images/wildlife/manas-national-park.jpg"],
  18: ["https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=85&auto=format&fit=crop"],
  19: ["https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&q=85&auto=format&fit=crop"],
  20: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85&auto=format&fit=crop"],
};

async function main() {
  for (const [idStr, urls] of Object.entries(adventureImages)) {
    const id = parseInt(idStr);
    await db.adventure.update({
      where: { id },
      data: { imageUrls: JSON.stringify(urls) },
    });
    console.log(`Updated Adventure [ID ${id}] with image ${urls[0]}`);
  }
  console.log("All adventure images updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
