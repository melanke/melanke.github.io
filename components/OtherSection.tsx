import { TbCards } from "react-icons/tb";
import { TechSkillItem, TechSkillItemProps } from "./TechSkillItem";

const otherSkills: TechSkillItemProps[] = [
  { name: "Native Android", since: "2011" },
  { name: "React Native", since: "2011" },
  { name: "Unity", since: "2017" },
  { name: "Figma", since: "2011" },
  { name: "Sketch", since: "2011" },
  { name: "XD", since: "2011" },
  { name: "Illustrator", since: "2007" },
  { name: "Photoshop", since: "2007" },
  { name: "Blender", since: "2021" },
  { name: "Procreate", since: "2007" },
];

export function OtherSection() {
  return (
    <div className="hidden xl:flex flex-col w-full mt-10 text-black dark:text-white max-md:max-w-full print:hidden">
      <div className="flex flex-wrap gap-1.5 items-center w-full text-2xl font-semibold leading-none whitespace-nowrap max-md:max-w-full">
        <TbCards size={20} className="text-[#f9b800]" />
        <div className="self-stretch my-auto font-clash font-semibold">
          Other
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-1.5 items-center mt-2.5 w-full max-md:max-w-full">
        {otherSkills.map((skill) => (
          <TechSkillItem key={skill.name} {...skill} />
        ))}
      </div>
    </div>
  );
}
