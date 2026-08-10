export interface RankedRow {
  key: string;
  label: string;
  count: number;
}

type RankedBarListProps = {
  rows: RankedRow[];
  emptyMessage: string;
  maxRows?: number;
};

const MAX_BAR_THICKNESS = 24;

// Horizontal ranking, not a pie or a colored-per-row bar — this is a
// magnitude comparison across labeled categories, and identity already rides
// the label, so color's only job here is magnitude (sequential, one hue).
// Past `maxRows`, the tail folds into "Other" rather than growing the list
// or inventing more hues (choosing-a-form.md's series-count ladder).
function foldRows(rows: RankedRow[], maxRows: number): RankedRow[] {
  if (rows.length <= maxRows) return rows;
  const head = rows.slice(0, maxRows - 1);
  const tailCount = rows.slice(maxRows - 1).reduce((sum, row) => sum + row.count, 0);
  return [...head, { key: "__other__", label: "Other", count: tailCount }];
}

function RankedBarList({ rows, emptyMessage, maxRows = 6 }: RankedBarListProps) {
  if (rows.length === 0) {
    return <p className="py-6 text-sm text-text-secondary">{emptyMessage}</p>;
  }

  const folded = foldRows(rows, maxRows);
  const max = Math.max(...folded.map((row) => row.count));

  return (
    <ul className="flex flex-col gap-3">
      {folded.map((row) => {
        const widthPct = Math.max((row.count / max) * 100, 4);
        return (
          <li key={row.key} className="group relative">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="truncate pr-2 text-text-primary">{row.label}</span>
              <span className="tabular-nums text-text-secondary">{row.count}</span>
            </div>
            <div
              tabIndex={0}
              role="img"
              aria-label={`${row.label}: ${row.count} article${row.count === 1 ? "" : "s"} read`}
              className="h-2.5 rounded-full bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ maxHeight: MAX_BAR_THICKNESS }}
            >
              <div
                className="h-full rounded-full bg-accent transition-colors group-hover:bg-accent-hover"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function RankedBarTable({ rows, emptyMessage, maxRows = 6 }: RankedBarListProps) {
  if (rows.length === 0) {
    return <p className="py-6 text-sm text-text-secondary">{emptyMessage}</p>;
  }
  const folded = foldRows(rows, maxRows);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-text-secondary">
          <th className="py-1 font-medium">Name</th>
          <th className="py-1 font-medium">Articles read</th>
        </tr>
      </thead>
      <tbody>
        {folded.map((row) => (
          <tr key={row.key} className="border-t border-border-subtle">
            <td className="py-1.5 text-text-primary">{row.label}</td>
            <td className="py-1.5 tabular-nums text-text-primary">{row.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RankedBarList;
