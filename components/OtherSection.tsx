import { TbCards } from "react-icons/tb";
import { TechSkillItem, TechSkillItemProps } from "./TechSkillItem";
import { SkillSection } from "./SkillSection";
import { other } from "@/lib/technologies";

export function OtherSection() {
  return (
    <div className="hidden xl:flex flex-col w-full mt-10 text-black dark:text-white max-md:max-w-full print:hidden">
      <SkillSection
          title="Other"
          icon={TbCards}
          skills={Object.values(other)}
        />
    </div>
  );
}
