export type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
};

/** Lightweight RSS 2.0 / Atom item parser — metadata only, no full article body. */
export function parseRssOrAtom(xml: string): RssItem[] {
  const items: RssItem[] = [];

  if (xml.includes("<entry") || xml.includes(":entry")) {
    const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
    for (const entry of entries) {
      const title = extractTag(entry, "title");
      const link = extractAtomLink(entry);
      const description = extractTag(entry, "summary") || extractTag(entry, "content");
      const pubDate = extractTag(entry, "updated") || extractTag(entry, "published");
      if (title && link) items.push({ title, link, description: stripHtml(description), pubDate });
    }
    return items;
  }

  const rssItems = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const item of rssItems) {
    const title = extractTag(item, "title");
    const link = extractTag(item, "link") || extractAttr(item, "link", "href");
    const description = extractTag(item, "description") || extractTag(item, "content:encoded");
    const pubDate = extractTag(item, "pubDate");
    if (title && link) items.push({ title, link, description: stripHtml(description), pubDate });
  }

  return items;
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  return decodeEntities(m[1].trim());
}

function extractAttr(block: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, "i");
  return block.match(re)?.[1] ?? "";
}

function extractAtomLink(block: string): string {
  const href = extractAttr(block, "link", "href");
  if (href) return href;
  return extractTag(block, "link");
}

function stripHtml(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 500);
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}
