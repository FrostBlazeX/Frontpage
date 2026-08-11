# Frontpage

A customizable content aggregator that pulls RSS and Atom feeds into one well-designed reading dashboard. Built as a [Frontend Mentor Product Challenge](https://www.frontendmentor.io).

**Live URL:** _add your deployed URL here_

---

## Overview

Frontpage lets you subscribe to RSS/Atom feeds, organize them into categories, and read everything — list, grid, or compact — in one dashboard. It supports two ways in:

- **Try as Guest** — opens straight into a fully populated dashboard, pre-loaded with 19 curated feeds across 5 categories (Frontend, Design, Backend & DevOps, General Tech, AI & ML). Everything persists locally via `localStorage`, exactly as it always has — no account needed.
- **Sign up** — the same dashboard, backed by a real [Supabase](https://supabase.com) account instead of `localStorage`, so feeds, categories, read state, and layout preference sync anywhere you sign in. A fresh account starts from the same curated defaults as guest mode; there's no import from a prior guest session.

This is the **full-stack path** (see `spec/technical-requirements.md`): real authentication (email/password, password reset) and a Postgres database with row-level security, on top of the frontend-only feature set. Server-side feed fetching (required regardless of path, since RSS can't be fetched directly from the browser due to CORS) is handled by small serverless functions in `api/`.

Two [differentiators](spec/differentiators.md) are implemented: **Accessibility-First Reading** and **Reading Analytics** (see [Design Decisions](#design-decisions)).

### Tech Stack

| Layer         | Technology                                                                                                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | React 19 + TypeScript, built with Vite                                                                                                                                                                                                                                       |
| Routing       | `react-router-dom` v7 (`BrowserRouter`)                                                                                                                                                                                                                                      |
| Backend       | [Supabase](https://supabase.com) — Postgres + Auth, accessed via `@supabase/supabase-js` with the public `anon` key; every table is protected by row-level security (`auth.uid() = user_id`), which is the actual security boundary for a client-side app using a public key |
| Feed fetching | Vercel-style serverless functions (`api/*.ts`), mirrored locally by a custom Vite dev middleware (`vite-plugins/apiDevMiddleware.ts`) — no Vercel CLI needed for local dev                                                                                                   |
| Feed parsing  | `rss-parser`, with custom charset detection (`iconv-lite`) and HTML sanitization (`dompurify`)                                                                                                                                                                               |
| Persistence   | Guest mode: `localStorage`. Signed-in: Supabase tables (`categories`, `custom_feeds`, `hidden_feeds`, `feed_title_overrides`, `read_events`, `bookmarks`, `preferences`) — see `supabase/migrations/`                                                                        |
| Styling       | Tailwind CSS v4, driven by the brand kit's CSS custom properties (`starter/tokens.css`)                                                                                                                                                                                      |
| Fonts         | Inter (default UI), Lexend (optional dyslexia-friendly mode — see Accessibility-First Reading)                                                                                                                                                                               |
| Icons         | `lucide-react` (primary), `react-icons` (a couple of header icons)                                                                                                                                                                                                           |
| Hosting       | Any static host with serverless function support (Vercel, Netlify, etc.) — not yet deployed                                                                                                                                                                                  |

---

## Feature Status

### Core Requirements

| #   | Feature                                                                            | Status                                                                                       |
| --- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | Feed Management (add/edit/remove, validate, favicon, health)                       | ✅ Done                                                                                      |
| 2   | Feed Parsing (RSS 2.0, Atom, RSS 1.0/RDF, encodings, malformed XML)                | ✅ Done                                                                                      |
| 3   | Content Browsing (list, favicons, sort, filter, pagination)                        | ✅ Done                                                                                      |
| 4   | Category Organization (create/rename/delete/reorder, Uncategorized, unread counts) | ✅ Done                                                                                      |
| 5   | Read/Unread Tracking (manual toggle, mark-all at every scope, persistence)         | ✅ Done                                                                                      |
| 6   | Article View (reader view, sanitized HTML, next/prev, original link)               | ✅ Done                                                                                      |
| 7   | Responsive Design (mobile nav drawer, no horizontal scroll)                        | ✅ Done                                                                                      |
| 8   | Feed Error Handling (temporary vs. dead, backoff, manual retry)                    | ✅ Done                                                                                      |
| 9   | User Authentication                                                                | ✅ Done — Supabase email/password sign-up, sign-in, sign-out, password reset                 |
| 10  | Landing Page                                                                       | ✅ Done — hero, feature highlights, dual CTAs (`/`)                                          |
| 11  | "Try as Guest" Experience                                                          | ✅ Done — unchanged from the original frontend-only build; guest data never touches Supabase |
| 12  | Data Persistence (real database)                                                   | ✅ Done — Supabase Postgres, RLS-protected per user (see `supabase/migrations/`)             |

### Design-It-Yourself Features

| Feature                        | Status                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Content Discovery & Onboarding | ✅ Done — see [Design Decisions](#design-decisions)                                                                       |
| Layout Customization           | ✅ Done — see [Design Decisions](#design-decisions)                                                                       |
| Digest / Summary View          | ✅ Done — since-last-visit briefing grouped by category (`Digest` nav toggle) — see [Design Decisions](#design-decisions) |

### Stretch Features

| Feature                    | Status                                                                                                                                                                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bookmarks / Save for Later | ✅ Done — save from any card or the reader, dedicated "Saved" view with sort-by-date-saved/published, count in the sidebar                                                                                                                                                        |
| Search                     | ✅ Done — client-side, highlights matches, composes with category selection; date-range filter and search history not built (MVP scope — see Known Limitations)                                                                                                                   |
| OPML Import/Export         | ✅ Done — import with a duplicate-flagged preview and results summary, export preserving category structure; handles `data/sample-feeds.opml`'s edge cases (nested categories, missing `type`, lowercase `xmlurl`/`htmlurl`)                                                      |
| Refresh and Polling        | ✅ Done — configurable auto-refresh interval (15/30/60 min or manual), a "last updated" timestamp, and a dismissible "N new items" banner distinct from the existing "since last visit" one; ETag/Last-Modified conditional caching not built (MVP scope — see Known Limitations) |
| Performance                | ✅ Done — lazy-loaded images, skeleton loading screens (no layout shift), route-level code-splitting; Lighthouse 82/83/100/82 (landing) — see [Design Decisions](#design-decisions) for the full scores and the `/app` caveat                                                     |
| Keyboard Navigation        | ✅ Done — `j`/`k` to move focus, `o`/`Enter` to open, `s` to save, `m` to toggle read, `/` to search, `?` for a shortcut reference, `Cmd/Ctrl+K` command palette; vim-style `g`-then-key sequences not built (MVP scope — see Known Limitations)                                  |

### Differentiators

Two chosen from `spec/differentiators.md` — see [Design Decisions](#design-decisions) for why these two and not the other two (AI Summarization, Offline/PWA).

| Feature                     | Status                                                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility-First Reading | ✅ Done — reduced motion, WCAG AAA high contrast, dyslexia-friendly font, adjustable font size/line height/line length, accessibility statement page (`/accessibility`) |
| Reading Analytics           | ✅ Done — signed-in only; total reads, reading streak, 90-day activity heatmap, daily reads chart, top categories/sources (`/analytics`)                                |
| AI Summarization            | ❌ Not chosen — requires a paid external LLM API key                                                                                                                    |
| Offline/PWA Support         | ❌ Not chosen — treated as a distinct skill area                                                                                                                        |

---

## Design Decisions

These are the product and design choices made where the spec left room for interpretation, in this session's collaborative build.

### Content Discovery & Onboarding

**The problem:** New users normally have an empty dashboard and need to find feeds. But in this frontend-only build, everyone opens the app to the same pre-loaded 19 curated feeds — there's no signed-up user with zero feeds the way the spec assumes. The only real cold-start is removing every single feed.

**The approach:** Scoped onboarding down to what's actually true for this app — a dedicated empty-dashboard state (calm messaging, a primary "Add a feed" CTA, and a one-click list to restore any curated feeds you've removed), plus the same restore list surfaced inside the Add Feed dialog itself for quicker recovery without a full URL round-trip. No forced first-visit tour was built, since the dashboard is already populated and reasonably discoverable — an unskippable walkthrough would have been solving a problem the app doesn't actually have.

**Why:** Building a generic "onboarding flow" for a cold-start that structurally can't happen here (no accounts) would have been designing for a hypothetical rather than the real product.

### Layout Customization

**The problem:** Different readers want different density — a dense list, an image-forward grid, or a scannable compact view.

**The approach:** Three layouts (List, Grid, Compact) selected via the header toggle, applied globally and persisted in `localStorage`. Grid needed a thumbnail per card that feed items didn't otherwise carry — server-side parsing now prefers the RSS `<enclosure>` when it's an image, falls back to the first inline `<img>` in the article content, and falls back further to a colored initial tile (matching the existing avatar treatment) for text-only feeds with no images at all.

**Why global rather than per-category:** Simpler mental model, and matches the existing single shared toggle in the header rather than requiring a layout picker per category.

### Full-Stack Migration

**The problem:** The spec's full-stack path asks for real accounts and a real database, but the app already had a complete, working guest experience — the migration shouldn't rewrite that.

**The approach:** Guest mode is untouched: no session means `localStorage`, exactly as before. Signing up adds a database-backed account on top; the dashboard UI itself doesn't change, only _where_ its data comes from. Each of the four local hooks (`useUserFeeds`, `useCategories`, `useReadState`, `useLayoutPreference`) has a Supabase-backed counterpart with an identical return shape (`useUserFeedsRemote`, etc.), and `Dashboard.tsx` picks between a `DashboardLocal`/`DashboardRemote` component pair based on auth state — React's rules of hooks don't allow conditionally calling different hooks inside one component, so the choice happens at the component level instead. A fresh account seeds the same curated defaults as guest mode; there's no migration path from an existing guest session's `localStorage` data into a new account.

**Why Row Level Security is the real security boundary:** The client uses Supabase's public `anon` key, which is meant to be exposed — every table (`categories`, `custom_feeds`, `hidden_feeds`, `feed_title_overrides`, `read_events`, `bookmarks`, `preferences`) has RLS enabled with a `for all using (auth.uid() = user_id) with check (auth.uid() = user_id)` policy, so a user can only ever read or write their own rows regardless of what the client sends.

**Why accessibility preferences stayed device-local, not account-synced:** Migrating them to Supabase would've meant another schema migration mid-build for a preference category (font size, contrast, motion) that many real apps treat as device-specific anyway. Both guest and signed-in users get the same `localStorage`-only persistence for these.

### Accessibility-First Reading (differentiator)

**The approach:** An in-app settings panel (the header's accessibility icon) controls reduced motion (an explicit toggle in addition to respecting the OS `prefers-reduced-motion` setting), WCAG AAA high contrast (21:1 text, in both light and dark mode), a dyslexia-friendly font, font size (small→extra-large, scales the root `font-size` so every `rem`-based Tailwind utility scales with it), and reader line height/line length. All of it applies instantly via `data-*` attributes on `<html>`, set by a single `AccessibilityProvider` above the router so it affects every page, not just the dashboard. An accessibility statement page (`/accessibility`) documents what's implemented.

**Why Lexend over OpenDyslexic:** The spec allows "OpenDyslexic or similar," and OpenDyslexic has no officially reliable CDN to depend on. Lexend is a Google Font built for reading proficiency and is reliably hosted.

**Why these preferences are device-local:** See Full-Stack Migration above — the same reasoning applies here specifically.

### Reading Analytics (differentiator)

**The approach:** Signed-in only, since it's built on the timestamped `read_events` table (`user_id`, `item_id`, `read_at`, plus `feed_id`/`category_key` added in a follow-up migration for source/category attribution) — guest mode's read state is just a boolean map with no history to chart. The `/analytics` page shows total reads, current/longest streak, a 90-day activity heatmap, a daily-reads chart (7/30/90-day presets), and top-categories/top-sources rankings. Charts are hand-built HTML/CSS (no charting library) following a dataviz methodology: sequential single-hue color (the app's own `--color-accent` token, since none of these charts encode _identity_ by color — they're all magnitude comparisons), thin bars with hover/focus tooltips, and a table-view toggle on every chart as the accessibility-equivalent view.

**Why category/source attribution needed a follow-up migration:** The original `read_events` table only recorded _that_ something was read, not _what it was_ — feed items are fetched live from RSS and never stored, so a source/category breakdown needs that context captured at read time, not reconstructed later from data that may no longer be in the live feed window.

### Bookmarks / Save for Later

**The approach:** A `Bookmark` toggle on every card (list/grid/compact) and in the reader view, mirroring the exact local/remote pattern the read-state feature already established — `useBookmarks`/`useBookmarksRemote`, `localStorage` for guests, a `bookmarks` table (RLS-protected, same shape as `read_events`) for signed-in users. "Saved" in the sidebar is a real filtered view now (previously a disabled placeholder), sortable by date saved or date published.

**Why it slots into the existing category-selection state rather than a new view type:** `selectedCategory` already had an `"All"` sentinel; `"Saved"` is just a second sentinel value filtering by bookmark instead of category, so it reuses the entire existing filtering/rendering pipeline (search, layouts, pagination) for free instead of duplicating it.

### Search

**The approach:** Client-side substring matching over already-loaded items (title, author, excerpt, content) — no backend involved, so results are effectively instant. It composes with the existing category/Saved selection rather than adding separate filter UI: searching within "Saved" searches only your bookmarks, satisfying that specific spec requirement without new code.

**What was trimmed:** a date-range filter and recent-search history — both explicitly optional in the spec, and lower-value than the rest of this pass's scope.

### OPML Import/Export

**The approach:** A small hand-rolled parser (`src/utils/opml.ts`) using the browser's native `DOMParser` rather than a new dependency — OPML's `<outline>` structure doesn't need a real XML/RSS library. It recurses through nested category outlines (a feed is any outline with an `xmlUrl`, case-insensitive; anything else is a category to descend into), tolerating the variations the spec's own `data/sample-feeds.opml` deliberately tests for: missing `type`/`title`, lowercase `xmlurl`/`htmlurl`, a feed nested two categories deep, and an entry with only a bare URL. Import shows a preview (new/duplicate/invalid, duplicates matched by URL against your existing feeds) before anything is added, and reports a final count. Export walks your current feeds grouped by category to rebuild the same nested structure.

### Refresh & Polling

**The approach:** A configurable interval (off/15/30/60 min) drives a `setInterval` around the existing `refresh()` — no new fetch logic needed. A "last updated" timestamp is derived from the most recent `fetchedAt` across all feeds' health data. The "N new items" banner is a second, independent signal from the existing "since last visit" one: `useFeeds` now diffs each refresh's results against the previous item-id set (skipping the very first load, where everything would trivially be "new") and surfaces a count a user can dismiss.

**What was trimmed:** ETag/Last-Modified conditional caching. It would mean plumbing conditional headers through `/api/feed` and `_lib/fetchFeed.ts` and storing a per-feed etag client-side — a real optimization, but one that's invisible to the user and meaningfully riskier to bolt onto `useFeeds.ts`'s existing backoff/token-guard logic than the rest of this pass.

### Performance

**The approach:** Concrete, verifiable changes: `loading="lazy"` on every card/avatar image and on reader-view content images (via a DOMPurify hook that tags every sanitized `<img>`); a skeleton-screen component matching each layout's real shape for the very first load (no layout shift, unlike the old plain "Loading…" text); and `React.lazy`/`Suspense` code-splitting for the three less-visited routes (Analytics, Accessibility statement, Reset password), confirmed via `npm run build` to produce separate chunks.

**Lighthouse scores** (`npx lighthouse`, headless, against a `vite preview` production build):

| Route                     | Performance | Accessibility | Best Practices | SEO |
| ------------------------- | :---------: | :-----------: | :------------: | :-: |
| `/` (landing)             |     82      |      83       |      100       | 82  |
| `/app` (dashboard, guest) |     59      |      96       |      100       | 82  |

Landing page: FCP/LCP 2.5s, TBT 470ms, CLS 0, TTI 3.0s — under the spec's 3s initial-load target but over its 2s landing-page-TTI target.

**Why `/app`'s performance score is lower, and why it's not fully representative:** `vite preview` serves the built static files only — it doesn't run the dev-only middleware that mirrors `/api/*` locally (see Tech Stack), so under this specific test the dashboard's feed requests 404 and the page never reaches its real steady state. The 59 is a real number for _this_ test setup, not a claim about production performance under Vercel (where `/api/*` runs for real); it's reported here rather than omitted because a caveated real number is more honest than no number at all.

### Keyboard Navigation

**The approach:** `j`/`k` move a visual focus indicator through the currently-rendered list (auto-expanding pagination and auto-scrolling into view at the boundary); `o`/`Enter` opens the focused item in the reader; `s` and `m` bookmark/toggle-read it. `?` opens a shortcut-reference dialog; `Cmd`/`Ctrl+K` opens a command palette (hand-rolled substring filter over a small static action list — switch category, jump to Saved/Digest, change layout, mark all read, jump to Analytics/Accessibility) since the action list is small enough that a fuzzy-search dependency wasn't worth adding. List shortcuts are suppressed while typing or while any dialog (`role="dialog"`) is open, the same guard the existing `/`-focuses-search shortcut already used.

**What was trimmed:** vim-style `g`-then-`h`/`s`/`f` compound sequences — the single-key shortcuts above and the command palette already reach the same destinations more directly.

### Digest / Summary View

**The approach:** Since this was an open design question in the spec, it's a since-last-visit briefing grouped by category: items published after your last visit, capped at 5 per category, most-recent first, with a "View all in [category]" link back to the main feed filtered to that category. It's a toggle in the header (`Feed`/`Digest`) rather than a separate route, reusing `BlogCard` for rendering instead of a new card component. The "since last visit" timestamp was lifted out of `Homepage.tsx` into a shared `useLastVisit()` hook so switching between Feed and Digest doesn't reset or duplicate the snapshot.

### Other Design Choices

- **Category IDs are stable and separate from display names.** Renaming a category, or deleting one out from under a feed's assignment, can't silently break navigation — a feed whose category no longer exists just falls back to "Uncategorized" automatically, no cleanup pass required.
- **Feed management layers on top of the curated data rather than mutating it.** Curated feeds you remove are hidden (and can be restored); feeds you add live entirely in `localStorage`. The curated `data/sample-feeds.json` set is never touched.
- **Feed health distinguishes temporary errors from likely-dead feeds** (3+ consecutive failures), with per-feed manual retry and exponential backoff on bulk refresh so one broken feed doesn't get hammered every time you refresh.
- **The reader view sanitizes feed HTML with DOMPurify** before rendering — feed content is untrusted input, and this was verified against actual `<script>`/`onerror`/`javascript:` payloads, not just assumed safe.

---

## Known Limitations

- **Guest data never migrates into a new account.** Signing up starts from the same curated defaults as guest mode, not from whatever a guest session already had in `localStorage`.
- **Accessibility preferences are device-local, not account-synced**, even when signed in — see [Design Decisions](#design-decisions) for why.
- **Search has no date-range filter or recent-search history.** Both are explicitly optional in the spec; not built.
- **Refresh has no conditional (ETag/Last-Modified) caching.** Auto-refresh and the "new items" banner work; feeds are always re-fetched in full rather than skipped when unchanged upstream.
- **Keyboard navigation has no vim-style `g`-then-key sequences.** The single-key shortcuts and command palette cover the same destinations.
- **The `/app` Lighthouse score reflects a `vite preview` build without `/api/*` running**, not real production performance — see [Design Decisions](#design-decisions) for why.
- **AI Summarization and Offline/PWA support (differentiators) were not chosen** for this pass — see the Differentiators table above.
- **Feed-fetch SSRF hardening is basic.** `/api/feed` and `/api/validateFeed` accept arbitrary user-supplied URLs (a structural requirement of "add any feed by URL") and block the obvious cases — localhost, private IP ranges — by hostname text. They do not resolve DNS or guard against rebinding attacks; that level of hardening was judged out of scope for this project.
- **No rate limiting** on feed fetches beyond the per-feed backoff on repeated failures.

---

## Running Locally

Guest mode works with zero configuration. Signing up/in requires a Supabase project.

```bash
cd frontpage-app

# Install dependencies
npm install

# Run the development server (mirrors /api/* serverless functions locally,
# no Vercel CLI needed)
npm run dev
```

### Supabase setup (only needed to test sign-up/sign-in)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run every file in `supabase/migrations/`, in order (`0001_init.sql`, `0002_read_events_analytics.sql`, then `0003_bookmarks_and_prefs.sql`).
3. In Authentication → URL Configuration, add `http://localhost:5173` as a valid redirect URL (needed for email confirmation and password reset links).
4. Create `frontpage-app/.env.local`:

   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   Only the public **anon** key ever belongs here — never the `service_role` key, which bypasses row-level security.

Other scripts:

```bash
npm run build   # tsc -b && vite build
npm run lint    # eslint .
npm run preview # preview the production build
```

---

## Self-Assessment, Development Journey & AI Collaboration Reflection

1. Sidebar scroll on mobile — Sidebar.tsx was locking scroll with document.body.style.overflow = "hidden", which iOS Safari partially ignores for touch. Added useLockBodyScroll.ts, which pins the body with position: fixed (removing it from the scrollable flow) and restores the exact scroll position on close. Also gave the drawer panel its own overflow-y-auto overscroll-contain so long content scrolls internally without leaking to the page.

2. Add Feed modal "zooming in" — not actually a zoom bug in your code, it's iOS Safari auto-zooming any input under 16px font-size on focus. AddFeedDialog.tsx inputs were text-sm (13px), and the URL field auto-focuses the instant the dialog opens, so it fired immediately with no reset — hence the double-tap-to-recover. Changed the input class to text-base sm:text-sm (16px on mobile, unchanged 13px at sm: and up), and reused the new scroll-lock hook here too.

3. Password visibility toggle — added PasswordInput.tsx, a small wrapper with an eye/eye-off button (lucide icons, proper aria-label/aria-pressed) that toggles between type="password" and type="text". Wired into both SignInPage.tsx and SignUpPage.tsx.

## ...

## Acknowledgments

Built as a [Frontend Mentor Product Challenge](https://www.frontendmentor.io).
