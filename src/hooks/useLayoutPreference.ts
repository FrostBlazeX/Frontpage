import { useEffect, useState } from "react";

export type FeedLayout = "list" | "grid" | "compact";

export const VALID_LAYOUTS: FeedLayout[] = ["list", "grid", "compact"];

export function useLayoutPreference(): [FeedLayout, (layout: FeedLayout) => void] {
  const [layout, setLayout] = useState<FeedLayout>(() => {
    const saved = localStorage.getItem("feedLayout");
    return VALID_LAYOUTS.includes(saved as FeedLayout) ? (saved as FeedLayout) : "list";
  });

  useEffect(() => {
    localStorage.setItem("feedLayout", layout);
  }, [layout]);

  return [layout, setLayout];
}
