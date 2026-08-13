import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/Footer";

// Both families are self-hosted (next/font/local) instead of fetched from
// Google Fonts at build time via next/font/google. In this build environment
// that fetch silently resolved every requested weight to the same Regular
// file — every heading rendered as browser-synthesized fake bold instead of
// the real weight, which is also why the headless Chrome that generates the
// CV PDFs looked bolder/different than an actual browser print. Self-hosting
// the exact per-weight files sidesteps the fetch entirely.
const display = localFont({
  src: [
    { path: "./fonts/bricolage/Bricolage-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/bricolage/Bricolage-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/bricolage/Bricolage-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/bricolage/Bricolage-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/bricolage/Bricolage-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [
    { path: "./fonts/inter/Inter-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/inter/Inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter/Inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter/Inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter/Inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gil.solutions"),
  title: "Gil Lopes Bueno - Principal Software Engineer",
  description: "Fullstack Dev since 2007, Blockchain Dev since 2018",
  keywords: [
    "Principal Developer",
    "Full Stack",
    "Blockchain",
    "Web Development",
    "JavaScript",
    "TypeScript",
    "React",
    "NextJS",
    "Software Engineer",
    "Computer Science",
    "Ethereum",
    "Solana",
  ],
  authors: [{ name: "Gil Lopes Bueno" }],
  creator: "Gil Lopes Bueno",
  openGraph: {
    title: "Gil Lopes Bueno - Principal Software Engineer",
    description: "Fullstack Dev since 2007, Blockchain Dev since 2018",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/profile.webp",
        width: 400,
        height: 400,
        alt: "Gil Lopes Bueno",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Gil Lopes Bueno - Principal Software Engineer",
    description: "Fullstack Dev since 2007, Blockchain Dev since 2018",
    images: ["/profile.webp"],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // verification: {
  // google: "your-google-site-verification", // Opcional: se você tiver verificação do Google Search Console
  // },
  // NOTE: no `alternates.canonical` here on purpose — Next.js inherits it into
  // every child segment, which would make all pages canonicalize to one URL.
  // Each page declares its own canonical instead.
  other: {
    education: "Computer Science, Bachelor's Degree PUC-SP",
    languages: "English and Portuguese",
    location: "Sao Paulo, Brazil",
  },
  appleWebApp: {
    title: "Gil LB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} transition-colors`}>
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="6232833a-5ec5-4e89-b8f8-9cbdb7ce1dae" />
      </head>
      <body className="bg-white dark:bg-neutral-900 transition-colors vsc-initialized">
        {children}
        <Footer />
      </body>
    </html>
  );
}
