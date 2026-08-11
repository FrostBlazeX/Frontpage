import { BLOG_FEEDS } from "../src/data/blogs.js";
import { fetchAndParseFeed, isFetchableFeedUrl } from "./_lib/fetchFeed.js";

export interface MinimalApiRequest {
  query: Record<string, string | string[] | undefined>;
}

export interface MinimalApiResponse {
  status(code: number): MinimalApiResponse;
  json(body: unknown): void;
}

// Known curated feeds are looked up by id (a fixed allow-list, no URL
// validation needed). User-added feeds (Feed Management) go through the
// `url` param instead, gated by isFetchableFeedUrl — see that function's
// comment for why some abuse surface here is unavoidable once "add any feed"
// exists, and what is/isn't guarded against.
export default async function handler(req: MinimalApiRequest, res: MinimalApiResponse) {
  const feedId = req.query.feedId;
  const url = req.query.url;

  let feedUrl: string;
  if (typeof feedId === "string") {
    const feed = BLOG_FEEDS.find((f) => f.id === feedId);
    if (!feed) {
      res.status(404).json({ ok: false, error: `Unknown feedId "${feedId}"` });
      return;
    }
    feedUrl = feed.url;
  } else if (typeof url === "string" && isFetchableFeedUrl(url)) {
    feedUrl = url;
  } else {
    res.status(400).json({ ok: false, error: "Provide a known `feedId` or a valid `url`" });
    return;
  }

  const result = await fetchAndParseFeed(feedUrl);
  res.status(result.ok ? 200 : 502).json(result);
}
