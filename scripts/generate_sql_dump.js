import fs from "fs";

function escapeSqlStr(str) {
  if (str === null || str === undefined) return "NULL";
  const s = String(str).replace(/'/g, "''");
  return `'${s}'`;
}

function escapeSqlNum(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return String(num);
}

function escapeSqlDate(d) {
  if (!d) return "NOW()";
  try {
    return `'${new Date(d).toISOString()}'`;
  } catch (e) {
    return "NOW()";
  }
}

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

function rowToValuesSql(item) {
  return `(${item.id}, ${escapeSqlStr(item.businessName)}, ${escapeSqlStr(item.category)}, ${escapeSqlStr(item.subcategory)}, ${escapeSqlStr(item.description)}, ${escapeSqlStr(item.address)}, ${escapeSqlStr(item.district)}, ${escapeSqlStr(item.city)}, ${escapeSqlStr(item.contactNumber)}, ${escapeSqlStr(item.email)}, ${escapeSqlStr(item.website)}, ${escapeSqlNum(item.latitude)}, ${escapeSqlNum(item.longitude)}, ${escapeSqlStr(item.workingHours)}, ${escapeSqlStr(item.imageUrls)}, ${escapeSqlNum(item.rating)}, ${escapeSqlNum(item.reviewsCount)}, ${escapeSqlStr(item.status)}, ${escapeSqlStr(item.facebookPostId)}, ${escapeSqlDate(item.createdAt)}, ${escapeSqlDate(item.updatedAt)})`;
}

function main() {
  console.log("Reading legacy SQL dump file...");
  const sql = fs.readFileSync("legacy/u638938569_northeast.sql", "utf-8");

  const lines = sql.split("\n");
  const recordsMap = new Map();

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
  console.log(`🎉 Parsed ${allRecords.length} UNIQUE directory records!`);

  let outSql = "BEGIN;\n";
  
  // Group into batches of 100 per INSERT query
  const batchSize = 100;
  for (let i = 0; i < allRecords.length; i += batchSize) {
    const batch = allRecords.slice(i, i + batchSize);
    const valuesList = batch.map(rowToValuesSql).join(",\n");
    outSql += `INSERT INTO "directory" ("id", "business_name", "category", "subcategory", "description", "address", "district", "city", "contact_number", "email", "website", "latitude", "longitude", "working_hours", "image_urls", "rating", "reviews_count", "status", "facebook_post_id", "created_at", "updated_at") VALUES\n${valuesList}\nON CONFLICT (id) DO UPDATE SET "business_name" = EXCLUDED."business_name", "category" = EXCLUDED."category", "description" = EXCLUDED."description", "address" = EXCLUDED."address", "district" = EXCLUDED."district", "city" = EXCLUDED."city", "contact_number" = EXCLUDED."contact_number", "email" = EXCLUDED."email", "website" = EXCLUDED."website", "latitude" = EXCLUDED."latitude", "longitude" = EXCLUDED."longitude", "working_hours" = EXCLUDED."working_hours", "image_urls" = EXCLUDED."image_urls", "rating" = EXCLUDED."rating", "reviews_count" = EXCLUDED."reviews_count", "status" = EXCLUDED."status";\n\n`;
  }

  outSql += `SELECT setval(pg_get_serial_sequence('directory', 'id'), COALESCE((SELECT MAX(id) FROM directory), 1));\n`;
  outSql += "COMMIT;\n";

  fs.writeFileSync("scripts/directory_dump.sql", outSql, "utf-8");
  console.log("Created high-speed scripts/directory_dump.sql with batched multi-row PostgreSQL inserts!");
}

main();
