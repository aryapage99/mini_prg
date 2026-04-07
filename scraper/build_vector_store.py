import os
import psycopg2
import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import MarkdownTextSplitter

# ---------------- CONFIG ----------------
DB_NAME = "cap_docs_rag"
DB_USER = "postgres"
DB_PASSWORD = "1111" # Update this!
DB_HOST = "localhost"
DB_PORT = "5432"

CHROMA_DB_DIR = "../cap-docs-backend/chroma_db" # Saving it directly in the backend folder
COLLECTION_NAME = "sap_cap_docs"
# ---------------------------------------

def build_vector_store():
    # 1. Connect to PostgreSQL to get the data
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
        cursor = conn.cursor()
        cursor.execute("SELECT doc_id, source_url, markdown_content FROM knowledge_base_docs WHERE markdown_content IS NOT NULL;")
        documents = cursor.fetchall()
        print(f"✅ Fetched {len(documents)} documents from PostgreSQL.")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

    # 2. Initialize ChromaDB
    print("Initializing ChromaDB...")
    # This creates a persistent local database folder
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    
    # We use Chroma's default embedding model (all-MiniLM-L6-v2) which is small, fast, and runs locally
    default_ef = embedding_functions.DefaultEmbeddingFunction()
    
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=default_ef
    )

    # 3. Setup the Markdown Splitter
    # We chunk by 1000 characters with a 200 character overlap so context isn't lost between chunks
    splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=200)

    print("Chunking documents and generating embeddings. This might take a minute...")
    
    total_chunks = 0
    
    # 4. Process and Insert
    for doc_id, source_url, content in documents:
        # Split the markdown into chunks
        chunks = splitter.split_text(content)
        
        if not chunks:
            continue

        chunk_ids = [f"doc_{doc_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{"source_url": source_url, "doc_id": doc_id} for _ in chunks]

        # Add to ChromaDB (it automatically handles the embedding generation here)
        collection.upsert(
            documents=chunks,
            metadatas=metadatas,
            ids=chunk_ids
        )
        total_chunks += len(chunks)

    print(f"🎉 Vector store built successfully!")
    print(f"Total chunks stored: {total_chunks}")
    print(f"Vector Database saved to: {CHROMA_DB_DIR}")

if __name__ == "__main__":
    build_vector_store()