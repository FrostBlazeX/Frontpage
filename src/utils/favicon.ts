// Google's favicon service needs no API key/backend and resolves a site's
// favicon from its domain alone, so it works for both curated and
// user-added feeds without us having to scrape <link rel="icon"> ourselves.
export function getFaviconUrl(siteUrl: string): string {
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(siteUrl)}`;
}
