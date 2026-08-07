import fs from "fs";
import { db } from "../src/lib/db";
import dotenv from "dotenv";

dotenv.config();

function unquote(str) {
  if (!str) return null;
  let s = str.trim();
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.substring(1, s.length - 1);
  }
  s = s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  if (s === "NULL" || s === "null" || s === "" || s === "0000-00-00 00:00:00") return null;
  return s;
}

function parseTuple(tupleStr) {
  let content = tupleStr.trim();
  if (content.startsWith("(")) content = content.substring(1);
  if (content.endsWith(")")) content = content.substring(0, content.length - 1);
  if (content.endsWith(";")) content = content.substring(0, content.length - 1);
  if (content.endsWith(")")) content = content.substring(0, content.length - 1);

  const fields = [];
  let cur = "";
  let inQuote = false;
  let escapeNext = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      cur += char;
      escapeNext = false;
    } else if (char === "\\") {
      cur += char;
      escapeNext = true;
    } else if (char === "'") {
      inQuote = !inQuote;
      cur += char;
    } else if (char === "," && !inQuote) {
      fields.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  fields.push(cur.trim());

  if (fields.length < 15) return null;

  const id = parseInt(fields[0], 10);
  if (isNaN(id)) return null;

  const businessName = unquote(fields[1]) || "Unnamed Business";
  const category = unquote(fields[2]) || "Services";
  const subcategory = unquote(fields[3]);
  const description = unquote(fields[4]);
  const address = unquote(fields[5]);
  const district = unquote(fields[6]) || "Kamrup Metro";
  const city = unquote(fields[7]);
  const contactNumber = unquote(fields[8]);
  const email = unquote(fields[9]);
  const website = unquote(fields[10]);
  const latitude = fields[11] && !isNaN(parseFloat(fields[11])) ? parseFloat(fields[11]) : 0.0;
  const longitude = fields[12] && !isNaN(parseFloat(fields[12])) ? parseFloat(fields[12]) : 0.0;
  const workingHours = unquote(fields[13]);
  const imageUrls = unquote(fields[14]);
  const rating = fields[15] && !isNaN(parseFloat(fields[15])) ? parseFloat(fields[15]) : 0.0;
  const reviewsCount = fields[16] && !isNaN(parseInt(fields[16], 10)) ? parseInt(fields[16], 10) : 0;
  const updatedAtStr = unquote(fields[17]);
  const status = unquote(fields[18]) || "Active";
  const createdAtStr = unquote(fields[19]);
  const facebookPostId = unquote(fields[20]);

  return {
    id,
    businessName,
    category,
    subcategory,
    description,
    address,
    district,
    city,
    contactNumber,
    email,
    website,
    latitude,
    longitude,
    workingHours,
    imageUrls,
    rating,
    reviewsCount,
    status,
    facebookPostId,
    createdAt: createdAtStr ? new Date(createdAtStr) : new Date(),
    updatedAt: updatedAtStr ? new Date(updatedAtStr) : new Date(),
  };
}

async function upsertSingle(item) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await db.directory.upsert({
        where: { id: item.id },
        create: item,
        update: item,
      });
      return;
    } catch (err) {
      if (attempt === 5) {
        console.error(`Failed ID ${item.id} after 5 attempts:`, err.message);
      } else {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
}

async function main() {
  console.log("Reading legacy SQL dump file...");
  const sql = fs.readFileSync("legacy/u638938569_northeast.sql", "utf-8");

  const lines = sql.split("\n");
  const recordsMap = new Map();

  console.log(`Processing ${lines.length} lines of SQL dump...`);

  let inDirectoryInsert = false;
  let currentBuffer = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("INSERT INTO `directory`")) {
      inDirectoryInsert = true;
      currentBuffer = line;
    } else if (inDirectoryInsert) {
      currentBuffer += " " + line;
    }

    if (inDirectoryInsert && line.endsWith(";")) {
      inDirectoryInsert = false;
      
      const valuesIdx = currentBuffer.indexOf("VALUES");
      if (valuesIdx !== -1) {
        const valStr = currentBuffer.substring(valuesIdx + 6).trim();
        const rawTuples = valStr.split(/\),\s*\(/);

        for (let tIdx = 0; tIdx < rawTuples.length; tIdx++) {
          let t = rawTuples[tIdx].trim();
          if (!t.startsWith("(")) t = "(" + t;
          if (!t.endsWith(")")) t = t + ")";
          const rec = parseTuple(t);
          if (rec) {
            recordsMap.set(rec.id, rec);
          }
        }
      }
      currentBuffer = "";
    }
  }

  const allRecords = Array.from(recordsMap.values());
  console.log(`🎉 Parsed ${allRecords.length} UNIQUE directory records from MySQL dump!`);

  const gupta = recordsMap.get(987);
  console.log("Found Dr O.P. Gupta (ID 987):", gupta ? gupta.businessName : "NOT FOUND");

  console.log("Safely upserting 1,759 directory records into PostgreSQL...");
  
  let successCount = 0;
  for (let i = 0; i < allRecords.length; i++) {
    const item = allRecords[i];
    await upsertSingle(item);
    successCount++;
    if (successCount % 100 === 0 || successCount === allRecords.length) {
      console.log(`Progress: ${successCount} / ${allRecords.length} directory records processed...`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Reset sequence
  await db.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('directory', 'id'), COALESCE((SELECT MAX(id) FROM directory), 1));`);

  const finalCount = await db.directory.count();
  console.log(`✅ FINAL TOTAL DIRECTORY LISTINGS IN POSTGRESQL: ${finalCount}`);

  // Verify Dr O.P. Gupta
  const guptaCheck = await db.directory.findUnique({ where: { id: 987 } });
  console.log("Dr O.P. Gupta DB Verification:", guptaCheck ? `SUCCESS! [${guptaCheck.id}] ${guptaCheck.businessName}` : "FAILED");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  });
