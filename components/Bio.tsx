import { contentVersion } from "@/app/contentVersion";

export function Bio() {
  return contentVersion === "web3" ? (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-5 print:mt-2">
        I&apos;m a Web3 Software Engineer with 7+ years of experience building
        decentralized systems that prioritize usability, identity, and
        abstraction of complexity. I&apos;ve led the development of
        self-custodial wallets, abstract accounts with sponsored transactions,
        multi-chain SDKs, explorers, indexers, and token gating platforms.
        I&apos;ve also helped build core infrastructure for blockchains,
        including RPC servers and virtual machine tooling like a Python-to-VM
        compiler.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        My background includes experimenting with decentralized betting games,
        DEXs, DAOs, and NFTs, giving me broad exposure to onchain product
        development. I&apos;ve also introduced WalletConnect to emerging
        ecosystems and designed tools that improve both developer and user
        experience in Web3 environments.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        With over 15 years in fullstack development and 12 years of leadership
        experience, I&apos;ve led teams of up to 30 professionals, aligning
        technical vision with product goals. I&apos;m skilled in software
        architecture, technical planning, and stakeholder communication. I care
        deeply about making blockchain more accessible and building systems that
        empower users without compromising on decentralization.
      </div>
    </>
  ) : (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-5 print:mt-2">
        I am a Senior Software Engineer with 15+ years of experience and over 50
        successfully delivered projects. I&apos;ve worked extensively with
        Fullstack Web Development and have been deeply involved with Web3
        technologies for the past 7 years. For 12 of those years, I&apos;ve also
        acted as a Tech Lead, leading teams of up to 30 professionals and
        gaining a strong understanding of digital product development.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-5 print:mt-2">
        My experience shaped me into a thoughtful leader who values listening,
        inclusion, and collaboration. I&apos;m skilled in solution architecture,
        stakeholder communication, requirements documentation, and technical
        planning.
      </div>
    </>
  );
}
