"use client";

import { PageHeader } from "./PageHeader";
import { TimelineItem } from "./TimelineItem";
import Image from "next/image";

function TimelineHeader({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-1.5 justify-center items-center self-start text-xl font-semibold leading-none ${className}`}
    >
      <Image
        src="/icons/timeline.svg"
        width={18}
        height={18}
        className="object-contain shrink-0 self-stretch my-auto aspect-[1.2] w-[18px]"
        alt=""
      />
      <div className="self-stretch my-auto font-clash font-semibold">
        Projects Timeline
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <div className="flex flex-col mt-10 w-full text-black max-md:max-w-full">
      <TimelineHeader />
      <div className="flex-1 shrink gap-2.5 self-stretch pt-1.5 pb-4 w-full text-base leading-5 text-black max-md:max-w-full">
        Throughout my career, I have contributed to over{" "}
        <span className="font-bold">50 projects</span>, encompassing diverse
        industries and innovative technologies. This selection highlights those
        I find most relevant to showcase my expertise and the impactful results
        achieved.
      </div>
      <TimelineItem
        dateRange="Since Jun 2024"
        technologies={["TS", "React", "Contract"]}
        title="Enclave Wallet - Simpli"
        role="Developer / Researcher"
        description="In it's Alpha version, Enclave is a Wallet built to embrace non-blockchain users. Using Abstract Accounts, WebAuthn and Gasless transactions, it makes the onboarding smooth as traditional web applications. I am one of the developers pioneering these emerging technologies."
      />
      <TimelineItem
        dateRange="Jan 2024 - Aug 2024"
        technologies={["TS", "SvelteKit", "Contract"]}
        title="Linkd Academy - Simpli"
        role="Tech Consultant"
        description="Linkd is the largest educational platform on the Neo network. This project features a website with extensive materials teaching users how to develop dApps on the network, along with a VSCode extension to streamline installation and integration with the platform's development environment and a Token. I was responsible for reviewing the platform's content, providing technical leadership on specific aspects of the project, and developing the dApp related to the Token."
      />
      <TimelineItem
        dateRange="Oct 2023 - Jun 2024"
        technologies={["SvelteKit", "Contract"]}
        title="Icon Dapp - Simpli"
        role="Product Owner / TechLead"
        description="This platform allows dApp administrators to upload their application icons to a decentralized File System and save the URL into a SmartContract, which organizes and makes these icons available to other applications. I was responsible for architecting the dApp to operate in a fully decentralized manner."
      />
      <PageHeader />
      <TimelineHeader className="hidden print:flex mb-8" />
      <TimelineItem
        dateRange="Aug 2023 - Jul 2024"
        technologies={["TS", "Blockchain"]}
        title="Blockchain Services Library - Simpli"
        role="Techlead"
        description="BSLib is a multi-chain library designed to perform common wallet operations in a generic manner, abstracting and normalizing the unique characteristics of each blockchain. It includes implementations for NeoN3, NeoLegacy, and various EVM networks. This library is extensively used by Neon Wallet Desktop and Mobile applications. As the creator of BSLib, I aimed to enable code reuse across the wallets maintained by my team."
      />
      <TimelineItem
        dateRange="Fev 2022 - Apr 2023"
        technologies={["TS", "React", "Contract", "Cadence"]}
        title="Letter - Simpli"
        role="TechLead / Main Developer"
        description="In partnership with the Associated Press, Dapper Labs, and COZ, Letter is a multi-chain (Neo and Flow) platform that provides authentication mechanisms based on NFTs. This allows systems to validate access in a decentralized manner. I was responsible for architecting the solution, which included SmartContracts on both networks, an SDK that integrates both networks simultaneously, and several key integrations."
      />
      <TimelineItem
        dateRange="July 2021 - July 2024"
        technologies={["TS", "React", "R. Native", "Blockchain"]}
        title="Neon Wallet - Simpli"
        role="TechLead"
        description="Neon is the largest wallet in the Neo ecosystem, with over $1 billion in traded volume. I was responsible for structuring its mobile version and later contributed to the development of the desktop version. Key challenges of this wallet included supporting multiple blockchain networks and managing multiple accounts simultaneously. Through this wallet, we introduced Wallet Connect integration to the network, implemented atomic swaps, and executed various other integrations."
      />
      <TimelineItem
        dateRange="Mar 2021 - Mar 2022"
        technologies={["Vue2", "Kotlin"]}
        title="Sharity - Simpli"
        role="TechLead / Main Developer"
        description="A crowdfunding for charitable causes with more than 100 thousand users. I played a key role at the outset of the project, where I designed the database architecture, structured the project, and developed the most critical components of the application."
      />
      <TimelineItem
        dateRange="Feb 2021 - Set 2024"
        technologies={["Vue2", "Kotlin"]}
        title="NDapp - Simpli"
        role="TechLead / Project Manager"
        description="NDapp became the official dApps galery of Neo network. Provides detailed information and automatic updates about each dApp, with data pulled directly from the NeoLegacy, Neo N3 and Neo X blockchains. I worked defining the initial structure of the project and developing the first functionalities."
      />
      <TimelineItem
        dateRange="Mar 2020 - Aug 2023"
        technologies={["TS", "Vue2", "Kotlin", "Jersey", "MySQL"]}
        title="Wow Talents - Simpli"
        role="Business Analyst / Project Manager / TechLead / Main Developer"
        description="Wow Talents was a comprehensive agency platform for child models. Its primary features included model registration, job listing, and match-making between models and opportunities. The system also supported various functionalities, such as subscription payments and five different user types. Organizing all the demands into functional requirements, developing wireframes, managing the project roadmap, designing the database architecture, structuring the project, creating the permissions system and delegating tasks were significant challenges. This project was a tremendous learning experience."
      />
      <TimelineItem
        dateRange="Oct 2019 - Nov 2020"
        technologies={["TS", "Vue2", "Kotlin", "MySQL"]}
        title="LDC's She Digital - Simpli"
        role="Business Analyst / Project Manager / TechLead / Main Developer"
        description="Louis Dreyfus Company, one of the largest commodity traders in the world, commissioned the development of a 'Safety, Health, and Environment' management platform for use across all its global units. I architected and developed this project entirely. The platform included integrations with Azure Active Directory for authentication and user management. The most significant challenge was translating all the company's needs into a flexible application that could scale without requiring code modifications."
      />
      <TimelineItem
        dateRange="Jun 2019 - May 2022"
        technologies={["TS", "Vue2"]}
        title="Jamef customers dashboard - Simpli"
        role="Developer / Tech Consultant"
        description="Jamef, the largest shipping company in Brazil, needed a new dashboard for customers to track delivery data due to significant performance issues with the old dashboard. Initially, my responsibility was focused solely on the frontend. However, I quickly realized that structural changes were necessary. I provided several recommendations to Jamef's team on improving the data structure and delivery for better performance. Ultimately, I delivered a complex dashboard featuring various customized graphs and contributed to enhancing the overall structure of the central system."
      />
      <PageHeader />
      <TimelineHeader className="hidden print:flex mb-8" />
      <TimelineItem
        dateRange="Jan 2018 - May 2019"
        technologies={["Vue2", "Kotlin / R"]}
        title="SimpliData - Simpli"
        role="Business Analyst / Project Manager / TechLead / Main Developer"
        description="In partnership with the macroeconomics firm Parallaxis, my team and I developed SimpliData, a Data Science application akin to the Bloomberg dashboard. Our goal was to combine various market tools and techniques into a platform that was significantly more practical and user-friendly."
      />
      <TimelineItem
        dateRange="Aug 2017 - Mar 2019"
        technologies={["Android"]}
        title="Bettie - Simpli"
        role="TechLead / Developer"
        description="Bettie was a cosmetics marketplace that integrated its product listings with Google Shopping. I was primarily responsible for structuring the architecture of the Android application, utilizing the cutting-edge technology of the time, 'Android Data Binding'."
      />
      <TimelineItem
        dateRange="Nov 2016 - Jun 2018"
        technologies={["Vue2", "Kotlin"]}
        title="iTrack - Simpli"
        role="Business Analyst / TechLead / Developer"
        description="iTrack Brasil is a B2B delivery services platform, integrating multiple systems, with nearly 60,000 couriers. Key challenges included various integrations and optimizing large data volumes. With over 50 million invoices and 2,000 companies registered, the platform's growth was further boosted by its acquisition by MadeiraMadeira in 2021."
      />
      <TimelineItem
        dateRange="Mar 2016 - Jan 2018"
        technologies={["Android", "Java"]}
        title="Mapix - Simpli"
        role="Business Analyst / Project Manager / TechLead / Developer"
        description="Mapix is a platform that connects students with their drivers, enhancing predictability and safety for children and parents while simplifying route planning and communication for drivers. I handled all the planning and structuring of the solution, and developed critical components of the application, including the route-building system, chat, and GPS mode."
      />
      <TimelineItem
        dateRange="Sep 2015 - July 2017"
        technologies={["Android", "Java"]}
        title="Apptite - Simpli"
        role="Business Analyst / TechLead / Developer / UX/UI Designer"
        description="Apptite was a food delivery app for iOS, Android and the web. It gained recognition with acceleration by '500 Startups'. With media coverage, it established itself as an important platform in the artisanal food market. I was the main responsible for the initial planning, structuring and development of the platform."
      />
      <TimelineItem
        dateRange="Aug 2015 - July 2017"
        technologies={["Android", "Java"]}
        title="Desabafa - Simpli"
        role="Business Analyst / TechLead / Developer / UX/UI Designer"
        description="Desabafa was an anonymous social network designed for emotional support and mutual understanding, featuring a robust security and monitoring system to ensure a healthy user experience. The platform received media recognition in the mental health sector and facilitated over 1 million interactions. I contributed to the planning, structuring, and development of the platform."
      />
      <TimelineItem
        dateRange="Out 2014 - Nov 2015"
        technologies={["Xamarin"]}
        title="Band Radios App - Simpli"
        role="Main Developer"
        description="Bandeirantes, a major Brazilian media conglomerate, established Band Radios in 1937 and selected my team in 2014 to modernize their mobile app. The project presented several challenges, including the requirement to establish a UDP connection before the user selected a radio station. I served as the lead developer for the Android and iOS apps."
      />
      <TimelineItem
        dateRange="Aug 2014 - Out 2014"
        technologies={["Android", "Java"]}
        title="Multilaser Runin - Simpli"
        role="Developer"
        description="Multilaser, one of Brazil's largest cell phone and tablet manufacturers, faced high demand for quality control tests, which were previously done manually. I helped develop an Android application to automate these tests, covering CPU, RAM, GPS, screen brightness, and touch functionality. This automation significantly improved productivity in tablet production, and the app has since tested over 20 million devices."
      />
      <TimelineItem
        dateRange="2010 - 2013"
        technologies={["JQuery", "Backbone", "Java", "Android"]}
        title="SIMET - NIC.br"
        role="Developer / UX/UI Designer"
        description="At NIC.br, I worked on applications for SIMET, an internet quality measurement tool. I proposed and designed a new version of the main SIMET application, transitioning from Java Applet to JavaScript. I developed SimetMapas, visualizing internet quality heat maps across Brazil, and created dashboards for internet operators and regulatory agencies. Additionally, I helped develop SimetBox, a Wi-Fi router for automatic tests, and an Android app for quality testing with a custom graphics library."
      />
    </div>
  );
}