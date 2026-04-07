import os
import psycopg2

# ---------------- CONFIG ----------------
OUTPUT_DIR = "cap_docs_node"
DB_NAME = "cap_docs_rag"
DB_USER = "postgres"
DB_PASSWORD = "1111" # Make sure this matches your Postgres password!
DB_HOST = "localhost"
DB_PORT = "5432"
# ---------------------------------------

def extract_url_from_frontmatter(content: str) -> str:
    """Extracts the source URL from the YAML frontmatter."""
    lines = content.split('\n')
    for line in lines:
        if line.startswith('source:'):
            return line.replace('source:', '').strip()
    return "unknown_source"

def seed_database():
    if not os.path.exists(OUTPUT_DIR):
        print(f"❌ Directory '{OUTPUT_DIR}' not found. Please run your scraper first.")
        return

    # Initialize these as None so the finally block doesn't crash if the connection fails
    conn = None
    cursor = None

    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
        )
        cursor = conn.cursor()
        print("✅ Connected to PostgreSQL.")

        files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.md')]
        print(f"📂 Found {len(files)} Markdown files to process.")

        inserted_count = 0
        updated_count = 0

        for filename in files:
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            source_url = extract_url_from_frontmatter(content)

            query = """
                INSERT INTO knowledge_base_docs (source_url, markdown_content)
                VALUES (%s, %s)
                ON CONFLICT (source_url) 
                DO UPDATE SET 
                    markdown_content = EXCLUDED.markdown_content,
                    last_scraped = CURRENT_TIMESTAMP;
            """
            
            cursor.execute(query, (source_url, content))
            
            if cursor.statusmessage == 'INSERT 0 1':
                inserted_count += 1
            else:
                updated_count += 1

        conn.commit()
        print(f"\n🎉 Database seeding complete!")
        print(f"➕ Inserted new docs: {inserted_count}")
        print(f"🔄 Updated existing docs: {updated_count}")

    except Exception as e:
        # Now we will actually see the real error!
        print(f"❌ Database error: {e}")
        if conn:
            conn.rollback()
    finally:
        # Safely close everything
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_database()