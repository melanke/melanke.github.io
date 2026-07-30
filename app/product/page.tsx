import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Technical Product Owner",
  description:
    "Technical Product Owner — discovery, requirements and roadmap for 50+ delivered products, with 19+ years of engineering behind the decisions",
  alternates: {
    canonical: "/product",
  },
  openGraph: {
    title: "Gil Lopes Bueno - Technical Product Owner",
    description:
      "Technical Product Owner — discovery, requirements and roadmap for 50+ delivered products, with 19+ years of engineering behind the decisions",
  },
  twitter: {
    title: "Gil Lopes Bueno - Technical Product Owner",
    description:
      "Technical Product Owner — discovery, requirements and roadmap for 50+ delivered products, with 19+ years of engineering behind the decisions",
  },
};

export default function ProductResume() {
  return <ResumePage version="product" />;
}
