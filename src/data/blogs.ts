import type { BlogFeed } from "../types/feed.ts";

// Sourced from data/sample-feeds.json (the spec's curated set). The two
// `edgeCases` entries in that file (dead feed, duplicate) are for OPML-import
// testing, not the live dashboard, so they're excluded here.
export const BLOG_FEEDS: BlogFeed[] = [
  // Frontend
  {
    id: "css-tricks",
    name: "CSS-Tricks",
    url: "https://css-tricks.com/feed/",
    siteUrl: "https://css-tricks.com/",
    category: "Frontend",
    color: "#D6432E",
  },
  {
    id: "smashing",
    name: "Smashing Magazine",
    url: "https://www.smashingmagazine.com/feed/",
    siteUrl: "https://www.smashingmagazine.com/",
    category: "Frontend",
    color: "#E8524A",
  },

  // Design
  {
    id: "sidebar",
    name: "Sidebar.io",
    url: "https://sidebar.io/feed.xml",
    siteUrl: "https://sidebar.io/",
    category: "Design",
    color: "#DB2777",
  },
  {
    id: "nng",
    name: "Nielsen Norman Group",
    url: "https://www.nngroup.com/feed/rss/",
    siteUrl: "https://www.nngroup.com/",
    category: "Design",
    color: "#C2410C",
  },

  {
    id: "ux-collective",
    name: "UX Collective",
    url: "https://uxdesign.cc/feed",
    siteUrl: "https://uxdesign.cc/",
    category: "Design",
    color: "#0D9488",
  },

  // Backend & DevOps
  {
    id: "cloudflare",
    name: "Cloudflare Blog",
    url: "https://blog.cloudflare.com/rss/",
    siteUrl: "https://blog.cloudflare.com/",
    category: "Backend & DevOps",
    color: "#C2540A",
  },
  {
    id: "vercel",
    name: "Vercel Blog",
    url: "https://vercel.com/atom",
    siteUrl: "https://vercel.com/blog",
    category: "Backend & DevOps",
    color: "#171717",
  },
  {
    id: "github",
    name: "The GitHub Blog",
    url: "https://github.blog/feed/",
    siteUrl: "https://github.blog/",
    category: "Backend & DevOps",
    color: "#24292F",
  },

  // General Tech
  {
    id: "pragmatic-engineer",
    name: "The Pragmatic Engineer",
    url: "https://blog.pragmaticengineer.com/rss/",
    siteUrl: "https://blog.pragmaticengineer.com/",
    category: "General Tech",
    color: "#0F766E",
  },
  {
    id: "hackernews",
    name: "Hacker News Best",
    url: "https://hnrss.org/best",
    siteUrl: "https://news.ycombinator.com/",
    category: "General Tech",
    color: "#D9480F",
  },

  // AI & ML
  {
    id: "simon-willison",
    name: "Simon Willison's Weblog",
    url: "https://simonwillison.net/atom/everything/",
    siteUrl: "https://simonwillison.net/",
    category: "AI & ML",
    color: "#059669",
  },
  {
    id: "huggingface",
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    siteUrl: "https://huggingface.co/blog",
    category: "AI & ML",
    color: "#B45309",
  },
];

export const CATEGORIES = [
  "All",
  ...new Set(BLOG_FEEDS.map((f) => f.category)),
];
