import { SkillItem, SkillItemProps } from "./SkillItem";
import Image from "next/image";

export interface SkillSectionProps {
  title: string;
  icon: string;
  skills: SkillItemProps[];
  otherSkills?: string[];
}

export function SkillSection({
  title,
  icon,
  skills,
  otherSkills,
}: SkillSectionProps) {
  return (
    <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
      <div className="flex gap-2 items-center w-full text-2xl font-semibold leading-none text-black dark:text-white">
        <Image
          src={icon}
          width={20}
          height={20}
          className="w-auto h-auto object-contain shrink-0 self-stretch my-auto dark:invert"
          alt=""
        />
        <div className="self-stretch my-auto font-clash font-semibold">
          {title}
        </div>
      </div>
      <div className="flex flex-col mt-2.5 w-full">
        {skills.map((skill, index) => (
          <div key={index} className={index > 0 ? "mt-1.5" : ""}>
            <SkillItem {...skill} />
          </div>
        ))}
        {otherSkills && (
          <div className="mt-1.5 flex flex-wrap gap-1 font-clash text-xs">
            {otherSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-[0.19rem] bg-neutral-100 dark:bg-neutral-800 rounded-full text-black dark:text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
