export interface TechSkillItemProps {
  name: string;
  since: string;
  lastUsed?: string;
}

/**
 * "2008-2024" when both years are known, otherwise just the starting year.
 * A range ending in the current year renders as "2008-now": "2008-2026" reads
 * as something that finished, when it means the opposite. Comparing against
 * the build year (not a constant) means the label degrades to a plain range on
 * its own once the data stops being refreshed, rather than claiming "now"
 * forever.
 */
export function techYears({ since, lastUsed }: TechSkillItemProps) {
  if (!lastUsed) return since;
  const current = lastUsed === String(new Date().getFullYear());
  return `${since}-${current ? "now" : lastUsed}`;
}

export function TechSkillItem({ name, since, lastUsed }: TechSkillItemProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full whitespace-nowrap">
      <span className="text-xs font-clash font-medium leading-none text-black dark:text-white">
        {name}
      </span>
      <span className="text-[0.65rem] font-clash font-light leading-none text-black/60 dark:text-white/60">
        {techYears({ name, since, lastUsed })}
      </span>
    </span>
  );
}
