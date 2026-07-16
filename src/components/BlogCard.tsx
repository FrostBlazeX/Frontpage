import type { Blog } from "../types/blog";
import { getAuthorAvatarColor } from "../utils/getAuthorAvatarColor";
import AuthorAvatar from "./AuthorAvatar";
import UnreadIndicator from "./UnreadIndicator";

type BlogCardProps = {
  blog: Blog;
};

function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="flex gap-2 p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 cursor-pointer transition-shadow duration-300 hover:-translate-y-0.5">
      <div className=" flex justify-center pt-1 w-6">
        <UnreadIndicator />
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex gap-2 items-center">
          <AuthorAvatar
            name={blog.author}
            backgroundColor={getAuthorAvatarColor(blog.author)}
          />
          <h2 className="text-sm text-gray-700 font-medium ">{blog.author}</h2>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <p className="text-xs text-gray-500">{blog.publishedAt}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold leading-tight">{blog.title}</h3>
        </div>
        <div className="pb-1">
          <p className="text-gray-600 text-base leading-6 line-clamp-2 tracking-wide ">
            {blog.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-gray-500 text-sm">
          <span className="text-xs rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-gray-700">
            {blog.category}
          </span>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
