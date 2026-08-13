import { StickyHeader } from "@/components/StickyHeader";
import { Bio } from "@/components/Bio";
import { Achievements } from "@/components/Achievements";
import { History } from "@/components/History";
import { SkillSection } from "@/components/SkillSection";
import { Timeline } from "@/components/Timeline";
import { OtherSection } from "@/components/OtherSection";
import { LatestPosts } from "@/components/LatestPosts";
import { PiGlobe, PiRobot } from "react-icons/pi";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { BlockchainIcon } from "@/components/BlockchainIcon";
import { BiServer } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import { ContentVersion } from "@/app/contentVersion";
import { getAllPosts } from "@/lib/posts";
import { backend, frontend, blockchain, ai } from "@/lib/technologies";
import { cloneElement } from "react";
import { existsSync } from "fs";
import { join } from "path";

export function ResumePage({ version }: { version: ContentVersion }) {
  const latestPosts = getAllPosts().slice(0, 5);

  const backendSection = (
    <SkillSection
      key="backend"
      title="Backend"
      icon={BiServer}
      skills={[
        backend.nodejs,
        backend.java,
        backend.kotlin,
        backend.mysql,
        backend.postgresql,
        backend.mongodb,
        backend.prisma,
        backend.graphql,
        backend.rest,
        backend.websockets,
        backend.docker,
        backend.aws,
        backend.csharp,
        backend.python,
        backend.express,
        backend.typegraphql,
        backend.apollo,
        backend.jersey,
        backend.jdbc,
        backend.paypal,
        backend.elasticsearch,
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
        backend.java,
        backend.kotlin,
        backend.nodejs,
        frontend.typescript,
        backend.rest,
        backend.graphql,
        backend.websockets,
        backend.microservices,
        backend.mysql,
        backend.postgresql,
        backend.mongodb,
        backend.prisma,
        backend.distributedSystems,
        backend.solutionArchitecture,
        backend.docker,
        backend.aws,
        backend.cicd,
        backend.githubActions,
        backend.csharp,
        backend.python,
        backend.express,
        backend.jersey,
        backend.jdbc,
        backend.elasticsearch,
      ]}
    />
  );

  const aiSection = (
    <SkillSection
      key="ai"
      title="AI Engineering"
      icon={PiRobot}
      skills={[
        ai.aiProcessAutomation,
        ai.agentDevelopment,
        ai.mcp,
        ai.claudeSkills,
        ai.harnessEngineering,
        ai.specDrivenDevelopment,
        ai.claude,
        ai.anthropicApi,
        ai.openaiApi,
        ai.claudeCode,
        ai.cursor,
        ai.contextEngineering,
        ai.agenticWorkflows,
        ai.evals,
        ai.rag,
      ]}
    />
  );

  const frontendSection = (
    <SkillSection
      key="frontend"
      title="Web Frontend"
      icon={PiGlobe}
      skills={[
        frontend.javascript,
        frontend.typescript,
        frontend.reactjs,
        frontend.nextjs,
        frontend.tailwind,
        frontend.vue2,
        frontend.sveltekit,
        frontend.chakraUi,
        frontend.reactQuery,
        frontend.reduxToolkit,
        frontend.echarts,
        frontend.valtio,
        frontend.vite,
        frontend.jest,
        frontend.playwright,
        frontend.storybook,
        frontend.urql,
        frontend.reactHookForm,
        frontend.lighthouse,
      ]}
    />
  );

  const blockchainSection = (
    <SkillSection
      key="blockchain"
      title="Blockchain"
      icon={BlockchainIcon}
      skills={[
        blockchain.ethereum,
        blockchain.solidity,
        blockchain.foundry,
        blockchain.protocolArchitecture,
        blockchain.fuzzing,
        blockchain.gasOptimization,
        blockchain.wagmi,
        blockchain.viem,
        blockchain.theGraph,
        blockchain.solana,
        blockchain.flow,
        blockchain.neoN3,
        blockchain.vmCompilerDevelopment,
        blockchain.walletDevelopment,
        blockchain.nft,
        blockchain.cryptoCurrency,
        blockchain.dex,
        blockchain.amm,
        blockchain.ethers,
        blockchain.hardhat,
        blockchain.auditPrep,
        blockchain.slither,
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
        blockchain.ethereum,
        blockchain.evm,
        blockchain.multiChainIntegration,
        blockchain.walletInfrastructure,
        blockchain.walletConnect,
        blockchain.ethers,
        blockchain.wagmi,
        blockchain.viem,
        blockchain.theGraph,
        blockchain.solidity,
        blockchain.foundry,
        blockchain.sdkDevelopment,
        blockchain.cryptography,
        blockchain.accountAbstraction,
        blockchain.solana,
        blockchain.flow,
        blockchain.neoN3,
        blockchain.hardhat,
        blockchain.automatedTesting,
        blockchain.auditPrep,
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
        { name: "Discovery", since: "2010" },
        { name: "Requirements", since: "2010" },
        { name: "Backlog Management", since: "2016" },
        { name: "Roadmap", since: "2016" },
        { name: "Prioritization", since: "2016" },
        { name: "Stakeholder Management", since: "2013" },
        { name: "Wireframing", since: "2011" },
        { name: "UX", since: "2011" },
        { name: "User Stories", since: "2016" },
        { name: "Acceptance Criteria", since: "2016" },
        { name: "Functional Specs", since: "2016" },
        { name: "Stakeholder Interviews", since: "2013" },
        { name: "Technical Feasibility", since: "2013" },
        { name: "Scope Negotiation", since: "2013" },
        { name: "Figma", since: "2018" },
        { name: "ClickUp", since: "2019" },
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
          fullName: "Gil Bueno",
          email: "gilbueno.mail@gmail.com",
          github: "github.com/melanke",
          telegram: "melankeee",
          x: "melanke",
          education: "Computer Science, Bachelor's Degree PUC-SP",
          languages: "English and Portuguese",
          location: "UTC-3",
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
            <div className="flex flex-col gap-y-8 print:gap-y-1.5 items-start mt-14 print:mt-3 w-full text-black max-md:max-w-full">
              {orderedSkills}
            </div>

            <OtherSection />

            <History text="I began my software development journey as a self-taught learner in middle school and pursued a technical programming course in high school. After high school, I worked as a full-stack web developer and then earned a Computer Science degree, gaining valuable experience at various companies, including NIC.br. There, I specialized in full-stack web and native Android development. Later, I co-founded Simpli, a startup that grew into a successful software house, delivering diverse projects, including blockchain development. This period helped me evolve as both a developer and a leader." />

            {/* Latest Posts — xl+ only (left column) */}
            <LatestPosts posts={latestPosts} className="hidden xl:block print:hidden" />
          </div>
          <div className="flex flex-col print:block">
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
