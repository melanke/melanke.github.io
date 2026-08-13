import { TechSkillItem, TechSkillItemProps } from "./TechSkillItem";
import Image from "next/image";
import { IconType } from "react-icons";

export interface SkillSectionProps {
  title: string;
  icon: string | IconType;
  skills: TechSkillItemProps[];
  className?: string;
}

export function SkillSection({
  title,
  icon,
  skills,
  className,
}: SkillSectionProps) {
  return (
    <div
      className={`flex flex-col w-full animate-fade-up opacity-0 print:break-inside-avoid ${className}`}
    >
      <div className="flex gap-2 items-center w-full text-2xl print:text-xl font-semibold leading-none text-black dark:text-white">
        {typeof icon === "string" ? (
          <Image
            src={icon}
            width={20}
            height={20}
            className="w-auto h-auto object-contain shrink-0 self-stretch my-auto dark:invert print:hidden"
            alt=""
          />
        ) : (
          icon({ size: 20, className: "print:hidden text-[#f9b800]" })
        )}
        <div className="self-stretch my-auto font-clash print:font-sans font-semibold">
          {title}
        </div>
      </div>
      {/* Print gets a single running-text line instead of the tag row,
          matching the Timeline technologies print treatment. Name keeps a
          heavier weight than the year, same contrast as the tag view. */}
      <div className="hidden print:block print:mt-1 font-sans text-[0.8rem] text-black dark:text-white">
        {skills.map((s, index) => (
          <span key={index}>
            <span className="font-medium">{s.name}</span>{" "}
            <span className="font-light">({s.since})</span>
            {index < skills.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
      <div className="print:hidden flex flex-row flex-wrap gap-1.5 items-center mt-2.5 w-full">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`animate-fade-up [animation-delay:${
              (index + 1) * 80
            }ms] opacity-0`}
          >
            <TechSkillItem {...skill} />
          </span>
        ))}
      </div>
    </div>
  );
}
