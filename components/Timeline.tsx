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

  return (
    <div className="flex flex-col max-xl:mt-14 xl:mt-4 print:mt-0 w-full text-black dark:text-white max-md:max-w-full">
      <TimelineHeader />

      <TimelineItem
        title="33Labs"
        dateRange="Sep 2025 - May 2026"
        technologies={[]}
        role="Software Engineer | Main Smart Contract Developer"
        description={
          <div className="space-y-2">
            <p>At 33Labs (formerly 33Audits), I worked on the design and development of advanced DeFi protocols, focusing on composability, capital efficiency, and developer experience.</p>
 
            <p>The company began as a smart contract auditing firm, which gave me hands-on, daily experience identifying and preventing vulnerabilities. I developed protocols end to end — architecture, implementation, and testing — with security and gas optimization as constant priorities throughout. This led me to a key conviction: the auditing process should start at the architecture stage, before any code is written. To support this, I integrated specialized tooling and AI agents into our development and auditing workflow.</p>
            </div>
        }
        image="/projects/33labs.webp"
        link="https://www.33labs.ai/"
      />
      <TimelineItem
        nested
        title="American Spend"
        dateRange="Mar 2026 - May 2026"
        technologies={[
          "Solidity",
          "Foundry",
          "Prediction Market",
          "Vault",
          "CLOB",
          "Ethereum",
          "EVM",
        ]}
        role="Software Engineer | Main Smart Contract Developer"
        description={
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
            <p className={version === "general" ? "print:hidden" : undefined}>
              Integrated vault-based yield strategies to generate returns on
              idle capital during market activity.
            </p>
            <p className={version === "general" ? "print:hidden" : undefined}>
              Led the end-to-end design and implementation of the smart contract
              architecture, ensuring seamless transitions between market phases
              without disrupting user positions or incentives.
            </p>
            <p className={version === "general" ? "print:hidden" : undefined}>
              Drove close collaboration with auditors throughout development,
              incorporating feedback early to strengthen security and reduce
              iteration cycles.
            </p>
          </div>
        }
        image="/projects/american-spend.webp"
        link="https://spend.market/"
      />
      <TimelineItem
        nested
        lastNested
        title="Mosaic"
        dateRange="Sep 2025 - Feb 2026"
        technologies={[
          "Solidity",
          "Foundry",
          "Uniswap V3",
          "Uniswap V4",
          "Ethereum",
          "EVM",
        ]}
        role="Software Engineer | Main Smart Contract Developer"
        description={
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
        }
        image="/projects/mosaic.webp"
        link="https://mosaic.build/"
      />

      <TimelineItem
        title="BuidlGuidl Batch Program"
        print={version === "web3"}
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
        print={false}
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
        title="Simpli"
        dateRange="Out 2013 - May 2025"
        technologies={[]}
        role="Software Engineer | CTO"
        description={
          <div className="space-y-2">
            <p>
              Simpli started as a startup focused on building a B2C mobile
              product, but quickly evolved into a fast-growing software house
              serving a wide range of clients. In its first year, the company
              pivoted to delivering custom distributed applications, and scaled
              organically to a 30-person team through consistent delivery and
              client satisfaction. Over 11 years, we delivered 50+ successful
              digital products for both startups and enterprise clients, while
              also launching and maintaining our own proprietary platforms.
            </p>
            <p>
              From the beginning, Simpli was an early adopter of emerging
              technologies like mobile development and blockchain. I played a
              key role in shaping both the technical direction and business
              strategy of the company. My work ranged from hands-on technical
              leadership to driving innovation through research, process design,
              and technology adoption. I led system architecture, created
              technical roadmaps and documentation, and helped turn product
              ideas into real businesses by aligning technical execution with
              market opportunities.
            </p>
            <p>Below are more details about some key projects:</p>
          </div>
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
          "Smart Contracts",
          "Cryptography",
        ]}
        role="Software Engineer | Product Owner | UI/UX Designer"
        description="Enclave is a Wallet built to embrace non-blockchain users. It combines cutting edge technologies like Abstract Accounts, WebAuthn and Gasless transactions, to allow the onboarding to be smooth as traditional web applications. Working with a small team, I was responsible for the product vision, usability, development of the whole wallet frontend and contributing to the Smart Contracts."
        image="/projects/enclave.webp"
        link="https://enclavewallet.com"
      />
      <TimelineItem
        title="Blockchain Services Library"
        nested
        dateRange="Aug 2023 - Jul 2024"
        technologies={["TypeScript", "Node.js", "Blockchain", "Cryptography"]}
        role="Software Engineer | Techlead"
        description="BSLib is a multi-chain library designed to perform common wallet operations in a generic manner, abstracting and normalizing the unique characteristics of each blockchain. It includes implementations for NeoN3, NeoLegacy, and various EVM networks. This library is extensively used by Neon Wallet Desktop and Mobile applications. As the creator of BSLib, I aimed to enable code reuse across the wallets maintained by my team."
        image="/projects/github.png"
        link="https://github.com/CityOfZion/blockchain-services"
      />
      <TimelineItem
        title="Letter"
        nested
        dateRange="Feb 2022 - Apr 2023"
        technologies={[
          "TypeScript",
          "React.js",
          "Smart Contracts",
          "Cadence",
          "Flow",
        ]}
        role="Software Engineer | TechLead"
        description="In partnership with the Associated Press, Dapper Labs, and COZ, Letter is a multi-chain (Neo and Flow) platform that provides authentication mechanisms based on NFTs. This allows systems to validate access in a decentralized manner. I was responsible for architecting the solution, which included SmartContracts on both networks, an SDK that integrates both networks simultaneously, and several key integrations."
        image="/projects/letter.png"
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
        role="Software Engineer | TechLead"
        description="Neon is the leading wallet in the Neo ecosystem, with over $1 billion in traded volume. I was responsible for architecting its mobile version and later contributed to the desktop app. During my time on the project, I tackled key challenges such as supporting multiple blockchain networks, managing multiple accounts simultaneously, implementing WalletConnect integration, and developing the protocol for network interaction, along with several other critical integrations."
        image="/projects/neon.webp"
        link="https://coz.io/neon-wallet/"
      />
      <TimelineItem
        title="Sharity"
        print={false}
        nested
        dateRange="Mar 2021 - Mar 2022"
        technologies={[
          "TypeScript",
          "React.js",
          "Kotlin",
          "Java",
          "Node.js",
          "Next.js",
          "GraphQL",
        ]}
        role="Software Engineer | TechLead"
        description="A crowdfunding for charitable causes with more than 100 thousand users. I played a key role at the outset of the project, where I designed the database architecture, structured the project, and developed the most critical components of the application."
        image="/projects/sharity.webp"
        link="https://sharity.com.br"
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
          title="NDapp"
          print={false}
          nested
          dateRange="Feb 2021 - Set 2024"
          technologies={["TypeScript", "React.js", "Kotlin", "Java"]}
          role="Software Engineer | TechLead"
          description="NDapp became the official dApps galery of Neo network. Provides detailed information and automatic updates about each dApp, with data pulled directly from the NeoLegacy, Neo N3 and Neo X blockchains. I worked defining the initial structure of the project and developing the first functionalities."
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
          role="Software Engineer | TechLead"
          description="Wow Talents was a comprehensive agency platform for child models. Its primary features included model registration, job listing, and match-making between models and opportunities. The system also supported various functionalities, such as subscription payments and five different user types. Organizing all the demands into functional requirements, developing wireframes, managing the project roadmap, designing the database architecture, structuring the project, creating the permissions system and delegating tasks were significant challenges. This project was a tremendous learning experience."
        />
        <TimelineItem
          nested
          dateRange="Oct 2019 - Nov 2020"
          technologies={["TypeScript", "React.js", "Kotlin", "Java", "MySQL"]}
          title="LDC's She Digital"
          role="Software Engineer | TechLead"
          description="Louis Dreyfus Company, one of the largest commodity traders in the world, commissioned the development of a 'Safety, Health, and Environment' management platform for use across all its global units. I architected and developed this project entirely. The platform included integrations with Azure Active Directory for authentication and user management. The most significant challenge was translating all the company's needs into a flexible application that could scale without requiring code modifications."
        />
        <TimelineItem
          title="Jamef Customers Dashboard"
          print={false}
          nested
          dateRange="Jun 2019 - May 2022"
          technologies={["TypeScript", "React.js"]}
          role="Software Engineer"
          description="Jamef, the largest shipping company in Brazil, needed a new dashboard for customers to track delivery data due to significant performance issues with the old dashboard. Initially, my responsibility was focused solely on the frontend. However, I quickly realized that structural changes were necessary. I provided several recommendations to Jamef's team on improving the data structure and delivery for better performance. Ultimately, I delivered a complex dashboard featuring various customized graphs and contributed to enhancing the overall structure of the central system."
        />
        <TimelineItem
          title="SimpliData"
          nested
          print={false}
          dateRange="Jan 2018 - May 2019"
          technologies={["TypeScript", "React.js", "Kotlin", "R"]}
          role="Software Engineer | TechLead"
          description="In partnership with the macroeconomics firm Parallaxis, my team and I developed SimpliData, a Data Science application akin to the Bloomberg dashboard. Our goal was to combine various market tools and techniques into a platform that was significantly more practical and user-friendly."
        />
        <TimelineItem
          title="iTrack"
          nested
          dateRange="Nov 2016 - Jun 2018"
          technologies={["TypeScript", "React.js", "Kotlin", "Java"]}
          role="Software Engineer | TechLead"
          description="iTrack Brasil is a B2B delivery services platform, integrating multiple systems, with nearly 60,000 couriers. Key challenges included various integrations and optimizing large data volumes. With over 50 million invoices and 2,000 companies registered, the platform's growth was further boosted by its acquisition by MadeiraMadeira in 2021."
          image="/projects/itrack.webp"
          link="https://itrackbrasil.com.br"
        />
        <TimelineItem
          title="Mapix"
          nested
          print={false}
          dateRange="Mar 2016 - Jan 2018"
          technologies={["Android", "Java"]}
          role="Software Engineer | TechLead"
          description="Mapix is a platform that connects students with their drivers, enhancing predictability and safety for children and parents while simplifying route planning and communication for drivers. I handled all the planning and structuring of the solution, and developed critical components of the application, including the route-building system, chat, and GPS mode."
          link="https://mapixapp.com/"
        />
        <TimelineItem
          title="Apptite"
          nested
          dateRange="Sep 2015 - July 2017"
          technologies={["Android", "Java"]}
          role="Software Engineer | TechLead"
          description="Apptite was a food delivery app for iOS, Android and the web. It gained recognition with acceleration by '500 Startups'. With media coverage, it established itself as an important platform in the artisanal food market. I was the main responsible for the initial planning, structuring and development of the platform."
          image="/projects/apptite.webp"
        />
        <TimelineItem
          title="Desabafa"
          nested
          print={false}
          dateRange="Aug 2015 - July 2017"
          technologies={["Android", "Java"]}
          role="Software Engineer | TechLead"
          description="Desabafa was an anonymous social network designed for emotional support and mutual understanding, featuring a robust security and monitoring system to ensure a healthy user experience. The platform received media recognition in the mental health sector and facilitated over 1 million interactions. I contributed to the planning, structuring, and development of the platform."
          image="/projects/desabafa.webp"
        />
        <TimelineItem
          title="Band Radios App"
          print={false}
          nested
          dateRange="Out 2014 - Nov 2015"
          technologies={["Xamarin"]}
          role="Software Engineer"
          description="Bandeirantes, a major Brazilian media conglomerate, established Band Radios in 1937 and selected my team in 2014 to modernize their mobile app. The project presented several challenges, including the requirement to establish a UDP connection before the user selected a radio station. I served as the lead developer for the Android and iOS apps."
        />
        <TimelineItem
          title="Multilaser Runin"
          nested
          lastNested
          print={version === "general"}
          dateRange="Aug 2014 - Out 2014"
          technologies={["Android", "Java"]}
          role="Software Engineer"
          description="Multilaser, one of Brazil's largest cell phone and tablet manufacturers, faced high demand for quality control tests, which were previously done manually. I helped develop an Android application to automate these tests, covering CPU, RAM, GPS, screen brightness, and touch functionality. This automation significantly improved productivity in tablet production, and the app has since tested over 20 million devices."
          image="/projects/runin.webp"
        />
        <TimelineItem
          dateRange="2010 - 2013"
          technologies={["JQuery", "Backbone", "Java", "Android"]}
          print={version === "general"}
          title="SIMET - NIC.br"
          role="Software Engineer"
          description="At NIC.br, I worked on applications for SIMET, an internet quality measurement tool. I proposed and designed a new version of the main SIMET application, transitioning from Java Applet to JavaScript. I developed SimetMapas, visualizing internet quality heat maps across Brazil, and created dashboards for internet operators and regulatory agencies. Additionally, I helped develop SimetBox, a Wi-Fi router for automatic tests, and an Android app for quality testing with a custom graphics library."
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
