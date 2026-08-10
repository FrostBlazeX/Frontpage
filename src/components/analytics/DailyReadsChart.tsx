import type { DailyCount } from "../../hooks/useReadingAnalytics";

type DailyReadsChartProps = {
  data: DailyCount[];
};

const PLOT_HEIGHT = 160;
const MAX_BAR_THICKNESS = 24;

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

// Rounds a max value up to a "clean" tick per the dataviz skill's axis
// guidance — never an arbitrary decimal like 17 or 43.
function niceMax(value: number): number {
  if (value <= 5) return Math.max(value, 1);
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

// Single hue, magnitude comparison over time — a bar chart, not a line, since
// the data is discrete per-day counts (choosing-a-form.md: "compare
// magnitude" → bar/column, sequential color). The bar IS the hit target
// (interaction.md); the tooltip rides on :hover/:focus-within so keyboard
// users get the same detail as pointer users without any JS event wiring.
function DailyReadsChart({ data }: DailyReadsChartProps) {
  const max = niceMax(Math.max(1, ...data.map((d) => d.count)));
  const mid = Math.round(max / 2);

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-0 text-xs text-text-tertiary" style={{ height: PLOT_HEIGHT }}>
          <span>{max}</span>
          <span>{mid}</span>
          <span>0</span>
        </div>
        <div
          className="flex flex-1 gap-px border-l border-b border-border-subtle pl-2"
          style={{ height: PLOT_HEIGHT }}
        >
          {data.map((day) => {
            const heightPct = Math.max((day.count / max) * 100, day.count > 0 ? 4 : 0);
            return (
              <div key={day.date} className="group relative flex flex-1 items-end justify-center">
                <button
                  type="button"
                  aria-label={`${formatDateLabel(day.date)}: ${day.count} article${day.count === 1 ? "" : "s"} read`}
                  className="w-full rounded-t-sm bg-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{
                    height: `${heightPct}%`,
                    maxWidth: MAX_BAR_THICKNESS,
                    minHeight: 2,
                    backgroundColor: day.count === 0 ? "var(--color-border-subtle)" : undefined,
                  }}
                />
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-md group-hover:block group-focus-within:block"
                >
                  <span className="font-semibold text-text-primary">{day.count}</span>{" "}
                  <span className="text-text-secondary">on {formatDateLabel(day.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1 flex justify-between pl-8 text-xs text-text-tertiary">
        <span>{formatDateLabel(data[0]?.date ?? "")}</span>
        <span>{formatDateLabel(data[data.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}

export function DailyReadsTable({ data }: DailyReadsChartProps) {
  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-secondary">
            <th className="py-1 font-medium">Date</th>
            <th className="py-1 font-medium">Articles read</th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((day) => day.count > 0)
            .slice()
            .reverse()
            .map((day) => (
              <tr key={day.date} className="border-t border-border-subtle">
                <td className="py-1.5 text-text-primary">{formatDateLabel(day.date)}</td>
                <td className="py-1.5 tabular-nums text-text-primary">{day.count}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {data.every((day) => day.count === 0) && (
        <p className="py-3 text-sm text-text-secondary">No reads in this range yet.</p>
      )}
    </div>
  );
}

export default DailyReadsChart;
