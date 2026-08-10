import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type KeyboardShortcutsDialogProps = {
  onClose: () => void;
};

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ["j", "k"], description: "Move focus down / up the article list" },
  { keys: ["o", "Enter"], description: "Open the focused article in the reader" },
  { keys: ["s"], description: "Save/unsave the focused article" },
  { keys: ["m"], description: "Toggle read/unread on the focused article" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["?"], description: "Show this shortcut reference" },
  { keys: ["Ctrl", "K"], description: "Open the command palette" },
  { keys: ["Esc"], description: "Close the open dialog or reader" },
];

// Same modal pattern as AccessibilitySettingsDialog.tsx.
function KeyboardShortcutsDialog({ onClose }: KeyboardShortcutsDialogProps) {
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
        aria-label="Close keyboard shortcuts"
        onClick={onClose}
        className="fixed inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-heading"
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-heading" className="text-lg font-semibold">
            Keyboard shortcuts
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

        <ul className="flex flex-col gap-3">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.description} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary">{shortcut.description}</span>
              <span className="flex shrink-0 gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded-md border border-border bg-bg-tertiary px-1.5 py-0.5 text-xs font-medium text-text-primary"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default KeyboardShortcutsDialog;
