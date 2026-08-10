import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

export interface CommandAction {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

type CommandPaletteProps = {
  actions: CommandAction[];
  onClose: () => void;
};

// Same modal pattern as AccessibilitySettingsDialog.tsx (focus-on-open,
// body-scroll-lock, Escape-to-close). The action list is small and static,
// so a hand-rolled substring filter is enough — no fuzzy-search dependency.
function CommandPalette({ actions, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = actions.filter((action) => action.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const runActive = () => {
    const action = filtered[activeIndex];
    if (!action) return;
    onClose();
    action.run();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runActive();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
      <button type="button" aria-label="Close command palette" onClick={onClose} className="fixed inset-0 bg-black/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
          <label htmlFor="command-palette-input" className="sr-only">
            Search commands
          </label>
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-tertiary"
          />
          <kbd className="shrink-0 rounded-md border border-border bg-bg-tertiary px-1.5 py-0.5 text-xs text-text-tertiary">
            Esc
          </kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-text-tertiary">No matching commands.</li>
          )}
          {filtered.map((action, index) => (
            <li key={action.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onClose();
                  action.run();
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                  index === activeIndex ? "bg-accent-subtle text-accent" : "text-text-primary hover:bg-bg-tertiary"
                }`}
              >
                <span>{action.label}</span>
                {action.hint && <span className="text-xs text-text-tertiary">{action.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
