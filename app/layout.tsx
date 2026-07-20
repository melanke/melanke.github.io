import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
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
  alternates: {
    canonical: "https://www.linkedin.com/in/gilsolutions/",
  },
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
    <html lang="en" className={`${display.variable} transition-colors`}>
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
