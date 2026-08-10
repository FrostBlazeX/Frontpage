import Parser from "rss-parser";
import iconv from "iconv-lite";

export interface NormalizedFeedItem {
  id: string;
  title: string;
  link: string;
  author: string;
  publishedAt: string | null;
  excerpt: string;
  content: string;
  imageUrl: string | null;
}

export type FeedFetchResult =
  | {
      ok: true;
      items: NormalizedFeedItem[];
      fetchedAt: string;
      feedTitle: string;
      feedDescription: string;
      siteUrl: string;
    }
  | { ok: false; error: string; fetchedAt: string };

const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const PRIVATE_IP_PATTERN = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/;

// Both /api/feed (for user-added feeds) and /api/validateFeed accept an
// arbitrary caller-supplied URL, which is an unavoidable SSRF-adjacent
// surface once "add any feed by URL" is a feature — these endpoints are
// publicly reachable with no auth. This blocks the obvious literal cases
// (localhost, private IP ranges) by hostname text alone. It does not resolve
// DNS or guard against rebinding attacks; that level of hardening is out of
// scope for this project.
export function isFetchableFeedUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) return false;
  if (PRIVATE_IP_PATTERN.test(hostname)) return false;
  return true;
}

const FETCH_TIMEOUT_MS = 10_000;
const EXCERPT_LENGTH = 280;
// Some real feeds ship entire history (Vercel's changelog atom feed alone has 1000+
// entries) rather than just recent posts. Cap per-feed until pagination/infinite-scroll
// exists — feeds are conventionally already newest-first, so this keeps the latest.
const MAX_ITEMS_PER_FEED = 40;

type CustomItemFields = { contentEncoded?: string };

const parser = new Parser<Record<string, unknown>, CustomItemFields>({
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
});

function detectCharset(contentType: string | null, buffer: Buffer): string {
  const headerMatch = contentType?.match(/charset=([^;]+)/i);
  if (headerMatch) return headerMatch[1].trim().toLowerCase();

  const prolog = buffer.subarray(0, 200).toString("ascii");
  const xmlMatch = prolog.match(/encoding=["']([^"']+)["']/i);
  if (xmlMatch) return xmlMatch[1].trim().toLowerCase();

  return "utf-8";
}

function decodeBuffer(buffer: Buffer, charset: string): string {
  if (charset === "utf-8" || charset === "utf8") {
    return buffer.toString("utf-8");
  }
  if (iconv.encodingExists(charset)) {
    return iconv.decode(buffer, charset);
  }
  return buffer.toString("utf-8");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

// RSS 2.0's <author> is technically "email (Display Name)" — most real feeds only
// populate the name half usefully, so prefer that over showing a raw email string.
function normalizeAuthor(value: string): string {
  const match = value.match(/^\S+@\S+\s+\(([^)]+)\)$/);
  return match ? match[1].trim() : value.trim();
}

// Grid layout needs a thumbnail per card; feed items don't reliably carry
// one. Prefer the standard RSS <enclosure> when it's an image, else fall
// back to the first inline <img> in the article content.
function extractImageUrl(fullContent: string, enclosure?: { url: string; type?: string }): string | null {
  if (enclosure?.type?.startsWith("image/")) return enclosure.url;
  const match = fullContent.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function stableId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export async function fetchAndParseFeed(url: string): Promise<FeedFetchResult> {
  const fetchedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "FrontpageFeedReader/1.0",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      return { ok: false, error: `Feed returned HTTP ${response.status}`, fetchedAt };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const charset = detectCharset(response.headers.get("content-type"), buffer);
    const xml = decodeBuffer(buffer, charset);

    const feed = await parser.parseString(xml);

    const items: NormalizedFeedItem[] = (feed.items ?? []).slice(0, MAX_ITEMS_PER_FEED).map((item) => {
      const fullContent = item.contentEncoded || item.content || item.summary || "";
      const excerptSource = item.contentSnippet || item.summary || fullContent;
      const link = item.link ?? "";
      const title = item.title?.trim() || "Untitled";

      return {
        id: stableId(item.guid || link || title),
        title,
        link,
        author: normalizeAuthor(item.creator || feed.title || "Unknown"),
        publishedAt: normalizeDate(item.isoDate || item.pubDate),
        excerpt: stripHtml(excerptSource).slice(0, EXCERPT_LENGTH),
        content: fullContent,
        imageUrl: extractImageUrl(fullContent, item.enclosure),
      };
    });

    return {
      ok: true,
      items,
      fetchedAt,
      feedTitle: feed.title?.trim() || "Untitled feed",
      feedDescription: stripHtml(feed.description ?? "").slice(0, EXCERPT_LENGTH),
      siteUrl: feed.link || url,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Feed request timed out after 10s"
          : err.message
        : "Unknown error fetching feed";
    return { ok: false, error: message, fetchedAt };
  } finally {
    clearTimeout(timeout);
  }
}
