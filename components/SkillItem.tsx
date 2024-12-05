import { SkillBars, SkillLevel } from "./SkillBars";

export interface SkillItemProps {
  name: string;
  since?: string;
  level: SkillLevel;
  yearRange?: string;
}

export function SkillItem({ name, since, level, yearRange }: SkillItemProps) {
  return (
    <div className="flex gap-1 items-center p-2 w-full bg-neutral-100 dark:bg-neutral-800 gap-3">
      <div className="flex-1 shrink self-stretch my-auto text-sm font-clash font-medium leading-none basis-0 text-black dark:text-white">
        {name}
      </div>
      <div className="self-stretch my-auto text-sm font-clash font-light leading-snug text-black dark:text-white">
        {yearRange ?? (since ? `Since ${since}` : "")}
      </div>
      <SkillBars level={level} />
    </div>
  );
}
