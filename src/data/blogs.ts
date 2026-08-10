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
  {
    id: "josh-comeau",
    name: "Josh W. Comeau",
    url: "https://www.joshwcomeau.com/rss.xml",
    siteUrl: "https://www.joshwcomeau.com/",
    category: "Frontend",
    color: "#B8860B",
  },
  {
    id: "kent-c-dodds",
    name: "Kent C. Dodds",
    url: "https://kentcdodds.com/blog/rss.xml",
    siteUrl: "https://kentcdodds.com/",
    category: "Frontend",
    color: "#4338CA",
  },
  {
    id: "web-dev",
    name: "web.dev",
    url: "https://web.dev/feed.xml",
    siteUrl: "https://web.dev/",
    category: "Frontend",
    color: "#1A73E8",
  },
  {
    id: "mdn",
    name: "MDN Blog",
    url: "https://developer.mozilla.org/en-US/blog/rss.xml",
    siteUrl: "https://developer.mozilla.org/en-US/blog/",
    category: "Frontend",
    color: "#6B46C1",
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
    id: "figma",
    name: "Figma Blog",
    url: "https://www.figma.com/blog/feed/",
    siteUrl: "https://www.figma.com/blog/",
    category: "Design",
    color: "#7C3AED",
  },
  {
    id: "alistapart",
    name: "A List Apart",
    url: "https://alistapart.com/main/feed/",
    siteUrl: "https://alistapart.com/",
    category: "Design",
    color: "#B03A1F",
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
  {
    id: "netlify",
    name: "Netlify Blog",
    url: "https://www.netlify.com/blog/index.xml",
    siteUrl: "https://www.netlify.com/blog/",
    category: "Backend & DevOps",
    color: "#058E82",
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
