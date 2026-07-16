import { articles } from "../data/articles";
import BlogCard from "./BlogCard";

type FeedPageProps = {
  selectedCategory: string;
};

function FeedPage({ selectedCategory }: FeedPageProps) {
  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  if (filteredArticles.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No articles found for "{selectedCategory}".
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-5">
      {filteredArticles.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </article>
  );
}
export default FeedPage;
