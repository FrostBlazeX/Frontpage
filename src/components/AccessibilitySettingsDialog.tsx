import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAccessibility } from "../hooks/useAccessibility";
import type { FontSize, LineHeight, LineLength } from "../hooks/useAccessibility";

type AccessibilitySettingsDialogProps = {
  onClose: () => void;
};

const optionButtonClass = (active: boolean) =>
  `flex-1 rounded-md border px-2 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
    active ? "border-accent bg-accent-subtle text-accent" : "border-border hover:bg-bg-tertiary"
  }`;

const FONT_SIZE_LABELS: Record<FontSize, string> = { sm: "Small", md: "Default", lg: "Large", xl: "X-Large" };

function AccessibilitySettingsDialog({ onClose }: AccessibilitySettingsDialogProps) {
  const { preferences, updatePreferences } = useAccessibility();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close accessibility settings"
        onClick={onClose}
        className="fixed inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-settings-heading"
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="a11y-settings-heading" className="text-lg font-semibold">
            Reading &amp; accessibility
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-9 min-w-9 items-center justify-center rounded-md transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Reduced motion</span>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(event) => updatePreferences({ reducedMotion: event.target.checked })}
              className="h-5 w-5 accent-accent"
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">High contrast (WCAG AAA)</span>
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(event) => updatePreferences({ highContrast: event.target.checked })}
              className="h-5 w-5 accent-accent"
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Dyslexia-friendly font (Lexend)</span>
            <input
              type="checkbox"
              checked={preferences.dyslexiaFont}
              onChange={(event) => updatePreferences({ dyslexiaFont: event.target.checked })}
              className="h-5 w-5 accent-accent"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Font size</legend>
            <div className="flex gap-2">
              {(Object.keys(FONT_SIZE_LABELS) as FontSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updatePreferences({ fontSize: size })}
                  aria-pressed={preferences.fontSize === size}
                  className={optionButtonClass(preferences.fontSize === size)}
                >
                  {FONT_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Reader line height</legend>
            <div className="flex gap-2">
              {(["normal", "relaxed", "loose"] as LineHeight[]).map((lh) => (
                <button
                  key={lh}
                  type="button"
                  onClick={() => updatePreferences({ lineHeight: lh })}
                  aria-pressed={preferences.lineHeight === lh}
                  className={optionButtonClass(preferences.lineHeight === lh)}
                >
                  {lh}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Reader line length</legend>
            <div className="flex gap-2">
              {(["narrow", "normal", "wide"] as LineLength[]).map((ll) => (
                <button
                  key={ll}
                  type="button"
                  onClick={() => updatePreferences({ lineLength: ll })}
                  aria-pressed={preferences.lineLength === ll}
                  className={optionButtonClass(preferences.lineLength === ll)}
                >
                  {ll}
                </button>
              ))}
            </div>
          </fieldset>

          <Link to="/accessibility" onClick={onClose} className="text-sm text-accent hover:underline">
            Read our accessibility statement
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccessibilitySettingsDialog;
