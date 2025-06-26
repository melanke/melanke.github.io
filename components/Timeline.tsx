import { TimelineItem } from "./TimelineItem";
import { TimelineIcon } from "./TimelineIcon";

function TimelineHeader({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-1.5 justify-center items-center self-start text-xl font-semibold leading-none mt-10 print:mt-8 ${className}`}
    >
      <TimelineIcon size={17} className="print:hidden" />
      <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
        Work Experience
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <div className="flex flex-col mt-10 print:mt-0 w-full text-black dark:text-white max-md:max-w-full">
      <TimelineHeader />

      <TimelineItem
        title="BuidlGuidl Batch Program"
        dateRange="Feb 2025 - Present"
        technologies={[
          "Solidity",
          "Hardhat",
          "TypeScript",
          "React.js",
          "Next.js",
          "Ethereum",
          "EVM",
        ]}
        role="Software Engineer | Mentor"
        description="BuidlGuidl is one of the most impactful builder communities in the Ethereum ecosystem. One of its core initiatives is the Batch Program, which helps onboard new developers into the Ethereum space. As a mentor in the program, I guide participants through their first steps contributing to open source using Solidity, Hardhat, ScaffoldEth 2, and Next.js."
        image="/projects/buidlguidl.webp"
        link="https://buidlguidl.com/batches"
      />
      <TimelineItem
        title="Jodobix"
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
              Hands-on Head of Technology, responsible for defining and
              implementing technology stacks, development processes, and product
              architecture. Blockchain specialist with a strong background as a
              Requirements Analyst, Software Architect, and Senior Developer.
              Over the past 11 years, I have successfully delivered more than 50
              projects to clients and stakeholders.
            </p>
            <p>Below are more details about some of these projects:</p>
          </div>
        }
        image="/projects/simpli.webp"
        groupCircleForPrint
      />
      <TimelineItem
        nested
        title="Enclave Wallet"
        dateRange="Jun 2024 - Present"
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
        dateRange="Fev 2022 - Apr 2023"
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
        dateRange="Aug 2014 - Out 2014"
        technologies={["Android", "Java"]}
        role="Software Engineer"
        description="Multilaser, one of Brazil's largest cell phone and tablet manufacturers, faced high demand for quality control tests, which were previously done manually. I helped develop an Android application to automate these tests, covering CPU, RAM, GPS, screen brightness, and touch functionality. This automation significantly improved productivity in tablet production, and the app has since tested over 20 million devices."
        image="/projects/runin.webp"
      />
      <TimelineItem
        dateRange="2010 - 2013"
        technologies={["JQuery", "Backbone", "Java", "Android"]}
        title="SIMET - NIC.br"
        role="Software Engineer"
        description="At NIC.br, I worked on applications for SIMET, an internet quality measurement tool. I proposed and designed a new version of the main SIMET application, transitioning from Java Applet to JavaScript. I developed SimetMapas, visualizing internet quality heat maps across Brazil, and created dashboards for internet operators and regulatory agencies. Additionally, I helped develop SimetBox, a Wi-Fi router for automatic tests, and an Android app for quality testing with a custom graphics library."
        link="https://simet.nic.br"
      />
      <TimelineItem
        dateRange="2008 - 2011"
        technologies={[]}
        title="Pontifícia Universidade Católica de São Paulo (PUC-SP)"
        role="Bachelor, Computer Science"
        description="Bachelor's degree in Computer Science from Pontifícia Universidade Católica de São Paulo, one of Brazil's leading higher education institutions."
      />
      <div className="h-48"></div>
    </div>
  );
}
