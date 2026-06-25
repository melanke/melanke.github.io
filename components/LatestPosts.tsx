import Link from "next/link";
import type { Post } from "@/lib/posts";

type PostMeta = Omit<Post, "content">;

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface LatestPostsProps {
  posts: PostMeta[];
  className?: string;
}

export function LatestPosts({ posts, className = "" }: LatestPostsProps) {
  return (
    <div className={className}>
      <div className="font-clash font-semibold text-2xl text-black dark:text-white mt-14 mb-6">
        Latest Posts
      </div>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100 dark:border-neutral-700"
          >
            {post.ogImage ? (
              <div className="w-24 shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.ogImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-24 shrink-0 bg-gradient-to-br from-[#f9b800] to-[#f9b800]" />
            )}
            <div className="py-3 pr-4 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mb-1">
                {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                {post.publishedAt && <span>·</span>}
                <span>{post.readingTime} min read</span>
              </div>
              <h3 className="font-clash font-semibold text-sm text-neutral-900 dark:text-white leading-snug group-hover:text-[#f9b800] dark:group-hover:text-[#f9b800] transition-colors">
                {post.title}
              </h3>
              {post.summary && (
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {post.summary}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href="/blog"
          className="text-sm text-[#f9b800] dark:text-[#f9b800] hover:underline font-semibold"
        >
          View all posts →
        </Link>
      </div>
    </div>
  );
}
