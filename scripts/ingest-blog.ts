/**
 * CLI: fetch RSS metadata from configured sources into content/blog/queue/
 * Run: npm run ingest:blog
 */
import { ingestBlogSources } from "../src/lib/blog/ingestion/ingest";

async function main() {
  console.log("Starting blog source ingestion (metadata only)...");
  const result = await ingestBlogSources();
  console.log(JSON.stringify(result, null, 2));
  console.log("Done. Review queue items before editorial synthesis.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
