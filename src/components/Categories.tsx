type CategoryButtonProps = {
  label: string;
  count: number;
  color: string;
  active?: boolean;
  onClick?: () => void;
};

type CategoriesProps = {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
};

type InitialBoxProps = {
  text: string;
  color: string;
};

const InitialBox = ({ text, color }: InitialBoxProps) => {
  const initial = text?.charAt(0).toUpperCase();

  return (
    <span
      className={`w-6 h-6 flex items-center justify-center rounded-md text-md font-semibold text-white ${color}`}
    >
      {initial}
    </span>
  );
};

const ColorDot = ({ color = "bg-gray-400" }) => (
  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
);

const CategoryButton = ({
  label,
  count,
  color,
  active,
  onClick,
}: CategoryButtonProps) => {
  return (
    <button
      type="button"
      className={`
  flex items-center gap-2 w-full rounded-md px-2 py-2
  transition text-left
  ${
    active
      ? "bg-blue-100 text-blue-600"
      : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
  }
`}
      onClick={onClick}
    >
      <ColorDot color={color} />
      <span className="flex-1  ">{label}</span>
      <span className=" text-gray-500 w-6 text-right">{count}</span>
    </button>
  );
};

const categoriesList = [
  {
    label: "All",
    count: 47,
    color: "bg-blue-700",
    feeds: [],
  },
  {
    label: "Dev",
    count: 14,
    color: "bg-blue-600",
    feeds: [
      { name: "CSS-Tricks", count: 3, color: "bg-red-500" },
      { name: "Hacker News", count: 4, color: "bg-orange-500" },
      { name: "Dev.to", count: 2, color: "bg-cyan-500" },
      { name: "Overreacted", count: 2, color: "bg-blue-500" },
      { name: "web.dev", count: 3, color: "bg-teal-500" },
    ],
  },

  {
    label: "Design",
    count: 11,
    color: "bg-pink-500",
    feeds: [
      { name: "Smashing Mag", count: 5, color: "bg-purple-300" },
      { name: "A List Apart", count: 2, color: "bg-green-500" },
      { name: "OpenAI Blog", count: 2, color: "bg-gray-900" },
      { name: "Hugging Face Blog", count: 2, color: "bg-blue-500" },
    ],
  },

  {
    label: "Tools",
    count: 8,
    color: "bg-yellow-500",
    feeds: [],
  },

  {
    label: "AI",
    count: 6,
    color: "bg-blue-700",
    feeds: [],
  },
];

function Categories({ selectedCategory, onCategorySelect }: CategoriesProps) {
  return (
    <div className="space-y-2">
      {categoriesList.map((category) => (
        <div key={category.label}>
          <CategoryButton
            label={category.label}
            count={category.count}
            color={category.color}
            active={selectedCategory === category.label}
            onClick={() => onCategorySelect(category.label)}
          />
          {category.feeds.length > 0 && (
            <ul className="ml-4 space-y-2 mt-1">
              {category.feeds.map((feed) => (
                <li
                  key={feed.name}
                  className="flex items-center gap-2 px-2 rounded-md hover:bg-gray-200"
                >
                  <InitialBox text={feed.name} color={feed.color} />

                  <span className="flex-1 text-md">{feed.name}</span>

                  <span className="text-sm text-gray-500">{feed.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
export default Categories;
