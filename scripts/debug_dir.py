import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

sql_path = "/Users/webotapppvtltd/node_projects/northeastconnect/legacy/u638938569_northeast.sql"
with open(sql_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

pattern = "INSERT INTO `directory` ("
idx = content.find(pattern)
values_idx = content.find(") VALUES", idx)
cols_str = content[idx + len(pattern):values_idx]
cols = ['"' + c.strip().strip("`") + '"' for c in cols_str.split(",")]
cols_formatted = ", ".join(cols)

end_idx = content.find(";\n", values_idx)
values_block = content[values_idx + 8:end_idx].strip()

clean_values = (
    values_block
    .replace("\\'", "''")
    .replace('\\"', '"')
    .replace("\\n", "\n")
    .replace("\\r", "\r")
    .replace("\\0", "")
    .replace("\\\\", "\\")
    .replace("'0000-00-00 00:00:00'", "NULL")
    .replace("'0000-00-00'", "NULL")
)

sql_cmd = f'INSERT INTO "directory" ({cols_formatted}) VALUES {clean_values};'

try:
    cursor.execute(sql_cmd)
    conn.commit()
    print("SUCCESS INSERTING DIRECTORY BATCH 1!")
except Exception as e:
    print("EXACT POSTGRES ERROR ON DIRECTORY:", e)
    conn.rollback()

conn.close()
