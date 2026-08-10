import { Link } from "react-router-dom";
import { Rss, LayoutGrid, BookOpen, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Rss,
    title: "One place for everything you read",
    description:
      "Dev blogs, design publications, changelogs, newsletters — pull RSS and Atom feeds from anywhere into a single organized dashboard.",
  },
  {
    icon: LayoutGrid,
    title: "Organize it your way",
    description:
      "Custom categories, per-feed reassignment, and three reading layouts — dense list, image-forward grid, or a scannable compact view.",
  },
  {
    icon: BookOpen,
    title: "Read without leaving",
    description:
      "An in-app reader view renders full article content cleanly, with next/previous navigation between items.",
  },
  {
    icon: ShieldCheck,
    title: "Built to handle real feeds",
    description:
      "Broken feeds, stale sources, malformed XML — feed health is tracked per source so one dead feed never breaks the rest.",
  },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-bold text-white">
              F
            </div>
            <span className="text-xl font-bold">Frontpage</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/signin"
              className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-page px-6 py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Your personalized front page for tech content.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            A calm, organized home for the blogs, newsletters, and release notes you actually want
            to keep up with — no algorithm, no noise, just your sources.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="w-full rounded-md bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
            >
              Sign Up
            </Link>
            <Link
              to="/app"
              className="w-full rounded-md border border-border px-6 py-3 font-semibold transition-colors hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
            >
              Try as Guest
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-page px-6 pb-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border border-border-subtle p-6 text-left"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mb-1 font-semibold">{feature.title}</h2>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle px-6 py-6 text-center text-sm text-text-tertiary">
        Built as a{" "}
        <a
          href="https://www.frontendmentor.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Frontend Mentor
        </a>{" "}
        Product Challenge.
      </footer>
    </div>
  );
}

export default LandingPage;
