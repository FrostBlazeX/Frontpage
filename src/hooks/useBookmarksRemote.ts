import { useEffect, useRef, useState } from "react";
import { supabase, fireAndForget } from "../lib/supabaseClient";
import type { UseBookmarksResult } from "./useBookmarks";

// Supabase-backed counterpart to useBookmarks, using the `bookmarks` table.
// Same shape and same pendingRef race-guard as useReadStateRemote.ts (see
// that file's comment for why the guard is needed): a bookmark toggled
// before the initial fetch resolves must not get clobbered by that fetch's
// stale snapshot.
export function useBookmarksRemote(userId: string): UseBookmarksResult {
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [bookmarkedAt, setBookmarkedAt] = useState<Record<string, number>>({});
  const pendingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("bookmarks")
        .select("item_id, created_at")
        .eq("user_id", userId);
      if (cancelled || !data) return;

      const ids: Record<string, boolean> = {};
      const at: Record<string, number> = {};
      for (const row of data) {
        ids[row.item_id] = true;
        at[row.item_id] = new Date(row.created_at).getTime();
      }
      for (const [id, isBookmarked] of Object.entries(pendingRef.current)) {
        if (isBookmarked) {
          ids[id] = true;
          at[id] = at[id] ?? Date.now();
        } else {
          delete ids[id];
          delete at[id];
        }
      }
      setBookmarkedIds(ids);
      setBookmarkedAt(at);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleBookmark = (id: string) => {
    const isCurrentlyBookmarked = !!bookmarkedIds[id];
    pendingRef.current[id] = !isCurrentlyBookmarked;

    setBookmarkedIds((prev) => {
      const next = { ...prev };
      if (isCurrentlyBookmarked) delete next[id];
      else next[id] = true;
      return next;
    });
    setBookmarkedAt((prev) => {
      const next = { ...prev };
      if (isCurrentlyBookmarked) delete next[id];
      else next[id] = Date.now();
      return next;
    });

    if (isCurrentlyBookmarked) {
      fireAndForget(supabase.from("bookmarks").delete().eq("user_id", userId).eq("item_id", id));
    } else {
      fireAndForget(supabase.from("bookmarks").upsert({ user_id: userId, item_id: id }));
    }
  };

  return { bookmarkedIds, bookmarkedAt, toggleBookmark };
}
