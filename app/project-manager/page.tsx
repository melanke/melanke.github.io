import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Technical Project Manager",
  description: "Technical Project Manager with 12+ years leading delivery — scope, estimates, schedules, budgets and software teams",
  alternates: {
    canonical: "/project-manager",
  },
  openGraph: {
    title: "Gil Lopes Bueno - Technical Project Manager",
    description: "Technical Project Manager with 12+ years leading delivery — scope, estimates, schedules, budgets and software teams",
  },
  twitter: {
    title: "Gil Lopes Bueno - Technical Project Manager",
    description: "Technical Project Manager with 12+ years leading delivery — scope, estimates, schedules, budgets and software teams",
  },
};

export default function ProjectManagerResume() {
  return <ResumePage version="leader" />;
}
