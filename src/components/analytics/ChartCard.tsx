import { useState } from "react";
import type { ReactNode } from "react";
import { Table2, BarChart3 } from "lucide-react";

type ChartCardProps = {
  title: string;
  caption?: string;
  chart: ReactNode;
  table: ReactNode;
};

// The container every chart mounts in — title, optional caption, and the
// table-view toggle that's this chart's accessibility twin (dataviz skill,
// components.md: "the table-view toggle... the accessibility twin of every
// chart"). Every value shown by the chart is also reachable in the table,
// so nothing is gated behind hover or color.
function ChartCard({ title, caption, chart, table }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="rounded-lg border border-border-subtle p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          {caption && <p className="text-sm text-text-secondary">{caption}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          aria-pressed={showTable}
          aria-label={showTable ? "Show chart view" : "Show table view"}
          title={showTable ? "Show chart view" : "Show table view"}
          className="flex min-h-9 min-w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {showTable ? <BarChart3 className="h-4 w-4" aria-hidden="true" /> : <Table2 className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {showTable ? table : chart}
    </div>
  );
}

export default ChartCard;
