const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

// Tokenizer to safely parse MySQL INSERT statements with embedded quotes & parentheses
function parseInsertStatement(statement) {
  // Find where VALUES starts
  const valuesIdx = statement.search(/\bVALUES\b/i);
  if (valuesIdx === -1) return null;

  const header = statement.substring(0, valuesIdx);
  const valuesPart = statement.substring(valuesIdx + 6).trim();

  // Extract columns from header
  const colMatch = header.match(/INSERT\s+INTO\s+`([^`]+)`\s*\(([^)]+)\)/i);
  if (!colMatch) return null;

  const tableName = colMatch[1];
  const columns = colMatch[2]
    .split(",")
    .map((c) => c.trim().replace(/`/g, ""))
    .map((c) => `"${c}"`)
    .join(", ");

  return { tableName, columns, valuesPart };
}

// Split multi-row VALUES block into individual row tuples
function splitValuesTuples(valuesPart) {
  const rows = [];
  let inString = false;
  let quoteChar = null;
  let current = "";
  let depth = 0;

  // Trim trailing semicolon
  let str = valuesPart.trim();
  if (str.endsWith(";")) {
    str = str.slice(0, -1).trim();
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const prevChar = i > 0 ? str[i - 1] : "";

    if (inString) {
      current += char;
      // Handle escaped quotes \' or ''
      if (char === quoteChar && prevChar !== "\\") {
        // Check for double quote escape ''
        if (i + 1 < str.length && str[i + 1] === quoteChar) {
          current += str[i + 1];
          i++;
        } else {
          inString = false;
          quoteChar = null;
        }
      }
    } else {
      if (char === "'" || char === '"') {
        inString = true;
        quoteChar = char;
        current += char;
      } else if (char === "(") {
        if (depth === 0) {
          current = "";
        } else {
          current += char;
        }
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth === 0) {
          rows.push(current);
          current = "";
        } else {
          current += char;
        }
      } else if (depth > 0) {
        current += char;
      }
    }
  }

  return rows;
}

// Convert a single MySQL row values tuple string into PostgreSQL compliant tuple string
function cleanRowTuple(rowStr) {
  return rowStr
    .replace(/\\'|\\"/g, "''")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\0/g, "")
    .replace(/\\\\/g, "\\")
    .replace(/'0000-00-00 00:00:00'/g, "NULL")
    .replace(/'0000-00-00'/g, "NULL");
}

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

  const fileContent = fs.readFileSync(sqlFilePath, "utf8");

  // Extract all INSERT statements
  const insertStatements = [];
  const lines = fileContent.split(/\r?\n/);
  let currentStmt = "";

  for (const line of lines) {
    if (line.startsWith("INSERT INTO ")) {
      if (currentStmt) {
        insertStatements.push(currentStmt);
      }
      currentStmt = line;
    } else if (currentStmt) {
      currentStmt += "\n" + line;
      if (line.trim().endsWith(";")) {
        insertStatements.push(currentStmt);
        currentStmt = "";
      }
    }
  }
  if (currentStmt) {
    insertStatements.push(currentStmt);
  }

  console.log(`📊 Found total ${insertStatements.length} INSERT statements in SQL dump.`);

  // Group INSERT statements by table name
  const statementsByTable = {};
  for (const stmt of insertStatements) {
    const parsed = parseInsertStatement(stmt);
    if (parsed) {
      if (!statementsByTable[parsed.tableName]) {
        statementsByTable[parsed.tableName] = [];
      }
      statementsByTable[parsed.tableName].push(parsed);
    }
  }

  const tableOrder = [
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

  for (const table of tableOrder) {
    console.log(`\n⏳ Truncating & Migrating table: "${table}"...`);
    try {
      await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    } catch (e) {
      console.log(`Note for ${table} truncate: ${e.message}`);
    }

    const tableStmts = statementsByTable[table] || [];
    let successRows = 0;
    let failedRows = 0;

    for (const stmtObj of tableStmts) {
      const rows = splitValuesTuples(stmtObj.valuesPart);
      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        const cleanedChunk = chunk.map(cleanRowTuple).map((r) => `(${r})`).join(",\n");
        const query = `INSERT INTO "${table}" (${stmtObj.columns}) VALUES ${cleanedChunk};`;

        try {
          await client.query(query);
          successRows += chunk.length;
        } catch (err) {
          // If batch insert fails, try inserting one-by-one to save valid rows
          for (const row of chunk) {
            const singleQuery = `INSERT INTO "${table}" (${stmtObj.columns}) VALUES (${cleanRowTuple(row)});`;
            try {
              await client.query(singleQuery);
              successRows++;
            } catch (singleErr) {
              failedRows++;
            }
          }
        }
      }
    }

    // Reset sequence ID for auto-increment PK
    try {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1));`
      );
    } catch (e) {
      // ignore sequence setting if auto-increment is not serial
    }

    const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`✅ Table "${table}": ${countRes.rows[0].count} rows populated (failures: ${failedRows}).`);
  }

  await client.end();
  console.log("\n🎉 Full database migration from u638938569_northeast.sql completed successfully!");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
