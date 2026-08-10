import { useEffect, useState } from "react";
import type { FeedItem } from "../types/feed";

export interface UseReadStateResult {
  readIds: Record<string, boolean>;
  markRead: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllRead: (items: FeedItem[]) => void;
}

// Lifted out of Homepage so Sidebar (a sibling, not a child) can also read
// read/unread state — needed for per-feed and per-category unread counts.
export function useReadState(): UseReadStateResult {
  const [readIds, setReadIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("readArticles");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("readArticles", JSON.stringify(readIds));
  }, [readIds]);

  const markRead = (id: string) => {
    setReadIds((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const toggleRead = (id: string) => {
    setReadIds((prev) => {
      if (!prev[id]) return { ...prev, [id]: true };
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const markAllRead = (items: FeedItem[]) => {
    setReadIds((prev) => {
      const next = { ...prev };
      for (const item of items) next[item.id] = true;
      return next;
    });
  };

  return { readIds, markRead, toggleRead, markAllRead };
}
