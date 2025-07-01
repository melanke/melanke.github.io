import { SkillItem, SkillItemProps } from "./SkillItem";
import Image from "next/image";
import { IconType } from "react-icons";

export interface SkillSectionProps {
  title: string;
  icon: string | IconType;
  skills: SkillItemProps[];
  otherSkills?: string[];
  className?: string;
}

export function SkillSection({
  title,
  icon,
  skills,
  otherSkills,
  className,
}: SkillSectionProps) {
  return (
    <div
      className={`flex flex-col flex-1 shrink basis-0 min-w-[240px] animate-fade-up opacity-0 ${className}`}
    >
      <div className="flex gap-2 items-center w-full text-2xl print:text-base font-semibold leading-none text-black dark:text-white">
        {typeof icon === "string" ? (
          <Image
            src={icon}
            width={20}
            height={20}
            className="w-auto h-auto object-contain shrink-0 self-stretch my-auto dark:invert print:hidden"
            alt=""
          />
        ) : (
          icon({ size: 20, className: "print:hidden" })
        )}
        <div className="hidden print:block w-1.5 h-1.5 bg-black dark:bg-white rounded-full shrink-0 self-stretch my-auto"></div>
        <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
          {title}
        </div>
      </div>
      <div className="flex flex-col print:flex-row print:flex-wrap mt-2.5 print:mt-1 print:ml-4 w-full">
        {skills.map((skill, index) => (
          <>
            <div
              key={index}
              className={`${
                index > 0 ? "mt-1.5 print:mt-0" : ""
              } animate-fade-up [animation-delay:${
                (index + 1) * 200
              }ms] opacity-0`}
            >
              <SkillItem {...skill} />
            </div>

            {index < skills.length - 1 && (
              <div className="hidden print:block text-black dark:text-white text-sm mr-2">
                ,
              </div>
            )}
          </>
        ))}
        {otherSkills && (
          <div
            className={`mt-1.5 flex flex-wrap gap-1 font-clash print:hidden text-xs animate-fade-up [animation-delay:${
              (skills.length + 1) * 200
            }ms] opacity-0`}
          >
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
