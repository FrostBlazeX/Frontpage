import { FolderOpen, Bookmark, CircleCheck } from "lucide-react";
import Categories from "./Categories";
// import FeedSources from "./FeedSources";

type SidebarProps = {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
};

function Sidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  console.log(selectedCategory);
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-300 bg-gray-100 px-3 text-gray-700">
      {/* Top section */}
      <div className="mt-2 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-200 transition px-2 rounded-md">
          <FolderOpen className="h-5 w-5" />
          <span>All Items</span>
          <span className="ml-auto">47</span>
        </div>

        <div className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-200 transition px-2 rounded-md mt-2">
          <Bookmark className="h-5 w-5" />
          <span>Saved</span>
          <span className="ml-auto">12</span>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 pb-4 mt-2">
        <h1 className="uppercase text-md font-semibold text-gray-500 mb-2">
          Categories
        </h1>

        <Categories
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
        />
        {/* <FeedSources /> */}
      </div>
      <div className="flex items-center gap-2 px-2 py-2 text-md mt-2">
        <CircleCheck className="h-5 w-5 text-green-400" />
        <span>All feeds healthy</span>
      </div>
    </aside>
  );
}

export default Sidebar;
