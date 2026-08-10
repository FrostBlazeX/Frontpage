import { useEffect, useState } from "react";
import { supabase, fireAndForget } from "../lib/supabaseClient";
import { VALID_AUTO_REFRESH_INTERVALS } from "./useAutoRefreshInterval";
import type { AutoRefreshInterval } from "./useAutoRefreshInterval";

// Supabase-backed counterpart to useAutoRefreshInterval, backed by the same
// `preferences` table useLayoutPreference's remote counterpart uses (one row
// per user, one column per preference).
export function useAutoRefreshIntervalRemote(
  userId: string,
): [AutoRefreshInterval, (interval: AutoRefreshInterval) => void] {
  const [interval, setIntervalState] = useState<AutoRefreshInterval>("off");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("preferences")
        .select("auto_refresh_interval")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled || !data) return;

      if (VALID_AUTO_REFRESH_INTERVALS.includes(data.auto_refresh_interval as AutoRefreshInterval)) {
        setIntervalState(data.auto_refresh_interval as AutoRefreshInterval);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setInterval = (newInterval: AutoRefreshInterval) => {
    setIntervalState(newInterval);
    fireAndForget(
      supabase.from("preferences").upsert({ user_id: userId, auto_refresh_interval: newInterval }),
    );
  };

  return [interval, setInterval];
}
