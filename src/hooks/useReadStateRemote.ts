import { useEffect, useRef, useState } from "react";
import type { FeedItem } from "../types/feed";
import { supabase, fireAndForget } from "../lib/supabaseClient";
import type { UseReadStateResult } from "./useReadState";

// feedId/categoryKey per item — the *effective* category (after the user's
// own reassignment overrides), not just the feed's default. Optional because
// a caller with no items loaded yet (or an item that's since disappeared from
// the feed) has nothing to attribute the read to; the write still succeeds,
// just without those columns, since Reading Analytics' category/source
// breakdowns are additive on top of the core read-tracking behavior.
export type ReadEventMeta = Map<string, { feedId: string; categoryKey: string }>;

// Supabase-backed counterpart to useReadState, using the `read_events` table
// (timestamped, unlike the guest's plain boolean map — this doubles as the
// Reading Analytics differentiator's data source).
//
// The "should this write happen?" check reads `readIds` from the closure
// directly rather than from inside a setState updater — updaters must stay
// pure (React can invoke them more than once), so the network call lives in
// the outer function body instead.
export function useReadStateRemote(userId: string, itemMeta?: ReadEventMeta): UseReadStateResult {
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  // Marks/unmarks made before the initial fetch below resolves — without
  // this, a read triggered right after sign-in can lose the race: the
  // optimistic update lands first, then the fetch's snapshot (taken before
  // that write reached the server) overwrites it right back out.
  const pendingRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase.from("read_events").select("item_id").eq("user_id", userId);
      if (cancelled || !data) return;
      const map: Record<string, boolean> = {};
      for (const row of data) map[row.item_id] = true;
      for (const [id, isRead] of Object.entries(pendingRef.current)) {
        if (isRead) map[id] = true;
        else delete map[id];
      }
      setReadIds(map);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const eventFor = (id: string) => {
    const meta = itemMeta?.get(id);
    return { user_id: userId, item_id: id, feed_id: meta?.feedId, category_key: meta?.categoryKey };
  };

  const markRead = (id: string) => {
    if (readIds[id]) return;
    pendingRef.current[id] = true;
    setReadIds((prev) => ({ ...prev, [id]: true }));
    fireAndForget(supabase.from("read_events").upsert(eventFor(id)));
  };

  const toggleRead = (id: string) => {
    const isCurrentlyRead = !!readIds[id];
    pendingRef.current[id] = !isCurrentlyRead;
    setReadIds((prev) => {
      const next = { ...prev };
      if (isCurrentlyRead) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });

    if (isCurrentlyRead) {
      fireAndForget(supabase.from("read_events").delete().eq("user_id", userId).eq("item_id", id));
    } else {
      fireAndForget(supabase.from("read_events").upsert(eventFor(id)));
    }
  };

  const markAllRead = (items: FeedItem[]) => {
    const toMark = items.filter((item) => !readIds[item.id]);
    if (toMark.length === 0) return;

    for (const item of toMark) pendingRef.current[item.id] = true;
    setReadIds((prev) => {
      const next = { ...prev };
      for (const item of toMark) next[item.id] = true;
      return next;
    });

    fireAndForget(
      supabase.from("read_events").upsert(toMark.map((item) => eventFor(item.id))),
    );
  };

  return { readIds, markRead, toggleRead, markAllRead };
}
