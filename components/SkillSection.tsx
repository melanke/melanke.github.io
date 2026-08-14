import { TechSkillItem, TechSkillItemProps, techYears } from "./TechSkillItem";
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
      {/* Screen only: on paper the category stops being a heading and becomes
          an inline label on the technologies line (see below), so the whole
          section list sits under one "Technical Skills" heading — which is
          also the header ATS look for to populate their skills field. */}
      <div className="print:hidden flex gap-2 items-center w-full text-2xl font-semibold leading-none text-black dark:text-white">
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
        <h3 className="self-stretch my-auto font-clash print:font-sans font-semibold">
          {title}
        </h3>
      </div>
      {/* Print gets a single running-text line instead of the tag row,
          matching the Timeline technologies print treatment. Name keeps a
          heavier weight than the year, same contrast as the tag view. */}
      <div className="hidden print:block print:mt-1 font-sans text-[0.8rem] text-black dark:text-white">
        {/* Uppercase + tracking is the register change: it reads as a label
            rather than as one more technology, without needing a font-size far
            from the list's — text runs of very different sizes get split apart
            by PDF extractors, which is what we spent the header fixing. */}
        <span className="font-semibold uppercase tracking-wide text-[0.72rem]">
          {title}:
        </span>{" "}
        {skills.map((s, index) => (
          <span key={index}>
            <span className="font-medium">{s.name}</span>{" "}
            {/* Never let the range split across lines: PDF extractors join the
                two halves without the hyphen, turning (2013-2025) into
                (20132025) in the text layer. */}
            <span className="font-light whitespace-nowrap">
              ({techYears(s)})
            </span>
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
