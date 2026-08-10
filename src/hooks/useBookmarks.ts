import { useEffect, useState } from "react";

export interface UseBookmarksResult {
  bookmarkedIds: Record<string, boolean>;
  bookmarkedAt: Record<string, number>;
  toggleBookmark: (id: string) => void;
}

// Mirrors useReadState.ts's shape — a sparse "true-only" map, persisted to
// localStorage. `bookmarkedAt` is tracked separately (rather than folded
// into a richer value type) so "sort by date saved" in the Saved view has
// something to sort by without complicating the read/write shape everywhere
// else that only needs a boolean.
export function useBookmarks(): UseBookmarksResult {
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("bookmarkedIds");
    return saved ? JSON.parse(saved) : {};
  });
  const [bookmarkedAt, setBookmarkedAt] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("bookmarkedAt");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("bookmarkedIds", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem("bookmarkedAt", JSON.stringify(bookmarkedAt));
  }, [bookmarkedAt]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      if (!prev[id]) return { ...prev, [id]: true };
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setBookmarkedAt((prev) => {
      if (bookmarkedIds[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: Date.now() };
    });
  };

  return { bookmarkedIds, bookmarkedAt, toggleBookmark };
}
