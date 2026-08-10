import type { DailyCount } from "../../hooks/useReadingAnalytics";

type ActivityHeatmapProps = {
  data: DailyCount[]; // ascending, daily, no gaps
};

const CELL_SIZE = 12;
const LEVELS = 4; // + the zero level

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date);
}

// Sequential single-hue ramp derived from the app's own accent token via
// color-mix, toward the surface, rather than a second hardcoded palette —
// same hue at every step (choosing-a-form.md: "sequential = one hue, more is
// darker"), and it inherits the light/dark swap for free.
function levelColor(level: number): string {
  if (level === 0) return "var(--color-border-subtle)";
  const pct = (level / LEVELS) * 85 + 15; // 15%..100% of accent
  return `color-mix(in oklab, var(--color-accent) ${pct}%, var(--color-surface))`;
}

function bucketize(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  return Math.max(1, Math.ceil((count / max) * LEVELS));
}

// GitHub-style calendar: weeks as columns, Sun-Sat as rows. The heatmap is a
// grid comparison (choosing-a-form.md: "compare magnitude... heatmap for a
// grid" → sequential color), so cell hue never carries identity, only count.
function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const max = Math.max(1, ...data.map((d) => d.count));

  const firstDate = new Date(`${data[0]?.date ?? new Date().toISOString().slice(0, 10)}T00:00:00`);
  const leadingBlanks = firstDate.getDay(); // 0=Sun

  const cells: (DailyCount | null)[] = [...Array(leadingBlanks).fill(null), ...data];
  const weeks: (DailyCount | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) =>
              day ? (
                <div key={day.date} className="group relative">
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${formatDateLabel(day.date)}: ${day.count} article${day.count === 1 ? "" : "s"} read`}
                    className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: levelColor(bucketize(day.count, max)),
                    }}
                  />
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs shadow-md group-hover:block group-focus-within:block"
                  >
                    <span className="font-semibold text-text-primary">{day.count}</span>{" "}
                    <span className="text-text-secondary">on {formatDateLabel(day.date)}</span>
                  </div>
                </div>
              ) : (
                <div key={dayIndex} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-text-tertiary">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            aria-hidden="true"
            className="rounded-sm"
            style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: levelColor(level) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export function ActivityHeatmapTable({ data }: ActivityHeatmapProps) {
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
        <p className="py-3 text-sm text-text-secondary">No reading activity yet.</p>
      )}
    </div>
  );
}

export default ActivityHeatmap;
