import { useState } from "react";
import { Menu, LayoutGrid, TextAlignStart } from "lucide-react";

function IconButtons() {
  const [active, setActive] = useState("menu");
  const views = [
    { id: "list", icon: Menu },
    { id: "grid", icon: LayoutGrid },
    { id: "compact", icon: TextAlignStart },
  ];

  return (
    <div className="flex overflow-hidden rounded-lg w-36 border border-gray-300">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <button
            key={view.id}
            onClick={() => setActive(view.id)}
            className={`flex-1 flex justify-center p-2 border-x border-gray-200 ${
              active === view.id ? "bg-gray-200" : "hover:bg-gray-100"
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
