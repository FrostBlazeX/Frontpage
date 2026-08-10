import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AccessibilityContext,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferences,
} from "../hooks/useAccessibility";

const STORAGE_KEY = "accessibilityPreferences";

const FONT_SCALE: Record<AccessibilityPreferences["fontSize"], string> = {
  sm: "93.75%",
  md: "100%",
  lg: "112.5%",
  xl: "125%",
};

// Device-level, not account-synced — like most apps' display/accessibility
// settings, these travel with the browser rather than the account, so guest
// and signed-in users share the same simple localStorage persistence
// without needing a new database migration.
//
// Applies globally (data attributes + font-size on <html>) rather than
// scoped to the dashboard, so it affects the landing page and auth pages
// too — this is provided above the router in App.tsx.
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_ACCESSIBILITY_PREFERENCES;
    try {
      return { ...DEFAULT_ACCESSIBILITY_PREFERENCES, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_ACCESSIBILITY_PREFERENCES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reducedMotion = String(preferences.reducedMotion);
    root.dataset.contrast = preferences.highContrast ? "high" : "normal";
    root.dataset.dyslexiaFont = String(preferences.dyslexiaFont);
    root.dataset.lineHeight = preferences.lineHeight;
    root.dataset.lineLength = preferences.lineLength;
    // Every Tailwind text size in this project is defined in rem, which
    // resolves against the root element's font-size — scaling it here
    // scales all type in the app proportionally, no per-component work needed.
    root.style.fontSize = FONT_SCALE[preferences.fontSize];
  }, [preferences]);

  const updatePreferences = (patch: Partial<AccessibilityPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
