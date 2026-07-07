import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Tech Lead & Engineering Manager",
  description: "Engineering leader with 12+ years managing teams of up to 30 — CTO, Tech Lead, Product Owner",
  openGraph: {
    title: "Gil Lopes Bueno - Tech Lead & Engineering Manager",
    description: "Engineering leader with 12+ years managing teams of up to 30 — CTO, Tech Lead, Product Owner",
  },
  twitter: {
    title: "Gil Lopes Bueno - Tech Lead & Engineering Manager",
    description: "Engineering leader with 12+ years managing teams of up to 30 — CTO, Tech Lead, Product Owner",
  },
};

export default function LeaderResume() {
  return <ResumePage version="leader" />;
}
