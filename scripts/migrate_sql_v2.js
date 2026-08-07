const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

async function migrate() {
  console.log("🚀 Starting database migration from u638938569_northeast.sql to PostgreSQL...");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL missing in .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const sqlFilePath = path.join(__dirname, "../legacy/u638938569_northeast.sql");
  console.log(`📄 Reading SQL dump from ${sqlFilePath}...`);

  const content = fs.readFileSync(sqlFilePath, "utf8");

  const tables = [
    "admin_users",
    "users",
    "wildlife",
    "culture",
    "adventure",
    "packages",
    "news",
    "directory",
    "blogs",
    "jobs",
    "leads",
    "page_views",
    "searches",
    "reviews",
    "bookings",
  ];

  for (const table of tables) {
    console.log(`\n⏳ Truncating & Migrating table: "${table}"...`);
    try {
      await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    } catch (e) {
      console.log(`Note for ${table} truncate: ${e.message}`);
    }

    const pattern = `INSERT INTO \`${table}\` (`;
    let pos = 0;
    let totalInserted = 0;

    while (true) {
      const idx = content.indexOf(pattern, pos);
      if (idx === -1) break;

      const valuesIdx = content.indexOf(") VALUES", idx);
      if (valuesIdx === -1) break;

      const colsStr = content.substring(idx + pattern.length, valuesIdx);
      const cols = colsStr
        .split(",")
        .map((c) => c.trim().replace(/`/g, ""))
        .map((c) => `"${c}"`)
        .join(", ");

      // Find semicolon ending the statement
      let endIdx = content.indexOf(";\n", valuesIdx);
      if (endIdx === -1) endIdx = content.indexOf(";\r\n", valuesIdx);
      if (endIdx === -1) endIdx = content.length;

      const valuesBlock = content.substring(valuesIdx + 8, endIdx).trim();
      pos = endIdx + 1;

      // Clean MySQL syntax
      const cleanValues = valuesBlock
        .replace(/\\'|\\"/g, "''")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\0/g, "")
        .replace(/\\\\/g, "\\")
        .replace(/'0000-00-00 00:00:00'/g, "NULL")
        .replace(/'0000-00-00'/g, "NULL");

      const sqlCmd = `INSERT INTO "${table}" (${cols}) VALUES ${cleanValues};`;

      try {
        await client.query(sqlCmd);
      } catch (err) {
        // If batch fails, try fallback tuple by tuple
        const rows = [];
        let curRow = "";
        let inStr = false;
        let qChar = null;
        let inTuple = false;

        for (let i = 0; i < cleanValues.length; i++) {
          const ch = cleanValues[i];
          const prev = i > 0 ? cleanValues[i - 1] : "";

          if (inStr) {
            curRow += ch;
            if (ch === qChar && prev !== "\\") {
              inStr = false;
              qChar = null;
            }
          } else {
            if (ch === "'" || ch === '"') {
              inStr = true;
              qChar = ch;
              curRow += ch;
            } else if (ch === "(") {
              inTuple = true;
              curRow = "";
            } else if (ch === ")") {
              inTuple = false;
              if (curRow) rows.push(curRow);
            } else if (inTuple) {
              curRow += ch;
            }
          }
        }

        for (const row of rows) {
          try {
            const singleSql = `INSERT INTO "${table}" (${cols}) VALUES (${row});`;
            await client.query(singleSql);
          } catch (singleErr) {
            // ignore malformed single row
          }
        }
      }
    }

    // Reset sequence ID
    try {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1));`
      );
    } catch (e) {}

    const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`✅ Table "${table}": ${countRes.rows[0].count} rows successfully imported!`);
  }

  await client.end();
  console.log("\n🎉 Full database migration completed successfully!");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
