import React from "react";
import Image from "next/image";

export interface TimelineItemProps {
  dateRange: string;
  technologies: string[];
  title: string;
  role: string;
  description: string;
  image?: string;
}

export function TimelineItem({
  dateRange,
  technologies,
  title,
  role,
  description,
  image,
}: TimelineItemProps) {
  return (
    <div className="flex mt-5 w-full max-md:max-w-full break-inside-avoid flex-col gap-1 flex-1 shrink self-start text-[0.89rem] basis-0 min-w-[288px] max-md:max-w-full">
      <div className="flex items-start w-full leading-snug min-h-[14px] max-md:max-w-full">
        <div className="font-bold text-black dark:text-white">{title}</div>
        <span className="mx-2 text-black text-opacity-60 dark:text-white dark:text-opacity-60">
          •
        </span>
        <div className="text-black/60 dark:text-white/60">{role}</div>
      </div>
      <div className="text-black/60 dark:text-white/60 text-xs">
        {dateRange}
      </div>
      <div className="leading-4 text-black dark:text-white max-md:max-w-full">
        {image && (
          <Image
            src={image}
            alt={title}
            width={128}
            height={72}
            className="float-left mr-3 mb-3 rounded-lg border border-neutral-200 dark:border-neutral-800 print:hidden"
          />
        )}
        {description}
        <div className="mt-1.5 flex flex-wrap gap-1 font-clash text-xs">
          {technologies.map((tech, index) => (
            <span
              className="px-3 py-[0.19rem] bg-neutral-100 dark:bg-neutral-800 rounded-full text-black dark:text-white"
              key={index}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
