export function formatDate(pubDate: string): string {
  const published = new Date(pubDate);
  if (isNaN(published.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - published.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const sameYear = published.getFullYear() === now.getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (minutes < 1) {
    return "Just now";
  }

  if (diff < 0) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (
    published.getFullYear() === yesterday.getFullYear() &&
    published.getMonth() === yesterday.getMonth() &&
    published.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }

  if (!sameYear) {
    options.year = "numeric";
  }

  if (sameYear) {
    return new Intl.DateTimeFormat(undefined, options).format(published);
  }
  return new Intl.DateTimeFormat(undefined, options).format(published);
}
