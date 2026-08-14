import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Senior Full-Stack Engineer",
  description:
    "Full-Stack Engineer since 2007 — React, Next.js, TypeScript, Node.js and the backends behind them",
  alternates: {
    canonical: "/webdev",
  },
  openGraph: {
    title: "Gil Lopes Bueno - Senior Full-Stack Engineer",
    description:
      "Full-Stack Engineer since 2007 — React, Next.js, TypeScript, Node.js and the backends behind them",
  },
  twitter: {
    title: "Gil Lopes Bueno - Senior Full-Stack Engineer",
    description:
      "Full-Stack Engineer since 2007 — React, Next.js, TypeScript, Node.js and the backends behind them",
  },
};

export default function WebDevResume() {
  return <ResumePage version="webdev" />;
}
