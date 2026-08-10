import type { ReactNode } from "react";

// Wraps every case-insensitive occurrence of `query` in `text` with a
// semantic <mark>. Returns the original string unchanged (not an array) when
// there's no query, so callers can render the result directly either way.
export function highlightMatch(text: string, query?: string): ReactNode {
  const trimmed = query?.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={index} className="bg-accent-subtle text-accent rounded-sm">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
