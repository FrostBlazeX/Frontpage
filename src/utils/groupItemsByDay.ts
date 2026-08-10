import type { FeedItem } from "../types/feed";

export interface ItemGroup {
  label: string;
  items: FeedItem[];
}

function dayLabel(date: Date, now: Date): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(date);
}

// Assumes items are already sorted reverse-chronologically — groups consecutive
// runs sharing a calendar day, preserving that order. Undated items trail last.
export function groupItemsByDay(items: FeedItem[]): ItemGroup[] {
  const now = new Date();
  const groups: ItemGroup[] = [];
  const undated: FeedItem[] = [];

  for (const item of items) {
    if (!item.publishedAt) {
      undated.push(item);
      continue;
    }

    const label = dayLabel(new Date(item.publishedAt), now);
    const currentGroup = groups[groups.length - 1];

    if (currentGroup?.label === label) {
      currentGroup.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  if (undated.length > 0) {
    groups.push({ label: "Undated", items: undated });
  }

  return groups;
}
