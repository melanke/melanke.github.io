import { SkillBars, SkillLevel } from "./SkillBars";

export interface SkillItemProps {
  name: string;
  since?: string;
  level: SkillLevel;
  yearRange?: string;
}

export function SkillItem({ name, since, level, yearRange }: SkillItemProps) {
  return (
    <div className="flex gap-1 print:gap-0 items-center p-2 print:p-0 w-full bg-neutral-100 dark:bg-neutral-800 print:bg-transparent gap-3">
      <div className="flex-1 print:flex-none shrink self-stretch my-auto text-sm font-clash print:font-sans font-medium leading-none basis-0 text-black dark:text-white">
        {name}
      </div>
      <div className="self-stretch my-auto text-sm font-clash print:font-sans font-light leading-snug text-black dark:text-white print:ml-1">
        <span className="hidden print:inline">(</span>
        {yearRange ?? (since ? `Since ${since}` : "")}
        <span className="hidden print:inline">)</span>
      </div>
      <SkillBars level={level} className="print:hidden" />
    </div>
  );
}
