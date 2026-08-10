import { fetchAndParseFeed, isFetchableFeedUrl } from "./_lib/fetchFeed.ts";

export interface MinimalApiRequest {
  query: Record<string, string | string[] | undefined>;
}

export interface MinimalApiResponse {
  status(code: number): MinimalApiResponse;
  json(body: unknown): void;
}

// Fetches and parses a user-supplied URL to confirm it's a real RSS/Atom
// feed before the client saves it — returns feed-level metadata only (title,
// description, site URL, item count), never the raw item content, so this
// endpoint can't be used to exfiltrate arbitrary fetched content.
export default async function handler(req: MinimalApiRequest, res: MinimalApiResponse) {
  const url = req.query.url;

  if (typeof url !== "string" || !isFetchableFeedUrl(url)) {
    res.status(400).json({ ok: false, error: "Provide a valid http(s) feed URL" });
    return;
  }

  const result = await fetchAndParseFeed(url);

  if (!result.ok) {
    res.status(502).json({ ok: false, error: result.error });
    return;
  }

  res.status(200).json({
    ok: true,
    feedTitle: result.feedTitle,
    feedDescription: result.feedDescription,
    siteUrl: result.siteUrl,
    itemCount: result.items.length,
  });
}
