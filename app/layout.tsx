import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gil.solutions"),
  title: "Gil Lopes Bueno - Senior Software Engineer",
  description: "Fullstack Dev since 2007, Blockchain Dev since 2018",
  keywords: [
    "Senior Developer",
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
    title: "Gil Lopes Bueno - Senior Software Engineer",
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
    title: "Gil Lopes Bueno - Senior Software Engineer",
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
    canonical: "https://linkedin.com/in/gilbueno",
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
    <html lang="en" className="transition-colors">
      <body className="bg-white dark:bg-neutral-900 transition-colors vsc-initialized">
        {children}
      </body>
    </html>
  );
}
