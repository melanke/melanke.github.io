import Link from 'next/link'
import { CompactHeader } from '@/components/CompactHeader'

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

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
      <CompactHeader {...headerProps} />
      <main className="flex-1 flex flex-col items-center justify-center px-5 text-center gap-6">
        <p className="font-clash font-bold text-8xl text-[#f9b800] dark:text-[#f9b800] leading-none">
          404
        </p>
        <div>
          <h1 className="font-clash font-semibold text-2xl text-neutral-900 dark:text-white">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-5 py-2 rounded-full bg-[#f9b800] text-white text-sm font-semibold hover:bg-[#f9b800] transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="px-5 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:border-[#f9b800] dark:hover:border-[#f9b800] transition-colors"
          >
            Read the blog
          </Link>
        </div>
      </main>
    </div>
  )
}
