import FeedHeader from "../components/FeedHeader";
import FeedPage from "../components/FeedPage";

type HomepageProps = {
  selectedCategory: string;
};

const Homepage = ({ selectedCategory }: HomepageProps) => {
  return (
    <div className="flex flex-col flex-1 w-full">
      <FeedHeader />

      {/* Feed items go here */}
      <FeedPage selectedCategory={selectedCategory} />
    </div>
  );
};
export default Homepage;
