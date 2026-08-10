import { useEffect, useState } from "react";

export type AutoRefreshInterval = "off" | "15m" | "30m" | "1h";

export const VALID_AUTO_REFRESH_INTERVALS: AutoRefreshInterval[] = ["off", "15m", "30m", "1h"];

export const AUTO_REFRESH_INTERVAL_MS: Record<AutoRefreshInterval, number | null> = {
  off: null,
  "15m": 15 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
};

export function useAutoRefreshInterval(): [AutoRefreshInterval, (interval: AutoRefreshInterval) => void] {
  const [interval, setInterval] = useState<AutoRefreshInterval>(() => {
    const saved = localStorage.getItem("autoRefreshInterval");
    return VALID_AUTO_REFRESH_INTERVALS.includes(saved as AutoRefreshInterval)
      ? (saved as AutoRefreshInterval)
      : "off";
  });

  useEffect(() => {
    localStorage.setItem("autoRefreshInterval", interval);
  }, [interval]);

  return [interval, setInterval];
}
