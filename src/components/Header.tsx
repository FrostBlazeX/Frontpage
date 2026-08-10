import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Square, Plus, Menu, Settings2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AccessibilitySettingsDialog from "./AccessibilitySettingsDialog";

type HeaderProps = {
  onMenuClick: () => void;
  onAddFeedClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: "feed" | "digest";
  onViewChange: (view: "feed" | "digest") => void;
};

export default function Header({
  onMenuClick,
  onAddFeedClick,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "G";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isA11ySettingsOpen, setIsA11ySettingsOpen] = useState(false);

  const handleAccountClick = async () => {
    if (!user) return; // Guest — nothing to sign out of.
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;

      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isTyping) return;

      event.preventDefault();
      searchInputRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="w-full flex h-16 items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-10">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden flex items-center justify-center min-h-11 min-w-11 -ml-2 rounded-md hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white font-bold">
              F
            </div>
            <span className="text-xl font-bold text-text-primary">Frontpage</span>
          </div>

          {/* Navigation */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-lg font-medium leading-none">
            <button
              type="button"
              onClick={() => onViewChange("feed")}
              aria-current={activeView === "feed" ? "page" : undefined}
              className={`px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeView === "feed"
                  ? "bg-accent-subtle text-accent font-semibold"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              Feed
            </button>

            <button
              type="button"
              onClick={() => onViewChange("digest")}
              aria-current={activeView === "digest" ? "page" : undefined}
              className={`px-3 py-2 rounded-md transition-colors leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeView === "digest"
                  ? "bg-accent-subtle text-accent font-semibold"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              Digest
            </button>

            <a
              href="#"
              className="px-3 py-2 rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Discover
            </a>

            {user && (
              <Link
                to="/analytics"
                className="px-3 py-2 rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Analytics
              </Link>
            )}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden lg:flex items-center rounded-full bg-bg-tertiary px-4 py-2 w-80">
            <Search size={18} className="text-text-tertiary" aria-hidden="true" />

            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            <input
              ref={searchInputRef}
              id="article-search"
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search articles..."
              className="ml-2 w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-tertiary"
            />

            <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs text-text-tertiary">
              /
            </kbd>
          </div>

          {/* button */}
          <button
            type="button"
            onClick={onAddFeedClick}
            aria-label="Add a feed"
            className="rounded-full p-2 hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="relative h-10 w-10">
              <Square
                className="absolute inset-0 h-10 w-10 text-text-tertiary"
                strokeWidth={1}
                aria-hidden="true"
              />
              <Plus
                className="absolute inset-0 m-auto h-5 w-5 text-text-secondary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Reading & accessibility settings */}
          <button
            type="button"
            onClick={() => setIsA11ySettingsOpen(true)}
            aria-label="Reading & accessibility settings"
            title="Reading & accessibility settings"
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Settings2 className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={handleAccountClick}
            aria-label={user ? "Sign out" : "Guest — not signed in"}
            title={user ? `Signed in as ${user.email} — click to sign out` : "Guest — not signed in"}
            className="flex items-center rounded-full px-2 py-1 hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {initials}
            </div>
          </button>
        </div>
      </div>

      {isA11ySettingsOpen && (
        <AccessibilitySettingsDialog onClose={() => setIsA11ySettingsOpen(false)} />
      )}
    </header>
  );
}
