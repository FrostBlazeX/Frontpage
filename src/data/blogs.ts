import type { BlogFeed } from "../types/feed";

export const BLOG_FEEDS: BlogFeed[] = [
  // Design
  {
    id: "smashing",
    name: "Smashing Magazine",
    url: "https://www.smashingmagazine.com/feed/",
    category: "Design",
    color: "#E8524A",
  },
  {
    id: "css-tricks",
    name: "CSS-Tricks",
    url: "https://css-tricks.com/feed/",
    category: "Design",
    color: "#FF6384",
  },
  {
    id: "alistapart",
    name: "A List Apart",
    url: "https://alistapart.com/main/feed/",
    category: "Design",
    color: "#DA4E2A",
  },

  // Dev
  {
    id: "devto",
    name: "Dev.to",
    url: "https://dev.to/feed",
    category: "Dev",
    color: "#3B49DF",
  },
  {
    id: "hackernews",
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "Dev",
    color: "#FF6600",
  },
  {
    id: "overreacted",
    name: "Overreacted",
    url: "https://overreacted.io/rss.xml",
    category: "Dev",
    color: "#61DAFB",
  },

  // Tools & Releases
  {
    id: "vercel",
    name: "Vercel Blog",
    url: "https://vercel.com/atom",
    category: "Tools",
    color: "#000000",
  },
  {
    id: "github",
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
    category: "Tools",
    color: "#24292F",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS Blog",
    url: "https://tailwindcss.com/feeds/feed.xml",
    category: "Tools",
    color: "#06B6D4",
  },

  // AI
  {
    id: "openai",
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    category: "AI",
    color: "#10A37F",
  },
  {
    id: "huggingface",
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    category: "AI",
    color: "#FFD21E",
  },
];

export const CATEGORIES = [
  "All",
  ...new Set(BLOG_FEEDS.map((f) => f.category)),
];
