import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X, Upload, Download } from "lucide-react";
import type { Category } from "../hooks/useCategories";
import type { NewFeedInput } from "../hooks/useUserFeeds";
import type { ApiValidateFeedResponse, BlogFeed } from "../types/feed";
import { getFaviconUrl } from "../utils/favicon";
import AuthorAvatar from "./AuthorAvatar";
import { parseOpml, buildOpml } from "../utils/opml";
import type { OpmlFeedEntry } from "../utils/opml";

type AddFeedDialogProps = {
  onClose: () => void;
  categories: Category[];
  onAddFeed: (input: NewFeedInput) => void;
  hiddenCuratedFeeds: BlogFeed[];
  onRestoreFeed: (feedId: string) => void;
  existingFeeds: BlogFeed[];
  categoryOrder: string[];
};

type OpmlPreviewRow = OpmlFeedEntry & { status: "new" | "duplicate" | "invalid" };

function isValidFeedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

type ValidationState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "error"; message: string }
  | { status: "valid"; feedTitle: string; feedDescription: string; siteUrl: string };

const inputClass =
  "w-full min-w-0 rounded-md border border-border bg-bg-primary px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

// The parent only mounts this component while the dialog is open (rather
// than always rendering it with an `isOpen` prop), so a fresh mount already
// gives clean initial state — no reset-on-open effect needed.
function AddFeedDialog({
  onClose,
  categories,
  onAddFeed,
  hiddenCuratedFeeds,
  onRestoreFeed,
  existingFeeds,
  categoryOrder,
}: AddFeedDialogProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(() => categories[categories.length - 1]?.id ?? "uncategorized");
  const [validation, setValidation] = useState<ValidationState>({ status: "idle" });
  const urlInputRef = useRef<HTMLInputElement>(null);
  const opmlFileInputRef = useRef<HTMLInputElement>(null);
  const [opmlPreview, setOpmlPreview] = useState<OpmlPreviewRow[] | null>(null);
  const [opmlError, setOpmlError] = useState<string | null>(null);
  const [opmlResult, setOpmlResult] = useState<string | null>(null);

  useEffect(() => {
    urlInputRef.current?.focus();

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
    // Runs once for this mount's lifetime — onClose is a fresh closure each
    // App render but always calls the same stable state setter underneath.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setValidation({ status: "checking" });
    try {
      const response = await fetch(`/api/validateFeed?url=${encodeURIComponent(trimmedUrl)}`);
      const data: ApiValidateFeedResponse = await response.json();
      if (data.ok) {
        setValidation({
          status: "valid",
          feedTitle: data.feedTitle,
          feedDescription: data.feedDescription,
          siteUrl: data.siteUrl,
        });
        setTitle(data.feedTitle);
      } else {
        setValidation({ status: "error", message: data.error });
      }
    } catch {
      setValidation({ status: "error", message: "Couldn't reach the server. Try again." });
    }
  };

  const handleSave = () => {
    if (validation.status !== "valid") return;
    onAddFeed({
      name: title.trim() || validation.feedTitle,
      url: url.trim(),
      siteUrl: validation.siteUrl,
      category: categories.find((c) => c.id === categoryId)?.name ?? "Uncategorized",
    });
    onClose();
  };

  const handleOpmlFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setOpmlError(null);
    setOpmlResult(null);
    try {
      const text = await file.text();
      const entries = parseOpml(text);
      if (entries.length === 0) {
        setOpmlError("No feeds found in that file.");
        return;
      }

      const existingUrls = new Set(existingFeeds.map((f) => f.url));
      const seenInBatch = new Set<string>();
      const rows: OpmlPreviewRow[] = entries.map((entry) => {
        let status: OpmlPreviewRow["status"];
        if (!isValidFeedUrl(entry.url)) status = "invalid";
        else if (existingUrls.has(entry.url) || seenInBatch.has(entry.url)) status = "duplicate";
        else status = "new";
        if (status === "new") seenInBatch.add(entry.url);
        return { ...entry, status };
      });
      setOpmlPreview(rows);
    } catch (err) {
      setOpmlError(err instanceof Error ? err.message : "Couldn't read that file.");
    }
  };

  const handleConfirmImport = () => {
    if (!opmlPreview) return;
    const toAdd = opmlPreview.filter((row) => row.status === "new");
    for (const row of toAdd) {
      onAddFeed({ name: row.name, url: row.url, siteUrl: row.siteUrl, category: row.category });
    }
    const duplicates = opmlPreview.filter((row) => row.status === "duplicate").length;
    const invalid = opmlPreview.filter((row) => row.status === "invalid").length;
    setOpmlResult(
      `${toAdd.length} feed${toAdd.length === 1 ? "" : "s"} added, ${duplicates} duplicate${duplicates === 1 ? "" : "s"} skipped, ${invalid} invalid.`,
    );
    setOpmlPreview(null);
  };

  const handleExport = () => {
    const opml = buildOpml(existingFeeds, categoryOrder);
    const blob = new Blob([opml], { type: "text/x-opml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "frontpage-feeds.opml";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // A slide-in side panel rather than a centered modal — guidance/patterns.md
  // calls out adding a feed as exactly the kind of routine action a heavy
  // modal shouldn't interrupt. The backdrop is a light click-outside-to-close
  // scrim, not the full-dimming treatment a true modal would use, so the
  // dashboard behind it stays visually present.
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/10"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-feed-heading"
        className="panel-slide-in relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="add-feed-heading" className="text-lg font-semibold">
            Add a feed
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="flex items-center justify-center min-h-9 min-w-9 rounded-md hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              ref={opmlFileInputRef}
              type="file"
              accept=".opml,.xml,text/x-opml,text/xml"
              onChange={handleOpmlFileChange}
              className="sr-only"
              aria-label="Import OPML file"
            />
            <button
              type="button"
              onClick={() => opmlFileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import OPML
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={existingFeeds.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export OPML
            </button>
          </div>

          {opmlError && (
            <p role="alert" className="text-sm text-error">
              {opmlError}
            </p>
          )}
          {opmlResult && (
            <p role="status" className="text-sm text-text-secondary">
              {opmlResult}
            </p>
          )}

          {opmlPreview && (
            <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-bg-secondary p-3">
              <p className="text-sm font-medium">
                {opmlPreview.length} feed{opmlPreview.length === 1 ? "" : "s"} found —{" "}
                {opmlPreview.filter((r) => r.status === "new").length} new,{" "}
                {opmlPreview.filter((r) => r.status === "duplicate").length} duplicate,{" "}
                {opmlPreview.filter((r) => r.status === "invalid").length} invalid
              </p>
              <ul className="max-h-40 divide-y divide-border-subtle overflow-y-auto rounded-md border border-border-subtle bg-surface">
                {opmlPreview.map((row, index) => (
                  <li key={`${row.url}-${index}`} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                    <span className="flex-1 truncate">{row.name}</span>
                    <span className="shrink-0 text-xs text-text-tertiary">{row.category}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.status === "new"
                          ? "bg-accent-subtle text-accent"
                          : row.status === "duplicate"
                            ? "bg-bg-tertiary text-text-tertiary"
                            : "bg-error/10 text-error"
                      }`}
                    >
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpmlPreview(null)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={opmlPreview.every((r) => r.status !== "new")}
                  className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none"
                >
                  Import {opmlPreview.filter((r) => r.status === "new").length} feed
                  {opmlPreview.filter((r) => r.status === "new").length === 1 ? "" : "s"}
                </button>
              </div>
            </div>
          )}
        </div>

        {hiddenCuratedFeeds.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
              Bring back a curated feed
            </h3>
            <ul className="max-h-40 divide-y divide-border-subtle overflow-y-auto rounded-md border border-border-subtle">
              {hiddenCuratedFeeds.map((feed) => (
                <li key={feed.id} className="flex items-center gap-2 px-3 py-2">
                  <AuthorAvatar
                    name={feed.name}
                    backgroundColor={feed.color}
                    faviconUrl={getFaviconUrl(feed.siteUrl)}
                  />
                  <span className="flex-1 truncate text-sm">{feed.name}</span>
                  <button
                    type="button"
                    onClick={() => onRestoreFeed(feed.id)}
                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Add back
                  </button>
                </li>
              ))}
            </ul>
            <div className="my-4 border-t border-border-subtle" />
          </div>
        )}

        <form onSubmit={handleCheck} className="flex flex-col gap-3">
          <div>
            <label htmlFor="feed-url" className="block text-sm font-medium text-text-secondary mb-1">
              Feed URL
            </label>
            <div className="flex gap-2">
              <input
                ref={urlInputRef}
                id="feed-url"
                type="url"
                required
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setValidation({ status: "idle" });
                }}
                placeholder="https://example.com/feed.xml"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={validation.status === "checking"}
                className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none"
              >
                {validation.status === "checking" ? "Checking…" : "Check"}
              </button>
            </div>
          </div>

          {validation.status === "error" && (
            <p role="alert" className="text-sm text-error">
              {validation.message}
            </p>
          )}

          {validation.status === "valid" && (
            <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-bg-secondary p-3">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={getFaviconUrl(validation.siteUrl)}
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 rounded-sm bg-bg-tertiary object-contain"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{validation.feedTitle}</p>
                  {validation.feedDescription && (
                    <p className="text-xs text-text-tertiary truncate">{validation.feedDescription}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="feed-title" className="block text-sm font-medium text-text-secondary mb-1">
                  Title
                </label>
                <input
                  id="feed-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="feed-category" className="block text-sm font-medium text-text-secondary mb-1">
                  Category
                </label>
                <select
                  id="feed-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={validation.status !== "valid"}
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none"
            >
              Add feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFeedDialog;
