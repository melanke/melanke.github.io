import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Senior Backend & AI Engineer",
  description: "Backend Engineer since 2007, now building AI-driven products",
  openGraph: {
    title: "Gil Lopes Bueno - Senior Backend & AI Engineer",
    description: "Backend Engineer since 2007, now building AI-driven products",
  },
  twitter: {
    title: "Gil Lopes Bueno - Senior Backend & AI Engineer",
    description: "Backend Engineer since 2007, now building AI-driven products",
  },
};

export default function Home() {
  return <ResumePage version="general" />;
}
