import { BLOG_FEEDS } from "../data/blogs";

export function getAuthorAvatarColor(author: string): string {
  const feed = BLOG_FEEDS.find(
    (feed) => feed.name.toLowerCase() === author.toLowerCase(),
  );
  return feed?.color ?? "#000000"; // Default color if author not found
}
