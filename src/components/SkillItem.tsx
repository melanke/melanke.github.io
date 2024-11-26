import { SkillBars, SkillLevel } from "./SkillBars";

export interface SkillItemProps {
  name: string;
  since?: string;
  level: SkillLevel;
  yearRange?: string;
}

export function SkillItem({ name, since, level, yearRange }: SkillItemProps) {
  return (
    <div className="flex gap-1 items-center p-2 w-full bg-stone-100 gap-3">
      <div className="flex-1 shrink self-stretch my-auto text-sm font-clash font-medium leading-none basis-0">
        {name}
      </div>
      <div className="self-stretch my-auto text-sm font-light leading-snug">
        {yearRange ?? (since ? `Since ${since}` : "")}
      </div>
      <SkillBars level={level} />
    </div>
  );
}
