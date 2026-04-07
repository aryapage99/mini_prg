import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import os
import time
import xml.etree.ElementTree as ET
from urllib.parse import urlparse


# ---------------- CONFIG ----------------
SITEMAP_URL = "https://cap.cloud.sap/docs/sitemap.xml"
OUTPUT_DIR = "cap_docs_node"


TARGET_PATHS = [
   "/docs/node.js/",
   "/docs/cds/",
   "/docs/guides/"
]


EXCLUDE_PATHS = [
   "/docs/java/"
]


HEADERS = {
   "User-Agent": "cap-docs-scraper/1.0"
}


REQUEST_TIMEOUT = 15
REQUEST_DELAY = 0.5
# ---------------------------------------




def fetch_xml(url: str) -> ET.Element:
   resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
   resp.raise_for_status()
   return ET.fromstring(resp.content)




def get_all_urls(sitemap_url: str) -> list[str]:
   """Recursively resolve sitemapindex + urlset."""
   print(f"🔍 Fetching sitemap: {sitemap_url}")


   try:
       root = fetch_xml(sitemap_url)
       ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
       urls = []


       # Case 1: sitemapindex → follow child sitemaps
       sitemap_tags = root.findall("sm:sitemap", ns)
       if sitemap_tags:
           for smap in sitemap_tags:
               loc = smap.find("sm:loc", ns)
               if loc is not None:
                   urls.extend(get_all_urls(loc.text))
           return urls


       # Case 2: urlset → extract URLs
       for loc in root.findall(".//sm:loc", ns):
           urls.append(loc.text)


       return urls


   except Exception as e:
       print(f"❌ Sitemap fetch failed: {e}")
       return []




def is_target_url(url: str) -> bool:
   if not any(p in url for p in TARGET_PATHS):
       return False
   if any(p in url for p in EXCLUDE_PATHS):
       return False
   return True




def clean_html(soup: BeautifulSoup):
   for tag in soup(["script", "style", "nav", "footer", "aside", "noscript"]):
       tag.decompose()
   return soup.find("main") or soup.find("article") or soup.body




def url_to_filename(url: str) -> str:
   path = urlparse(url).path.replace("/docs/", "").strip("/")
   return (path or "index").replace("/", "_") + ".md"




def save_as_markdown(url: str, content):
   if not content:
       return


   filename = url_to_filename(url)
   filepath = os.path.join(OUTPUT_DIR, filename)


   markdown_body = md(str(content), heading_style="ATX")


   final_md = f"""---
source: {url}
subject: SAP CAP Documentation
stack: Node.js / CDS
---


{markdown_body}
"""


   with open(filepath, "w", encoding="utf-8") as f:
       f.write(final_md)


   print(f"✅ Saved: {filename}")




def main():
   os.makedirs(OUTPUT_DIR, exist_ok=True)


   all_urls = get_all_urls(SITEMAP_URL)
   print(f"📄 Total URLs discovered: {len(all_urls)}")


   target_urls = [u for u in all_urls if is_target_url(u)]
   print(f"🚀 Relevant pages selected: {len(target_urls)}")


   for i, url in enumerate(target_urls, 1):
       try:
           print(f"({i}/{len(target_urls)}) Fetching {url}")
           time.sleep(REQUEST_DELAY)


           resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
           if resp.status_code != 200:
               print(f"⚠️ Skipped ({resp.status_code})")
               continue


           soup = BeautifulSoup(resp.text, "lxml")
           content = clean_html(soup)
           save_as_markdown(url, content)


       except Exception as e:
           print(f"❌ Error on {url}: {e}")


   print("\n🎉 Scraping complete. LLM-ready Markdown generated.")
  




if __name__ == "__main__":
   main()





