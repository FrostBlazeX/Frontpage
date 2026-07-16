import { Search, Square, Plus } from "lucide-react";

export default function Header() {
  const user = {
    firstName: "Mary",
    lastName: "Smith",
  };

  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  const activePage = "feed";
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 ">
      <div className=" w-full flex h-16 items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              F
            </div>
            <span className="text-xl font-bold text-gray-900">Frontpage</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-lg font-medium leading-none">
            <a
              href="#"
              className={`px-3 py-2 rounded-md transition ${
                activePage === "feed"
                  ? "bg-gray-200 text-black"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              Feed
            </a>

            <a
              href="#"
              className="text-gray-600  hover:text-black transition leading-none"
            >
              Digest
            </a>

            <a
              href="#"
              className="text-gray-600  hover:text-black transition leading-none"
            >
              Discover
            </a>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden lg:flex items-center rounded-full bg-gray-100 px-4 py-2 w-80">
            <Search size={18} className="text-gray-500" />

            <input
              type="text"
              placeholder="Search articles..."
              className="ml-2 w-full bg-transparent outline-none text-sm"
            />
          </div>

          {/* button */}
          <button className="rounded-full p-2">
            <div className="relative h-10 w-10">
              <Square
                className="absolute inset-0 h-10 w-10 text-gray-400"
                strokeWidth={1}
              />
              <Plus
                className="absolute inset-0 m-auto h-5 w-5 text-gray-700"
                strokeWidth={1.5}
              />
            </div>
          </button>

          {/* Profile */}
          <button className="flex items-center rounded-full px-2 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {initials}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
