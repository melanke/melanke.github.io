import { SkillItem } from "./SkillItem";
import Image from "next/image";

export function OtherSection() {
  return (
    <div className="flex flex-col w-full mt-10 text-black max-md:max-w-full">
      <div className="flex flex-wrap gap-1.5 items-center w-full text-xl font-semibold leading-none whitespace-nowrap max-md:max-w-full">
        <Image
          src="/icons/other.svg"
          width={16}
          height={16}
          className="object-contain shrink-0 self-stretch my-auto w-4 aspect-[1.07]"
          alt=""
        />
        <div className="self-stretch my-auto font-clash font-semibold">
          Other
        </div>
      </div>
      <div className="flex flex-wrap gap-5 items-start mt-2.5 w-full max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
          <SkillItem
            name="Mobile Developer - Native Android, React Native"
            yearRange="2011 - 2022"
            level="intermediate"
          />
          <div className="mt-1.5">
            <SkillItem
              name="Game Developer - Unity"
              since="2017"
              level="beginner"
            />
          </div>
          <div className="mt-1.5">
            <SkillItem
              name="UX Designer - Figma / Sketch / XD / Illustrator"
              since="2011"
              level="advanced"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
          <SkillItem
            name="Designer - Photoshop / Illustrator"
            since="2007"
            level="intermediate"
          />
          <div className="mt-1.5">
            <SkillItem
              name="3D Modeller - Blender"
              since="2021"
              level="beginner"
            />
          </div>
          <div className="mt-1.5">
            <SkillItem
              name="Digital Illustrator - Procreate / Photoshop"
              since="2007"
              level="expert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}