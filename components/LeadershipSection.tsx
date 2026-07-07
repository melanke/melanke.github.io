import { SkillItem } from "./SkillItem";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { ContentVersion } from "@/app/contentVersion";

export function LeadershipSection({ version }: { version?: ContentVersion }) {
  return (
    <div
      className={`flex flex-col mt-10 print:mt-5 w-full text-black break-inside-avoid dark:text-white max-md:max-w-full ${
        version === "leader" ? "" : "print:hidden"
      }`}
    >
      <div className="flex gap-1.5 justify-center items-center self-start text-2xl print:text-xl font-semibold leading-none animate-fade-up opacity-0">
        <HiOutlineUserGroup size={20} className="print:hidden text-[#f9b800]" />
        <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
          Leadership Experience
        </div>
      </div>
      <div className="flex flex-wrap gap-5 items-start mt-2.5 w-full max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
          <div className="animate-fade-up [animation-delay:200ms] opacity-0">
            <SkillItem name="CTO" since="2013" level="expert" />
          </div>
          <div className="mt-1.5 animate-fade-up [animation-delay:400ms] opacity-0">
            <SkillItem name="Techlead" since="2013" level="expert" />
          </div>
          <div className="mt-1.5 animate-fade-up [animation-delay:600ms] opacity-0">
            <SkillItem name="Business Analyst" since="2010" level="expert" />
          </div>
          <div className="mt-1.5 animate-fade-up [animation-delay:800ms] opacity-0">
            <SkillItem name="Product Owner" since="2022" level="intermediate" />
          </div>
          <div className="mt-1.5 animate-fade-up [animation-delay:1000ms] opacity-0">
            <SkillItem
              name="Project Manager"
              since="2018"
              level="intermediate"
            />
          </div>
        </div>
        <div className="flex-1 shrink basis-0 text-xs leading-4 min-w-[240px] w-[258px] text-black dark:text-white animate-fade-up [animation-delay:1200ms] opacity-0">
          From college onward, my advanced experience fostered a natural
          leadership spirit and a drive to guide others toward the best
          results. Leading teams taught me the importance of listening,
          inclusivity, delegation, and collaborative discussion.
          <br />I excel in architecting solutions, understanding stakeholder
          demands, documenting requirements, and planning solution structures,
          along with discovery processes and roadmap management.
        </div>
      </div>
    </div>
  );
}
