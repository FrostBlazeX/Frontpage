import { createContext, useContext } from "react";

export type FontSize = "sm" | "md" | "lg" | "xl";
export type LineHeight = "normal" | "relaxed" | "loose";
export type LineLength = "narrow" | "normal" | "wide";

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: FontSize;
  lineHeight: LineHeight;
  lineLength: LineLength;
  dyslexiaFont: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  fontSize: "md",
  lineHeight: "normal",
  lineLength: "normal",
  dyslexiaFont: false,
};

export interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  updatePreferences: (patch: Partial<AccessibilityPreferences>) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
