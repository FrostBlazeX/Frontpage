import { useEffect, useState } from "react";
import { supabase, fireAndForget } from "../lib/supabaseClient";
import { VALID_LAYOUTS } from "./useLayoutPreference";
import type { FeedLayout } from "./useLayoutPreference";

// Supabase-backed counterpart to useLayoutPreference, backed by the
// `preferences` table (one row per user).
export function usePreferencesRemote(userId: string): [FeedLayout, (layout: FeedLayout) => void] {
  const [layout, setLayoutState] = useState<FeedLayout>("list");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("preferences")
        .select("layout")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;

      if (data && VALID_LAYOUTS.includes(data.layout as FeedLayout)) {
        setLayoutState(data.layout as FeedLayout);
      } else {
        // First time this account has loaded preferences — seed a row.
        fireAndForget(supabase.from("preferences").upsert({ user_id: userId, layout: "list" }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setLayout = (newLayout: FeedLayout) => {
    setLayoutState(newLayout);
    fireAndForget(supabase.from("preferences").upsert({ user_id: userId, layout: newLayout }));
  };

  return [layout, setLayout];
}
