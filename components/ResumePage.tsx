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
import { BlockchainIcon } from "@/components/BlockchainIcon";
import { BiServer } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import { ContentVersion } from "@/app/contentVersion";
import { getAllPosts } from "@/lib/posts";

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

  // Skill order is version-driven: the primary resume (general) leads with
  // Backend + AI, the web3 resume leads with Blockchain + AI.
  const orderedSkills =
    version === "web3"
      ? [blockchainSection, aiSection, backendSection, frontendSection]
      : [backendSection, aiSection, frontendSection, blockchainSection];

  return (
    <div className="print:p-0 print:max-w-[740px]">
      <StickyHeader
        name="Gil"
        title={
          version === "web3"
            ? "Senior Blockchain Engineer"
            : version === "leader"
            ? "Tech Lead / Engineering Manager"
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
          linkedin: "linkedin.com/in/gilsolutions",
        }}
      />

      <div className="pb-6 pl-5 pr-8 max-md:pr-5 print:p-0">
        <div className="flex justify-end print:hidden mt-4">
          <a
            href={
              version === "web3"
                ? "/documents/Gil%20Lopes%20Bueno%20-%20Senior%20Blockchain%20Engineer.pdf"
                : version === "leader"
                ? "/documents/Gil%20Lopes%20Bueno%20-%20Tech%20Lead%20%26%20Engineering%20Manager.pdf"
                : "/documents/Gil%20Lopes%20Bueno%20-%20Principal%20Software%20Engineer.pdf"
            }
            download
            className="flex items-center gap-1.5 text-xs text-black dark:text-white opacity-60 hover:opacity-100 transition-opacity"
          >
            <FaFileDownload className="w-3.5 h-3.5" />
            Download CV
          </a>
        </div>
        <div className="flex overflow-hidden print:overflow-visible max-xl:flex-col max-xl:max-w-[740px] max-xl:mx-auto print:mx-0 print:block gap-x-32">
          <div className="flex flex-col max-w-[740px] print:block">
            <Bio version={version} />
            <Achievements />
            {version === "leader" && <LeadershipSection version={version} />}
            <div className="hidden print:block font-clash print:font-sans font-semibold text-black dark:text-white print:mt-5 text-xl">
              Technical Skills
            </div>

            <div className="flex flex-wrap print:flex-col gap-x-5 gap-y-14 print:gap-y-3 items-start mt-14 print:mt-2 w-full text-black max-md:max-w-full">
              {orderedSkills}
            </div>

            {version !== "leader" && <LeadershipSection version={version} />}
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
