import { Header } from "@/components/Header";
import { Bio } from "@/components/Bio";
import { Achievements } from "@/components/Achievements";
import { History } from "@/components/History";
import { SkillSection } from "@/components/SkillSection";
import { Timeline } from "@/components/Timeline";
import { LeadershipSection } from "@/components/LeadershipSection";
import { OtherSection } from "@/components/OtherSection";
import { PiGlobe } from "react-icons/pi";
import { BlockchainIcon } from "@/components/BlockchainIcon";
import { BiServer } from "react-icons/bi";
import { LiaToolsSolid } from "react-icons/lia";
import { contentVersion } from "./contentVersion";

export default function Home() {
  return (
    <div className="flex overflow-hidden max-xl:flex-col max-xl:max-w-[740px] max-xl:mx-auto print:mx-0 py-6 pr-8 pl-5 max-md:pr-5 print:p-0 gap-x-32">
      <div className="flex flex-col max-w-[740px]">
        <Header
          name="Gil"
          title={
            contentVersion === "web3"
              ? "Senior Blockchain Engineer"
              : "Senior Software Engineer"
          }
          profileImage="/profile.webp"
          contacts={{
            fullName: "Gil L Bueno",
            email: "gilbueno.mail@gmail.com",
            github: "github.com/melanke",
            telegram: "melankeee",
            education: "Computer Science, Bachelor's Degree PUC-SP",
            languages: "English and Portuguese",
            location: "Sao Paulo, Brazil (UTC-3)",
            linkedin: "linkedin.com/in/gilbueno",
          }}
        />

        <Bio />
        <Achievements />
        <div className="hidden print:block font-clash print:font-sans font-semibold text-black dark:text-white print:mt-5 text-xl">
          Technical Skills
        </div>

        <div className="flex flex-wrap print:flex-col gap-x-5 gap-y-10 print:gap-y-3 items-start mt-10 print:mt-2 w-full text-black max-md:max-w-full">
          <SkillSection
            title="Blockchain"
            icon={BlockchainIcon}
            skills={[
              { name: "Ethereum / Solidity", since: "2020", level: "expert" },
              {
                name: "Solana / Anchor / Rust",
                since: "2022",
                level: "advanced",
              },
              { name: "Flow / Cadence", since: "2022", level: "expert" },
              {
                name: "Neo N3 / Python / Go",
                since: "2018",
                level: "expert",
              },
            ]}
            otherSkills={[
              "Smart Contract",
              "VM Compiler Development",
              "Wallet Development",
              "NFT",
              "Crypto Currency",
              "DEX",
              "AMM",
              "Wagmi",
              "Viem",
              "Ethers",
              "Hardhat",
              "ScaffoldEth-2",
              "and more...",
            ]}
          />

          <SkillSection
            title="Web Frontend"
            icon={PiGlobe}
            skills={[
              { name: "Javascript", since: "2008", level: "expert" },
              { name: "Typescript", since: "2018", level: "expert" },
              { name: "Tailwind", since: "2020", level: "expert" },
              { name: "ReactJS / NextJS", since: "2017", level: "expert" },
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

          <SkillSection
            title="Backend"
            icon={BiServer}
            skills={[
              {
                name: "Node.JS",
                since: "2012",
                level: "expert",
              },
              {
                name: "Java / Kotlin",
                since: "2008",
                level: "expert",
              },
              {
                name: "MySQL / PostgreSQL / MongoDB",
                since: "2007",
                level: "expert",
              },
              {
                name: "Prisma",
                since: "2022",
                level: "advanced",
              },
            ]}
            otherSkills={[
              "C#",
              "Python",
              "Express",
              "TypeGraphQL",
              "Apollo",
              "Jersey",
              "JDBC",
              "Docker",
              "AWS",
              "PayPal",
              "ElasticSearch",
              "and more...",
            ]}
          />

          <SkillSection
            title="Processes and Tools"
            icon={LiaToolsSolid}
            className="print:hidden"
            skills={[
              {
                name: "AI / Vibe Coding / Prompt Engineering",
                since: "2023",
                level: "advanced",
              },
              {
                name: "Scrum / Agile",
                since: "2013",
                level: "advanced",
              },
              {
                name: "Git flow",
                since: "2018",
                level: "advanced",
              },
              {
                name: "Clickup / Youtrack / Jira",
                level: "expert",
              },
              {
                name: "Lean Canvas / OGSM",
                since: "2023",
                level: "advanced",
              },
            ]}
            otherSkills={[
              "Dailies",
              "Kanban",
              "Time tracking",
              "Effort Estimation",
              "Code Review",
              "Git Hooks",
              "Github Actions",
              "Test Environment",
              "and more...",
            ]}
          />
        </div>

        <LeadershipSection />
        <OtherSection />

        <History text="I began my software development journey as a self-taught learner in middle school and pursued a technical programming course in high school. After high school, I worked as a full-stack web developer and then earned a Computer Science degree, gaining valuable experience at various companies, including NIC.br. There, I specialized in full-stack web and native Android development. Later, I co-founded Simpli, a startup that grew into a successful software house, delivering diverse projects, including blockchain development. This period helped me evolve as both a developer and a leader." />
      </div>
      <div className="flex flex-col">
        <Timeline />

        <div className="h-8 bg-transparent mt-[120px] hidden print:block" />
      </div>
    </div>
  );
}
