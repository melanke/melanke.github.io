import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";
import { AUTHOR, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Principal Software Engineer",
  description: "Backend Engineer since 2007, now building AI-driven products",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gil Lopes Bueno - Principal Software Engineer",
    description: "Backend Engineer since 2007, now building AI-driven products",
    url: SITE_URL,
  },
  twitter: {
    title: "Gil Lopes Bueno - Principal Software Engineer",
    description: "Backend Engineer since 2007, now building AI-driven products",
  },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: AUTHOR.name,
  jobTitle: AUTHOR.jobTitle,
  url: AUTHOR.url,
  image: AUTHOR.image,
  sameAs: [...AUTHOR.sameAs],
  description:
    "Backend Engineer since 2007, now building AI-driven products. Blockchain Dev since 2018.",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "PUC-SP",
  },
  knowsLanguage: ["en", "pt-BR"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sao Paulo",
    addressCountry: "BR",
  },
};

const siteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: AUTHOR.name,
  url: SITE_URL,
  author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
      />
      <ResumePage version="general" />
    </>
  );
}
