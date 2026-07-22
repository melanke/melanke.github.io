import Link from 'next/link'
import { getAllSlugs, getPost, getAdjacentPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CompactHeader } from '@/components/CompactHeader'
import { AUTHOR, SITE_URL } from '@/lib/site'
import 'highlight.js/styles/github-dark.css'

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} - Gil Lopes Bueno`,
    description: post.summary,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      url: `${SITE_URL}/blog/${slug}`,
      publishedTime: post.publishedAt,
      images: post.ogImage ? [{ url: post.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: post.ogImage ? [post.ogImage] : [],
    },
  }
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
  title: 'Principal Software Engineer',
  contacts: {
    fullName: 'Gil L Bueno',
    email: 'gilbueno.mail@gmail.com',
    github: 'github.com/melanke',
    telegram: 'melankeee',
    x: 'melanke',
    education: "Computer Science, Bachelor's Degree PUC-SP",
    languages: 'English and Portuguese',
    location: 'Sao Paulo, Brazil (UTC-3)',
    linkedin: 'linkedin.com/in/gilbueno',
  },
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(slug)

  const url = `${SITE_URL}/blog/${slug}`
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(post.ogImage ? { image: `${SITE_URL}${post.ogImage}` } : {}),
    ...(post.publishedAt
      ? { datePublished: post.publishedAt, dateModified: post.publishedAt }
      : {}),
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      url: AUTHOR.url,
      sameAs: [...AUTHOR.sameAs],
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Gil Lopes Bueno', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CompactHeader {...headerProps} />

      {post.ogImage && (
        <div className="max-w-3xl mx-auto px-5 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.ogImage}
            alt={post.title}
            className="w-full h-auto rounded-xl"
          />
        </div>
      )}

      <main className="max-w-3xl mx-auto px-5 py-10">
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-500 mb-6">
          <Link href="/" className="hover:text-[#f9b800] dark:hover:text-[#f9b800] transition-colors">Gil Lopes Bueno</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#f9b800] dark:hover:text-[#f9b800] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-neutral-600 dark:text-neutral-300 truncate">{post.title}</span>
        </nav>
        <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-500 mb-3">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.publishedAt && <span>·</span>}
          <span>{post.readingTime} min read</span>
        </div>
        <h1 className="font-clash text-4xl font-bold text-neutral-900 dark:text-white leading-tight mb-8">
          {post.title}
        </h1>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />

        {(prev || next) && (
          <nav className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-4">
            <div>
              {next && (
                <Link href={`/blog/${next.slug}`} className="group flex flex-col gap-1">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">← Newer</span>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#f9b800] dark:group-hover:text-[#f9b800] transition-colors line-clamp-2">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {prev && (
                <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-1 items-end">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">Older →</span>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#f9b800] dark:group-hover:text-[#f9b800] transition-colors line-clamp-2">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </main>
    </div>
  )
}
