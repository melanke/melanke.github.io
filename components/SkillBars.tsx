export type SkillLevel = "expert" | "advanced" | "intermediate" | "beginner";

interface SkillBarsProps {
  level: SkillLevel;
  className?: string;
}

export const SkillBars = ({ level, className }: SkillBarsProps) => {
  const levelToBarCount: Record<SkillLevel, number> = {
    expert: 5,
    advanced: 4,
    intermediate: 3,
    beginner: 2,
  };

  return (
    <div className={`flex gap-[2px] h-5 ${className}`}>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`w-[7px] h-full transform -skew-x-[18deg] ${
            index < levelToBarCount[level]
              ? "bg-black dark:bg-white"
              : "bg-neutral-300 dark:bg-neutral-600"
          }`}
        />
      ))}
    </div>
  );
};
