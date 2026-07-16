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

const items = [
  { name: "CSS-Tricks", count: 3, color: "bg-red-500" },
  { name: "Hacker News", count: 4, color: "bg-orange-500" },
  { name: "Dev.to", count: 2, color: "bg-cyan-500" },
  { name: "Overreacted", count: 2, color: "bg-blue-500" },
  { name: "web.dev", count: 3, color: "bg-teal-500" },
];

const itemsTwo = [
  { name: "Smashing Mag", count: 5, color: "bg-purple-300" },
  { name: "A List Apart", count: 2, color: "bg-green-500" },
  { name: "OpenAI Blog", count: 2, color: "bg-gray-900" },
  { name: "Hugging Face Blog", count: 2, color: "bg-blue-500" },
];

function FeedSources() {
  return (
    <div>
      <ul className="ml-4 space-y-2 mt-1 mb-1">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-2 px-2 rounded-md hover:bg-gray-200"
          >
            <InitialBox text={item.name} color={item.color} />

            <span className="flex-1 text-md capitalize">{item.name}</span>

            <span className="text-sm text-gray-500 w-6 text-right">
              {item.count}
            </span>
          </li>
        ))}
      </ul>

      <ul className="ml-4 space-y-2 mt-2 mb-2">
        {itemsTwo.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-2 px-2 rounded-md hover:bg-gray-200"
          >
            <InitialBox text={item.name} color={item.color} />

            <span className="flex-1 text-md">{item.name}</span>

            <span className="text-sm text-gray-500 w-6 text-right">
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default FeedSources;
