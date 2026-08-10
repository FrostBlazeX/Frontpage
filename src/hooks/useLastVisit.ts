import { useEffect, useState } from "react";

// Lifted out of Homepage so both the main feed view and the Digest view can
// read the same "since last visit" snapshot without resetting it every time
// one of them mounts/unmounts as the user switches views.
export function useLastVisit(): number | null {
  // Captures the *previous* visit's timestamp before overwriting it below, so
  // "new since last visit" compares against where the user actually left off.
  const [lastVisitAt] = useState<number | null>(() => {
    const stored = localStorage.getItem("lastVisitAt");
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem("lastVisitAt", String(Date.now()));
  }, []);

  return lastVisitAt;
}
