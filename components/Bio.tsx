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
  ) : version === "enterprise" ? (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-4 print:mt-2">
        I am a Principal Software Engineer with 19+ years delivering scalable
        backend systems, distributed applications and enterprise software,
        with 50+ projects across logistics, fintech, media, enterprise SaaS
        and Web3. I architected a logistics platform processing 50M+ invoices
        for 60,000 couriers, and a wallet that moved over $1 billion in
        volume.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        My core expertise is Java, Kotlin, Node.js and TypeScript — REST and
        GraphQL APIs, distributed systems, and solution architecture. I&apos;ve
        led engineering teams of up to 30 while staying hands-on in design and
        implementation, defining architecture, roadmaps, and engineering
        standards.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        More recently I&apos;ve worked on AI-assisted engineering workflows —
        integrating LLM agents into development and review, and building
        tooling that turns natural language into working software — plus Web3
        applications: backend services, wallet infrastructure, and multi-chain
        integrations. What I care about is shipping systems that stay reliable
        in production.
      </div>
    </>
  ) : version === "product" ? (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-8 print:mt-2">
        I&apos;m a Technical Product Owner with 19+ years in software and 12+
        years owning product decisions alongside engineering teams of up to
        30. I co-founded Simpli and grew it from a two-person startup into a
        30-person software house delivering 50+ products — running discovery,
        requirements and roadmap across logistics, fintech, media, education
        and Web3.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        My work is turning stakeholder needs into functional requirements,
        wireframes and a prioritized backlog, then staying close to delivery so
        scope, feasibility and deadlines stay honest. I owned product vision
        and usability for Enclave Wallet, wrote requirements and roadmap for
        Louis Dreyfus Company&apos;s global Safety, Health and Environment
        platform, and shaped products that reached real numbers: 50M+ invoices
        on iTrack, 100k users on Sharity.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        Coming from engineering, I size technical trade-offs myself, argue
        architecture with the team, and cut scope without breaking the system.
        Lately I&apos;ve put AI to work inside product and delivery workflows,
        from agent-assisted development to process automation. I&apos;m
        looking for a role where I own the problem, the backlog and the
        outcome.
      </div>
    </>
  ) : version === "webdev" ? (
    <>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up opacity-0 mt-8 print:mt-2">
        I&apos;m a Senior Full-Stack Engineer with 19+ years building
        production web applications in React, Next.js, TypeScript and
        Node.js. I&apos;ve shipped complex dashboards, configurable
        form-driven platforms, and the backend systems behind them —
        including a logistics platform processing 50M+ invoices for 60,000
        couriers.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:200ms] opacity-0 mt-5 print:mt-2">
        On the frontend, I traced a slow customer dashboard down to its data
        layer and took an 8-second query to a few milliseconds, then rebuilt
        it with several customized graphs. I also designed a form engine
        that lets non-technical teams configure entire workflows without a
        deploy, for Louis Dreyfus Company&apos;s global compliance platform.
        On the backend I work in Node.js, Java and Kotlin, with REST/GraphQL
        APIs, PostgreSQL/MySQL, and AWS.
      </div>
      <div className="text-sm leading-4 text-black dark:text-white max-md:max-w-full animate-fade-up [animation-delay:400ms] opacity-0 mt-5 print:mt-2">
        I co-founded Simpli and grew it from a two-person startup into a
        30-person software house delivering 50+ products, which built the
        habit of owning a feature end to end — from the database schema to
        the pixel on screen. Lately I&apos;ve also put AI coding agents to
        work inside real development workflows. I&apos;m looking for a
        hands-on role building web products end to end.
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
