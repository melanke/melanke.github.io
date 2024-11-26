import { Header } from "./components/Header";
import { Bio } from "./components/Bio";
import { SkillSection } from "./components/SkillSection";
import { Timeline } from "./components/Timeline";
import { LeadershipSection } from "./components/LeadershipSection";
import { OtherSection } from "./components/OtherSection";

export function Resume() {
  return (
    <div className="flex overflow-hidden flex-col bg-white max-w-[740px]">
      <div className="flex flex-col py-6 pr-8 pl-5 w-full max-md:pr-5 max-md:max-w-full">
        <Header
          name="Gil"
          title="Senior Developer"
          profileImage="/profile.webp"
          contacts={{
            fullName: "Gil Lopes Bueno",
            email: "gilbueno.mail@gmail.com",
            github: "github.com/melanke",
            phone: "+55 11970629099",
            education: "Computer Science, Bachelor's Degree PUC-SP",
            languages: "English and Portuguese",
            location: "Sao Paulo, Brazil",
            linkedin: "linkedin.com/in/gilbueno",
          }}
        />

        <div className="flex flex-col flex-1 pl-2.5 mt-5 w-full max-md:max-w-full">
          <Bio text="I began my software development journey as a self-taught learner in middle school and pursued a technical programming course in high school. After high school, I worked as a full-stack web developer and then earned a Computer Science degree, gaining valuable experience at various companies, including NIC.br. There, I specialized in full-stack web and native Android development. Later, I co-founded Simpli, a startup that grew into a successful software house, delivering diverse projects, including blockchain development. This period helped me evolve as both a developer and a leader. Now, I am returning to my core passion for hands-on software development." />

          <div className="flex flex-wrap gap-5 items-start mt-5 w-full text-black max-md:max-w-full">
            <SkillSection
              title="Web Frontend"
              icon="/icons/web.svg"
              skills={[
                { name: "Javascript", since: "2008", level: "expert" },
                { name: "Typescript", since: "2018", level: "expert" },
                { name: "HTML / CSS / SCSS", since: "2007", level: "expert" },
                { name: "Tailwind", since: "2020", level: "expert" },
                { name: "Chakra UI", since: "2021", level: "expert" },
                { name: "ReactJS / NextJS", since: "2020", level: "expert" },
                {
                  name: "Svelte / SvelteKit",
                  since: "2022",
                  level: "advanced",
                },
                {
                  name: "Vue 2",
                  since: "2016",
                  yearRange: "2016 - 2021",
                  level: "expert",
                },
              ]}
            />

            <SkillSection
              title="Blockchain"
              icon="/icons/blockchain.svg"
              skills={[
                { name: "EVM dApp Dev.", since: "2023", level: "expert" },
                {
                  name: "Solana dApp Dev.",
                  since: "2023",
                  level: "expert",
                },
                { name: "Flow dApp Dev.", since: "2022", level: "expert" },
                { name: "Neo N3 dApp Dev.", since: "2018", level: "expert" },
                { name: "Wallet Dev.", since: "2020", level: "expert" },
                { name: "Tooling Dev.", since: "2020", level: "expert" },
              ]}
            />

            <SkillSection
              title="Backend"
              icon="/icons/backend.svg"
              skills={[
                {
                  name: "Node.JS / Express",
                  since: "2012",
                  level: "expert",
                },
                {
                  name: "Java / Kotlin / Jersey / JDBC",
                  yearRange: "2008 - 2022",
                  level: "expert",
                },
                {
                  name: "MySQL / PostgreSQL / MongoDB",
                  since: "2007",
                  level: "expert",
                },
                {
                  name: "Apollo / TypeGraphQL",
                  since: "2022",
                  level: "advanced",
                },
                {
                  name: "Prisma",
                  since: "2022",
                  level: "advanced",
                },
              ]}
            />

            <SkillSection
              title="Processes and Tools"
              icon="/icons/processes.svg"
              skills={[
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
            />
          </div>
          <div className="break-after-page" />

          <LeadershipSection />
          <OtherSection />

          <Timeline />

          <div className="h-64 bg-transparent mt-5" />
        </div>
      </div>
    </div>
  );
}
