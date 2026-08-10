import { Menu, LayoutGrid, TextAlignStart } from "lucide-react";
import type { FeedLayout } from "../hooks/useLayoutPreference";

type IconButtonsProps = {
  layout: FeedLayout;
  onLayoutChange: (layout: FeedLayout) => void;
};

const views: { id: FeedLayout; icon: typeof Menu; label: string }[] = [
  { id: "list", icon: Menu, label: "List" },
  { id: "grid", icon: LayoutGrid, label: "Grid" },
  { id: "compact", icon: TextAlignStart, label: "Compact" },
];

function IconButtons({ layout, onLayoutChange }: IconButtonsProps) {
  return (
    <div className="flex overflow-hidden rounded-md w-36 border border-border">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onLayoutChange(view.id)}
            aria-label={`${view.label} view`}
            aria-pressed={layout === view.id}
            className={`flex-1 flex justify-center p-2 border-x border-border-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
              layout === view.id ? "bg-accent-subtle text-accent" : "text-text-secondary hover:bg-bg-tertiary"
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
export default IconButtons;
