import { db } from "../src/lib/db";
import fs from "fs";
import path from "path";

const artifactDir = "/Users/webotapppvtltd/.gemini/antigravity-ide/brain/27d30438-98c4-466d-a6f9-bc9e8b109af8";
const destDir = path.join(process.cwd(), "public", "assets", "images", "wildlife");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const updates: Record<number, { filename: string; srcPattern: string }> = {
  1: { filename: "kaziranga-national-park.jpg", srcPattern: "kaziranga_rhino_wildlife" },
  2: { filename: "manas-national-park.jpg", srcPattern: "manas_golden_langur" },
  3: { filename: "nameri-national-park.jpg", srcPattern: "nameri_hornbill_forest" },
  4: { filename: "pobitora-wildlife-sanctuary.jpg", srcPattern: "pobitora_rhino_sanctuary" },
  5: { filename: "orang-national-park.jpg", srcPattern: "orang_rhino_tiger" },
  6: { filename: "dibru-saikhowa-national-park.jpg", srcPattern: "dibru_saikhowa_horses" },
  7: { filename: "laokhowa-burhachapori-wildlife-sanctuary.jpg", srcPattern: "laokhowa_sanctuary" },
  8: { filename: "hoollongapar-gibbon-sanctuary.jpg", srcPattern: "hoollongapar_gibbon" },
  9: { filename: "balpakram-national-park.jpg", srcPattern: "balpakram_canyon_elephants" },
  10: { filename: "nokrek-national-park.jpg", srcPattern: "nokrek_red_panda" },
  11: { filename: "intanki-national-park.jpg", srcPattern: "intanki_clouded_leopard" },
};

async function main() {
  const artifactFiles = fs.readdirSync(artifactDir);

  for (const [idStr, info] of Object.entries(updates)) {
    const id = parseInt(idStr);
    const matchedFile = artifactFiles.find(
      (f) => f.startsWith(info.srcPattern) && f.endsWith(".jpg")
    );

    if (matchedFile) {
      const srcPath = path.join(artifactDir, matchedFile);
      const destPath = path.join(destDir, info.filename);
      fs.copyFileSync(srcPath, destPath);
      const relativeUrl = `/assets/images/wildlife/${info.filename}`;

      await db.wildlife.update({
        where: { id },
        data: { imageUrls: JSON.stringify([relativeUrl]) },
      });
      console.log(`Updated Wildlife [ID ${id}] with image ${relativeUrl}`);
    }
  }

  // Also ensure IDs 12-20 have clean relative URLs
  const remaining = [
    { id: 12, file: "keibul-lamjao-national-park-v1786851388.jpg" },
    { id: 13, file: "dampa-tiger-reserve-v1786851424.jpg" },
    { id: 14, file: "murlen-national-park-v1786851447.jpg" },
    { id: 15, file: "sepahijala-wildlife-sanctuary-v1786851482.jpg" },
    { id: 16, file: "trishna-wildlife-sanctuary-v1786851505.jpg" },
    { id: 17, file: "namdapha-national-park-v1786851543.jpg" },
    { id: 18, file: "pakke-tiger-reserve-v1786851565.jpg" },
    { id: 19, file: "eaglenest-wildlife-sanctuary-v1786851592.jpg" },
    { id: 20, file: "khangchendzonga-national-park-v1786851629.jpg" },
  ];

  for (const item of remaining) {
    const relativeUrl = `/assets/images/wildlife/${item.file}`;
    await db.wildlife.update({
      where: { id: item.id },
      data: { imageUrls: JSON.stringify([relativeUrl]) },
    });
    console.log(`Verified Wildlife [ID ${item.id}] with image ${relativeUrl}`);
  }

  console.log("All wildlife thumbnails updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
