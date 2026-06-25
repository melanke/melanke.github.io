import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import type { Metadata } from 'next'
import { StickyHeader } from '@/components/StickyHeader'

export const metadata: Metadata = {
  title: 'Blog - Gil Lopes Bueno',
  description: 'Articles about software engineering, blockchain, and product development by Gil Lopes Bueno.',
  alternates: {
    types: {
      'application/rss+xml': 'https://gil.solutions/feed.xml',
    },
  },
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const headerProps = {
  name: 'Gil',
  title: 'Senior Software Engineer',
  contacts: {
    fullName: 'Gil L Bueno',
    email: 'gilbueno.mail@gmail.com',
    github: 'github.com/melanke',
    telegram: 'melankeee',
    x: 'melanke',
    education: "Computer Science, Bachelor's Degree PUC-SP",
    languages: 'English and Portuguese',
    location: 'Sao Paulo, Brazil (UTC-3)',
    linkedin: 'linkedin.com/in/gilsolutions',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <StickyHeader {...headerProps} />

      <main className="max-w-4xl mx-auto px-5 pb-16">
        <div className="mt-10 mb-8">
          <Link href="/" className="text-sm text-[#f9b800] dark:text-[#f9b800] hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="font-clash font-semibold text-2xl text-black dark:text-white mb-1">
            Blog
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Software engineering, blockchain, and product development.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100 dark:border-neutral-700"
            >
              {post.ogImage ? (
                <div className="aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.ogImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-[#f9b800] to-[#f9b800]" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 mb-2">
                  {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                  {post.publishedAt && <span>·</span>}
                  <span>{post.readingTime} min read</span>
                </div>
                <h2 className="font-clash font-semibold text-lg text-neutral-900 dark:text-white leading-snug group-hover:text-[#f9b800] dark:group-hover:text-[#f9b800] transition-colors">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    {post.summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
