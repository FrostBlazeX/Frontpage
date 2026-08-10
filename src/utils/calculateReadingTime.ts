export function calculateReadingTime(content: string): string {
  if (!content.trim()) {
    return "1 min read";
  }

  const plainText = content.replace(/<[^>]*>/g, "");
  const words = plainText.split(/\s+/).filter(Boolean);
  const WORDS_PER_MINUTE = 200;
  const wordCount = words.length;

  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return `${readingTime} min read`;
}
