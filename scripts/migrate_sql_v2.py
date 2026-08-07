import re
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL missing")
    exit(1)

conn = psycopg2.connect(db_url)
cursor = conn.cursor()

sql_path = "/Users/webotapppvtltd/node_projects/northeastconnect/legacy/u638938569_northeast.sql"
print(f"Reading {sql_path}...")
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

tables = [
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
    "bookings"
]

for table in tables:
    print(f"\nProcessing table: {table}")
    cursor.execute(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE;')
    conn.commit()

    # Find all INSERT statements for table
    pattern = f"INSERT INTO `{table}` \\("
    pos = 0
    total_inserted = 0

    while True:
        idx = content.find(pattern, pos)
        if idx == -1:
            break
        
        # Find ) VALUES
        values_idx = content.find(") VALUES", idx)
        if values_idx == -1:
            break

        cols_str = content[idx + len(pattern) : values_idx]
        cols = [c.strip().strip("`") for c in cols_str.split(",")]
        cols_formatted = ", ".join([f'"{c}"' for c in cols])

        # Find the trailing semicolon of this INSERT statement
        end_idx = content.find(";\n", values_idx)
        if end_idx == -1:
            end_idx = content.find(";\r\n", values_idx)
        if end_idx == -1:
            end_idx = len(content)

        values_block = content[values_idx + 8 : end_idx].strip()
        pos = end_idx + 1

        # Clean MySQL syntax
        clean_values = (
            values_block.replace("\\'", "''")
            .replace('\\"', '"')
            .replace("\\n", "\n")
            .replace("\\r", "\r")
            .replace("\\0", "")
            .replace("\\\\", "\\")
            .replace("'0000-00-00 00:00:00'", "NULL")
            .replace("'0000-00-00'", "NULL")
        )

        sql_cmd = f'INSERT INTO "{table}" ({cols_formatted}) VALUES {clean_values};'

        try:
            cursor.execute(sql_cmd)
            conn.commit()
            total_inserted += cursor.rowcount
        except Exception as e:
            conn.rollback()
            # Try single row fallback if batch fails
            rows = []
            cur_row = ""
            in_str = False
            q_char = None
            in_tuple = False
            
            for i, ch in enumerate(clean_values):
                if in_str:
                    cur_row += ch
                    if ch == q_char and (i == 0 or clean_values[i-1] != '\\'):
                        in_str = False
                else:
                    if ch in ("'", '"'):
                        in_str = True
                        q_char = ch
                        cur_row += ch
                    elif ch == '(':
                        in_tuple = True
                        cur_row = ""
                    elif ch == ')':
                        in_tuple = False
                        if cur_row:
                            rows.append(cur_row)
                    elif in_tuple:
                        cur_row += ch

            for row in rows:
                try:
                    single_sql = f'INSERT INTO "{table}" ({cols_formatted}) VALUES ({row});'
                    cursor.execute(single_sql)
                    conn.commit()
                    total_inserted += 1
                except Exception as se:
                    conn.rollback()

    # Reset sequence
    try:
        cursor.execute(f"SELECT setval(pg_get_serial_sequence('\"{table}\"', 'id'), COALESCE((SELECT MAX(id) FROM \"{table}\"), 1));")
        conn.commit()
    except Exception:
        pass

    cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
    count = cursor.fetchone()[0]
    print(f"✅ Table '{table}': {count} rows successfully imported!")

conn.close()
print("\n🎉 Full migration finished!")
