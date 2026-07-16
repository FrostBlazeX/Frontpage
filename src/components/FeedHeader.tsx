import { RxTextAlignLeft } from "react-icons/rx";
import { BiRefresh } from "react-icons/bi";
import IconButtons from "./IconButtons";
import { ArrowUp } from "lucide-react";

function FeedHeader() {
  return (
    <div>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">All Items</h1>
          <h2 className="text-sm text-gray-600 font-light"> 47 unread</h2>
        </div>
        <div className="flex items-center gap-2">
          <IconButtons />

          <button className="flex items-center gap-1 rounded-md border border-gray-400 text-gray-900 px-3 py-1 hover:bg-gray-100">
            <span className="relative -top-1">
              <RxTextAlignLeft className="h-4 w-4" />
            </span>
            <span className="font-medium">Newest</span>
          </button>
          <button className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 font-medium">
            <BiRefresh />
            Refresh
          </button>
          <button className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 font-medium">
            Mark all read
          </button>
        </div>
      </div>
      <div className="bg-blue-100 items-center justify-center flex gap-2 px-6 py-2 border-b border-gray-300">
        <ArrowUp className="h-5 w-5 text-blue-500" />
        <p className="text-md text-blue-500 font-semibold">
          5 new items since your last visit
        </p>
      </div>
    </div>
  );
}
export default FeedHeader;
