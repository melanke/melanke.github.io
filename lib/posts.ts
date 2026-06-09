import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

const postsDir = path.join(process.cwd(), 'posts')

export interface Post {
  slug: string
  title: string
  summary?: string
  ogImage?: string
  publishedAt?: string
  linkedinUrl?: string
  readingTime: number
  content?: string
}

function calcReadingTime(markdownContent: string): number {
  const words = markdownContent.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Lightweight helper — reads frontmatter only, no content parse */
function getAllPostsMeta(): { slug: string; linkedinUrl?: string }[] {
  return fs
    .readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8')
      const { data } = matter(raw)
      return {
        slug: slugify(filename.replace(/\.md$/, '')),
        linkedinUrl: data['linkedin-url'] as string | undefined,
      }
    })
}

/**
 * Replaces href values in HTML that point to LinkedIn pulse URLs which
 * correspond to posts in this blog, rewriting them to local /blog/{slug} paths.
 */
function normalizeLinkedInPath(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    let pathname = parsed.pathname.replace(/\/$/, '')
    // Decode until stable to handle double-encoded URLs (%25C3%25A7 → %C3%A7 → ç)
    let prev = ''
    while (prev !== pathname) {
      prev = pathname
      try { pathname = decodeURIComponent(pathname) } catch { break }
    }
    return pathname.toLowerCase()
  } catch {
    return ''
  }
}

function rewriteLinkedInLinks(html: string): string {
  const metaList = getAllPostsMeta()

  // Build a map: normalized linkedin pathname → local slug
  const linkedinToSlug = new Map<string, string>()
  for (const { slug, linkedinUrl } of metaList) {
    if (!linkedinUrl) continue
    const normalized = normalizeLinkedInPath(linkedinUrl)
    if (normalized) linkedinToSlug.set(normalized, slug)
  }

  // Replace all href="...linkedin.com/pulse/..." links
  return html.replace(/href="(https?:\/\/(?:www\.)?linkedin\.com\/pulse\/[^"]+)"/g, (match, url) => {
    const normalized = normalizeLinkedInPath(url)
    const slug = linkedinToSlug.get(normalized)
    if (slug) return `href="/blog/${slug}"`
    // No matching local post — strip the href so the link text stays but doesn't navigate away
    return 'href="#"'
  })
}

export function getAllPosts(): Omit<Post, 'content'>[] {
  return fs
    .readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8')
      const { data, content } = matter(raw)
      return {
        slug: slugify(filename.replace(/\.md$/, '')),
        title: filename.replace(/\.md$/, ''),
        summary: data.summary as string | undefined,
        ogImage: data['og-image'] as string | undefined,
        publishedAt: data['published-at'] as string | undefined,
        linkedinUrl: data['linkedin-url'] as string | undefined,
        readingTime: calcReadingTime(content),
      }
    })
    .sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
}

export function getAdjacentPosts(slug: string): {
  prev: Omit<Post, 'content'> | null
  next: Omit<Post, 'content'> | null
} {
  const posts = getAllPosts()
  const index = posts.findIndex(p => p.slug === slug)
  return {
    next: index > 0 ? posts[index - 1] : null,
    prev: index < posts.length - 1 ? posts[index + 1] : null,
  }
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => slugify(f.replace(/\.md$/, '')))
}

export function getPost(slug: string): Post | null {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  const filename = files.find(f => slugify(f.replace(/\.md$/, '')) === slug)
  if (!filename) return null

  const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8')
  const { data, content } = matter(raw)

  const rawHtml = marked.parse(content) as string
  const processedHtml = rewriteLinkedInLinks(rawHtml)

  return {
    slug,
    title: filename.replace(/\.md$/, ''),
    summary: data.summary as string | undefined,
    ogImage: data['og-image'] as string | undefined,
    publishedAt: data['published-at'] as string | undefined,
    linkedinUrl: data['linkedin-url'] as string | undefined,
    readingTime: calcReadingTime(content),
    content: processedHtml,
  }
}
