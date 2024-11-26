import { SkillItem, SkillItemProps } from "./SkillItem";

export interface SkillSectionProps {
  title: string;
  icon: string;
  skills: SkillItemProps[];
}

export function SkillSection({ title, icon, skills }: SkillSectionProps) {
  return (
    <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
      <div className="flex gap-2 items-center w-full text-2xl font-semibold leading-none">
        <img
          loading="lazy"
          src={icon}
          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-[1.07]"
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
      </div>
    </div>
  );
}
