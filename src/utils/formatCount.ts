const CAP = 99;

// guidance/patterns.md: "Don't use notification badges for counts over 99 —
// show '99+' and stop. Anxiety-inducing counts are a dark pattern."
export function formatCount(count: number): string {
  return count > CAP ? `${CAP}+` : String(count);
}
