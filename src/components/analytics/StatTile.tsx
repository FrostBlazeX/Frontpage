type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
};

// Figure contract per the dataviz skill: label (sentence case, no trailing
// colon), value (semibold, proportional figures — never tabular-nums at
// display size), optional hint. No delta/sparkline here since none of these
// numbers have a prior-period comparison worth showing yet.
function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border-subtle p-5">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-tertiary">{hint}</p>}
    </div>
  );
}

export default StatTile;
