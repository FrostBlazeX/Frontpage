import type { BlogFeed } from "../types/feed";

export interface OpmlFeedEntry {
  name: string;
  url: string;
  siteUrl: string;
  category: string;
}

// Case-insensitive attribute lookup — real-world OPML (including the
// provided sample-feeds.opml) mixes xmlUrl/xmlurl and htmlUrl/htmlurl.
function attr(el: Element, name: string): string | undefined {
  for (const a of el.attributes) {
    if (a.name.toLowerCase() === name.toLowerCase()) return a.value;
  }
  return undefined;
}

function siteUrlFromFeedUrl(feedUrl: string): string {
  try {
    return new URL(feedUrl).origin;
  } catch {
    return feedUrl;
  }
}

// An <outline> with an xmlUrl (any case) is a feed; anything else is a
// category container to recurse into, however deeply nested — the nearest
// enclosing category name is what a feed under it gets tagged with.
function walk(el: Element, categoryName: string, entries: OpmlFeedEntry[]): void {
  for (const child of Array.from(el.children)) {
    if (child.tagName.toLowerCase() !== "outline") continue;

    const xmlUrl = attr(child, "xmlUrl");
    if (xmlUrl) {
      const name = attr(child, "title") || attr(child, "text") || xmlUrl;
      entries.push({
        name,
        url: xmlUrl,
        siteUrl: attr(child, "htmlUrl") || siteUrlFromFeedUrl(xmlUrl),
        category: categoryName,
      });
    } else {
      const nextCategory = attr(child, "title") || attr(child, "text") || categoryName;
      walk(child, nextCategory, entries);
    }
  }
}

const DEFAULT_CATEGORY = "Uncategorized";

export function parseOpml(xml: string): OpmlFeedEntry[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("That file doesn't look like valid OPML/XML.");
  }
  const body = doc.querySelector("body") ?? doc.documentElement;
  const entries: OpmlFeedEntry[] = [];
  walk(body, DEFAULT_CATEGORY, entries);
  return entries;
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Preserves category structure: one top-level <outline> per category,
// containing that category's feeds as nested outlines.
export function buildOpml(feeds: BlogFeed[], categoryOrder: string[]): string {
  const byCategory = new Map<string, BlogFeed[]>();
  for (const feed of feeds) {
    const list = byCategory.get(feed.category) ?? [];
    list.push(feed);
    byCategory.set(feed.category, list);
  }

  const orderedCategories = [
    ...categoryOrder.filter((c) => byCategory.has(c)),
    ...Array.from(byCategory.keys()).filter((c) => !categoryOrder.includes(c)),
  ];

  const body = orderedCategories
    .map((category) => {
      const items = (byCategory.get(category) ?? [])
        .map(
          (feed) =>
            `      <outline type="rss" text="${escapeXmlAttr(feed.name)}" title="${escapeXmlAttr(feed.name)}" xmlUrl="${escapeXmlAttr(feed.url)}" htmlUrl="${escapeXmlAttr(feed.siteUrl)}" />`,
        )
        .join("\n");
      return `    <outline text="${escapeXmlAttr(category)}" title="${escapeXmlAttr(category)}">\n${items}\n    </outline>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>Frontpage Subscriptions</title>\n    <dateCreated>${new Date().toISOString()}</dateCreated>\n  </head>\n  <body>\n${body}\n  </body>\n</opml>\n`;
}
