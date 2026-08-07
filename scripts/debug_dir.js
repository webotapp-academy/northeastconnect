const fs = require("fs");
const { Client } = require("pg");
require("dotenv").config();

async function test() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const content = fs.readFileSync("/Users/webotapppvtltd/node_projects/northeastconnect/legacy/u638938569_northeast.sql", "utf8");
  const pattern = "INSERT INTO `directory` (";
  const idx = content.indexOf(pattern);
  const valuesIdx = content.indexOf(") VALUES", idx);
  const colsStr = content.substring(idx + pattern.length, valuesIdx);
  const cols = colsStr.split(",").map(c => `"${c.trim().replace(/`/g, "")}"`).join(", ");

  let endIdx = content.indexOf(";\n", valuesIdx);
  if (endIdx === -1) endIdx = content.indexOf(";\r\n", valuesIdx);

  const valuesBlock = content.substring(valuesIdx + 8, endIdx).trim();

  const cleanValues = valuesBlock
    .replace(/\\'/g, "''")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\0/g, "")
    .replace(/\\\\/g, "\\")
    .replace(/'0000-00-00 00:00:00'/g, "NULL")
    .replace(/'0000-00-00'/g, "NULL");

  const sqlCmd = `INSERT INTO "directory" (${cols}) VALUES ${cleanValues};`;

  try {
    await client.query(sqlCmd);
    console.log("SUCCESS INSERTING DIRECTORY BATCH 1!");
  } catch (err) {
    console.log("EXACT POSTGRES ERROR ON DIRECTORY:", err.message);
  }
  await client.end();
}

test();
