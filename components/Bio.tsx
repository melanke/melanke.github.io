import { ContentVersion } from "@/app/contentVersion";

export function Bio({ version }: { version: ContentVersion }) {
  return version === "web3" ? (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-8 print:mt-2">
        I&apos;m a Web3 Software Engineer with 8+ years building decentralized
        systems for mainstream users. I&apos;ve led self-custodial wallets,
        abstract accounts with sponsored transactions, and multi-chain SDKs used
        across production apps. On Neon Wallet, that work backed over $1 billion
        in traded volume.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        On the protocol side I&apos;ve designed DeFi systems end to end, from
        bonding-curve launchpads to Uniswap v4 hooks, plus prediction markets
        with vault-based yield. I worked as main developer at a firm that
        started as a security auditing shop, and it taught me to treat security
        as an architecture decision, not a final review step.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        Recently I&apos;ve been bringing AI into this work, integrating LLM
        agents into development and auditing workflows and building tooling that
        generates smart contracts from natural language. With 19 years in
        fullstack and 12 leading teams of up to 30, I care about making
        blockchain feel as smooth as a normal web app.
      </div>
    </>
  ) : version === "leader" ? (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-8 print:mt-2">
        I&apos;m a Tech Lead and Engineering Manager with 19+ years in software
        and 12+ years leading teams of up to 30, across roles as CTO, Tech
        Lead, Business Analyst, and Product Owner. I co-founded Simpli and
        grew it from a two-person startup into a 30-person software house that
        delivered 50+ products for startups and enterprise clients.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        My focus as a leader is translating business goals into technical
        roadmaps: gathering requirements, architecting solutions, and keeping
        delivery aligned with what the product and the business actually need.
        I favor listening, delegation, and collaborative decision-making over
        top-down direction, and I make a point of mentoring engineers, including
        a stint as a mentor in the BuidlGuidl Batch Program onboarding new Web3
        developers.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        Lately I&apos;ve been bringing AI into how teams work, from
        agent-assisted development workflows to process automation, while
        staying hands-on enough to keep credibility with the engineers I lead.
        I&apos;m looking for a role where I can own both the technical
        direction and the people side of a team.
      </div>
    </>
  ) : (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-4 print:mt-2">
        I am a Principal Software Engineer, focused on shipping AI-driven backends that hold up in production, with 19+ years of experience and
        over 50 delivered projects. Most of my career has gone into backend
        systems that hold up under real scale. I architected a logistics
        platform that processed 50M+ invoices for 60,000 couriers, and a wallet
        that moved more than $1 billion in volume.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        Lately I&apos;ve focused on putting AI to work inside real products.
        I&apos;ve integrated LLM-powered agents into development and auditing
        workflows, and built tooling that turns natural language into working
        software. What I care about is shipping systems that stay reliable in
        production, not demos.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        I&apos;ve also spent 8 years in Web3 and 12 years leading teams of up to
        30 as a Tech Lead. Today I enjoy building AI-driven backends the most.
        I&apos;m strong in solution architecture and distributed systems, and
        comfortable talking to the people who depend on what I ship.
      </div>
    </>
  );
}
