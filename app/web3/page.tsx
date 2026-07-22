import type { Metadata } from "next";
import { ResumePage } from "@/components/ResumePage";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Senior Blockchain Engineer",
  description: "Web3 Engineer since 2018 — DeFi, wallets, and multi-chain infrastructure",
  alternates: {
    canonical: "/web3",
  },
  openGraph: {
    title: "Gil Lopes Bueno - Senior Blockchain Engineer",
    description: "Web3 Engineer since 2018 — DeFi, wallets, and multi-chain infrastructure",
  },
  twitter: {
    title: "Gil Lopes Bueno - Senior Blockchain Engineer",
    description: "Web3 Engineer since 2018 — DeFi, wallets, and multi-chain infrastructure",
  },
};

export default function Web3Resume() {
  return <ResumePage version="web3" />;
}
