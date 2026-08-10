import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function AccessibilityStatementPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-page items-center gap-4 px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <span className="text-xl font-bold">Frontpage</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-12">
        <h1 className="text-2xl font-bold">Accessibility statement</h1>
        <p className="mt-3 text-text-secondary">
          Frontpage is built to be usable regardless of how you read, navigate, or perceive
          content. This page describes what's implemented today and how to adjust it.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Reading &amp; display preferences</h2>
          <p className="mt-2 text-text-secondary">
            Open the reading &amp; accessibility settings from the header (the icon next to your
            profile) to control:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-text-secondary">
            <li>
              <strong>Reduced motion</strong> — turns off animations and transitions in-app, in
              addition to automatically respecting your operating system's reduced-motion
              preference.
            </li>
            <li>
              <strong>High contrast</strong> — switches text, borders, and links to a WCAG AAA
              (21:1) black-on-white or white-on-black palette, in both light and dark mode.
            </li>
            <li>
              <strong>Dyslexia-friendly font</strong> — switches body and reader text to Lexend, a
              typeface designed to improve reading proficiency.
            </li>
            <li>
              <strong>Font size</strong> — scales all text in the app from small to extra-large.
            </li>
            <li>
              <strong>Reader line height &amp; line length</strong> — adjusts spacing and column
              width in the article reader for easier tracking line to line.
            </li>
          </ul>
          <p className="mt-2 text-text-secondary">
            These preferences are stored on this device and apply immediately, without a page
            reload.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Keyboard &amp; screen reader support</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-text-secondary">
            <li>Every interactive control is reachable and operable by keyboard alone.</li>
            <li>Dialogs (add feed, reader view, accessibility settings) trap focus, move focus to themselves on open, and close on Escape.</li>
            <li>Landmarks and labels (navigation, search, buttons) are provided for assistive technology.</li>
            <li>Press <kbd className="rounded-md border border-border bg-bg-tertiary px-1.5 py-0.5 text-xs">/</kbd> anywhere in the dashboard to jump to search.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Feedback</h2>
          <p className="mt-2 text-text-secondary">
            If you encounter an accessibility barrier anywhere in Frontpage, we want to know — this
            statement will keep expanding as more of the app is audited.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AccessibilityStatementPage;
