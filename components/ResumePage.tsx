import { StickyHeader } from "@/components/StickyHeader";
import { Bio } from "@/components/Bio";
import { Achievements } from "@/components/Achievements";
import { History } from "@/components/History";
import { SkillSection } from "@/components/SkillSection";
import { Timeline } from "@/components/Timeline";
import { LeadershipSection } from "@/components/LeadershipSection";
import { OtherSection } from "@/components/OtherSection";
import { LatestPosts } from "@/components/LatestPosts";
import { PiGlobe, PiRobot } from "react-icons/pi";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { BlockchainIcon } from "@/components/BlockchainIcon";
import { BiServer } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import { ContentVersion } from "@/app/contentVersion";
import { getAllPosts } from "@/lib/posts";
import { cloneElement } from "react";
import { existsSync } from "fs";
import { join } from "path";

export function ResumePage({ version }: { version: ContentVersion }) {
  const latestPosts = getAllPosts().slice(0, 3);

  const backendSection = (
    <SkillSection
      key="backend"
      title="Backend"
      icon={BiServer}
      skills={[
        { name: "Node.JS", since: "2012", level: "expert" },
        { name: "GraphQL / REST / WebSockets", since: "2018", level: "expert" },
        {
          name: "MySQL / PostgreSQL / MongoDB / Prisma",
          since: "2007",
          level: "expert",
        },
        { name: "Java / Kotlin", since: "2008", level: "expert" },
      ]}
      otherSkills={[
        "Docker",
        "AWS",
        "C#",
        "Python",
        "Express",
        "TypeGraphQL",
        "Apollo",
        "Jersey",
        "JDBC",
        "PayPal",
        "ElasticSearch",
        "and more...",
      ]}
    />
  );

  // Enterprise variant of the backend section: same real skills, ordered so a
  // recruiter reads Java/Kotlin and distributed systems before anything else.
  const backendEnterpriseSection = (
    <SkillSection
      key="backend"
      title="Backend"
      icon={BiServer}
      skills={[
        { name: "Java / Kotlin", since: "2008", level: "expert" },
        { name: "Node.JS / TypeScript", since: "2012", level: "expert" },
        {
          name: "REST / GraphQL / WebSockets / Microservices",
          since: "2018",
          level: "expert",
        },
        {
          name: "MySQL / PostgreSQL / MongoDB / Prisma",
          since: "2007",
          level: "expert",
        },
      ]}
      otherSkills={[
        "Distributed Systems",
        "Solution Architecture",
        "Docker",
        "AWS",
        "CI/CD",
        "GitHub Actions",
        "C#",
        "Python",
        "Express",
        "Jersey",
        "JDBC",
        "ElasticSearch",
        "and more...",
      ]}
    />
  );

  const aiSection = (
    <SkillSection
      key="ai"
      title="AI Engineering"
      icon={PiRobot}
      skills={[
        {
          name: "AI Process Automation",
          since: "2025",
          level: "advanced",
        },
        {
          name: "Agent Development / MCP / Skills",
          since: "2025",
          level: "advanced",
        },
        { name: "Harness Engineering", since: "2026", level: "advanced" },
        { name: "Spec-Driven Development", since: "2025", level: "advanced" },
      ]}
      otherSkills={[
        "Claude / Anthropic API",
        "OpenAI API",
        "Claude Code",
        "Cursor",
        "Context Engineering",
        "Agentic Workflows",
        "Evals",
        "RAG",
        "and more...",
      ]}
    />
  );

  const frontendSection = (
    <SkillSection
      key="frontend"
      title="Web Frontend"
      icon={PiGlobe}
      skills={[
        { name: "Javascript", since: "2008", level: "expert" },
        { name: "Typescript", since: "2018", level: "expert" },
        { name: "ReactJS / NextJS", since: "2017", level: "expert" },
        { name: "Tailwind", since: "2020", level: "expert" },
      ]}
      otherSkills={[
        "Vue 2",
        "SvelteKit",
        "Chakra UI",
        "ReactQuery",
        "ReduxToolkit",
        "Echarts",
        "Valtio",
        "Vite",
        "Jest",
        "Playwright",
        "Storybook",
        "URQL",
        "ReactHookForm",
        "Lighthouse",
        "and more...",
      ]}
    />
  );

  const blockchainSection = (
    <SkillSection
      key="blockchain"
      title="Blockchain"
      icon={BlockchainIcon}
      skills={[
        {
          name: "Ethereum / Solidity / Foundry",
          since: "2020",
          level: "expert",
        },
        {
          name: "Architecture / Fuzzing / Gas Optimization",
          since: "2023",
          level: "expert",
        },
        { name: "Wagmi / Viem / The Graph", since: "2023", level: "expert" },
        { name: "Solana / Flow / Neo N3", since: "2018", level: "intermediate" },
      ]}
      otherSkills={[
        "VM Compiler Development",
        "Wallet Development",
        "NFT",
        "Crypto Currency",
        "DEX",
        "AMM",
        "Ethers",
        "Hardhat",
        "Audit Prep",
        "Slither",
        "and more...",
      ]}
    />
  );

  // Enterprise variant of the blockchain section: framed as Web3 integration
  // work (multi-chain, wallets, SDKs) rather than DeFi/protocol engineering.
  const web3IntegrationSection = (
    <SkillSection
      key="blockchain"
      title="Web3"
      icon={BlockchainIcon}
      skills={[
        {
          name: "Ethereum / EVM / Multi-chain Integration",
          since: "2018",
          level: "expert",
        },
        {
          name: "Wallet Infrastructure / WalletConnect",
          since: "2021",
          level: "expert",
        },
        { name: "Ethers / Wagmi / Viem / The Graph", since: "2023", level: "expert" },
        { name: "Solidity / Foundry", since: "2020", level: "expert" },
      ]}
      otherSkills={[
        "SDK Development",
        "Cryptography",
        "Account Abstraction",
        "Solana / Flow / Neo N3",
        "Hardhat",
        "Automated Testing",
        "Audit Prep",
        "and more...",
      ]}
    />
  );

  // Product resume only: the competencies behind the PO/BA hats listed in the
  // Leadership section — what he does, as opposed to what he was called.
  const productSection = (
    <SkillSection
      key="product"
      title="Product"
      icon={HiOutlineClipboardDocumentList}
      skills={[
        { name: "Discovery / Requirements", since: "2010", level: "expert" },
        { name: "Backlog / Roadmap / Prioritization", since: "2016", level: "expert" },
        { name: "Stakeholder Management", since: "2013", level: "expert" },
        { name: "Wireframing / UX", since: "2011", level: "advanced" },
      ]}
      otherSkills={[
        "User Stories",
        "Acceptance Criteria",
        "Functional Specs",
        "Stakeholder Interviews",
        "Technical Feasibility",
        "Scope Negotiation",
        "Figma",
        "ClickUp",
        "and more...",
      ]}
    />
  );

  // Skill order is version-driven: the primary resume (general) leads with
  // Backend + AI, the web3 resume leads with Blockchain + AI, the enterprise
  // resume pushes Web3 to the end (backend-first positioning), and the product
  // resume leads with Product and keeps the technical stack as evidence.
  const orderedSkills =
    version === "web3"
      ? [blockchainSection, aiSection, backendSection, frontendSection]
      : version === "enterprise"
      ? [
          backendEnterpriseSection,
          frontendSection,
          aiSection,
          web3IntegrationSection,
        ]
      : version === "product"
      ? [
          productSection,
          backendSection,
          frontendSection,
          aiSection,
          // Blockchain stays on the site as range evidence, but the PDF's
          // 3-page budget is better spent on the product content.
          cloneElement(blockchainSection, { className: "print:hidden" }),
        ]
      : [backendSection, aiSection, frontendSection, blockchainSection];

  // The PDFs are print-to-PDF exports done by hand, so a version may not have
  // one yet — only render the download button when the file actually exists.
  const pdfFileName = {
    web3: "Gil Lopes Bueno - Senior Blockchain Engineer.pdf",
    leader: "Gil Lopes Bueno - Tech Lead & Engineering Manager.pdf",
    enterprise: "Gil Lopes Bueno - Principal Backend Engineer.pdf",
    product: "Gil Lopes Bueno - Technical Product Owner.pdf",
    general: "Gil Lopes Bueno - Principal Software Engineer.pdf",
  }[version];
  const hasPdf = existsSync(join(process.cwd(), "public", "documents", pdfFileName));

  return (
    <div className="print:p-0 print:max-w-[740px]">
      <StickyHeader
        name="Gil"
        title={
          version === "web3"
            ? "Senior Blockchain Engineer"
            : version === "leader"
            ? "Tech Lead / Engineering Manager"
            : version === "product"
            ? "Technical Product Owner"
            : "Principal Software Engineer"
        }
        contacts={{
          fullName: "Gil L Bueno",
          email: "gilbueno.mail@gmail.com",
          github: "github.com/melanke",
          telegram: "melankeee",
          x: "melanke",
          education: "Computer Science, Bachelor's Degree PUC-SP",
          languages: "English and Portuguese",
          location: "Sao Paulo, Brazil (UTC-3)",
          linkedin: "linkedin.com/in/gilbueno",
        }}
      />

      <div className="pb-6 pl-5 pr-8 max-md:pr-5 print:p-0">
        <div className="flex justify-end print:hidden mt-4">
          {hasPdf && (
            <a
              href={`/documents/${encodeURIComponent(pdfFileName)}`}
              download
              className="flex items-center gap-1.5 text-xs text-black dark:text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <FaFileDownload className="w-3.5 h-3.5" />
              Download CV
            </a>
          )}
        </div>
        <div className="flex overflow-hidden print:overflow-visible max-xl:flex-col max-xl:max-w-[740px] max-xl:mx-auto print:mx-0 print:block gap-x-32">
          <div className="flex flex-col max-w-[740px] print:block">
            <Bio version={version} />
            <Achievements />
            {(version === "leader" || version === "product") && (
              <LeadershipSection version={version} />
            )}
            <div className="hidden print:block font-clash print:font-sans font-semibold text-black dark:text-white print:mt-3 text-xl">
              Technical Skills
            </div>

            <div className="flex flex-wrap print:flex-col gap-x-5 gap-y-14 print:gap-y-1.5 items-start mt-14 print:mt-2 w-full text-black max-md:max-w-full">
              {orderedSkills}
            </div>

            {version !== "leader" && version !== "product" && (
              <LeadershipSection version={version} />
            )}
            <OtherSection />

            <History text="I began my software development journey as a self-taught learner in middle school and pursued a technical programming course in high school. After high school, I worked as a full-stack web developer and then earned a Computer Science degree, gaining valuable experience at various companies, including NIC.br. There, I specialized in full-stack web and native Android development. Later, I co-founded Simpli, a startup that grew into a successful software house, delivering diverse projects, including blockchain development. This period helped me evolve as both a developer and a leader." />

            {/* Latest Posts — xl+ only (left column) */}
            <LatestPosts posts={latestPosts} className="hidden xl:block print:hidden" />
          </div>
          <div className="flex flex-col print:block print:break-before-page">
            <Timeline version={version} />
          </div>
        </div>

        {/* Latest Posts — below xl (below two-column layout) */}
        <LatestPosts
          posts={latestPosts}
          className="xl:hidden print:hidden max-xl:max-w-[740px] max-xl:mx-auto"
        />
      </div>
    </div>
  );
}
