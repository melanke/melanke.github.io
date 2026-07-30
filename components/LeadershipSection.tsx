import { SkillItem, SkillItemProps } from "./SkillItem";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { ContentVersion } from "@/app/contentVersion";

const cto: SkillItemProps = { name: "CTO", since: "2013", level: "expert" };
const techlead: SkillItemProps = {
  name: "Techlead",
  since: "2013",
  level: "expert",
};
const businessAnalyst: SkillItemProps = {
  name: "Business Analyst",
  since: "2010",
  level: "expert",
};
const productOwner: SkillItemProps = {
  name: "Product Owner",
  since: "2018",
  level: "expert",
};
const projectManager: SkillItemProps = {
  name: "Project Manager",
  since: "2018",
  level: "intermediate",
};

export function LeadershipSection({ version }: { version?: ContentVersion }) {
  const isProduct = version === "product";

  // The product resume reads the same roles from the product side: what he
  // owned (backlog, requirements) before what he managed (org, delivery).
  const roles = isProduct
    ? [productOwner, businessAnalyst, projectManager, techlead, cto]
    : [cto, techlead, businessAnalyst, productOwner, projectManager];

  return (
    <div
      className={`flex flex-col mt-10 print:mt-3 w-full text-black break-inside-avoid dark:text-white max-md:max-w-full ${
        version === "leader" || isProduct ? "" : "print:hidden"
      }`}
    >
      <div className="flex gap-1.5 justify-center items-center self-start text-2xl print:text-xl font-semibold leading-none animate-fade-up opacity-0">
        <HiOutlineUserGroup size={20} className="print:hidden text-[#f9b800]" />
        <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
          {isProduct ? "Product & Leadership Experience" : "Leadership Experience"}
        </div>
      </div>
      <div className="flex flex-wrap gap-5 items-start mt-2.5 w-full max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
          {roles.map((role, index) => (
            <div
              key={role.name}
              className={`${
                index > 0 ? "mt-1.5" : ""
              } animate-fade-up [animation-delay:${
                (index + 1) * 200
              }ms] opacity-0`}
            >
              <SkillItem {...role} />
            </div>
          ))}
        </div>
        <div className="flex-1 shrink basis-0 text-xs leading-4 min-w-[240px] w-[258px] text-black dark:text-white animate-fade-up [animation-delay:1200ms] opacity-0">
          {isProduct ? (
            <>
              From my first projects onward I gravitated to the space between
              the client and the code: understanding what a business actually
              needs, then turning it into something a team can build and ship.
              <br />I excel at discovery, stakeholder interviews, documenting
              requirements, wireframing, prioritization and roadmap management —
              and I stay technical enough to judge feasibility and cost myself
              instead of relaying the question.
            </>
          ) : (
            <>
              From college onward, my advanced experience fostered a natural
              leadership spirit and a drive to guide others toward the best
              results. Leading teams taught me the importance of listening,
              inclusivity, delegation, and collaborative discussion.
              <br />I excel in architecting solutions, understanding stakeholder
              demands, documenting requirements, and planning solution
              structures, along with discovery processes and roadmap management.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
