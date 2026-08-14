import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Principal Backend Engineer",
  description:
    "Backend Engineer since 2007 — Java, Kotlin, Node.js, TypeScript, distributed systems and solution architecture",
  alternates: {
    canonical: "/enterprise",
  },
  openGraph: {
    title: "Gil Lopes Bueno - Principal Backend Engineer",
    description:
      "Backend Engineer since 2007 — Java, Kotlin, Node.js, TypeScript, distributed systems and solution architecture",
  },
  twitter: {
    title: "Gil Lopes Bueno - Principal Backend Engineer",
    description:
      "Backend Engineer since 2007 — Java, Kotlin, Node.js, TypeScript, distributed systems and solution architecture",
  },
};

export default function EnterpriseResume() {
  return <ResumePage version="enterprise" />;
}
