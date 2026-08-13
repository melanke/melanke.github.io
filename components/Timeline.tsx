 "use client";

import { TimelineItem } from "./TimelineItem";
import { TimelineIcon } from "./TimelineIcon";
import { useState } from "react";
import { ContentVersion } from "@/app/contentVersion";

function TimelineHeader({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-1.5 justify-center items-center self-start text-xl font-semibold leading-none print:mt-8 ${className}`}
    >
      <TimelineIcon size={17} className="print:hidden text-[#f9b800]" />
      <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
        Work Experience
      </div>
    </div>
  );
}

export function Timeline({ version }: { version: ContentVersion }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // The enterprise resume describes the same work in backend / distributed
  // systems language instead of protocol-engineering language, and drops the
  // "Main Smart Contract Developer" role suffix. Nothing is omitted or
  // overstated — only framed for a backend-focused reader.
  const isEnterprise = version === "enterprise";

  // The leader resume titles each item by the hat Gil actually wore on it
  // (management, product, delivery) instead of by the engineering track.
  const isLeader = version === "leader";

  // The product resume reads the same hats, but leads with the product-side one
  // (Product Owner, Business Analyst) where he actually wore it. Where he did
  // not, it falls back to the leader wording — no role is invented.
  const isProduct = version === "product";
  const isLeaderish = isLeader || isProduct;

  return (
    <div className="flex flex-col max-xl:mt-14 xl:mt-4 print:mt-0 w-full text-black dark:text-white max-md:max-w-full">
      <TimelineHeader />

      <TimelineItem
        title="33Labs"
        dateRange="Sep 2025 - current"
        // Employer-level aggregate: the union of the projects nested below.
        // REVIEW/EDIT FREELY.
        technologies={
          isEnterprise
            ? [
                "Solidity",
                "Foundry",
                "Ethereum",
                "EVM",
                "Distributed Systems",
                "System Architecture",
                "AI Tooling",
              ]
            : [
                "Solidity",
                "Foundry",
                "Ethereum",
                "EVM",
                "Uniswap V3",
                "Uniswap V4",
                "System Architecture",
                "AI Tooling",
              ]
        }
        role={
          isLeaderish
            ? "Principal Engineer | Smart Contract Engineer"
            : isEnterprise
              ? "Software Engineer"
              : "Software Engineer | Main Smart Contract Developer"
        }
        description={
          isEnterprise ? (
            <div className="space-y-2">
              <p>At 33Labs (formerly 33Audits), I design and implement scalable backend services and application architecture for decentralized financial products.</p>

              <p>The company began as a security auditing firm, which gave me daily experience preventing vulnerabilities in production systems. I work end to end — architecture, implementation, and automated testing — with security engineers involved throughout. This led me to a key conviction: review should start at the architecture stage, before any code is written. To support it, I built developer tooling and AI-assisted workflows that improved the team&apos;s productivity.</p>
            </div>
          ) : isLeader ? (
            "Taking a hands-on IC role here was a deliberate choice: I had been building smart contracts for years, but DeFi raises the security bar far higher, so before leading a team on this architecture I wanted to build it myself, alongside the engineers who audit it. At 33Labs (formerly 33Audits), I worked on advanced DeFi protocols, and the company's roots as a smart contract auditing firm gave me daily, hands-on exposure to how vulnerabilities actually get through in production. That shaped a conviction I now bring to any team I lead: review has to start at the architecture stage, before any code is written — not bolted on as a late-stage audit."
          ) : isProduct ? (
            "Taking a hands-on engineering role here was a deliberate choice: after 11 years as CTO, I wanted to go deep on DeFi architecture next to the engineers who audit it, so that when I own a product in this space I know exactly what I'm asking a team to build and what it costs. At 33Labs (formerly 33Audits), I worked on advanced DeFi protocols, and the company's roots as a smart contract auditing firm sharpened a conviction I now carry into product decisions: security and feasibility have to be weighed at the architecture stage, before a single requirement gets locked in."
          ) : (
          <div className="space-y-2">
            <p>At 33Labs (formerly 33Audits), I worked on the design and development of advanced DeFi protocols, focusing on composability, capital efficiency, and developer experience.</p>

            <p>The company began as a smart contract auditing firm, which gave me hands-on, daily experience identifying and preventing vulnerabilities. I developed protocols end to end — architecture, implementation, and testing — with security and gas optimization as constant priorities throughout. This led me to a key conviction: the auditing process should start at the architecture stage, before any code is written. To support this, I integrated specialized tooling and AI agents into our development and auditing workflow.</p>
            </div>
          )
        }
        image="/projects/33labs.webp"
        link="https://www.33labs.ai/"
      />
      <TimelineItem
        nested
        hidden={version !== "web3"}
        title="American Spend"
        dateRange="Mar 2026 - May 2026"
        technologies={
          isEnterprise
            ? [
                "Solidity",
                "Foundry",
                "Distributed Systems",
                "System Architecture",
                "Ethereum",
                "EVM",
              ]
            : [
                "Solidity",
                "Foundry",
                "Prediction Market",
                "Vault",
                "CLOB",
                "Ethereum",
                "EVM",
              ]
        }
        role={
          isLeaderish
            ? "Principal Engineer | Smart Contract Engineer"
            : isEnterprise
              ? "Software Engineer"
              : "Software Engineer | Main Smart Contract Developer"
        }
        description={
          isEnterprise ? (
            <div className="space-y-2">
              <p>
                American Spend is a high-throughput financial platform
                combining yield generation with market-based price discovery.
              </p>
              <p>
                Designed the backend architecture, including a hybrid market
                model that transitions between two distinct operating phases.
              </p>
              <p className="print:hidden">
                Developed distributed components for real-time market
                operations, with yield strategies on idle capital.
              </p>
              <p className="print:hidden">
                Worked closely with security engineers throughout development,
                incorporating feedback early to reduce iteration cycles.
              </p>
            </div>
          ) : (
          <div className="space-y-2">
            <p>
              American Spend is a prediction market protocol combining yield
              generation with market-based price discovery through a hybrid
              market structure.
            </p>
            <p>
              Designed a hybrid market model starting with a parimutuel phase
              and transitioning into a Central Limit Order Book (CLOB).
            </p>
            <p className={version !== "web3" ? "print:hidden" : undefined}>
              Integrated vault-based yield strategies to generate returns on
              idle capital during market activity.
            </p>
            <p className={version !== "web3" ? "print:hidden" : undefined}>
              Led the end-to-end design and implementation of the smart contract
              architecture, ensuring seamless transitions between market phases
              without disrupting user positions or incentives.
            </p>
            <p className={version !== "web3" ? "print:hidden" : undefined}>
              Drove close collaboration with auditors throughout development,
              incorporating feedback early to strengthen security and reduce
              iteration cycles.
            </p>
          </div>
          )
        }
        image="/projects/american-spend.webp"
        link="https://spend.market/"
      />
      <TimelineItem
        nested
        lastNested
        hidden={version !== "web3"}
        title="Mosaic"
        dateRange="Sep 2025 - Feb 2026"
        technologies={
          isEnterprise
            ? [
                "Solidity",
                "Foundry",
                "AI Tooling",
                "System Architecture",
                "Ethereum",
                "EVM",
              ]
            : [
                "Solidity",
                "Foundry",
                "Uniswap V3",
                "Uniswap V4",
                "Ethereum",
                "EVM",
              ]
        }
        role={
          isLeaderish
            ? "Principal Engineer | Smart Contract Engineer"
            : isEnterprise
              ? "Software Engineer"
              : "Software Engineer | Main Smart Contract Developer"
        }
        description={
          isEnterprise ? (
            <div className="space-y-2">
              <p>
                Mosaic is a developer platform designed to make application
                development more accessible, cost-efficient, and secure through
                flexible, pre-audited, and composable components, with
                AI-assisted tooling for generating compositions from natural
                language.
              </p>
              <p>
                Designed reusable backend components and contributed to the core
                architecture of the platform.
              </p>
              <p>
                Built modular application services focused on scalability and
                maintainability, including a workflow for automated liquidity
                and price discovery.
              </p>
              <p>
                Improved developer productivity through automation and
                AI-assisted tooling.
              </p>
              <p>
                Collaborated on architecture decisions for distributed
                applications and developed abstractions supporting modular,
                extensible services.
              </p>
            </div>
          ) : (
          <div className="space-y-2">
            <p>
              Mosaic is a protocol designed to make smart contract development
              more accessible, cost-efficient, and secure through flexible,
              pre-audited, and composable contracts, with AI-assisted tooling
              for generating contract compositions from natural language.
            </p>
            <p>
              Contributed to the core architecture and designed reusable
              protocol modules with a strong focus on composability.
            </p>
            <p>
              Designed and implemented a Launchpad workflow powered by a
              bonding curve, graduating into a Uniswap v3 liquidity pool for
              smooth price discovery and liquidity transition.
            </p>
            <p>
              Built a Uniswap v4 hook combining CLMM behavior with a bonding
              curve model, later transitioning into a standard AMM.
            </p>
            <p>
              Developed abstractions to support modular and extensible DeFi
              primitives.
            </p>
          </div>
          )
        }
        image="/projects/mosaic.webp"
        link="https://mosaic.build/"
      />

      <TimelineItem
        title="BuidlGuidl Batch Program"
        hidden={version !== "web3"}
        dateRange="Feb 2025 - Jan 2026"
        technologies={[
          "Solidity",
          "Hardhat",
          "TypeScript",
          "React.js",
          "Next.js",
          "Ethereum",
          "EVM",
        ]}
        role="Mentor"
        description="BuidlGuidl is one of the most impactful builder communities in the Ethereum ecosystem. One of its core initiatives is the Batch Program, which helps onboard new developers into the Ethereum space. As a mentor in the program, I guide participants through their first steps contributing to open source using Solidity, Hardhat, Wagmi, and Next.js."
        image="/projects/buidlguidl.webp"
        link="https://buidlguidl.com/batches"
      />
      <TimelineItem
        title="Jodobix"
        hidden={version !== "web3"}
        dateRange="Mar 2025 - Jun 2025"
        technologies={[
          "Solidity",
          "Hardhat",
          "Optimism",
          "TypeScript",
          "React.js",
          "Next.js",
          "Ethereum",
          "EVM",
        ]}
        role="Software Engineer | Creator"
        description="Jodobix is a decentralized betting game designed to be fully fair and autonomous. It leverages blockchain technology to eliminate intermediaries and guarantees that all betting value is distributed among players and contributors. I developed the entire project on my own, including the design of secure random number generation strategies that do not rely on trusted third parties."
        image="/projects/jodobix.png"
        links={[
          "https://jodobix.com",
          {
            label: "Contract on Optimism",
            url: "https://optimistic.etherscan.io/address/0xB23Bd5Eb9986B03E83197BBD22cD12f52607B06C#code",
          },
        ]}
      />
      <TimelineItem
        hidden={version !== "web3" && version !== "leader"}
        title="COZ"
        dateRange="Jun 2022 - Feb 2023"
        technologies={["Blockchain", "Web3"]}
        role="Director | Tech Lead"
        description="COZ is the first and most well-known group of developers on the Neo network, renowned for numerous significant projects within the ecosystem. After years of partnership, I was honored to be invited to join the group's board of directors."
        link="https://coz.io/"
      />
      <TimelineItem
        title="Simpli"
        dateRange="Oct 2013 - May 2025"
        // Employer-level aggregate: the full union of the projects nested
        // below. REVIEW/EDIT FREELY.
        technologies={[
          "Java",
          "Kotlin",
          "C#",
          "TypeScript",
          "Node.js",
          "React.js",
          "React Native",
          "Next.js",
          "Angular",
          "SvelteKit",
          "Android",
          "iOS",
          "Xamarin",
          "Electron.js",
          "JQuery",
          "Backbone",
          "Python",
          "R",
          "MySQL",
          "PostgreSQL",
          "Redis",
          "GraphQL",
          "Jersey",
          "AWS",
          "ECS",
          "S3",
          "SNS",
          "SQS",
          "Web3",
          "Blockchain",
          "Smart Contracts",
          "Cryptography",
          "Cadence",
          "Flow",
        ]}
        role={
          isProduct
            ? "Co-founder | Product Owner | Business Analyst | Project Manager | CTO"
            : isLeader
              ? "Co-founder | CTO | Engineering Manager | TechLead | Product Owner"
              : "Co-founder | Software Engineer | CTO"
        }
        description={
          isEnterprise ? (
            <div className="space-y-2">
              <p>
                I co-founded Simpli and, over 11 years, led engineering teams
                of up to 30 developers,
                including 5 team leads, and delivered 50+ production software
                projects — distributed enterprise systems for logistics,
                fintech, media, education and SaaS clients, plus our own
                proprietary platforms. I defined software architecture,
                technical roadmaps, engineering standards and delivery
                processes, and built scalable backend services using Java,
                Kotlin, Node.js, TypeScript, MySQL/PostgreSQL and REST/GraphQL
                APIs.
              </p>
              <p>
                We started Simpli as a two-person startup building a B2C mobile
                product and pivoted within its first year into a software house
                delivering
                custom distributed applications, scaling organically through
                consistent delivery and client satisfaction. I played a key role
                in shaping both the technical direction and the business
                strategy, ranging from hands-on technical leadership to driving
                innovation through research, process design and early adoption
                of emerging technologies such as mobile and blockchain.
              </p>
              <p>
                Provisioning AWS infrastructure was a recurring part of that
                work. Across 50+ projects, I standardized it: a checklist for
                spinning up new accounts, a baseline set of IAM roles, and a
                reusable Terraform starter kit so no project&apos;s infrastructure
                started from scratch — the same template became a paved road
                that sped up every project&apos;s first deploy. Cost management
                started reactively, triggered by a client flagging a high AWS
                bill, but past a certain point I put anomaly-alert triggers in
                place instead of waiting for the next complaint.
              </p>
              <p>Below are more details about some key projects:</p>
            </div>
          ) : (
          <div className="space-y-2">
            <p>
              I co-founded Simpli as a two-person startup focused on building a
              B2C mobile product, which quickly evolved into a fast-growing
              software house serving a wide range of clients. In its first year,
              the company
              pivoted to delivering custom distributed applications and scaled
              organically through consistent delivery and
              client satisfaction. Over 11 years, we delivered 50+ successful
              digital products for both startups and enterprise clients, while
              also launching and maintaining our own proprietary platforms.
            </p>
            <p>
              From the beginning, Simpli was an early adopter of emerging
              technologies like mobile development and blockchain. I played a
              key role in shaping both the technical direction and business
              strategy of the company, leading system architecture, technical
              roadmaps, and documentation, and building an engineering org of
              30 including 5 team leads. My work ranged from hands-on technical
              leadership to driving innovation through research, process design,
              and technology adoption — helping turn product ideas into real
              businesses by aligning technical execution with market opportunities.
            </p>
            <p>
              Provisioning AWS infrastructure was a recurring part of that
              work. With 50+ projects, we needed a standard: a checklist for
              spinning up a new account, a baseline set of IAM roles, and a
              reusable Terraform starter kit so no project&apos;s infra started
              from a blank page — the same template became a paved road that
              sped up every project&apos;s first deploy. Cost optimization started
              reactively, after a client flagged a high AWS bill, but past a
              certain point we set up anomaly-alert triggers instead of
              waiting for the next complaint.
            </p>
            <p>Below are more details about some key projects:</p>
          </div>
          )
        }
        image="/projects/simpli.webp"
      />
      <TimelineItem
        nested
        title="Enclave Wallet"
        dateRange="Jun 2024 - Feb 2025"
        technologies={[
          "TypeScript",
          "React.js",
          "Next.js",
          "Node.js",
          "PostgreSQL",
          "AWS",
          "ECS",
          "S3",
          "SNS",
          "SQS",
          "Smart Contracts",
          "Cryptography",
        ]}
        role={
          isProduct
            ? "Product Owner | Project Manager | UI/UX Designer | TechLead"
            : isLeader
              ? "TechLead | Product Owner | Project Manager | UI/UX Designer"
              : "Software Engineer | Product Owner | UI/UX Designer"
        }
        description={
          version === "web3"
            ? "Enclave is a Wallet built to embrace non-blockchain users. It combines cutting edge technologies like Abstract Accounts, WebAuthn and Gasless transactions, to allow the onboarding to be smooth as traditional web applications. Working with a small team, I was responsible for the product vision, usability, development of the whole wallet frontend and contributing to the Smart Contracts."
            : isEnterprise
              ? "Enclave is an application for secure digital asset management, built so non-technical users can onboard as smoothly as in a traditional web app. It combines Abstract Accounts, WebAuthn authentication and sponsored transactions, paired with a full on-chain activity explorer. In a small team, I owned the product vision, usability and the entire frontend, contributed to the backend services it relies on, and led the system design of the indexer and API behind the explorer. One example of that indexing work: handling chain reorgs. Every block was stored keyed by its own hash and its parent's, so detecting a reorg meant walking back parent hashes until the indexer found one it already had — the fork point. From there, the orphaned blocks and the balances derived from them were invalidated, and the canonical chain was replayed forward through idempotent handlers, so reprocessing never double-counted a transaction."
              : "Enclave is a Wallet built to embrace non-blockchain users. It combines cutting edge technologies like Abstract Accounts, WebAuthn and Gasless transactions to make onboarding as smooth as a traditional web application — paired with a full on-chain activity explorer. Working with a small team, I was responsible for the product vision, usability, and development of the whole wallet frontend, contributed to the Smart Contracts, and led the system design of the indexer and API behind the explorer. One example of that indexing work: handling chain reorgs. Every block was stored keyed by its own hash and its parent's, so detecting a reorg meant walking back parent hashes until the indexer found one it already had — the fork point. From there, the orphaned blocks and the balances derived from them were invalidated, and the canonical chain was replayed forward through idempotent handlers, so reprocessing never double-counted a transaction."
        }
        image="/projects/enclave.webp"
        link="https://enclavewallet.com"
      />
      <TimelineItem
        hidden
        nested
        title="Linkd Academy"
        dateRange="Jan 2024 - Aug 2024"
        technologies={["TypeScript", "SvelteKit", "Python", "Web3", "Smart Contracts"]}
        role="Tech Consultant"
        description="Linkd is the largest educational platform on the Neo network. This project features a website with extensive materials teaching users how to develop dApps on the network, along with a VSCode extension to streamline installation and integration with the platform's development environment and a token. I was responsible for reviewing the platform's content, providing technical leadership on specific aspects of the project, and developing the dApp related to the token."
        image="/projects/linkd.webp"
      />
      <TimelineItem
        hidden
        nested
        title="Icon Dapp"
        dateRange="Oct 2023 - Jun 2024"
        technologies={["SvelteKit", "Python", "Web3", "Smart Contracts", "TypeScript"]}
        role="Software Engineer"
        description="This platform allows dApp administrators to upload their application icons to a decentralized File System and save the URL into a SmartContract, which organizes and makes these icons available to other applications. I was responsible for architecting the dApp to operate in a fully decentralized manner."
      />
      <TimelineItem
        title="Blockchain Services Library"
        nested
        hidden={version !== "web3"}
        dateRange="Aug 2023 - Jul 2024"
        technologies={["TypeScript", "Node.js", "Blockchain", "Cryptography"]}
        role={isLeaderish ? "TechLead" : "Software Engineer | Techlead"}
        description={
          isEnterprise
            ? "BSLib is a multi-network TypeScript SDK that exposes common asset-management operations behind a single generic API, normalizing the characteristics of each underlying network. It ships implementations for NeoN3, NeoLegacy and EVM networks, and runs in production in desktop and mobile applications. As its creator, I designed the abstraction to maximize code reuse across my team's products."
            : "BSLib is a multi-chain library designed to perform common wallet operations in a generic manner, abstracting and normalizing the unique characteristics of each blockchain. It includes implementations for NeoN3, NeoLegacy, and various EVM networks. This library is extensively used by Neon Wallet Desktop and Mobile applications. As the creator of BSLib, I aimed to enable code reuse across the wallets maintained by my team."
        }
        image="/projects/github.png"
        link="https://github.com/CityOfZion/blockchain-services"
      />
      <TimelineItem
        hidden
        nested
        title="ClickClock"
        dateRange="Jun 2023 - Mar 2024"
        technologies={["TypeScript", "SvelteKit", "Node.js", "MySQL", "GraphQL"]}
        role="Software Engineer | Tech Lead"
        description="This tool was developed to enhance ClickUp's functionalities, primarily focusing on time management and employee performance. It began as a proof of concept (POC) that I developed based on the needs I identified while managing the team. As the tool proved its value, I involved the team in its development, allowing me to transition into the role of Tech Lead and conduct interviews to better organize and prioritize demands."
      />
      <TimelineItem
        hidden
        nested
        title="Abacashi"
        dateRange="Mar 2022 - Aug 2024"
        technologies={["TypeScript", "React.js", "Node.js", "Next.js", "GraphQL"]}
        role="Software Engineer"
        description="Abacashi is a crowdfunding platform that acquired Sharity, the system I previously worked on. Following this acquisition, my team was invited to undertake a significant refactoring of Abacashi to modernize its technologies and enhance code scalability. I led this refactoring effort, selecting technologies, defining the system architecture, guiding developers, and conducting code reviews."
        links={[
          "https://www.abacashi.com/",
          {
            label: "NeoFeed: Abacashi acquires Sharity",
            url: "https://neofeed.com.br/finde/abacashi-compra-sharity-e-quer-colocar-empresas-nas-vaquinhas-online/",
          },
        ]}
      />
      <TimelineItem
        title="Letter"
        nested
        hidden={version !== "web3"}
        dateRange="Feb 2022 - Apr 2023"
        technologies={[
          "TypeScript",
          "React.js",
          "Smart Contracts",
          "Cadence",
          "Flow",
        ]}
        role={isLeaderish ? "Engineering Manager" : "Software Engineer | TechLead"}
        description={
          isEnterprise
            ? "In partnership with the Associated Press, Dapper Labs and COZ, Letter is a distributed authentication platform that lets systems validate access in a decentralized manner. I architected the solution: services on both networks (Neo and Flow), a reusable SDK that integrates both simultaneously behind one interface, and several key integrations."
            : "In partnership with the Associated Press, Dapper Labs, and COZ, Letter is a multi-chain (Neo and Flow) platform that provides authentication mechanisms based on NFTs. This allows systems to validate access in a decentralized manner. I was responsible for architecting the solution, which included SmartContracts on both networks, an SDK that integrates both networks simultaneously, and several key integrations."
        }
        image="/projects/letter.png"
      />
      <TimelineItem
        hidden
        nested
        title="AcroMatch"
        dateRange="Nov 2021 - Jan 2023"
        technologies={["TypeScript", "React.js", "Node.js", "MySQL", "Next.js", "GraphQL"]}
        role="Software Engineer | Tech Lead"
        description="AcroMatch is a niche platform designed to connect users based on their experience in circus acrobatics. My objective in leading this project was to experiment with new technologies for automatically generating code for GraphQL APIs. The experiment proved successful, and the resulting architecture was adopted in subsequent projects, including Abacashi and ClickClock."
      />
      <TimelineItem
        title="Neon Wallet"
        nested
        dateRange="July 2021 - July 2024"
        technologies={[
          "TypeScript",
          "React.js",
          "React Native",
          "Blockchain",
          "Electron.js",
        ]}
        role={isLeaderish ? "Engineering Manager" : "Software Engineer | TechLead"}
        description={
          isEnterprise
            ? "Led the architecture of a production mobile application for secure digital asset management, with over $1 billion in traded volume, and later contributed to its desktop counterpart. Responsibilities included application architecture, backend and API integration, multi-network connectivity, secure authentication, managing multiple accounts simultaneously, WalletConnect integration, the protocol for network communication, and performance optimization."
            : "Neon is the leading wallet in the Neo ecosystem, with over $1 billion in traded volume. I was responsible for architecting its mobile version and later contributed to the desktop app. During my time on the project, I tackled key challenges such as supporting multiple blockchain networks, managing multiple accounts simultaneously, implementing WalletConnect integration, and developing the protocol for network interaction, along with several other critical integrations."
        }
        image="/projects/neon.webp"
        link="https://coz.io/neon-wallet/"
      />
      <TimelineItem
        title="Sharity"
        print={false}
        nested
        dateRange="Mar 2021 - Aug 2024"
        technologies={[
          "TypeScript",
          "React.js",
          "Kotlin",
          "Java",
          "Node.js",
          "Next.js",
          "GraphQL",
          "MySQL",
          "AWS",
          "SQS",
          "C#",
          "Angular",
        ]}
        role={isLeaderish ? "Engineering Manager" : "Software Engineer | TechLead"}
        description="Sharity was a crowdfunding platform for charitable causes that I built from creation through scaling, growing it past 100 thousand users. It was eventually sold to Abacashi, a bigger competitor, and I was invited to lead the engineering side of that merger in recognition of the quality of Sharity's system — refactoring Abacashi's legacy C#/Angular codebase over to Node.js and React with the platform staying live the whole time, using a Strangler Fig strategy to migrate it piece by piece instead of a big-bang rewrite. One example of the work on Sharity itself: an event-driven achievements system, with badges and real-time progress bars for challenges that could chain off one another. Business events flowed through SQS, and idempotency was enforced by inserting each event's ID into a dedupe table in the same MySQL transaction as the counter increment, so a duplicate delivery just aborted instead of double-counting; chained challenges unlocked themselves by publishing a follow-up event back onto the queue, with no need for global ordering. It held up at 100k+ users, and was later reused as-is inside Abacashi after the merger."
        image="/projects/sharity.webp"
        links={[
          "https://sharity.com.br",
          {
            label: "NeoFeed: Abacashi acquires Sharity",
            url: "https://neofeed.com.br/finde/abacashi-compra-sharity-e-quer-colocar-empresas-nas-vaquinhas-online/",
          },
        ]}
      />
      <TimelineItem
        title="NDapp"
        print={false}
        nested
        dateRange="Feb 2021 - Sep 2024"
        technologies={["TypeScript", "React.js", "Kotlin", "Java"]}
        role={isLeaderish ? "Engineering Manager" : "Software Engineer | TechLead"}
        description="NDapp earned its way into becoming the official dApps gallery of the Neo network on its own merit — its traction and the quality of its data got it adopted and featured on the network's official site, not built as an official project from day one. I worked on defining the initial project structure and building its first functionalities, including the indexer and analytics pipeline behind the catalog. That meant reconciling three genuinely different chains — NeoLegacy, Neo N3, and Neo X — each with its own RPC shape and contract metadata format, into one consistent data model with automatic updates: polling each network on its own cadence, normalizing every chain-specific quirk, and keeping every dApp's stats fresh without one network's hiccup stalling the other two."
        image="/projects/ndapp.webp"
        link="https://ndapp.org"
      />
      <TimelineItem
        title="Wow Talents"
        print={false}
        nested
        dateRange="Mar 2020 - Aug 2023"
        technologies={[
          "TypeScript",
          "React.js",
          "Kotlin",
          "Java",
          "Jersey",
          "MySQL",
        ]}
        role={
          isProduct
            ? "Business Analyst | Project Manager"
            : isLeader
              ? "Project Manager | TechLead"
              : "Software Engineer | TechLead"
        }
        description="Wow Talents was a comprehensive agency platform connecting child models with modeling opportunities, supporting subscription payments and five distinct user types — models, guardians, agency staff, clients, and admins — each with its own view and permissions. I owned it end to end: turning a loosely defined set of demands into functional requirements and wireframes, designing the database architecture, and structuring the project from scratch. One example of that structuring work: since every model account belonged to a minor, every read and write had to be scoped through a guardian relationship as well as a role, so I designed the permission model around both the user type and that guardianship chain — letting new user types and rules get added later without touching the core matching logic."
        image="/projects/wowtalents.webp"
      />
      <TimelineItem
        hidden
        nested
        title="Neo3-boa"
        dateRange="Feb 2020 - Jun 2024"
        technologies={["Blockchain", "Python", "Web3"]}
        role="Software Engineer"
        description="An essential tool for Python developers on the Neo network, this project is a compiler for NeoVM. Although compilers are not my specialty, my role in the project primarily involved defining objectives, managing priorities, and assisting with technical decision-making."
        link="https://github.com/CityOfZion/neo3-boa"
      />
      <TimelineItem
        nested
        dateRange="Oct 2019 - Nov 2020"
        technologies={["TypeScript", "React.js", "Kotlin", "Java", "MySQL"]}
        title="LDC's She Digital"
        role={
          isLeaderish
            ? "Product Owner | Project Manager | TechLead"
            : "Software Engineer | TechLead"
        }
        description="Louis Dreyfus Company, one of the largest commodity traders in the world, commissioned a 'Safety, Health, and Environment' management platform for use across all its global units — each with its own local regulations, forms, and reporting requirements. I owned it end to end: architecture, development, and integration with Azure Active Directory for authentication and user management. The core challenge was translating that sprawl of per-unit requirements into one flexible application instead of one branch per country, so I modeled forms, fields, and workflows as configurable data instead of hardcoded screens — letting a compliance team in a new unit stand up its own SHE process by configuring the platform, not by requesting a code change and a deploy."
        image="/projects/ldc.webp"
      />
      <TimelineItem
        title="Jamef Customers Dashboard"
        hidden={version === "web3"}
        nested
        dateRange="Jun 2019 - May 2022"
        technologies={["TypeScript", "React.js", "Java", "Redis"]}
        role={
          isLeaderish ? "Project Manager | TechLead" : "Software Engineer"
        }
        description="Jamef, the largest shipping company in Brazil, needed a new dashboard for customers to track delivery data, but the existing one suffered from severe performance problems. My scope started as frontend-only, but tracing the slowness back to its source pulled me into the data layer. I introduced a caching layer and a server-side pagination policy for the result set, taking a query that took 8 seconds down to a few milliseconds. I delivered a complex dashboard with several customized graphs and contributed to restructuring the underlying central system."
        image="/projects/jamef.webp"
      />
      <TimelineItem
        hidden
        nested
        title="FishEffect"
        dateRange="Aug 2018 - Sep 2018"
        technologies={["TypeScript", "Python", "Web3", "Smart Contracts"]}
        role="Software Engineer"
        description="FishEffect was a cryptogame similar to CryptoKitties, where players had an aquarium linked to their account, and each fish NFT appeared in their aquarium. The game included a dynamic where players could feed the fish, which would eventually reproduce."
      />
      <TimelineItem
        hidden
        nested
        title="Neo-Sharp"
        dateRange="May 2018 - Oct 2018"
        technologies={["C#", "Web3"]}
        role="Software Engineer"
        description="Neo-Sharp was a C# implementation of Neo Node (v2). A fundamental part of the Neo ecosystem, restricted to developers in the 'Core Dev' group. I contributed to various aspects of the project, with a primary focus on the implementation of the RPC server."
      />
      <TimelineItem
        hidden
        title="SimpliData"
        nested
        dateRange="Jan 2018 - May 2019"
        technologies={["TypeScript", "React.js", "Kotlin", "R"]}
        role={
          isLeaderish
            ? "Product Owner | Project Manager | TechLead"
            : "Software Engineer | TechLead"
        }
        description="In partnership with the macroeconomics firm Parallaxis, my team and I developed SimpliData, a Data Science application akin to the Bloomberg dashboard. Our goal was to combine various market tools and techniques into a platform that was significantly more practical and user-friendly."
      />
      <TimelineItem
        hidden
        nested
        title="Bettie"
        dateRange="Aug 2017 - Mar 2019"
        technologies={["Android", "MySQL", "Java"]}
        role="Software Engineer"
        description="Bettie was a cosmetics marketplace that integrated its product listings with Google Shopping. I was primarily responsible for structuring the architecture of the Android application, utilizing the cutting-edge technology of the time, 'Android Data Binding'."
      />
      <TimelineItem
        hidden
        nested
        title="Zerum's Falcon"
        dateRange="Jul 2017 - May 2018"
        technologies={["TypeScript", "React.js"]}
        role="Software Engineer"
        description="Zerum was developing Falcon, an advanced network monitoring system. To create the system's complex visual interface, they needed a developer with my level of experience. The application's frontend was highly customizable and managed complex, recursively structured data, which needed to be presented in flexible tables and graphs."
      />
      <TimelineItem
        nested
        hidden
        title="Panorist"
        dateRange="Dec 2016 - Apr 2020"
        technologies={["React.js", "Java", "MySQL", "AWS", "S3"]}
        role="Software Engineer"
        description="Panorist was a photo sharing and sales application. I was responsible for gathering the client's requirements and architecting a scalable framework for storing and reading high-definition images — tiering images across S3 storage classes to cut cost on older, rarely-accessed files, and handling simultaneous multi-file uploads through a buffered queue that processed them without blocking the request path. I also integrated a split-payment system with PayPal."
      />
      <TimelineItem
        title="iTrack"
        nested
        dateRange="Nov 2016 - Jun 2018"
        technologies={[
          "TypeScript",
          "React.js",
          "Kotlin",
          "Java",
          "AWS",
          "S3",
          "SNS",
          "SQS",
          "Redis",
          "MySQL",
          "ECS",
        ]}
        role={
          isProduct
            ? "Business Analyst | Engineering Manager | TechLead"
            : isLeader
              ? "Engineering Manager | TechLead | Business Analyst"
              : "Software Engineer | TechLead"
        }
        description="I was the lead engineer who built iTrack Brasil from the ground up, owning its system design and scaling it into a B2B delivery platform integrating multiple systems, with nearly 60,000 couriers and over 50 million invoices processed across 2,000 registered companies — growth that led to its acquisition by MadeiraMadeira in 2021. One example of that scaling work: as invoice volume and courier position updates grew, the database hit a write bottleneck, surfaced by a spike at the end of a fiscal month. The system stayed up, but latency and AWS costs climbed, so I redesigned the write path at its source — courier position pings now land as Parquet files on S3, backed by a Redis cache holding each courier's last known position for fast reads, while invoice processing moved behind an SNS/SQS pipeline that absorbs bursts asynchronously."
        image="/projects/itrack.webp"
        link="https://itrackbrasil.com.br"
      />
      <TimelineItem
        title="Mapix"
        nested
        print={false}
        dateRange="Mar 2016 - Jan 2018"
        technologies={["Android", "Java"]}
        role={
          isProduct
            ? "Business Analyst | Project Manager | TechLead"
            : isLeader
              ? "TechLead | Project Manager | Business Analyst"
              : "Software Engineer | TechLead"
        }
        description="Mapix connects students with their school drivers, giving children and parents predictability and safety while simplifying route planning and communication for drivers. I owned the planning and structuring of the solution end to end and built its most critical components: the route-building system, in-app chat, and a live GPS mode. One example of that work: building a route wasn't just point-to-point — each van carried several students with different pickup and drop-off points on a shared trip, so the routing logic had to sequence stops for the whole group at once, and the GPS mode had to keep parents' ETAs accurate against a background location stream over unreliable mobile connections, without draining a driver's phone battery on a multi-hour shift."
        image="/projects/mapix.webp"
        link="https://mapixapp.com/"
      />
      <TimelineItem
        hidden
        nested
        title="Ativo Coach"
        dateRange="Mar 2016 - Apr 2018"
        technologies={["JQuery", "Android", "Java", "MySQL"]}
        role="Software Engineer"
        description="Ativo Coach was one of the first mobile applications to enable asynchronous communication between coaches and athletes, allowing for the comprehensive, practical, and flexible configuration of training sessions. I focused primarily on project planning and structure, and contributed to the development of both the coach platform and the Android application."
      />
      <TimelineItem
        title="Apptite"
        nested
        print={version !== "web3"}
        dateRange="Sep 2015 - July 2017"
        technologies={[
          "Android",
          "Java",
          "MySQL",
          "Redis",
          "S3",
          "SNS",
          "SQS",
          "ECS",
        ]}
        role={
          isProduct
            ? "Business Analyst | Project Manager | TechLead"
            : isLeader
              ? "TechLead | Project Manager | Business Analyst"
              : "Software Engineer | TechLead"
        }
        description="Apptite was a food delivery app for iOS, Android and the web. It gained recognition with acceleration by '500 Startups' and media coverage that established it as an important platform in the artisanal food market. I was the main engineer responsible for the platform from its initial planning and structuring through scaling it as it grew. One example of that scaling work: the dish recommendation engine. The map was discretized into cells, each holding the list of stores that served it, updated in batch whenever delivery areas changed — so the geographic lookup itself was just a cached read. Personalization ran on top of that already-filtered set, combining complementary signals in parallel (repurchase history, regional popularity, among others), with the heavier estimates — including a store-by-cell matrix — precomputed offline."
        image="/projects/apptite.webp"
      />
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-expanded={false}
          className="print:hidden self-start mt-4 px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Show more
        </button>
      )}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out print:overflow-visible ${
          isExpanded
            ? "max-h-[5000px] opacity-100"
            : "max-h-0 opacity-0 print:max-h-[5000px] print:opacity-100"
        }`}
      >
        <TimelineItem
          title="Desabafa"
          nested
          print={false}
          dateRange="Aug 2015 - July 2017"
          technologies={["Android", "Java"]}
          role={
            isProduct
              ? "Business Analyst | Project Manager | TechLead"
              : isLeader
                ? "TechLead | Project Manager | Business Analyst"
                : "Software Engineer | TechLead"
          }
          description="Desabafa was an anonymous social network built for emotional support and mutual understanding, and it went on to receive media recognition in the mental health sector while facilitating over 1 million interactions. I was responsible for planning, structuring, and building the platform, including its moderation and safety systems. One example of that work: anonymity was the whole point of the product, so any moderation approach that relied on identifying users to punish or filter them was off the table. I built the safety layer around behavior instead of identity — rate-limiting and pattern detection on posting activity, plus keyword and pattern-based flagging tuned for crisis language — so harmful content and abuse could be caught and escalated without ever unmasking a user."
          image="/projects/desabafa.webp"
        />
        <TimelineItem
          title="Band Radios App"
          print={false}
          nested
          dateRange="Oct 2014 - Nov 2015"
          technologies={["Xamarin"]}
          role={isLeaderish ? "TechLead" : "Software Engineer"}
          description="Bandeirantes, one of Brazil's largest media conglomerates, has run Band Radios since 1937 and selected my team in 2014 to modernize its mobile app. I served as lead developer for both the Android and iOS apps. One example of the technical work: streaming ran over UDP, and the naive approach — opening the connection only after a listener picked a station — meant a noticeable delay before audio started. I pre-established the UDP connection ahead of the station choice instead, trading a bit of idle network and battery use for audio that started the instant a user tapped a station."
        />
        <TimelineItem
          hidden
          nested
          title="iFrete"
          dateRange="Sep 2014 - Jun 2015"
          technologies={["Xamarin", "Android", "JQuery", "Java", "MySQL", "iOS"]}
          role="Software Engineer"
          description="iFrete was a comprehensive platform for managing and discovering freight services, featuring applications for iOS, Android, and Web, as well as an administrative panel. My role involved end-to-end responsibilities, including planning, architecture, and development, ensuring seamless integration and functionality across all components."
        />
        <TimelineItem
          title="Multilaser Runin"
          nested
          lastNested
          print={version !== "web3" && !isProduct}
          dateRange="Aug 2014 - Oct 2014"
          technologies={["Android", "Java"]}
          role={isLeaderish ? "TechLead" : "Software Engineer"}
          description="Multilaser, one of Brazil's largest cell phone and tablet manufacturers, faced high demand for quality control testing that had been done by hand on the assembly line. I led development of the Android app that automated it instead — running CPU, RAM, GPS, screen brightness, and touch checks — and it has since tested over 20 million devices. One example of that work: each check had its own pass/fail criteria and its own margin for hardware variance, so the real problem wasn't running the tests, it was collapsing five independent, noisy hardware signals into one deterministic pass/fail a line worker could act on in a couple of seconds, fast enough to keep up with a production line moving tens of thousands of units."
          image="/projects/runin.webp"
        />
        <TimelineItem
          hidden
          nested
          title="SelfChef"
          dateRange="Jan 2014 - Apr 2015"
          technologies={["Xamarin", "Android", "iOS", "Java", "MySQL"]}
          role="Software Engineer"
          description="SelfChef was an idea I developed with my team, designed to help users find recipes based on the ingredients they had at home. Using adaptive intelligence, the app suggested compatible recipes. We managed to turn the concept into reality by creating a sophisticated architecture and developing apps for iOS and Android."
        />
        <TimelineItem
          hidden
          nested
          title="Diário da Dor (Pain Diary)"
          dateRange="Aug 2013 - Feb 2014"
          technologies={["Android", "Java", "MySQL"]}
          role="Software Engineer"
          description="'Diário da Dor' was an app designed to assist people with chronic migraines in tracking headache occurrences and associated habits. By analyzing statistical data, users could investigate potential pain triggers. I developed the Android version of the application."
        />
        <TimelineItem
          dateRange="2010 - 2013"
          technologies={["JQuery", "Backbone", "Java", "Android"]}
          print={version === "general" || isEnterprise}
          title="SIMET - NIC.br"
          role="Software Engineer"
          description="At NIC.br, I worked on SIMET, Brazil's official internet quality measurement tool used by regulators and ISPs alike. The flagship SIMET application still ran as a Java Applet at a time when browsers were starting to lock those out for security reasons, so I proposed and led its migration to plain JavaScript before that became an emergency. Beyond the core tool, I built SimetMapas, visualizing internet quality heat maps across Brazil, and dashboards consumed directly by internet operators and regulatory agencies. I also contributed to SimetBox, a Wi-Fi router built to run these tests automatically, and to an Android testing app with its own custom graphics library for rendering results on constrained hardware."
          link="https://simet.nic.br"
        />
      </div>
      <div className="font-clash print:font-sans font-semibold text-black dark:text-white mt-10 print:mt-5 text-2xl print:text-xl">
        Academic Qualifications
      </div>
      <div className="-mt-7 print:-mt-3">
        <TimelineItem
          dateRange="2008 - 2011"
          technologies={[]}
          title="Pontifícia Universidade Católica de São Paulo (PUC-SP)"
          role="Bachelor, Computer Science"
          description="Bachelor's degree in Computer Science from Pontifícia Universidade Católica de São Paulo, one of Brazil's leading higher education institutions."
        />
      </div>
      <div className="xl:h-48"></div>
    </div>
  );
}
