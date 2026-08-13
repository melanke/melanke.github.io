export interface TechSkillItemProps {
  name: string;
  since: string;
}

export function TechSkillItem({ name, since }: TechSkillItemProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full whitespace-nowrap">
      <span className="text-xs font-clash font-medium leading-none text-black dark:text-white">
        {name}
      </span>
      <span className="text-[0.65rem] font-clash font-light leading-none text-black/60 dark:text-white/60">
        {since}
      </span>
    </span>
  );
}
